import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const CL_BASE = "https://www.courtlistener.com";

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Auth check
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? "",
      { global: { headers: { Authorization: authHeader } } }
    );

    const token = authHeader.replace("Bearer ", "");
    const { data: userData, error: authError } = await supabaseClient.auth.getUser(token);
    if (authError || !userData?.user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { searchName, limit = 10 } = await req.json();

    if (!searchName || searchName.trim().length < 2) {
      return new Response(
        JSON.stringify({ error: "Search name required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const CL_TOKEN = Deno.env.get("COURTLISTENER_API_TOKEN");
    const headers: Record<string, string> = { "Content-Type": "application/json" };
    if (CL_TOKEN) {
      headers["Authorization"] = `Token ${CL_TOKEN}`;
    }

    const encodedName = encodeURIComponent(searchName.trim());

    // --- 1. Search RECAP Archive (federal dockets) ---
    let dockets: any[] = [];
    let docketCount = 0;
    try {
      const recapUrl = `${CL_BASE}/api/rest/v4/search/?q=${encodedName}&type=r&order_by=score+desc&page_size=${limit}`;
      console.log("[dossier-courtlistener] RECAP search:", recapUrl);
      const recapRes = await fetch(recapUrl, { headers });

      if (recapRes.ok) {
        const recapData = await recapRes.json();
        docketCount = recapData.count || 0;
        dockets = (recapData.results || []).map((r: any) => ({
          case_name: r.caseName || r.case_name || "",
          docket_number: r.docketNumber || r.docket_number || "",
          court: r.court || r.court_id || "",
          date_filed: r.dateFiled || r.date_filed || null,
          date_terminated: r.dateTerminated || r.date_terminated || null,
          suit_nature: r.suitNature || r.suit_nature || "",
          assigned_to: r.assignedTo || r.assigned_to_str || "",
          cause: r.cause || "",
          url: r.absolute_url ? `${CL_BASE}${r.absolute_url}` : null,
          docket_id: r.docket_id || r.id || null,
          snippet: r.snippet || "",
        }));
      } else {
        console.error("[dossier-courtlistener] RECAP error:", recapRes.status);
        await recapRes.text();
      }
    } catch (e) {
      console.error("[dossier-courtlistener] RECAP fetch failed:", e);
    }

    // --- 2. Search Opinions (case law) ---
    let opinions: any[] = [];
    let opinionCount = 0;
    try {
      const opUrl = `${CL_BASE}/api/rest/v4/search/?q=${encodedName}&type=o&order_by=score+desc&page_size=${limit}`;
      console.log("[dossier-courtlistener] Opinions search:", opUrl);
      const opRes = await fetch(opUrl, { headers });

      if (opRes.ok) {
        const opData = await opRes.json();
        opinionCount = opData.count || 0;
        opinions = (opData.results || []).map((r: any) => ({
          case_name: r.caseName || r.case_name || "",
          court: r.court || r.court_id || "",
          date_filed: r.dateFiled || r.date_filed || null,
          citation: r.citation || (r.citations && r.citations[0]) || "",
          status: r.status || "",
          url: r.absolute_url ? `${CL_BASE}${r.absolute_url}` : null,
          snippet: r.snippet || "",
        }));
      } else {
        console.error("[dossier-courtlistener] Opinions error:", opRes.status);
        await opRes.text();
      }
    } catch (e) {
      console.error("[dossier-courtlistener] Opinions fetch failed:", e);
    }

    console.log("[dossier-courtlistener] Found", dockets.length, "dockets,", opinions.length, "opinions");

    return new Response(
      JSON.stringify({
        source: "courtlistener",
        query: searchName,
        dockets: {
          total_count: docketCount,
          returned: dockets.length,
          results: dockets,
        },
        opinions: {
          total_count: opinionCount,
          returned: opinions.length,
          results: opinions,
        },
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    console.error("[dossier-courtlistener] error:", err);
    return new Response(
      JSON.stringify({ error: "Internal error", message: String(err) }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
