import { supabase } from "@/integrations/supabase/client";
import { sanitizeInput } from "@/utils/validation";

const STATE_ABBR: Record<string, string> = {
  Alabama:"AL",Alaska:"AK",Arizona:"AZ",Arkansas:"AR",California:"CA",Colorado:"CO",Connecticut:"CT",
  Delaware:"DE",Florida:"FL",Georgia:"GA",Hawaii:"HI",Idaho:"ID",Illinois:"IL",Indiana:"IN",Iowa:"IA",
  Kansas:"KS",Kentucky:"KY",Louisiana:"LA",Maine:"ME",Maryland:"MD",Massachusetts:"MA",Michigan:"MI",
  Minnesota:"MN",Mississippi:"MS",Missouri:"MO",Montana:"MT",Nebraska:"NE",Nevada:"NV",
  "New Hampshire":"NH","New Jersey":"NJ","New Mexico":"NM","New York":"NY","North Carolina":"NC",
  "North Dakota":"ND",Ohio:"OH",Oklahoma:"OK",Oregon:"OR",Pennsylvania:"PA","Rhode Island":"RI",
  "South Carolina":"SC","South Dakota":"SD",Tennessee:"TN",Texas:"TX",Utah:"UT",Vermont:"VT",
  Virginia:"VA",Washington:"WA","West Virginia":"WV",Wisconsin:"WI",Wyoming:"WY",
  "District of Columbia":"DC",
};

function toStateCode(state: string): string {
  if (state.length === 2) return state.toUpperCase();
  return STATE_ABBR[state] || state;
}

export interface RecordResult {
  id: string;
  source: string;
  description: string;
  category: string;
  details: Record<string, string>;
  sourceUrl?: string;
  relevance?: number; // 0-100, higher = better match
  returnedName?: string; // The name as it appeared in the source database
}

export interface ApiDebugInfo {
  api: string;
  status: "success" | "error";
  resultCount: number;
  error?: string;
  duration?: number;
}

function formatMoney(amount: number): string {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(amount);
}

async function proxyFetch(source: string, searchName: string, state?: string): Promise<any> {
  console.log(`[proxyFetch] Calling records-proxy for source: ${source}`);
  try {
    const { data, error } = await supabase.functions.invoke("records-proxy", {
      body: { source, searchName: sanitizeInput(searchName), state },
    });
    if (error) {
      console.error(`[proxyFetch] Error for ${source}:`, error);
      throw new Error(`Proxy error: ${error.message}`);
    }
    if (data == null || typeof data !== "object") {
      console.error(`[proxyFetch] Unexpected response shape for ${source}:`, data);
      return { success: false, error: "Unexpected response format" };
    }
    console.log(`[proxyFetch] Success for ${source}:`, typeof data);
    return data;
  } catch (err) {
    console.error(`[proxyFetch] Exception for ${source}:`, err);
    return { success: false, error: String(err) };
  }
}

// ═══════════════════════════════════════════════════════════════
// FEC — now routed through edge function proxy
// ═══════════════════════════════════════════════════════════════
export async function searchFEC(name: string, state: string): Promise<RecordResult[]> {
  const isNational = !state || state === "All States / National";
  const stateCode = isNational ? "" : toStateCode(state);
  const results: RecordResult[] = [];
  let id = 0;

  try {
    const data = await proxyFetch("fec", name, stateCode);
    if (!data.success) {
      console.error("[FEC] Proxy returned error:", data.error);
      return results;
    }

    const contributions = data.contributions || [];
    if (contributions.length > 0) {
      const totalAmount = contributions.reduce((sum: number, c: any) => sum + (c.contribution_receipt_amount || 0), 0);
      const uniqueRecipients = new Set(contributions.map((c: any) => c.committee?.name || c.committee_id)).size;

      results.push({
        id: "fec-summary",
        source: "FEC Campaign Finance Summary",
        category: "donations",
        description: `${contributions.length} contributions totaling ${formatMoney(totalAmount)} to ${uniqueRecipients} recipient(s)`,
        details: {
          "Total Contributions": String(contributions.length),
          "Total Amount": formatMoney(totalAmount),
          "Unique Recipients": String(uniqueRecipients),
          "Date Range": `${contributions[contributions.length - 1]?.contribution_receipt_date || "N/A"} to ${contributions[0]?.contribution_receipt_date || "N/A"}`,
        },
        sourceUrl: `https://www.fec.gov/data/receipts/individual-contributions/?contributor_name=${encodeURIComponent(name)}&contributor_state=${stateCode}`,
      });

      for (const c of contributions.slice(0, 10)) {
        const amount = c.contribution_receipt_amount || 0;
        const recipient = c.committee?.name || c.committee_id || "Unknown";
        results.push({
          id: `fec-${++id}`,
          source: "FEC Individual Contribution",
          category: "donations",
          description: `${formatMoney(amount)} to ${recipient} on ${c.contribution_receipt_date || "N/A"}`,
          returnedName: c.contributor_name || undefined,
          details: {
            Contributor: c.contributor_name || name,
            Amount: formatMoney(amount),
            Recipient: recipient,
            Date: c.contribution_receipt_date || "N/A",
            City: c.contributor_city || "N/A",
            State: c.contributor_state || "N/A",
            Employer: c.contributor_employer || "N/A",
            Occupation: c.contributor_occupation || "N/A",
          },
          sourceUrl: `https://www.fec.gov/data/receipts/individual-contributions/?contributor_name=${encodeURIComponent(name)}`,
        });
      }
    }

    for (const c of (data.candidates || [])) {
      results.push({
        id: `fec-cand-${++id}`,
        source: "FEC Candidate Record",
        category: "donations",
        description: `${c.name} — ${c.office_full || "Unknown Office"} (${c.party_full || "Unknown Party"})`,
        details: {
          Name: c.name, Office: c.office_full || "N/A", State: c.state || "N/A",
          District: c.district || "N/A", Party: c.party_full || "N/A",
          "Candidate ID": c.candidate_id || "N/A",
          "Election Cycles": (c.cycles || []).join(", "),
          "Has Raised Funds": c.has_raised_funds ? "Yes" : "No",
        },
        sourceUrl: `https://www.fec.gov/data/candidate/${c.candidate_id}/`,
      });
    }

    for (const c of (data.committees || [])) {
      results.push({
        id: `fec-committee-${++id}`,
        source: "FEC Committee/PAC",
        category: "donations",
        description: `${c.name} — ${c.committee_type_full || "Committee"} (${c.party_full || "N/A"})`,
        details: {
          Name: c.name || "N/A",
          "Committee Type": c.committee_type_full || "N/A",
          Designation: c.designation_full || "N/A",
          "Filing Frequency": c.filing_frequency || "N/A",
          "First Filing Date": c.first_file_date || "N/A",
          "Last Filing Date": c.last_file_date || "N/A",
          Treasurer: c.treasurer_name || "N/A",
          "Total Receipts": c.total_receipts ? `$${c.total_receipts.toLocaleString()}` : "N/A",
          "Total Disbursements": c.total_disbursements ? `$${c.total_disbursements.toLocaleString()}` : "N/A",
        },
        sourceUrl: `https://www.fec.gov/data/committee/${c.committee_id}/`,
      });
    }
  } catch (err) {
    console.error("[FEC] Search failed:", err);
  }
  return results;
}

