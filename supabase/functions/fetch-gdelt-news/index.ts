import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

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
    const { query, days = 7 } = await req.json();
    if (!query || typeof query !== "string") {
      return new Response(JSON.stringify({ error: "query is required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const encoded = encodeURIComponent(query);
    const url = `https://api.gdeltproject.org/api/v2/doc/doc?query=${encoded}&mode=artlist&format=json&timespan=${days}d`;

    const res = await fetch(url);
    if (!res.ok) {
      const text = await res.text();
      console.error("[GDELT] upstream error", res.status, text);
      return new Response(JSON.stringify({ error: "GDELT API error", status: res.status }), {
        status: 502,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const data = await res.json();
    const articles = (data.articles ?? []).map((a: any) => ({
      title: a.title ?? "",
      url: a.url ?? "",
      source: a.domain ?? a.source ?? "",
      date: a.seendate ?? "",
      image: a.socialimage ?? null,
    }));

    return new Response(JSON.stringify({ articles }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("[GDELT] error", err);
    return new Response(JSON.stringify({ error: String(err) }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
