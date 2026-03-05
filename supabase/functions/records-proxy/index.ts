import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Authenticate the request
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

    const body = await req.json();
    const source = typeof body.source === "string" ? body.source.trim().slice(0, 50) : "";
    const searchName = typeof body.searchName === "string" ? body.searchName.replace(/<[^>]*>/g, "").trim().slice(0, 200) : "";
    const state = typeof body.state === "string" ? body.state.trim().slice(0, 50) : "";

    if (!source || !searchName) {
      return new Response(JSON.stringify({ error: "source and searchName are required" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const validSources = ["sec", "propublica", "sunbiz", "fec", "courtlistener", "sanctions", "icij", "lobbying", "faa", "contact-intel"];
    if (!validSources.includes(source)) {
      return new Response(JSON.stringify({ error: "Invalid source" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    let result: any = { success: false, error: "Unknown source" };

    if (source === "sec") result = await searchSEC(searchName);
    if (source === "propublica") result = await searchProPublica(searchName);
    if (source === "sunbiz") result = await searchSunBiz(searchName);
    if (source === "fec") result = await searchFEC(searchName, state);
    if (source === "courtlistener") result = await fetchCourtListener(searchName);
    if (source === "sanctions") result = await searchSanctions(searchName);
    if (source === "icij") result = await searchOffshoreLeaks(searchName);
    if (source === "lobbying") result = await searchLobbying(searchName);
    if (source === "faa") result = await searchFAA(searchName);
    if (source === "contact-intel") result = await searchContactIntel(searchName, state);

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
// FEC — Campaign finance (contributions, candidates, committees)
// ═══════════════════════════════════════════════════════════════
async function searchFEC(name: string, state: string) {
  const apiKey = Deno.env.get("FEC_API_KEY") || "DEMO_KEY";
  const stateCode = toStateAbbr(state);
  const stateParam = stateCode ? `&contributor_state=${stateCode}` : "";

  const contributions: any[] = [];
  const candidates: any[] = [];
  const committees: any[] = [];

  try {
    // Individual contributions
    const contribUrl = `https://api.open.fec.gov/v1/schedules/schedule_a/?contributor_name=${encodeURIComponent(name)}${stateParam}&per_page=20&sort=-contribution_receipt_date&api_key=${apiKey}`;
    const contribRes = await fetch(contribUrl);
    if (contribRes.ok) {
      const data = await contribRes.json();
      contributions.push(...(data.results || []));
    } else {
      console.error("[FEC] Contributions status:", contribRes.status);
      await contribRes.text();
    }
  } catch (err) {
    console.error("[FEC] Contributions fetch failed");
  }

  try {
    // Candidate search
    const candidateStateParam = stateCode ? `&state=${stateCode}` : "";
    const candidateUrl = `https://api.open.fec.gov/v1/candidates/search/?name=${encodeURIComponent(name)}${candidateStateParam}&per_page=10&api_key=${apiKey}`;
    const candidateRes = await fetch(candidateUrl);
    if (candidateRes.ok) {
      const data = await candidateRes.json();
      candidates.push(...(data.results || []));
    } else {
      console.error("[FEC] Candidates status:", candidateRes.status);
      await candidateRes.text();
    }
  } catch (err) {
    console.error("[FEC] Candidates error:", err);
  }

  try {
    // Committee/PAC search
    const committeeUrl = `https://api.open.fec.gov/v1/committees/?q=${encodeURIComponent(name)}&per_page=10&api_key=${apiKey}`;
    const committeeRes = await fetch(committeeUrl);
    if (committeeRes.ok) {
      const data = await committeeRes.json();
      committees.push(...(data.results || []));
    } else {
      console.error("[FEC] Committees status:", committeeRes.status);
      await committeeRes.text();
    }
  } catch (err) {
    console.error("[FEC] Committees error:", err);
  }

  return {
    success: true,
    contributions,
    candidates,
    committees,
  };
}

// ═══════════════════════════════════════════════════════════════
// SEC EDGAR
// ═══════════════════════════════════════════════════════════════
async function searchSEC(name: string) {
  try {
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
// ProPublica Nonprofit Explorer
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
          name: org.name, ein: org.ein, city: org.city, state: org.state,
          nteeCode: org.ntee_code, income: org.income_amount, subsection: org.subseccd,
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
// Florida SunBiz
// ═══════════════════════════════════════════════════════════════
function looksLikeBusinessName(name: string): boolean {
  const bizPatterns = /\b(llc|l\.l\.c|inc|corp|corporation|company|co\b|ltd|limited|lp|l\.p\.|llp|pllc|pa|p\.a\.|plc|group|holdings|enterprises|associates|partners|foundation|trust|fund|ventures|capital|management|consulting|services|solutions|technologies|properties|investments|realty|development)\b/i;
  return bizPatterns.test(name);
}

async function searchSunBiz(name: string) {
  try {
    const isBusiness = looksLikeBusinessName(name);
    const inquiryType = isBusiness ? "EntityName" : "OfficerRegisteredAgentName";
    console.log(`[SunBiz] Searching as ${isBusiness ? "entity" : "officer"}: "${name}"`);
    
    const searchUrl = `https://search.sunbiz.org/Inquiry/CorporationSearch/SearchResults?inquiryType=${inquiryType}&searchNameOrder=true&searchTerm=${encodeURIComponent(name)}&listingType=active`;
    const res = await fetch(searchUrl, {
      headers: { "User-Agent": "Mozilla/5.0 (compatible; RecordTracer/1.0)", Accept: "text/html" },
    });
    if (!res.ok) return { success: false, results: [], error: `Status ${res.status}` };

    const html = await res.text();
    const results: any[] = [];
    const rowRegex = /<tr[^>]*>([\s\S]*?)<\/tr>/gi;
    let rowMatch;
    while ((rowMatch = rowRegex.exec(html)) !== null) {
      const row = rowMatch[1];
      const cells: string[] = [];
      const cellRegex = /<td[^>]*>([\s\S]*?)<\/td>/gi;
      let cellMatch;
      while ((cellMatch = cellRegex.exec(row)) !== null) {
        cells.push(cellMatch[1].replace(/<[^>]+>/g, "").trim());
      }
      const linkMatch = row.match(/href="([^"]+)"/);
      const detailUrl = linkMatch ? linkMatch[1] : null;
      if (cells.length >= 3 && cells[0] && /^\w/.test(cells[0])) {
        if (isBusiness) {
          // Entity search: col0=entityName, col1=docNumber, col2=status
          results.push({
            entityName: cells[0],
            documentNumber: cells[1] || "",
            status: cells[2] || "Unknown",
            filingDate: cells[3] || "",
            detailUrl,
          });
        } else {
          // Officer search: col0=officerName, col1=entityName, col2=docNumber
          results.push({
            officerName: cells[0],
            entityName: cells[1] || "",
            documentNumber: cells[2] || "",
            status: "Active",
            filingDate: "",
            detailUrl,
          });
        }
      }
    }
    return { success: true, results: results.slice(0, 30), totalResults: results.length, inquiryType };
  } catch (err) {
    console.error("SunBiz search error:", err);
    return { success: false, error: String(err), results: [], totalResults: 0 };
  }
}


// ═══════════════════════════════════════════════════════════════
// CourtListener
// ═══════════════════════════════════════════════════════════════
// ═══════════════════════════════════════════════════════════════
// OpenSanctions — Global sanctions, PEPs, and watchlists
// ═══════════════════════════════════════════════════════════════
async function searchSanctions(name: string) {
  try {
    const apiKey = (Deno.env.get("OPENSANCTIONS_API_KEY") || "").replace(/[^\x20-\x7E]/g, "").trim();
    const apiKeyParam = apiKey ? `&api_key=${encodeURIComponent(apiKey)}` : "";
    const url = `https://api.opensanctions.org/search/default?q=${encodeURIComponent(name)}&limit=15${apiKeyParam}`;
    const res = await fetch(url, { headers: { "Accept": "application/json" } });
    
    if (res.ok) {
      const data = await res.json();
      const results = (data.results || []).map((r: any) => ({
        id: r.id || "",
        name: r.caption || r.name || "Unknown",
        schema: r.schema || "",
        datasets: (r.datasets || []).join(", "),
        countries: (r.properties?.country || []).join(", "),
        topics: (r.properties?.topics || []).join(", "),
        birthDate: (r.properties?.birthDate || [])[0] || "",
        address: (r.properties?.address || [])[0] || "",
        notes: (r.properties?.notes || [])[0] || "",
        sourceUrl: r.id ? `https://www.opensanctions.org/entities/${r.id}/` : "",
        score: r.score || 0,
      }));
      return { success: true, results, total: data.total || results.length };
    }
    return { success: false, results: [], total: 0, error: `Status ${res.status}` };
  } catch (err) {
    console.error("[Sanctions] Search error:", err);
    return { success: false, error: String(err), results: [], total: 0 };
  }
}

// ═══════════════════════════════════════════════════════════════
// ICIJ Offshore Leaks — Panama/Paradise/Pandora Papers
// ═══════════════════════════════════════════════════════════════
async function searchOffshoreLeaks(name: string) {
  try {
    const url = "https://offshoreleaks.icij.org/api/v1/reconcile";
    const body = JSON.stringify({
      queries: {
        q0: { query: name, type: "Entity", limit: 10 },
        q1: { query: name, type: "Officer", limit: 10 },
        q2: { query: name, type: "Intermediary", limit: 5 },
      },
    });
    console.log("[ICIJ] Searching:", name);
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json", "Accept": "application/json" },
      body,
    });
    console.log("[ICIJ] Response status:", res.status);

    if (res.ok) {
      const data = await res.json();
      const entities: any[] = [];
      for (const key of ["q0", "q1", "q2"]) {
        const queryResult = data[key];
        if (queryResult?.result) {
          for (const r of queryResult.result) {
            entities.push({
              id: r.id || "",
              name: r.name || "Unknown",
              type: key === "q0" ? "Offshore Entity" : key === "q1" ? "Officer/Beneficiary" : "Intermediary",
              score: r.score || 0,
              match: r.match || false,
              description: r.description || "",
            });
          }
        }
      }
      return { success: true, entities, total: entities.length };
    }
    return { success: false, entities: [], total: 0, error: `Status ${res.status}` };
  } catch (err) {
    console.error("[ICIJ] Search error:", err);
    return { success: false, error: String(err), entities: [], total: 0 };
  }
}

// ═══════════════════════════════════════════════════════════════
// Senate Lobbying Disclosures (LDA)
// ═══════════════════════════════════════════════════════════════
async function searchLobbying(name: string) {
  try {
    const url = `https://lda.senate.gov/api/v1/filings/?filing_year=2024&client_name=${encodeURIComponent(name)}&page_size=15`;
    const res = await fetch(url, {
      headers: { "Accept": "application/json" },
    });

    if (res.ok) {
      const data = await res.json();
      const rawFilings = data.results || [];
      const filings = rawFilings.map((f: any) => ({
        registrantName: f.registrant?.name || f.registrant_name || "Unknown",
        clientName: f.client?.name || f.client_name || "Unknown",
        filingType: f.filing_type_display || f.filing_type || "N/A",
        amount: f.income || f.expenses || null,
        filingYear: f.filing_year || "N/A",
        filingPeriod: f.filing_period_display || f.filing_period || "N/A",
        filingDate: f.dt_posted || "N/A",
        filingUuid: f.filing_uuid || "",
      }));
      return { success: true, filings, total: data.count || filings.length };
    }
    return { success: false, filings: [], total: 0, error: `Status ${res.status}` };
  } catch (err) {
    console.error("[Lobbying] Search error:", err);
    return { success: false, error: String(err), filings: [], total: 0 };
  }
}

// ═══════════════════════════════════════════════════════════════
// FAA Aircraft Registry
// ═══════════════════════════════════════════════════════════════
async function searchFAA(name: string) {
  try {
    const url = `https://registry.faa.gov/AircraftInquiry/Search/NameResult?Nametxt=${encodeURIComponent(name)}&sort_option=1&PageSize=20`;
    const res = await fetch(url, {
      headers: { "User-Agent": "Mozilla/5.0 (compatible; RecordTracer/1.0)", Accept: "text/html" },
    });

    if (!res.ok) return { success: false, aircraft: [], total: 0, error: `Status ${res.status}` };

    const html = await res.text();
    const aircraft: any[] = [];
    const rowRegex = /<tr[^>]*>([\s\S]*?)<\/tr>/gi;
    let rowMatch;
    while ((rowMatch = rowRegex.exec(html)) !== null) {
      const row = rowMatch[1];
      if (!row.includes("<td")) continue;
      const cells: string[] = [];
      const cellRegex = /<td[^>]*>([\s\S]*?)<\/td>/gi;
      let cellMatch;
      while ((cellMatch = cellRegex.exec(row)) !== null) {
        cells.push(cellMatch[1].replace(/<[^>]+>/g, "").trim());
      }
      if (cells.length >= 7 && /^N?\d/.test(cells[0])) {
        aircraft.push({
          nNumber: cells[0] || "",
          serialNumber: cells[1] || "",
          manufacturer: cells[2] || "",
          model: cells[3] || "",
          yearMfr: cells[4] || "",
          registrant: cells[5] || "",
          city: cells[6] || "",
          state: cells[7] || "",
        });
      }
    }
    console.log("[FAA] Aircraft found:", aircraft.length);
    return { success: true, aircraft, total: aircraft.length };
  } catch (err) {
    console.error("[FAA] Search error:", err);
    return { success: false, error: String(err), aircraft: [], total: 0 };
  }
}

// ═══════════════════════════════════════════════════════════════
// Contact Intelligence — FEC candidate addresses, FL Elections, SunBiz addresses
// ═══════════════════════════════════════════════════════════════

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

async function searchContactIntel(name: string, state: string) {
  const contacts: any[] = [];
  const stateCode = toStateAbbr(state);
  const apiKey = Deno.env.get("FEC_API_KEY") || "DEMO_KEY";

  // 1. FEC Candidate filings — address info from candidate detail
  try {
    const stateParam = stateCode ? `&state=${stateCode}` : "";
    const url = `https://api.open.fec.gov/v1/candidates/search/?name=${encodeURIComponent(name)}${stateParam}&per_page=5&api_key=${apiKey}`;
    const res = await fetch(url);
    if (res.ok) {
      const data = await res.json();
      
      for (const c of (data.results || [])) {
        try {
          const detailUrl = `https://api.open.fec.gov/v1/candidate/${c.candidate_id}/?api_key=${apiKey}`;
          const detailRes = await fetch(detailUrl);
          if (detailRes.ok) {
            const detail = await detailRes.json();
            const info = detail.results?.[0] || {};
            const address = [info.address_street_1, info.address_street_2, info.address_city, info.address_state, info.address_zip]
              .filter(Boolean).join(", ");
            if (address) {
              contacts.push({
                source: "FEC Candidate Filing",
                name: c.name || name,
                address,
                phone: null,
                office: c.office_full || null,
                party: c.party_full || null,
                candidateId: c.candidate_id,
                sourceUrl: `https://www.fec.gov/data/candidate/${c.candidate_id}/`,
              });
            }
          } else { await detailRes.text(); }
        } catch (e) { console.error("[ContactIntel] FEC detail error:", e); }

        if (c.principal_committees?.length > 0) {
          for (const comm of c.principal_committees) {
            try {
              const commUrl = `https://api.open.fec.gov/v1/committee/${comm.committee_id}/?api_key=${apiKey}`;
              const commRes = await fetch(commUrl);
              if (commRes.ok) {
                const commData = await commRes.json();
                const ci = commData.results?.[0] || {};
                const commAddr = [ci.street_1, ci.street_2, ci.city, ci.state, ci.zip]
                  .filter(Boolean).join(", ");
                if (commAddr) {
                  contacts.push({
                    source: "FEC Committee Filing",
                    name: ci.treasurer_name || ci.name || comm.committee_id,
                    address: commAddr,
                    phone: null,
                    role: "Treasurer / Committee",
                    committeeId: comm.committee_id,
                    sourceUrl: `https://www.fec.gov/data/committee/${comm.committee_id}/`,
                  });
                }
              } else { await commRes.text(); }
            } catch (e) { console.error("[ContactIntel] FEC committee error:", e); }
          }
        }
      }
    } else { await res.text(); }
  } catch (err) { console.error("[ContactIntel] FEC candidate error:", err); }

  // 2. FEC Individual Contributions — contributor addresses from Schedule A
  try {
    const stateParam = stateCode ? `&contributor_state=${stateCode}` : "";
    const url = `https://api.open.fec.gov/v1/schedules/schedule_a/?contributor_name=${encodeURIComponent(name)}${stateParam}&per_page=5&sort=-contribution_receipt_date&api_key=${apiKey}`;
    const res = await fetch(url);
    if (res.ok) {
      const data = await res.json();
      
      const seen = new Set<string>();
      for (const c of (data.results || [])) {
        const addr = [c.contributor_street_1, c.contributor_street_2, c.contributor_city, c.contributor_state, c.contributor_zip]
          .filter(Boolean).join(", ");
        if (addr && !seen.has(addr)) {
          seen.add(addr);
          contacts.push({
            source: "FEC Contribution Filing",
            name: c.contributor_name || name,
            address: addr,
            phone: null,
            role: c.contributor_employer ? `${c.contributor_occupation || ""} at ${c.contributor_employer}`.trim() : c.contributor_occupation || null,
            sourceUrl: `https://www.fec.gov/data/receipts/individual-contributions/?contributor_name=${encodeURIComponent(name)}`,
          });
        }
      }
    } else { await res.text(); }
  } catch (err) { console.error("[ContactIntel] FEC contributions error:", err); }

  // 3. SunBiz — registered agent address from detail pages
  try {
    const searchUrl = `https://search.sunbiz.org/Inquiry/CorporationSearch/SearchResults?inquiryType=OfficerRegisteredAgentName&searchNameOrder=true&searchTerm=${encodeURIComponent(name)}&listingType=active`;
    
    const res = await fetch(searchUrl, {
      headers: { "User-Agent": "Mozilla/5.0 (compatible; RecordTracer/1.0)", Accept: "text/html" },
    });
    if (res.ok) {
      const html = await res.text();
      // Extract detail URLs
      const linkRegex = /href="(\/Inquiry\/CorporationSearch\/SearchResultDetail[^"]+)"/gi;
      const detailUrls: string[] = [];
      let linkMatch;
      while ((linkMatch = linkRegex.exec(html)) !== null && detailUrls.length < 3) {
        detailUrls.push(`https://search.sunbiz.org${linkMatch[1]}`);
      }
      
      for (const detailUrl of detailUrls) {
        try {
          const detailRes = await fetch(detailUrl, {
            headers: { "User-Agent": "Mozilla/5.0 (compatible; RecordTracer/1.0)", Accept: "text/html" },
          });
          if (detailRes.ok) {
            const detailHtml = await detailRes.text();
            // Extract entity name
            const titleMatch = detailHtml.match(/Document Number[\s\S]*?Filing Information[\s\S]*?<p[^>]*>([\s\S]*?)<\/p>/i)
              || detailHtml.match(/<title[^>]*>([\s\S]*?)<\/title>/i);
            const entityName = titleMatch ? titleMatch[1].replace(/<[^>]+>/g, "").trim().split(" - ")[0] : "Unknown Entity";

            // Look for any address pattern in the page — registered agent or principal address
            const addressRegex = /(\d+\s+[\w\s.]+(?:ST|AVE|BLVD|DR|RD|LN|CT|WAY|PL|CIR|PKWY|HWY)\b[\s\S]{0,80}?FL\s+\d{5})/gi;
            const addrMatches = detailHtml.replace(/<[^>]+>/g, " ").match(addressRegex);
            if (addrMatches && addrMatches.length > 0) {
              const addr = addrMatches[0].replace(/\s+/g, " ").trim();
              contacts.push({
                source: "FL SunBiz (Registered Agent)",
                name: entityName,
                address: addr,
                phone: null,
                sourceUrl: "https://search.sunbiz.org/Inquiry/CorporationSearch/ByName",
              });
            }
          }
        } catch (e) { console.error("[ContactIntel] SunBiz detail error:", e); }
      }
    }
  } catch (err) { console.error("[ContactIntel] SunBiz error:", err); }

  // 4. Property appraiser search links by state
  const propertyLinks = getPropertyAppraiserLinks(state);

  
  return {
    success: true,
    contacts,
    propertyLinks,
    totalContacts: contacts.length,
  };
}

function getPropertyAppraiserLinks(state: string): any[] {
  // Major county property appraiser search links
  const links: Record<string, any[]> = {
    Florida: [
      { county: "Miami-Dade", url: "https://www.miamidade.gov/pa/property-search.asp", label: "Miami-Dade Property Appraiser" },
      { county: "Broward", url: "https://web.bcpa.net/BcpaClient/", label: "Broward County Property Appraiser" },
      { county: "Palm Beach", url: "https://www.pbcgov.org/papa/", label: "Palm Beach County Property Appraiser" },
      { county: "Orange", url: "https://www.ocpafl.org/Searches/ParcelSearch.aspx", label: "Orange County Property Appraiser" },
      { county: "Hillsborough", url: "https://gis.hcpafl.org/propertysearch/", label: "Hillsborough County Property Appraiser" },
      { county: "Pinellas", url: "https://www.pcpao.gov/", label: "Pinellas County Property Appraiser" },
      { county: "Duval", url: "https://apps.coj.net/PAO_PropertySearch/", label: "Duval County (Jacksonville) Property Appraiser" },
      { county: "Lee", url: "https://www.leepa.org/Search/PropertySearch.aspx", label: "Lee County Property Appraiser" },
    ],
    Texas: [
      { county: "Harris", url: "https://public.hcad.org/records/quicksearch.asp", label: "Harris County (Houston) Appraisal District" },
      { county: "Dallas", url: "https://www.dallascad.org/SearchAddr.aspx", label: "Dallas Central Appraisal District" },
      { county: "Travis", url: "https://www.traviscad.org/property-search/", label: "Travis County (Austin) Appraisal District" },
    ],
    "New York": [
      { county: "NYC", url: "https://a836-acris.nyc.gov/DS/DocumentSearch/Index", label: "NYC ACRIS Property Records" },
    ],
    California: [
      { county: "Los Angeles", url: "https://portal.assessor.lacounty.gov/", label: "LA County Assessor" },
      { county: "San Francisco", url: "https://www.sfassessor.org/property-information/homeowners/property-search", label: "SF Assessor-Recorder" },
    ],
  };
  if (state === "All States / National") {
    return Object.values(links).flat();
  }
  return links[state] || [];
}

async function fetchCourtListener(name: string) {
  const token = Deno.env.get("COURTLISTENER_API_TOKEN");
  const headers: Record<string, string> = { Accept: "application/json" };
  if (token) headers["Authorization"] = `Token ${token}`;

  try {
    const searchUrl = `https://www.courtlistener.com/api/rest/v4/search/?q=${encodeURIComponent(name)}&format=json&order_by=score+desc`;
    const searchRes = await fetch(searchUrl, { headers });
    const searchBody = await searchRes.text();

    let cases: any[] = [];
    let totalCases = 0;
    if (searchRes.ok) {
      try {
        const searchData = JSON.parse(searchBody);
        totalCases = searchData.count || 0;
      cases = (searchData.results || []).slice(0, 15).map((r: any) => ({
          caseName: r.caseName || r.case_name || r.caseNameFull || r.case_name_full || "Unknown Case",
          court: r.court || r.court_id || "",
          docketNumber: r.docketNumber || r.docket_number || "",
          dateFiled: r.dateFiled || r.date_filed || "",
          dateTerminated: r.dateTerminated || r.date_terminated || "",
          status: r.status || "",
          assignedTo: r.assignedTo || r.assigned_to_str || "",
          cause: r.cause || "",
          suitNature: r.suitNature || r.nature_of_suit || "",
          description: r.snippet || r.description || "",
          absoluteUrl: r.absolute_url || r.absoluteUrl || "",
        }));
      } catch (parseErr) {
        console.error("[CourtListener] Failed to parse search response:", parseErr);
      }
    }

    let parties: any[] = [];
    let totalParties = 0;
    try {
      const partiesUrl = `https://www.courtlistener.com/api/rest/v4/parties/?name=${encodeURIComponent(name)}&format=json`;
      const partiesRes = await fetch(partiesUrl, { headers });
      if (partiesRes.ok) {
        const partiesData = await partiesRes.json();
        totalParties = partiesData.count || 0;
        parties = (partiesData.results || []).slice(0, 10).map((p: any) => ({
          name: p.name || "Unknown",
          partyType: p.party_type || "",
          dateTerminated: p.date_terminated || "",
        }));
      } else {
        await partiesRes.text();
      }
    } catch (partyErr) {
      console.error("[CourtListener] Parties search error:", partyErr);
    }

    return { success: true, cases, totalCases, parties, totalParties };
  } catch (err) {
    console.error("[CourtListener] Search error:", err);
    return { success: false, error: String(err), cases: [], totalCases: 0, parties: [], totalParties: 0 };
  }
}