// ═══════════════════════════════════════════════════════════════
// SEC EDGAR
// ═══════════════════════════════════════════════════════════════
export async function searchSEC(name: string): Promise<RecordResult[]> {
  const results: RecordResult[] = [];
  let id = 0;
  try {
    const data = await proxyFetch("sec", name);
    if (data.success && data.filings?.length > 0) {
      for (const f of data.filings.slice(0, 15)) {
        const entityName = f.entityName !== "Unknown Entity" ? f.entityName : "SEC Filing";
        const formType = f.formType !== "Unknown Form" ? f.formType : "Filing";
        const description = entityName !== "SEC Filing"
          ? `${entityName} — ${formType} filed ${f.fileDate}`
          : `SEC filing related to "${name}" (${formType}) — ${f.fileDate}`;
        results.push({
          id: `sec-${++id}`, source: "SEC EDGAR Filing", category: "business", description,
          details: {
            Entity: entityName, "Form Type": formType, "Filing Date": f.fileDate || "N/A",
            "File Number": f.fileNum || "N/A", "Period of Report": f.periodOfReport || "N/A",
          },
          sourceUrl: `https://www.sec.gov/cgi-bin/browse-edgar?company=${encodeURIComponent(name)}&CIK=&type=&dateb=&owner=include&count=40&search_text=&action=getcompany`,
        });
      }
    }
  } catch (err) { console.error("[SEC] Search failed:", err); }
  return results;
}

// ═══════════════════════════════════════════════════════════════
// USASpending
// ═══════════════════════════════════════════════════════════════
export async function searchUSASpending(name: string, state: string): Promise<RecordResult[]> {
  const results: RecordResult[] = [];
  let id = 0;
  try {
    const endpoint = "https://api.usaspending.gov/api/v2/search/spending_by_award/";
    const baseFields = ["Award ID", "Recipient Name", "Start Date", "End Date", "Award Amount",
      "Awarding Agency", "Awarding Sub Agency", "Award Type", "Description", "internal_id"];

    // Contracts
    const res = await fetch(endpoint, {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        filters: { recipient_search_text: [name], award_type_codes: ["A", "B", "C", "D"],
          time_period: [{ start_date: "2015-10-01", end_date: "2026-09-30" }] },
        fields: baseFields, page: 1, limit: 15, sort: "Award Amount", order: "desc",
      }),
    });
    let awards: any[] = [];
    if (res.ok) {
      const data = await res.json();
      awards = data.results || [];
    }
    if (awards.length === 0) {
      const fallbackRes = await fetch(endpoint, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          filters: { keywords: [name], award_type_codes: ["A", "B", "C", "D"],
            time_period: [{ start_date: "2015-10-01", end_date: "2026-09-30" }] },
          fields: baseFields, page: 1, limit: 15, sort: "Award Amount", order: "desc",
        }),
      });
      if (fallbackRes.ok) {
        const fallbackData = await fallbackRes.json();
        awards = fallbackData.results || [];
      }
    }

    if (awards.length > 0) {
      const totalAmount = awards.reduce((sum: number, a: any) => sum + (parseFloat(a["Award Amount"]) || 0), 0);
      const agencies = new Set(awards.map((a: any) => a["Awarding Agency"])).size;
      results.push({
        id: "usa-summary", source: "Federal Contracts Summary", category: "contracts",
        description: `${awards.length} federal contract(s) worth ${formatMoney(totalAmount)} from ${agencies} agency/agencies`,
        details: { "Total Awards": String(awards.length), "Total Value": formatMoney(totalAmount), "Awarding Agencies": String(agencies) },
        sourceUrl: `https://www.usaspending.gov/search/?hash=recipient-${encodeURIComponent(name)}`,
      });
      for (const a of awards.slice(0, 10)) {
        const amount = parseFloat(a["Award Amount"]) || 0;
        results.push({
          id: `usa-${++id}`, source: "Federal Contract", category: "contracts",
          description: `${formatMoney(amount)} from ${a["Awarding Agency"] || "Unknown"} — ${(a["Description"] || "No description").slice(0, 100)}`,
          details: {
            Recipient: a["Recipient Name"] || name, "Award Amount": formatMoney(amount),
            "Awarding Agency": a["Awarding Agency"] || "N/A", "Sub Agency": a["Awarding Sub Agency"] || "N/A",
            "Award Type": a["Award Type"] || "N/A", "Start Date": a["Start Date"] || "N/A",
            "End Date": a["End Date"] || "N/A", Description: a["Description"] || "N/A", "Award ID": a["Award ID"] || "N/A",
          },
          sourceUrl: a["internal_id"] ? `https://www.usaspending.gov/award/${a["internal_id"]}` : "https://www.usaspending.gov/search",
        });
      }
    }

    // Grants
    const grantRes = await fetch(endpoint, {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        filters: { recipient_search_text: [name], award_type_codes: ["02", "03", "04", "05"],
          time_period: [{ start_date: "2015-10-01", end_date: "2026-09-30" }] },
        fields: ["Award ID", "Recipient Name", "Start Date", "End Date", "Award Amount",
          "Awarding Agency", "Award Type", "Description", "internal_id"],
        page: 1, limit: 10, sort: "Award Amount", order: "desc",
      }),
    });
    let grants: any[] = [];
    if (grantRes.ok) {
      const grantData = await grantRes.json();
      grants = grantData.results || [];
    }
    if (grants.length === 0) {
      const grantFallback = await fetch(endpoint, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          filters: { keywords: [name], award_type_codes: ["02", "03", "04", "05"],
            time_period: [{ start_date: "2015-10-01", end_date: "2026-09-30" }] },
          fields: ["Award ID", "Recipient Name", "Start Date", "End Date", "Award Amount",
            "Awarding Agency", "Award Type", "Description", "internal_id"],
          page: 1, limit: 10, sort: "Award Amount", order: "desc",
        }),
      });
      if (grantFallback.ok) {
        const grantFallbackData = await grantFallback.json();
        grants = grantFallbackData.results || [];
      }
    }
    for (const a of grants.slice(0, 5)) {
      const amount = parseFloat(a["Award Amount"]) || 0;
      results.push({
        id: `usa-grant-${++id}`, source: "Federal Grant", category: "contracts",
        description: `${formatMoney(amount)} grant from ${a["Awarding Agency"] || "Unknown"} — ${(a["Description"] || "").slice(0, 100)}`,
        details: {
          Recipient: a["Recipient Name"] || name, "Grant Amount": formatMoney(amount),
          Agency: a["Awarding Agency"] || "N/A", Type: a["Award Type"] || "N/A",
          "Start Date": a["Start Date"] || "N/A", "End Date": a["End Date"] || "N/A", Description: a["Description"] || "N/A",
        },
        sourceUrl: a["internal_id"] ? `https://www.usaspending.gov/award/${a["internal_id"]}` : "https://www.usaspending.gov/search",
      });
    }
  } catch (err) { console.error("[USASpending] Search failed:", err); }
  return results;
}

