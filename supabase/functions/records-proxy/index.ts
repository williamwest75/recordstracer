// supabase/functions/records-proxy/index.ts
// This Edge Function acts as a "waiter" — it fetches data from APIs that
// block direct browser requests (CORS), and passes the results back to your app.

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  // Handle preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { source, searchName, state } = await req.json();

    let result: any = { success: false, error: "Unknown source" };

    // ─── SEC EDGAR ───────────────────────────────────────────
    if (source === "sec") {
      result = await searchSEC(searchName);
    }

    // ─── ProPublica Nonprofits ───────────────────────────────
    if (source === "propublica") {
      result = await searchProPublica(searchName);
    }

    // ─── Florida SunBiz ──────────────────────────────────────
    if (source === "sunbiz") {
      result = await searchSunBiz(searchName);
    }

    // ─── OpenSecrets (if API key is set) ─────────────────────
    if (source === "opensecrets") {
      const apiKey = Deno.env.get("OPENSECRETS_API_KEY");
      if (apiKey) {
        result = await searchOpenSecrets(searchName, state || "FL", apiKey);
      } else {
        result = { success: false, error: "OpenSecrets API key not configured" };
      }
    }

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    return new Response(
      JSON.stringify({ success: false, error: String(err) }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

// ═══════════════════════════════════════════════════════════════
// SEC EDGAR — Full-text search of corporate filings
// ═══════════════════════════════════════════════════════════════
async function searchSEC(name: string) {
  try {
    // Try the EDGAR full-text search (EFTS)
    const url = `https://efts.sec.gov/LATEST/search-index?q=%22${encodeURIComponent(name)}%22&forms=10-K,10-Q,8-K,DEF%2014A,4,SC%2013D&from=0&size=20`;
    const res = await fetch(url, {
      headers: {
        "User-Agent": "RecordTracer InvestigativeJournalismTool/1.0 contact@recordtracer.com",
        Accept: "application/json",
      },
    });

    if (res.ok) {
      const data = await res.json();
      const hits = data.hits?.hits || [];
      return {
        success: true,
        filings: hits.map((h: any) => ({
          entityName: h._source?.entity_name || "Unknown",
          formType: h._source?.form_type || "Unknown",
          fileDate: h._source?.file_date || "N/A",
          fileNum: h._source?.file_num || "",
          periodOfReport: h._source?.period_of_report || "",
        })),
        totalFilings: data.hits?.total?.value || hits.length,
      };
    }

    // Fallback: company search
    const fallbackUrl = `https://www.sec.gov/cgi-bin/browse-edgar?action=getcompany&company=${encodeURIComponent(name)}&type=&dateb=&owner=include&count=40&output=atom`;
    const fallbackRes = await fetch(fallbackUrl, {
      headers: {
        "User-Agent": "RecordTracer InvestigativeJournalismTool/1.0 contact@recordtracer.com",
        Accept: "application/atom+xml",
      },
    });

    if (fallbackRes.ok) {
      const xml = await fallbackRes.text();
      const entries: any[] = [];
      const entryRegex = /<entry>([\s\S]*?)<\/entry>/g;
      let match;
      while ((match = entryRegex.exec(xml)) !== null) {
        const entry = match[1];
        const get = (tag: string) => {
          const m = entry.match(new RegExp(`<${tag}[^>]*>([^<]+)</${tag}>`));
          return m ? m[1].trim() : "";
        };
        entries.push({
          entityName: get("company-name") || get("title"),
          formType: get("filing-type"),
          fileDate: get("filing-date"),
          fileNum: get("file-number"),
          url: get("filing-href"),
        });
      }
      return { success: true, filings: entries, totalFilings: entries.length };
    }

    return { success: false, filings: [], totalFilings: 0 };
  } catch (err) {
    console.error("SEC search error:", err);
    return { success: false, error: String(err), filings: [], totalFilings: 0 };
  }
}

// ═══════════════════════════════════════════════════════════════
// ProPublica Nonprofit Explorer — 990 tax filings
// ═══════════════════════════════════════════════════════════════
async function searchProPublica(name: string) {
  try {
    const url = `https://projects.propublica.org/nonprofits/api/v2/search.json?q=${encodeURIComponent(name)}`;
    const res = await fetch(url);

    if (res.ok) {
      const data = await res.json();
      return {
        success: true,
        organizations: (data.organizations || []).slice(0, 15).map((org: any) => ({
          name: org.name,
          ein: org.ein,
          city: org.city,
          state: org.state,
          nteeCode: org.ntee_code,
          income: org.income_amount,
          subsection: org.subseccd,
        })),
        totalOrgs: data.total_results || 0,
      };
    }

    return { success: false, organizations: [], totalOrgs: 0 };
  } catch (err) {
    console.error("ProPublica search error:", err);
    return { success: false, error: String(err), organizations: [], totalOrgs: 0 };
  }
}

// ═══════════════════════════════════════════════════════════════
// Florida SunBiz — Business registrations
// ═══════════════════════════════════════════════════════════════
async function searchSunBiz(name: string) {
  try {
    const searchUrl = `https://search.sunbiz.org/Inquiry/CorporationSearch/SearchResults?inquiryType=OfficerRegisteredAgentName&searchNameOrder=true&searchTerm=${encodeURIComponent(name)}&listingType=active`;

    const res = await fetch(searchUrl, {
      headers: {
        "User-Agent": "Mozilla/5.0 (compatible; RecordTracer/1.0)",
        Accept: "text/html",
      },
    });

    if (!res.ok) {
      return { success: false, results: [], error: `Status ${res.status}` };
    }

    const html = await res.text();
    const results: any[] = [];

    // Parse the HTML table rows
    // SunBiz results are in table rows with links
    const rowRegex = /<tr[^>]*>([\s\S]*?)<\/tr>/gi;
    let rowMatch;
    while ((rowMatch = rowRegex.exec(html)) !== null) {
      const row = rowMatch[1];
      const cells: string[] = [];
      const cellRegex = /<td[^>]*>([\s\S]*?)<\/td>/gi;
      let cellMatch;
      while ((cellMatch = cellRegex.exec(row)) !== null) {
        // Strip HTML tags from cell content
        cells.push(cellMatch[1].replace(/<[^>]+>/g, "").trim());
      }

      // Extract link if present
      const linkMatch = row.match(/href="([^"]+)"/);
      const detailUrl = linkMatch ? linkMatch[1] : null;

      if (cells.length >= 3 && cells[0] && /^\w/.test(cells[0])) {
        results.push({
          entityName: cells[1] || cells[0],
          documentNumber: cells[0],
          status: cells[2] || "Unknown",
          filingDate: cells[3] || "",
          detailUrl: detailUrl,
        });
      }
    }

    return {
      success: true,
      results: results.slice(0, 15),
      totalResults: results.length,
    };
  } catch (err) {
    console.error("SunBiz search error:", err);
    return { success: false, error: String(err), results: [], totalResults: 0 };
  }
}

// ═══════════════════════════════════════════════════════════════
// OpenSecrets — Money in politics (requires API key)
// ═══════════════════════════════════════════════════════════════
async function searchOpenSecrets(name: string, state: string, apiKey: string) {
  try {
    // Search for legislators
    const url = `https://www.opensecrets.org/api/?method=getLegislators&id=${state}&apikey=${apiKey}&output=json`;
    const res = await fetch(url);

    if (res.ok) {
      const data = await res.json();
      const legislators = data?.response?.legislator || [];
      // Filter by name match
      const nameLower = name.toLowerCase();
      const matched = legislators.filter((l: any) => {
        const fullName = (l["@attributes"]?.firstlast || "").toLowerCase();
        return fullName.includes(nameLower) || nameLower.includes(fullName.split(" ").pop() || "");
      });

      return {
        success: true,
        legislators: matched.map((l: any) => ({
          name: l["@attributes"]?.firstlast,
          cid: l["@attributes"]?.cid,
          party: l["@attributes"]?.party,
          office: l["@attributes"]?.office,
          phone: l["@attributes"]?.phone,
          website: l["@attributes"]?.website,
          bioguideId: l["@attributes"]?.bioguide_id,
        })),
      };
    }

    return { success: false, legislators: [] };
  } catch (err) {
    console.error("OpenSecrets search error:", err);
    return { success: false, error: String(err), legislators: [] };
  }
}
