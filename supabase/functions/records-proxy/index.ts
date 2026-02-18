import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { source, searchName, state } = await req.json();

    if (!source || !searchName) {
      return new Response(JSON.stringify({ error: "Missing source or searchName" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    let result: any;

    switch (source) {
      case "sec":
        result = await fetchSEC(searchName);
        break;
      case "propublica":
        result = await fetchProPublica(searchName);
        break;
      case "sunbiz":
        result = await fetchSunBiz(searchName);
        break;
      default:
        return new Response(JSON.stringify({ error: `Unknown source: ${source}` }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
    }

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("records-proxy error:", err);
    return new Response(JSON.stringify({ error: String(err) }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});

// ── SEC EDGAR ──
async function fetchSEC(name: string) {
  const url = `https://efts.sec.gov/LATEST/search-index?q=%22${encodeURIComponent(name)}%22&dateRange=custom&startdt=2015-01-01&enddt=2026-12-31&forms=10-K,10-Q,8-K,DEF%2014A,4,SC%2013D,SC%2013G&from=0&size=20`;
  const res = await fetch(url, {
    headers: {
      "User-Agent": "RecordTracer contact@recordtracer.com",
      Accept: "application/json",
    },
  });

  if (!res.ok) {
    // Fallback to EDGAR full-text search
    const fallbackUrl = `https://efts.sec.gov/LATEST/search-index?q=%22${encodeURIComponent(name)}%22&from=0&size=10`;
    const res2 = await fetch(fallbackUrl, {
      headers: {
        "User-Agent": "RecordTracer contact@recordtracer.com",
        Accept: "application/json",
      },
    });
    if (!res2.ok) return { success: false, filings: [] };
    const data2 = await res2.json();
    const filings = (data2.hits?.hits || []).map((hit: any) => {
      const s = hit._source || {};
      return {
        entityName: s.entity_name || "Unknown",
        formType: s.form_type || "Unknown",
        fileDate: s.file_date || "N/A",
        fileNum: s.file_num || "",
        periodOfReport: s.period_of_report || "N/A",
      };
    });
    return { success: true, filings };
  }

  const data = await res.json();
  const filings = (data.hits?.hits || []).map((hit: any) => {
    const s = hit._source || {};
    return {
      entityName: s.entity_name || "Unknown",
      formType: s.form_type || "Unknown",
      fileDate: s.file_date || "N/A",
      fileNum: s.file_num || "",
      periodOfReport: s.period_of_report || "N/A",
    };
  });

  return { success: true, filings };
}

// ── ProPublica Nonprofits ──
async function fetchProPublica(name: string) {
  const url = `https://projects.propublica.org/nonprofits/api/v2/search.json?q=${encodeURIComponent(name)}`;
  const res = await fetch(url);

  if (!res.ok) return { success: false, organizations: [] };

  const data = await res.json();
  const organizations = (data.organizations || []).map((org: any) => ({
    name: org.name,
    ein: org.ein,
    city: org.city,
    state: org.state,
    nteeCode: org.ntee_code,
    income: org.income_amount,
    subsection: org.subseccd,
  }));

  return { success: true, organizations };
}

// ── Florida SunBiz ──
async function fetchSunBiz(name: string) {
  // SunBiz doesn't have a public JSON API — try the Vercel proxy
  try {
    const res = await fetch("https://records-detective-ai.vercel.app/api/search-sunbiz", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ searchName: name }),
    });

    if (!res.ok) return { success: false, results: [] };
    const data = await res.json();
    return { success: data.success || false, results: data.results || [] };
  } catch {
    return { success: false, results: [] };
  }
}