// ═══════════════════════════════════════════════════════════════
// ProPublica Nonprofits
// ═══════════════════════════════════════════════════════════════
export async function searchProPublicaNonprofits(name: string): Promise<RecordResult[]> {
  const results: RecordResult[] = [];
  let id = 0;
  try {
    const data = await proxyFetch("propublica", name);
    if (data.success && data.organizations?.length > 0) {
      for (const org of data.organizations.slice(0, 10)) {
        const revenue = org.income ? formatMoney(org.income) : "N/A";
        results.push({
          id: `pp-${++id}`, source: "ProPublica Nonprofit Record", category: "business",
          description: `${org.name} (${org.city || "?"}, ${org.state || "?"}) — Revenue: ${revenue}`,
          details: {
            Name: org.name || "N/A", EIN: org.ein ? String(org.ein) : "N/A",
            City: org.city || "N/A", State: org.state || "N/A",
            "NTEE Code": org.nteeCode || "N/A", "Total Revenue": revenue,
            Subsection: org.subsection ? `501(c)(${org.subsection})` : "N/A",
          },
          sourceUrl: org.ein ? `https://projects.propublica.org/nonprofits/organizations/${org.ein}` : undefined,
        });
      }
    }
  } catch (err) { console.error("[ProPublica] Search failed:", err); }
  return results;
}

// ═══════════════════════════════════════════════════════════════
// Florida SunBiz
// ═══════════════════════════════════════════════════════════════

function looksLikeBusinessName(name: string): boolean {
  const bizPatterns = /\b(llc|l\.l\.c|inc|corp|corporation|company|co\b|ltd|limited|lp|l\.p\.|llp|pllc|pa|p\.a\.|plc|group|holdings|enterprises|associates|partners|foundation|trust|fund|ventures|capital|management|consulting|services|solutions|technologies|properties|investments|realty|development)\b/i;
  return bizPatterns.test(name);
}

function sunbizNameMatch(searchName: string, resultText: string, isBusiness: boolean): boolean {
  const normalize = (s: string) => s.toLowerCase().replace(/[^a-z0-9 ]/g, "").replace(/\s+/g, " ").trim();
  const search = normalize(searchName);
  const result = normalize(resultText);

  if (isBusiness) {
    const coreName = search.replace(/\b(llc|inc|corp|corporation|company|co|ltd|limited|lp|llp|pllc|pa|plc)\b/g, "").trim();
    return coreName.length >= 3 && result.includes(coreName);
  }

  // For person: parse "LASTNAME, FIRSTNAME" format from SunBiz officer field
  const searchParts = search.split(" ").filter(p => p.length >= 2);
  if (searchParts.length === 0) return false;
  
  // SunBiz returns officer names like "WILLIAM, WEST" or "WILLIAM WEST"
  const resultParts = result.replace(",", " ").split(" ").filter(p => p.length >= 2);
  
  const searchLast = searchParts[searchParts.length - 1];
  const searchFirst = searchParts[0];
  
  // Check if result contains EXACTLY the last name (not just starts with it)
  const hasExactLast = resultParts.some(p => p === searchLast);
  const hasFirst = resultParts.some(p => p === searchFirst || p.startsWith(searchFirst));
  
  return hasExactLast && hasFirst;
}

export async function searchSunBiz(name: string): Promise<RecordResult[]> {
  const results: RecordResult[] = [];
  let id = 0;
  const isBusiness = looksLikeBusinessName(name);
  try {
    const data = await proxyFetch("sunbiz", name);
    if (data.success && data.results?.length > 0) {
      const filtered = data.results.filter((entity: any) => {
        const textToCheck = isBusiness
          ? (entity.entityName || "")
          : (entity.officerName || entity.documentNumber || "");
        return sunbizNameMatch(name, textToCheck, isBusiness);
      });

      const inquiryType = data.inquiryType || (isBusiness ? "EntityName" : "OfficerRegisteredAgentName");
      
      for (const entity of filtered.slice(0, 10)) {
        const detailLink = entity.detailUrl
          ? `https://search.sunbiz.org${entity.detailUrl.replace(/&amp;/g, "&")}`
          : `https://search.sunbiz.org/Inquiry/CorporationSearch/SearchResults?inquiryType=${inquiryType}&searchNameOrder=true&searchTerm=${encodeURIComponent(name)}`;
        
        results.push({
          id: `sunbiz-${++id}`, source: "Florida SunBiz", category: "business",
          description: isBusiness
            ? `${entity.entityName || "Unknown"} (${entity.status || "N/A"})`
            : `${entity.entityName || "Unknown"} — Officer: ${entity.officerName || "N/A"}`,
          details: {
            "Entity Name": entity.entityName || "N/A",
            ...(isBusiness ? {} : { "Officer/Agent": entity.officerName || "N/A" }),
            "Document Number": entity.documentNumber || "N/A",
            Status: entity.status || "N/A",
            "Filing Date": entity.filingDate || "N/A",
          },
          sourceUrl: detailLink,
        });
      }
    }
  } catch (err) { console.error("[SunBiz] Search failed:", err); }
  return results;
}

