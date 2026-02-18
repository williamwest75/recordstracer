import { supabase } from "@/integrations/supabase/client";

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
  const { data, error } = await supabase.functions.invoke("records-proxy", {
    body: { source, searchName, state },
  });
  if (error) throw new Error(`Proxy error: ${error.message}`);
  return data;
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
export async function searchSunBiz(name: string): Promise<RecordResult[]> {
  const results: RecordResult[] = [];
  let id = 0;
  try {
    const data = await proxyFetch("sunbiz", name);
    if (data.success && data.results?.length > 0) {
      for (const entity of data.results.slice(0, 10)) {
        results.push({
          id: `sunbiz-${++id}`, source: "Florida SunBiz", category: "business",
          description: entity.entityName || `Business record for ${name}`,
          details: {
            "Entity Name": entity.entityName || "N/A", "Document Number": entity.documentNumber || "N/A",
            Status: entity.status || "N/A", "Filing Date": entity.filingDate || "N/A",
          },
          sourceUrl: "https://search.sunbiz.org/Inquiry/CorporationSearch/ByName",
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
          sourceUrl: `https://www.courtlistener.com/?q=${encodeURIComponent(caseName)}&type=r&order_by=score+desc`,
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
// Search All
// ═══════════════════════════════════════════════════════════════
export async function searchAll(
  name: string, state: string
): Promise<{ results: RecordResult[]; debug: ApiDebugInfo[] }> {
  const debug: ApiDebugInfo[] = [];
  const run = async (label: string, fn: () => Promise<RecordResult[]>): Promise<RecordResult[]> => {
    const start = Date.now();
    try {
      const r = await fn();
      debug.push({ api: label, status: "success", resultCount: r.length, duration: Date.now() - start });
      return r;
    } catch (err) {
      debug.push({ api: label, status: "error", resultCount: 0, error: String(err), duration: Date.now() - start });
      return [];
    }
  };

  const [fec, sec, usaSpending, nonprofits, sunbiz, courts] = await Promise.all([
    run("FEC Campaign Finance", () => searchFEC(name, state)),
    run("SEC EDGAR", () => searchSEC(name)),
    run("USASpending.gov", () => searchUSASpending(name, state)),
    run("ProPublica Nonprofits", () => searchProPublicaNonprofits(name)),
    run("Florida SunBiz", () => searchSunBiz(name)),
    run("CourtListener", () => searchCourtListener(name)),
  ]);

  const results = [...fec, ...sec, ...usaSpending, ...nonprofits, ...sunbiz, ...courts];
  return { results, debug };
}

export type MockResult = RecordResult;
