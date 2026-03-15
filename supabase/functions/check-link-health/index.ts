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
    const timeout = setTimeout(() => controller.abort(), 15000);

    // Try HEAD first, fall back to GET if HEAD is rejected
    let response: Response;
    try {
      response = await fetch(url, {
        method: "HEAD",
        signal: controller.signal,
        redirect: "follow",
        headers: {
          "User-Agent":
            "RecordTracer-LinkChecker/1.0 (health-monitoring; +https://recordstracer.lovable.app)",
        },
      });
    } catch {
      // Some government sites reject HEAD, try GET
      response = await fetch(url, {
        method: "GET",
        signal: controller.signal,
        redirect: "follow",
        headers: {
          "User-Agent":
            "RecordTracer-LinkChecker/1.0 (health-monitoring; +https://recordstracer.lovable.app)",
        },
      });
      // Consume body to avoid leak
      await response.text();
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
    const { sources } = (await req.json()) as { sources: SourceToCheck[] };

    if (!sources || !Array.isArray(sources) || sources.length === 0) {
      return new Response(
        JSON.stringify({ error: "No sources provided" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log(`Checking ${sources.length} URLs...`);

    // Process in batches of 10 to avoid overwhelming connections
    const BATCH_SIZE = 10;
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