// ═══════════════════════════════════════════════════════════════
// CourtListener
// ═══════════════════════════════════════════════════════════════
export async function searchCourtListener(name: string): Promise<RecordResult[]> {
  const results: RecordResult[] = [];
  let id = 0;
  try {
    const data = await proxyFetch("courtlistener", name);
    if (data.success && data.cases?.length > 0) {
      const clSearchUrl = `https://www.courtlistener.com/?q=${encodeURIComponent(name)}&type=r&order_by=score+desc`;
      const pacerUrl = "https://www.pacer.gov/";
      results.push({
        id: "court-summary", source: "Federal Court Records Summary", category: "court",
        description: `${data.totalCases} federal court case(s) found for "${name}"`,
        details: {
          "Total Cases": String(data.totalCases),
          "Related Parties": String(data.totalParties || 0),
          "PACER Lookup": pacerUrl,
        },
        sourceUrl: clSearchUrl,
      });
      for (const c of data.cases.slice(0, 12)) {
        const caseName = c.caseName || "Unknown Case";
        const caseUrl = c.absoluteUrl
          ? `https://www.courtlistener.com${c.absoluteUrl}`
          : `https://www.courtlistener.com/?q=${encodeURIComponent(caseName)}&type=r&order_by=score+desc`;
        results.push({
          id: `court-${++id}`, source: "Federal Court Case", category: "court",
          description: `${caseName} (${c.court || "Unknown Court"})`,
          details: {
            "Case Name": caseName, Court: c.court || "N/A",
            "Docket Number": c.docketNumber || "N/A", "Date Filed": c.dateFiled || "N/A",
            "Date Terminated": c.dateTerminated || "Ongoing", Status: c.status || "N/A",
            "Assigned To": c.assignedTo || "N/A", Cause: c.cause || "N/A",
            "Nature of Suit": c.suitNature || "N/A",
            "PACER Lookup": pacerUrl,
            ...(c.description ? { Description: c.description.slice(0, 200) } : {}),
          },
          sourceUrl: caseUrl,
        });
      }
    }
    if (data.parties?.length > 0) {
      for (const p of data.parties.slice(0, 5)) {
        results.push({
          id: `court-party-${++id}`, source: "Court Party Record", category: "court",
          description: `${p.name} — ${p.partyType || "Party"} in federal case`,
          details: {
            Name: p.name || "N/A", "Party Type": p.partyType || "N/A",
            "Date Terminated": p.dateTerminated || "N/A",
            "PACER Lookup": "https://www.pacer.gov/",
          },
          sourceUrl: `https://www.courtlistener.com/?q=${encodeURIComponent(p.name || name)}&type=r&order_by=score+desc`,
        });
      }
    }
  } catch (err) { console.error("[CourtListener] Search failed:", err); }
  return results;
}

// ═══════════════════════════════════════════════════════════════
// OpenSanctions — Global sanctions, PEPs, and watchlists
// ═══════════════════════════════════════════════════════════════
export async function searchSanctions(name: string): Promise<RecordResult[]> {
  const results: RecordResult[] = [];
  let id = 0;
  try {
    const data = await proxyFetch("sanctions", name);
    if (data.success && data.results?.length > 0) {
      const totalCount = typeof data.total === "number" ? data.total : (Array.isArray(data.results) ? data.results.length : 0);
      results.push({
        id: "sanctions-summary",
        source: "Global Sanctions & PEPs Summary",
        category: "sanctions",
        description: `${totalCount} record(s) found across global sanctions lists and PEP databases`,
        details: {
          "Total Matches": String(data.total),
          "Source": "OpenSanctions (OFAC, UN, EU, and 100+ other lists)",
          "Disclaimer": "Inclusion does not imply wrongdoing — verify identities carefully",
        },
        sourceUrl: `https://www.opensanctions.org/search/?q=${encodeURIComponent(name)}`,
      });
      for (const r of data.results.slice(0, 12)) {
        results.push({
          id: `sanctions-${++id}`,
          source: "Sanctions/PEP Record",
          category: "sanctions",
          description: `${r.name} — ${r.schema || "Entity"} (${r.datasets || "Unknown list"})`,
          details: {
            Name: r.name || "N/A",
            Type: r.schema || "N/A",
            "Sanctions Lists": r.datasets || "N/A",
            Countries: r.countries || "N/A",
            Topics: r.topics || "N/A",
            "Birth Date": r.birthDate || "N/A",
            Address: r.address || "N/A",
            Notes: r.notes ? r.notes.slice(0, 300) : "N/A",
          },
          sourceUrl: r.sourceUrl || `https://www.opensanctions.org/search/?q=${encodeURIComponent(name)}`,
        });
      }
    }
  } catch (err) {
    console.error("[Sanctions] Search failed:", err);
  }
  return results;
}

// ═══════════════════════════════════════════════════════════════
// ICIJ Offshore Leaks — Panama/Paradise/Pandora Papers
// ═══════════════════════════════════════════════════════════════
export async function searchOffshoreLeaks(name: string): Promise<RecordResult[]> {
  const results: RecordResult[] = [];
  let id = 0;
  try {
    const data = await proxyFetch("icij", name);
    if (data.success && data.entities?.length > 0) {
      results.push({
        id: "icij-summary",
        source: "ICIJ Offshore Leaks Summary",
        category: "offshore",
        description: `${data.total} offshore record(s) found in Panama Papers, Paradise Papers, Pandora Papers & more`,
        details: {
          "Total Records": String(data.total),
          "Source": "International Consortium of Investigative Journalists (ICIJ)",
          "Datasets": "Panama Papers, Paradise Papers, Pandora Papers, Bahamas Leaks, Offshore Leaks",
          "Disclaimer": "Inclusion does not imply illegal or improper conduct",
        },
        sourceUrl: `https://offshoreleaks.icij.org/search?q=${encodeURIComponent(name)}`,
      });
      for (const e of data.entities.slice(0, 12)) {
        results.push({
          id: `icij-${++id}`,
          source: `ICIJ ${e.type || "Record"}`,
          category: "offshore",
          description: `${e.name} — ${e.type || "Offshore Entity"}${e.match ? " (Strong Match)" : ""}`,
          details: {
            Name: e.name || "N/A",
            Type: e.type || "N/A",
            "Match Score": e.score ? `${Math.round(e.score * 100)}%` : "N/A",
            Description: e.description || "N/A",
            "Strong Match": e.match ? "Yes" : "No",
          },
          sourceUrl: e.id ? `https://offshoreleaks.icij.org/nodes/${e.id}` : `https://offshoreleaks.icij.org/search?q=${encodeURIComponent(name)}`,
        });
      }
    }
  } catch (err) {
    console.error("[ICIJ] Search failed:", err);
  }
  return results;
}

