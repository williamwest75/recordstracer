import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface SourceToCheck {
  source_id: string;
  state_code: string;
  category: string;
  url: string;
  source_name: string;
}

// Build a flat list of all URLs from all 50 states
// The edge function receives the full source list from the caller (admin trigger or cron)
// to avoid importing frontend code into the edge function.

async function checkUrl(
  url: string
): Promise<{ status_code: number | null; is_healthy: boolean; error_message: string | null; response_time_ms: number }> {
  const start = Date.now();
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 10000);

    const headers = {
      "User-Agent":
        "RecordTracer-LinkChecker/1.0 (health-monitoring; +https://recordstracer.lovable.app)",
    };

    let response = await fetch(url, {
      method: "HEAD",
      signal: controller.signal,
      redirect: "follow",
      headers,
    });

    // Retry with GET if HEAD returns 405 (Method Not Allowed) or 503 (Service Unavailable)
    if (response.status === 405 || response.status === 503) {
      const retryController = new AbortController();
      const retryTimeout = setTimeout(() => retryController.abort(), 10000);
      try {
        response = await fetch(url, {
          method: "GET",
          signal: retryController.signal,
          redirect: "follow",
          headers,
        });
      } finally {
        clearTimeout(retryTimeout);
      }
    }

    clearTimeout(timeout);
    const elapsed = Date.now() - start;

    // Consider 2xx and 3xx as healthy, also 403 (some gov sites block bots but page exists)
    const is_healthy = response.status < 400 || response.status === 403;

    return {
      status_code: response.status,
      is_healthy,
      error_message: is_healthy ? null : `HTTP ${response.status}`,
      response_time_ms: elapsed,
    };
  } catch (err) {
    const elapsed = Date.now() - start;
    const message = err instanceof Error ? err.message : "Unknown error";
    return {
      status_code: null,
      is_healthy: false,
      error_message: message.includes("abort")
        ? "Timeout (15s)"
        : message,
      response_time_ms: elapsed,
    };
  }
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, serviceRoleKey);

    // Accept sources list from the request body
    // If sources is empty/missing, this was triggered by cron — return early with instructions
    let sources: SourceToCheck[] = [];
    try {
      const body = await req.json();
      sources = body.sources ?? [];
    } catch {
      // No body (cron trigger) — we can't build source list in edge function
      // The admin UI sends sources; cron should be set up to call via the admin UI or a separate script
    }

    if (!sources || sources.length === 0) {
      return new Response(
        JSON.stringify({ message: "No sources provided. Use the admin UI to run a check, or POST sources in the body." }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log(`Checking ${sources.length} URLs...`);

    // Process in batches of 50 for high concurrency within the edge function timeout
    const BATCH_SIZE = 50;
    const results: Array<SourceToCheck & { status_code: number | null; is_healthy: boolean; error_message: string | null; response_time_ms: number }> = [];

    for (let i = 0; i < sources.length; i += BATCH_SIZE) {
      const batch = sources.slice(i, i + BATCH_SIZE);
      const batchResults = await Promise.all(
        batch.map(async (source) => {
          const check = await checkUrl(source.url);
          return { ...source, ...check };
        })
      );
      results.push(...batchResults);
    }

    // Insert results into link_health table
    const rows = results.map((r) => ({
      source_id: r.source_id,
      state_code: r.state_code,
      category: r.category,
      url: r.url,
      source_name: r.source_name,
      status_code: r.status_code,
      is_healthy: r.is_healthy,
      error_message: r.error_message,
      response_time_ms: r.response_time_ms,
      checked_at: new Date().toISOString(),
    }));

    const { error: insertError } = await supabase
      .from("link_health")
      .insert(rows);

    if (insertError) {
      console.error("Insert error:", insertError);
      throw insertError;
    }

    const unhealthy = results.filter((r) => !r.is_healthy);
    console.log(
      `Done. ${results.length} checked, ${unhealthy.length} unhealthy.`
    );

    return new Response(
      JSON.stringify({
        total: results.length,
        healthy: results.length - unhealthy.length,
        unhealthy: unhealthy.length,
        broken: unhealthy.map((u) => ({
          source_name: u.source_name,
          state: u.state_code,
          url: u.url,
          error: u.error_message,
        })),
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    console.error("Link health check failed:", err);
    return new Response(
      JSON.stringify({ error: err instanceof Error ? err.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
