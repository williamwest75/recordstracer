import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

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

    const { searchName, state = "", limit = 20 } = await req.json();

    if (!searchName || searchName.trim().length < 2) {
      return new Response(
        JSON.stringify({ error: "Search name required (min 2 characters)" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const FEC_API_KEY = Deno.env.get("FEC_API_KEY") || "DEMO_KEY";
    const stateCode = toStateAbbr(state);

    // --- 1. Fetch individual contributions (Schedule A) ---
    const scheduleAParams = new URLSearchParams({
      contributor_name: searchName.trim(),
      sort: "-contribution_receipt_date",
      per_page: String(Math.min(limit, 100)),
      api_key: FEC_API_KEY,
      is_individual: "true",
    });
    if (stateCode) scheduleAParams.set("contributor_state", stateCode);

    const scheduleAUrl = `https://api.open.fec.gov/v1/schedules/schedule_a/?${scheduleAParams}`;
    console.log("[dossier-fec] Fetching Schedule A:", scheduleAUrl.replace(FEC_API_KEY, "***"));

    const scheduleARes = await fetch(scheduleAUrl);
    if (!scheduleARes.ok) {
      const errText = await scheduleARes.text();
      console.error("[dossier-fec] Schedule A error:", scheduleARes.status, errText.slice(0, 200));
      return new Response(
        JSON.stringify({ error: "FEC API request failed", status: scheduleARes.status }),
        { status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const scheduleAData = await scheduleARes.json();
    const rawResults = scheduleAData.results || [];

    // --- 2. Transform into clean structure ---
    const contributions = rawResults.map((r: any) => ({
      contributor_name: r.contributor_name || "",
      contributor_city: r.contributor_city || "",
      contributor_state: r.contributor_state || "",
      contributor_employer: r.contributor_employer || "",
      contributor_occupation: r.contributor_occupation || "",
      committee_name: r.committee?.name || r.committee_name || "",
      committee_id: r.committee_id || "",
      candidate_name: r.candidate_name || null,
      amount: r.contribution_receipt_amount || 0,
      date: r.contribution_receipt_date || "",
      receipt_type_description: r.receipt_type_description || "",
      fec_url: r.pdf_url || null,
    }));

    // --- 3. Calculate summary stats ---
    const totalAmount = contributions.reduce((sum: number, c: any) => sum + c.amount, 0);
    const uniqueCommittees = [...new Set(contributions.map((c: any) => c.committee_name))];
    const uniqueCandidates = [...new Set(contributions.filter((c: any) => c.candidate_name).map((c: any) => c.candidate_name))];
    const dateRange = contributions.length > 0
      ? {
          earliest: contributions[contributions.length - 1]?.date || null,
          latest: contributions[0]?.date || null,
        }
      : null;

    // Group by committee for top recipients
    const byCommittee: Record<string, number> = {};
    contributions.forEach((c: any) => {
      byCommittee[c.committee_name] = (byCommittee[c.committee_name] || 0) + c.amount;
    });
    const topRecipients = Object.entries(byCommittee)
      .map(([name, total]) => ({ name, total }))
      .sort((a, b) => (b.total as number) - (a.total as number))
      .slice(0, 5);

    console.log("[dossier-fec] Found", contributions.length, "contributions totaling $" + totalAmount);

    return new Response(
      JSON.stringify({
        source: "fec",
        query: searchName,
        state,
        total_results: scheduleAData.pagination?.count || contributions.length,
        returned_results: contributions.length,
        summary: {
          total_amount: totalAmount,
          contribution_count: contributions.length,
          unique_committees: uniqueCommittees.length,
          unique_candidates: uniqueCandidates.length,
          top_recipients: topRecipients,
          date_range: dateRange,
        },
        contributions,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    console.error("[dossier-fec] error:", err);
    return new Response(
      JSON.stringify({ error: "Internal error", message: String(err) }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

const STATE_ABBR: Record<string, string> = {
  "Alabama":"AL","Alaska":"AK","Arizona":"AZ","Arkansas":"AR","California":"CA",
  "Colorado":"CO","Connecticut":"CT","Delaware":"DE","District of Columbia":"DC",
  "Florida":"FL","Georgia":"GA","Hawaii":"HI","Idaho":"ID","Illinois":"IL",
  "Indiana":"IN","Iowa":"IA","Kansas":"KS","Kentucky":"KY","Louisiana":"LA",
  "Maine":"ME","Maryland":"MD","Massachusetts":"MA","Michigan":"MI","Minnesota":"MN",
  "Mississippi":"MS","Missouri":"MO","Montana":"MT","Nebraska":"NE","Nevada":"NV",
  "New Hampshire":"NH","New Jersey":"NJ","New Mexico":"NM","New York":"NY",
  "North Carolina":"NC","North Dakota":"ND","Ohio":"OH","Oklahoma":"OK","Oregon":"OR",
  "Pennsylvania":"PA","Rhode Island":"RI","South Carolina":"SC","South Dakota":"SD",
  "Tennessee":"TN","Texas":"TX","Utah":"UT","Vermont":"VT","Virginia":"VA",
  "Washington":"WA","West Virginia":"WV","Wisconsin":"WI","Wyoming":"WY",
};

function toStateAbbr(state: string): string {
  if (!state || state === "All States / National") return "";
  if (state.length === 2) return state.toUpperCase();
  return STATE_ABBR[state] || "";
}