// ═══════════════════════════════════════════════════════════════
// Senate Lobbying Disclosures (LDA)
// ═══════════════════════════════════════════════════════════════
export async function searchLobbying(name: string): Promise<RecordResult[]> {
  const results: RecordResult[] = [];
  let id = 0;
  try {
    const data = await proxyFetch("lobbying", name);
    if (data.success && data.filings?.length > 0) {
      const totalAmount = data.filings.reduce((sum: number, f: any) => sum + (parseFloat(f.amount) || 0), 0);
      results.push({
        id: "lobbying-summary",
        source: "Senate Lobbying Disclosures Summary",
        category: "lobbying",
        description: `${data.total} lobbying filing(s) found${totalAmount > 0 ? ` totaling ${formatMoney(totalAmount)}` : ""}`,
        details: {
          "Total Filings": String(data.total),
          "Source": "Senate Office of Public Records (LDA)",
        },
        sourceUrl: `https://lda.senate.gov/filings/public/filing/search/?client_name=${encodeURIComponent(name)}`,
      });
      for (const f of data.filings.slice(0, 12)) {
        results.push({
          id: `lobbying-${++id}`,
          source: "Lobbying Filing",
          category: "lobbying",
          description: `${f.registrantName} lobbying for ${f.clientName} — ${f.filingType} (${f.filingPeriod} ${f.filingYear})`,
          details: {
            Registrant: f.registrantName || "N/A",
            Client: f.clientName || "N/A",
            "Filing Type": f.filingType || "N/A",
            Amount: f.amount ? formatMoney(parseFloat(f.amount)) : "N/A",
            Year: String(f.filingYear) || "N/A",
            Period: f.filingPeriod || "N/A",
            "Date Posted": f.filingDate || "N/A",
          },
          sourceUrl: f.filingUuid ? `https://lda.senate.gov/filings/public/filing/${f.filingUuid}/` : undefined,
        });
      }
    }
  } catch (err) {
    console.error("[Lobbying] Search failed:", err);
  }
  return results;
}

// ═══════════════════════════════════════════════════════════════
// FAA Aircraft Registry
// ═══════════════════════════════════════════════════════════════
export async function searchFAA(name: string): Promise<RecordResult[]> {
  const results: RecordResult[] = [];
  let id = 0;
  try {
    const data = await proxyFetch("faa", name);
    if (data.success && data.aircraft?.length > 0) {
      results.push({
        id: "faa-summary",
        source: "FAA Aircraft Registry Summary",
        category: "assets",
        description: `${data.total} aircraft registration(s) found`,
        details: {
          "Total Aircraft": String(data.total),
          "Source": "FAA Aircraft Registry",
        },
        sourceUrl: `https://registry.faa.gov/AircraftInquiry/Search/NameResult?Nametxt=${encodeURIComponent(name)}`,
      });
      for (const a of data.aircraft.slice(0, 12)) {
        results.push({
          id: `faa-${++id}`,
          source: "FAA Aircraft Registration",
          category: "assets",
          description: `N${a.nNumber} — ${a.manufacturer} ${a.model} (${a.yearMfr})`,
          details: {
            "N-Number": a.nNumber || "N/A",
            "Serial Number": a.serialNumber || "N/A",
            Manufacturer: a.manufacturer || "N/A",
            Model: a.model || "N/A",
            "Year Manufactured": a.yearMfr || "N/A",
            Registrant: a.registrant || "N/A",
            City: a.city || "N/A",
            State: a.state || "N/A",
          },
          sourceUrl: `https://registry.faa.gov/AircraftInquiry/Search/NNumberResult?nNumberTxt=${a.nNumber}`,
        });
      }
    }
  } catch (err) {
    console.error("[FAA] Search failed:", err);
  }
  return results;
}

// ═══════════════════════════════════════════════════════════════
// OFAC SDN — US Treasury Sanctions List (direct)
// ═══════════════════════════════════════════════════════════════
export async function searchOFAC(name: string): Promise<RecordResult[]> {
  const results: RecordResult[] = [];
  let id = 0;
  try {
    const data = await proxyFetch("ofac", name);
    if (data.success && data.results?.length > 0) {
      results.push({
        id: "ofac-summary", source: "OFAC SDN List Summary", category: "sanctions",
        description: `${data.total} OFAC Specially Designated Nationals record(s) found`,
        details: {
          "Total Matches": String(data.total),
          "Source": "US Treasury Office of Foreign Assets Control (OFAC)",
          "Disclaimer": "Inclusion on OFAC lists has specific legal implications — verify carefully",
        },
        sourceUrl: `https://sanctionssearch.ofac.treas.gov/`,
      });
      for (const r of data.results.slice(0, 12)) {
        results.push({
          id: `ofac-${++id}`, source: "OFAC SDN Record", category: "sanctions",
          description: `${r.name} — ${r.type} (${r.program || "N/A"})`,
          details: {
            Name: r.name || "N/A", Type: r.type || "N/A",
            Program: r.program || "N/A", Title: r.title || "N/A",
            Remarks: r.remarks ? r.remarks.slice(0, 300) : "N/A",
            IDs: r.ids || "N/A",
            Addresses: (r.addresses || []).join("; ") || "N/A",
            Aliases: (r.aliases || []).join(", ") || "N/A",
          },
          sourceUrl: `https://sanctionssearch.ofac.treas.gov/`,
        });
      }
    }
  } catch (err) { console.error("[OFAC] Search failed:", err); }
  return results;
}

