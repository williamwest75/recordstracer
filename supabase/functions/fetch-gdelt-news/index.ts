// GDELT: DOC API only — free, automatic, 30-day window, 10 results max
// BigQuery GDELT removed — not cost-effective at current scale
// Revisit BigQuery archive search only when a clear editorial use case is established

import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "npm:@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? "",
      { global: { headers: { Authorization: authHeader } } }
    );

    const token = authHeader.replace("Bearer ", "");
    const { data: userData, error: authError } = await supabase.auth.getUser(token);
    if (authError || !userData?.user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const body = await req.json();
    const query = typeof body.query === "string"
      ? body.query.replace(/<[^>]*>/g, "").trim().slice(0, 200)
      : "";

    if (!query) {
      return new Response(JSON.stringify({ error: "query is required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const params = new URLSearchParams({
      query: `${query} sourcelang:eng`,
      mode: "ArtList",
      maxrecords: "10",
      format: "json",
      timespan: "30d",
    });

    const url = `https://api.gdeltproject.org/api/v2/doc/doc?${params}`;
    const res = await fetch(url);

    if (!res.ok) {
      console.error(`[GDELT] DOC API returned ${res.status}`);
      return new Response(JSON.stringify({ articles: [] }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const data = await res.json();
    const raw = data.articles ?? [];

    const articles = raw.map((a: any) => ({
      title: a.title ?? "",
      url: a.url ?? "",
      domain: a.domain ?? "",
      seendate: a.seendate ?? "",
    }));

    return new Response(
      JSON.stringify({ articles }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    console.error("[GDELT] error:", String(err));
    // Fail silently — return empty results
    return new Response(JSON.stringify({ articles: [] }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