// ═══════════════════════════════════════════════════════════════
// SEC EDGAR — Insider Trading (Form 4) specific search
// ═══════════════════════════════════════════════════════════════
export async function searchSECInsider(name: string): Promise<RecordResult[]> {
  const results: RecordResult[] = [];
  let id = 0;
  try {
    const data = await proxyFetch("sec-insider", name);
    if (data.success && data.filings?.length > 0) {
      results.push({
        id: "sec-insider-summary", source: "SEC Insider Trading Summary", category: "business",
        description: `${data.totalFilings} insider trading filing(s) (Form 3/4/5) found`,
        details: {
          "Total Filings": String(data.totalFilings),
          "Source": "SEC EDGAR Full-Text Search (EFTS)",
          "Forms": "Form 3 (Initial), Form 4 (Changes), Form 5 (Annual)",
        },
        sourceUrl: `https://efts.sec.gov/LATEST/search-index?q=%22${encodeURIComponent(name)}%22&forms=4,3,5`,
      });
      for (const f of data.filings.slice(0, 12)) {
        results.push({
          id: `sec-insider-${++id}`, source: "SEC Insider Filing", category: "business",
          description: `${f.entityName} — ${f.formType} filed ${f.fileDate}`,
          details: {
            Entity: f.entityName || "N/A", "Form Type": f.formType || "N/A",
            "Filing Date": f.fileDate || "N/A", "File Number": f.fileNum || "N/A",
            "Period of Report": f.periodOfReport || "N/A",
            "Related Parties": (f.displayNames || []).join(", ") || "N/A",
          },
          sourceUrl: `https://www.sec.gov/cgi-bin/browse-edgar?action=getcompany&company=${encodeURIComponent(name)}&type=4&dateb=&owner=include&count=40&search_text=&action=getcompany`,
        });
      }
    }
  } catch (err) { console.error("[SEC Insider] Search failed:", err); }
  return results;
}

// ═══════════════════════════════════════════════════════════════
// State Campaign Finance — FollowTheMoney / OpenSecrets / State portals
// ═══════════════════════════════════════════════════════════════
export async function searchStateCampaignFinance(name: string, state: string): Promise<RecordResult[]> {
  const results: RecordResult[] = [];
  let id = 0;
  try {
    const data = await proxyFetch("state-campaign-finance", name, state);
    if (data.success && data.results?.length > 0) {
      // Links to external search tools
      for (const r of data.results) {
        if (r.type === "link") {
          results.push({
            id: `scf-${++id}`, source: r.source, category: "donations",
            description: r.description,
            details: { Source: r.source, "Search URL": r.url },
            sourceUrl: r.url,
          });
        } else if (r.type === "portal") {
          results.push({
            id: `scf-portal-${++id}`, source: `${r.source} (State Portal)`, category: "donations",
            description: r.description,
            details: { Source: r.source, State: r.state || "N/A" },
            sourceUrl: r.url,
          });
        }
      }
    }
  } catch (err) { console.error("[StateCampaignFinance] Search failed:", err); }
  return results;
}

// ═══════════════════════════════════════════════════════════════
// Social/OSINT Footprint — OCCRP Aleph + profile search links
// ═══════════════════════════════════════════════════════════════
export async function searchSocialOSINT(name: string): Promise<RecordResult[]> {
  const results: RecordResult[] = [];
  let id = 0;
  try {
    const data = await proxyFetch("social-osint", name);
    if (data.success) {
      // OCCRP Aleph investigative database results
      if (data.alephResults?.length > 0) {
        results.push({
          id: "aleph-summary", source: "OCCRP Aleph Summary", category: "business",
          description: `${data.alephTotal} record(s) in OCCRP investigative databases`,
          details: {
            "Total Records": String(data.alephTotal),
            "Source": "Organized Crime and Corruption Reporting Project (OCCRP)",
            "Note": "Contains leaked documents, corporate registries, court records from 100+ countries",
          },
          sourceUrl: `https://aleph.occrp.org/search?q=${encodeURIComponent(name)}`,
        });
        for (const e of data.alephResults.slice(0, 8)) {
          results.push({
            id: `aleph-${++id}`, source: "OCCRP Aleph Record", category: "business",
            description: `${e.name} — ${e.schema || "Entity"} (${e.collection || "Unknown collection"})`,
            details: {
              Name: e.name || "N/A", Type: e.schema || "N/A",
              Collection: e.collection || "N/A", Countries: e.countries || "N/A",
            },
            sourceUrl: e.sourceUrl || `https://aleph.occrp.org/search?q=${encodeURIComponent(name)}`,
          });
        }
      }

      // Social profile search links
      if (data.profiles?.length > 0) {
        for (const p of data.profiles) {
          results.push({
            id: `social-${++id}`, source: `${p.platform} Profile Search`, category: "business",
            description: `Search ${p.platform} for "${name}"`,
            details: { Platform: p.platform },
            sourceUrl: p.searchUrl,
          });
        }
      }
    }
  } catch (err) { console.error("[SocialOSINT] Search failed:", err); }
  return results;
}

// ═══════════════════════════════════════════════════════════════
// OSHA Violations — Workplace safety
// ═══════════════════════════════════════════════════════════════
export async function searchOSHA(name: string): Promise<RecordResult[]> {
  const results: RecordResult[] = [];
  let id = 0;
  try {
    const data = await proxyFetch("osha", name);
    if (data.success && data.results?.length > 0) {
      for (const r of data.results) {
        const penalty = r.penalty ? formatMoney(Number(r.penalty)) : "N/A";
        results.push({
          id: `osha-${++id}`, source: "OSHA Violation", category: "violations",
          description: `${r.establishment || name} — ${r.violation_type || "Inspection"} ${r.open_date ? `(${r.open_date})` : ""}`,
          details: {
            Establishment: r.establishment || name,
            City: r.site_city || "N/A", State: r.site_state || "N/A",
            "Open Date": r.open_date || "N/A", "Close Date": r.close_case_date || "N/A",
            Penalty: penalty, Instances: String(r.nr_instances || "N/A"),
            "Violation Type": r.violation_type || "N/A",
          },
          sourceUrl: `https://www.osha.gov/pls/imis/establishment.search?p_logger=1&establishment=${encodeURIComponent(name)}`,
          returnedName: r.establishment,
        });
      }
    }
  } catch (err) { console.error("[OSHA] Search failed:", err); }
  return results;
}

// ═══════════════════════════════════════════════════════════════
// EPA ECHO — Environmental compliance
// ═══════════════════════════════════════════════════════════════
export async function searchEPAECHO(name: string): Promise<RecordResult[]> {
  const results: RecordResult[] = [];
  let id = 0;
  try {
    const data = await proxyFetch("epa-echo", name);
    if (data.success && data.results?.length > 0) {
      for (const f of data.results) {
        results.push({
          id: `epa-${++id}`, source: "EPA ECHO Facility", category: "violations",
          description: `${f.name || name} (${f.city || "?"}, ${f.state || "?"}) — ${f.compliance_status || "Unknown status"}`,
          details: {
            Facility: f.name || name,
            Address: f.address || "N/A", City: f.city || "N/A", State: f.state || "N/A",
            Programs: f.programs || "N/A",
            "Compliance Status": f.compliance_status || "N/A",
            "Inspections (5yr)": String(f.inspections_5yr || "0"),
            "Violations (3yr)": String(f.violations_3yr || "0"),
            "Formal Actions": String(f.formal_actions || "0"),
          },
          sourceUrl: f.url || `https://echo.epa.gov/facilities/facility-search/results?search_type=FacilitySearch&p_fn=${encodeURIComponent(name)}`,
          returnedName: f.name,
        });
      }
    }
  } catch (err) { console.error("[EPA] Search failed:", err); }
  return results;
}

// ═══════════════════════════════════════════════════════════════
// SAM.gov — Federal contractor registrations & exclusions
// ═══════════════════════════════════════════════════════════════
export async function searchSAMgov(name: string): Promise<RecordResult[]> {
  const results: RecordResult[] = [];
  let id = 0;
  try {
    const data = await proxyFetch("sam-gov", name);
    if (data.success && data.results?.length > 0) {
      for (const r of data.results) {
        if (r.type === "exclusion") {
          results.push({
            id: `sam-excl-${++id}`, source: "SAM.gov Exclusion (Debarment)", category: "sanctions",
            description: `${r.name || name} — ${r.classification || "Excluded"} by ${r.agency || "Unknown"}`,
            details: {
              Name: r.name || name, Classification: r.classification || "N/A",
              Agency: r.agency || "N/A",
              "Active Date": r.active_date || "N/A", "Termination Date": r.termination_date || "N/A",
            },
            sourceUrl: r.url || "https://sam.gov",
            returnedName: r.name,
          });
        } else {
          results.push({
            id: `sam-reg-${++id}`, source: "SAM.gov Registration", category: "contracts",
            description: `${r.name || name} — ${r.entity_type || "Entity"} (${r.city || "?"}, ${r.state || "?"})`,
            details: {
              Name: r.name || name, UEI: r.uei || "N/A", "CAGE Code": r.cage_code || "N/A",
              Status: r.status || "N/A", Expiration: r.expiration || "N/A",
              City: r.city || "N/A", State: r.state || "N/A",
            },
            sourceUrl: r.url || "https://sam.gov",
            returnedName: r.name,
          });
        }
      }
    }
  } catch (err) { console.error("[SAM] Search failed:", err); }
  return results;
}

// ═══════════════════════════════════════════════════════════════
// OpenSecrets — PAC networks, dark money, revolving door
// ═══════════════════════════════════════════════════════════════
export async function searchOpenSecrets(name: string): Promise<RecordResult[]> {
  const results: RecordResult[] = [];
  let id = 0;
  try {
    const data = await proxyFetch("opensecrets", name);
    if (data.success && data.results?.length > 0) {
      for (const r of data.results) {
        results.push({
          id: `os-${++id}`, source: r.source || "OpenSecrets", category: "donations",
          description: r.description || `OpenSecrets record for "${name}"`,
          details: { Type: r.type || "N/A", Source: r.source || "OpenSecrets" },
          sourceUrl: r.url || "https://www.opensecrets.org",
        });
      }
    }
  } catch (err) { console.error("[OpenSecrets] Search failed:", err); }
  return results;
}

// ═══════════════════════════════════════════════════════════════
// MuckRock — FOIA archive search
// ═══════════════════════════════════════════════════════════════
export async function searchMuckRock(name: string): Promise<RecordResult[]> {
  const results: RecordResult[] = [];
  let id = 0;
  try {
    const data = await proxyFetch("muckrock", name);
    if (data.success && data.results?.length > 0) {
      for (const r of data.results) {
        results.push({
          id: `mr-${++id}`, source: r.type === "search_link" ? "MuckRock Archive" : "MuckRock FOIA Request", category: "foia",
          description: r.title || `FOIA request for "${name}"`,
          details: {
            Agency: r.agency || "N/A", Status: r.status || "N/A",
            "Date Submitted": r.date_submitted || "N/A",
            Requester: r.user || "N/A",
            Documents: String(r.documents_count || 0),
          },
          sourceUrl: r.url || `https://www.muckrock.com/foi/search/?q=${encodeURIComponent(name)}`,
        });
      }
    }
  } catch (err) { console.error("[MuckRock] Search failed:", err); }
  return results;
}

// ═══════════════════════════════════════════════════════════════
// FDA — Recalls, enforcement, warning letters
// ═══════════════════════════════════════════════════════════════
export async function searchFDA(name: string): Promise<RecordResult[]> {
  const results: RecordResult[] = [];
  let id = 0;
  try {
    const data = await proxyFetch("fda", name);
    if (data.success && data.results?.length > 0) {
      for (const r of data.results) {
        if (r.type === "search_link") {
          results.push({
            id: `fda-link-${++id}`, source: r.source || "FDA", category: "violations",
            description: r.description || `FDA records for "${name}"`,
            details: { Source: r.source || "FDA" },
            sourceUrl: r.url,
          });
        } else {
          results.push({
            id: `fda-${++id}`, source: r.type === "drug_recall" ? "FDA Drug Recall" : "FDA Food Recall", category: "violations",
            description: `${r.firm || name} — ${(r.reason || "Recall").slice(0, 120)}`,
            details: {
              Firm: r.firm || name, Product: (r.product || "N/A").slice(0, 100),
              Reason: (r.reason || "N/A").slice(0, 100),
              Classification: r.classification || "N/A", Status: r.status || "N/A",
              Date: r.date || "N/A", City: r.city || "N/A", State: r.state || "N/A",
            },
            sourceUrl: r.url || "https://www.fda.gov",
            returnedName: r.firm,
          });
        }
      }
    }
  } catch (err) { console.error("[FDA] Search failed:", err); }
  return results;
}

// ═══════════════════════════════════════════════════════════════
// Search All — with per-source progress callbacks
// ═══════════════════════════════════════════════════════════════
export interface SearchOptions {
  skip?: string[];
  middleInitial?: string;
  dob?: string;
  email?: string;
  streetAddress?: string;
  city?: string;
}

export interface SourceStatus {
  label: string;
  status: "pending" | "loading" | "success" | "error" | "skipped";
  resultCount: number;
  duration?: number;
  error?: string;
}

export type ProgressCallback = (sources: SourceStatus[]) => void;
export type ResultsCallback = (results: RecordResult[], sourceLabel: string) => void;

export async function searchAll(
  name: string, state: string, options?: SearchOptions, onProgress?: ProgressCallback, onResults?: ResultsCallback
): Promise<{ results: RecordResult[]; debug: ApiDebugInfo[] }> {
  const debug: ApiDebugInfo[] = [];
  const skip = new Set(options?.skip || []);

  const sourceDefs: { key: string; skipKey: string; label: string; fn: () => Promise<RecordResult[]> }[] = [
    { key: "fec", skipKey: "fec", label: "FEC Campaign Finance", fn: () => searchFEC(name, state) },
    { key: "sec", skipKey: "business", label: "SEC EDGAR", fn: () => searchSEC(name) },
    { key: "sec-insider", skipKey: "business", label: "SEC Insider Trading", fn: () => searchSECInsider(name) },
    { key: "usaspending", skipKey: "contracts", label: "USASpending.gov", fn: () => searchUSASpending(name, state) },
    { key: "propublica", skipKey: "business", label: "ProPublica Nonprofits", fn: () => searchProPublicaNonprofits(name) },
    { key: "sunbiz", skipKey: "sunbiz", label: "Florida SunBiz", fn: () => searchSunBiz(name) },
    { key: "court", skipKey: "court", label: "CourtListener", fn: () => searchCourtListener(name) },
    { key: "sanctions", skipKey: "", label: "OpenSanctions", fn: () => searchSanctions(name) },
    { key: "ofac", skipKey: "", label: "OFAC SDN List", fn: () => searchOFAC(name) },
    { key: "icij", skipKey: "", label: "ICIJ Offshore Leaks", fn: () => searchOffshoreLeaks(name) },
    { key: "lobbying", skipKey: "", label: "Senate Lobbying (LDA)", fn: () => searchLobbying(name) },
    { key: "faa", skipKey: "", label: "FAA Aircraft Registry", fn: () => searchFAA(name) },
    { key: "state-campaign", skipKey: "fec", label: "State Campaign Finance", fn: () => searchStateCampaignFinance(name, state) },
    { key: "social-osint", skipKey: "", label: "OSINT / OCCRP Aleph", fn: () => searchSocialOSINT(name) },
    { key: "osha", skipKey: "", label: "OSHA Violations", fn: () => searchOSHA(name) },
    { key: "epa", skipKey: "", label: "EPA ECHO", fn: () => searchEPAECHO(name) },
    { key: "sam", skipKey: "contracts", label: "SAM.gov", fn: () => searchSAMgov(name) },
    { key: "opensecrets", skipKey: "fec", label: "OpenSecrets", fn: () => searchOpenSecrets(name) },
    { key: "muckrock", skipKey: "", label: "MuckRock FOIA Archive", fn: () => searchMuckRock(name) },
    { key: "fda", skipKey: "", label: "FDA Inspections", fn: () => searchFDA(name) },
  ];

  const sourceStatuses: SourceStatus[] = sourceDefs.map(s => ({
    label: s.label,
    status: (s.skipKey && skip.has(s.skipKey)) ? "skipped" as const : "pending" as const,
    resultCount: 0,
  }));

  const emitProgress = () => { onProgress?.([...sourceStatuses]); };
  emitProgress();

  const tasks = sourceDefs.map(async (source, index) => {
    if (source.skipKey && skip.has(source.skipKey)) {
      debug.push({ api: source.label, status: "success", resultCount: 0 });
      return [];
    }

    sourceStatuses[index] = { ...sourceStatuses[index], status: "loading" };
    emitProgress();

    const start = Date.now();
    try {
      const r = await source.fn();
      const duration = Date.now() - start;
      const scored = r.map(rec => ({ ...rec, relevance: computeRelevance(rec, name, state) }));
      debug.push({ api: source.label, status: "success", resultCount: r.length, duration });
      sourceStatuses[index] = { ...sourceStatuses[index], status: "success", resultCount: r.length, duration };
      emitProgress();
      // Stream results as they arrive
      onResults?.(scored, source.label);
      return scored;
    } catch (err) {
      const duration = Date.now() - start;
      debug.push({ api: source.label, status: "error", resultCount: 0, error: String(err), duration });
      sourceStatuses[index] = { ...sourceStatuses[index], status: "error", resultCount: 0, error: String(err), duration };
      emitProgress();
      return [];
    }
  });

  const allResults = await Promise.all(tasks);
  const results = allResults.flat();
  results.sort((a, b) => (b.relevance ?? 0) - (a.relevance ?? 0));

  return { results, debug };
}

/**
 * Compute a relevance score (0-100) based on how closely a result matches the search name.
 */
function computeRelevance(result: RecordResult, searchName: string, searchState: string): number {
  const search = searchName.toLowerCase().trim();
  const searchParts = search.split(/\s+/);
  let score = 50; // baseline

  // Check all text fields in the result
  const textFields = [
    result.source, result.description,
    ...Object.values(result.details),
  ].map(v => (typeof v === "string" ? v : String(v ?? "")).toLowerCase());

  const allText = textFields.join(" ");

  // Exact full-name match in any field → big boost
  if (allText.includes(search)) {
    score += 30;
  }

  // All name parts present → good match
  const partsFound = searchParts.filter(p => allText.includes(p)).length;
  score += Math.round((partsFound / searchParts.length) * 15);

  // State match bonus
  if (searchState && searchState !== "All States / National") {
    const stateLC = searchState.toLowerCase();
    if (allText.includes(stateLC)) {
      score += 5;
    }
  }

  // Summary records get a small boost (they aggregate info)
  if (result.id.endsWith("-summary")) {
    score += 5;
  }

  // Penalize very generic descriptions
  if (result.description.length < 20) {
    score -= 10;
  }

  return Math.max(0, Math.min(100, score));
}

export type MockResult = RecordResult;
