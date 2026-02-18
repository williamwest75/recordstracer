// src/lib/recordsApi.ts
// Record Tracer — Phase 1: Direct browser API calls to free government databases
// No backend proxy needed! These APIs all support CORS.

// ============================================================
// CONFIGURATION — Add your API keys here
// ============================================================
const FEC_API_KEY = "DEMO_KEY"; // Replace with your real FEC key from https://api.open.fec.gov/developers/

// ============================================================
// TYPES
// ============================================================
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

// ============================================================
// HELPER
// ============================================================
function formatMoney(amount: number): string {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(amount);
}

// ============================================================
// 1. FEC — Campaign Donations (api.open.fec.gov)
//    Free, open, CORS-enabled. DEMO_KEY works but is rate-limited.
// ============================================================
export async function searchFEC(name: string, state: string): Promise<RecordResult[]> {
  const results: RecordResult[] = [];
  let id = 0;

  try {
    // Search individual contributions
    const contribUrl = `https://api.open.fec.gov/v1/schedules/schedule_a/?contributor_name=${encodeURIComponent(name)}&contributor_state=${state}&per_page=20&sort=-contribution_receipt_date&api_key=${FEC_API_KEY}`;
    const contribRes = await fetch(contribUrl);

    if (contribRes.ok) {
      const data = await contribRes.json();
      const contributions = data.results || [];

      // Summary card
      if (contributions.length > 0) {
        const totalAmount = contributions.reduce(
          (sum: number, c: any) => sum + (c.contribution_receipt_amount || 0),
          0
        );
        const uniqueRecipients = new Set(contributions.map((c: any) => c.committee?.name || c.committee_id)).size;

        results.push({
          id: `fec-summary`,
          source: "FEC Campaign Finance Summary",
          category: "donations",
          description: `${contributions.length} contributions totaling ${formatMoney(totalAmount)} to ${uniqueRecipients} recipient(s)`,
          details: {
            "Total Contributions": String(contributions.length),
            "Total Amount": formatMoney(totalAmount),
            "Unique Recipients": String(uniqueRecipients),
            "Date Range": `${contributions[contributions.length - 1]?.contribution_receipt_date || "N/A"} to ${contributions[0]?.contribution_receipt_date || "N/A"}`,
          },
          sourceUrl: `https://www.fec.gov/data/receipts/individual-contributions/?contributor_name=${encodeURIComponent(name)}&contributor_state=${state}`,
        });
      }

      // Individual contribution cards (top 10)
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

    // Also search if this person is/was a candidate
    const candidateUrl = `https://api.open.fec.gov/v1/candidates/search/?name=${encodeURIComponent(name)}&state=${state}&per_page=10&api_key=${FEC_API_KEY}`;
    const candidateRes = await fetch(candidateUrl);

    if (candidateRes.ok) {
      const data = await candidateRes.json();
      for (const c of data.results || []) {
        results.push({
          id: `fec-cand-${++id}`,
          source: "FEC Candidate Record",
          category: "donations",
          description: `${c.name} — ${c.office_full || "Unknown Office"} (${c.party_full || "Unknown Party"})`,
          details: {
            Name: c.name,
            Office: c.office_full || "N/A",
            State: c.state || "N/A",
            District: c.district || "N/A",
            Party: c.party_full || "N/A",
            "Candidate ID": c.candidate_id || "N/A",
            "Election Cycles": (c.cycles || []).join(", "),
            "Has Raised Funds": c.has_raised_funds ? "Yes" : "No",
          },
          sourceUrl: `https://www.fec.gov/data/candidate/${c.candidate_id}/`,
        });
      }
    }
  } catch (err) {
    console.error("[FEC] Search failed:", err);
  }

  return results;
}

// ============================================================
// 2. SEC EDGAR — Corporate Filings (efts.sec.gov)
//    Free, no key needed. Uses the full-text search system.
// ============================================================
export async function searchSEC(name: string): Promise<RecordResult[]> {
  const results: RecordResult[] = [];
  let id = 0;

  try {
    // Use EDGAR full-text search API (EFTS)
    const searchUrl = `https://efts.sec.gov/LATEST/search-index?q=%22${encodeURIComponent(name)}%22&dateRange=custom&startdt=2015-01-01&enddt=2026-12-31&forms=10-K,10-Q,8-K,DEF%2014A,4,SC%2013D,SC%2013G&from=0&size=20`;
    const res = await fetch(searchUrl, {
      headers: {
        "User-Agent": "RecordTracer Investigative Tool contact@recordtracer.com",
        Accept: "application/json",
      },
    });

    if (res.ok) {
      const data = await res.json();
      const hits = data.hits?.hits || [];

      for (const hit of hits.slice(0, 15)) {
        const source = hit._source || {};
        const filingDate = source.file_date || "N/A";
        const formType = source.form_type || "Unknown";
        const entityName = source.entity_name || "Unknown Entity";
        const fileNum = source.file_num || "";

        results.push({
          id: `sec-${++id}`,
          source: "SEC EDGAR Filing",
          category: "business",
          description: `${entityName} — ${formType} filed ${filingDate}`,
          details: {
            Entity: entityName,
            "Form Type": formType,
            "Filing Date": filingDate,
            "File Number": fileNum || "N/A",
            "Period of Report": source.period_of_report || "N/A",
          },
          sourceUrl: `https://www.sec.gov/cgi-bin/browse-edgar?action=getcompany&company=${encodeURIComponent(name)}&CIK=&type=&dateb=&owner=include&count=40&search_text=&action=getcompany`,
        });
      }
    }

    // Fallback: also try the company search endpoint
    if (results.length === 0) {
      const companyUrl = `https://efts.sec.gov/LATEST/search-index?q=%22${encodeURIComponent(name)}%22&from=0&size=10`;
      const res2 = await fetch(companyUrl, {
        headers: {
          "User-Agent": "RecordTracer Investigative Tool contact@recordtracer.com",
          Accept: "application/json",
        },
      });
      if (res2.ok) {
        const data2 = await res2.json();
        for (const hit of (data2.hits?.hits || []).slice(0, 10)) {
          const s = hit._source || {};
          results.push({
            id: `sec-${++id}`,
            source: "SEC EDGAR Filing",
            category: "business",
            description: `${s.entity_name || "Entity"} — ${s.form_type || "Filing"} (${s.file_date || "N/A"})`,
            details: {
              Entity: s.entity_name || "N/A",
              "Form Type": s.form_type || "N/A",
              "Filing Date": s.file_date || "N/A",
            },
            sourceUrl: `https://www.sec.gov/cgi-bin/browse-edgar?company=${encodeURIComponent(name)}&CIK=&type=&dateb=&owner=include&count=40&search_text=&action=getcompany`,
          });
        }
      }
    }
  } catch (err) {
    console.error("[SEC] Search failed:", err);
  }

  return results;
}

// ============================================================
// 3. USASpending.gov — Federal Government Contracts & Awards
//    Free, no key needed, CORS-enabled.
//    THIS IS THE CORRUPTION FINDER — shows who gets government money.
// ============================================================
export async function searchUSASpending(name: string, state: string): Promise<RecordResult[]> {
  const results: RecordResult[] = [];
  let id = 0;

  try {
    // Search for recipient (contractor) by name
    const recipientSearchUrl = "https://api.usaspending.gov/api/v2/search/spending_by_award/";
    const res = await fetch(recipientSearchUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        filters: {
          recipient_search_text: [name],
          award_type_codes: ["A", "B", "C", "D", "IDV_A", "IDV_B", "IDV_B_A", "IDV_B_B", "IDV_B_C", "IDV_C", "IDV_D", "IDV_E"],
          time_period: [{ start_date: "2015-10-01", end_date: "2026-09-30" }],
        },
        fields: [
          "Award ID",
          "Recipient Name",
          "Start Date",
          "End Date",
          "Award Amount",
          "Total Outlays",
          "Awarding Agency",
          "Awarding Sub Agency",
          "Award Type",
          "Description",
          "recipient_id",
          "internal_id",
        ],
        page: 1,
        limit: 15,
        sort: "Award Amount",
        order: "desc",
      }),
    });

    if (res.ok) {
      const data = await res.json();
      const awards = data.results || [];

      if (awards.length > 0) {
        // Summary card
        const totalAmount = awards.reduce((sum: number, a: any) => sum + (parseFloat(a["Award Amount"]) || 0), 0);
        const agencies = new Set(awards.map((a: any) => a["Awarding Agency"])).size;

        results.push({
          id: `usa-summary`,
          source: "Federal Contracts Summary",
          category: "contracts",
          description: `${awards.length} federal contract(s) found worth ${formatMoney(totalAmount)} from ${agencies} agency/agencies`,
          details: {
            "Total Awards Found": String(awards.length),
            "Total Value": formatMoney(totalAmount),
            "Awarding Agencies": String(agencies),
          },
          sourceUrl: `https://www.usaspending.gov/search/?hash=recipient-${encodeURIComponent(name)}`,
        });

        // Individual awards
        for (const a of awards.slice(0, 10)) {
          const amount = parseFloat(a["Award Amount"]) || 0;
          results.push({
            id: `usa-${++id}`,
            source: "Federal Contract Award",
            category: "contracts",
            description: `${formatMoney(amount)} from ${a["Awarding Agency"] || "Unknown Agency"} — ${a["Description"]?.slice(0, 100) || "No description"}`,
            details: {
              Recipient: a["Recipient Name"] || name,
              "Award Amount": formatMoney(amount),
              "Awarding Agency": a["Awarding Agency"] || "N/A",
              "Sub Agency": a["Awarding Sub Agency"] || "N/A",
              "Award Type": a["Award Type"] || "N/A",
              "Start Date": a["Start Date"] || "N/A",
              "End Date": a["End Date"] || "N/A",
              Description: a["Description"] || "N/A",
              "Award ID": a["Award ID"] || "N/A",
            },
            sourceUrl: a["internal_id"]
              ? `https://www.usaspending.gov/award/${a["internal_id"]}`
              : `https://www.usaspending.gov/search`,
          });
        }
      }
    }

    // Also search grants (not just contracts)
    const grantRes = await fetch(recipientSearchUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        filters: {
          recipient_search_text: [name],
          award_type_codes: ["02", "03", "04", "05", "06", "10", "07", "08", "09", "11"],
          time_period: [{ start_date: "2015-10-01", end_date: "2026-09-30" }],
        },
        fields: [
          "Award ID",
          "Recipient Name",
          "Start Date",
          "End Date",
          "Award Amount",
          "Awarding Agency",
          "Award Type",
          "Description",
          "internal_id",
        ],
        page: 1,
        limit: 10,
        sort: "Award Amount",
        order: "desc",
      }),
    });

    if (grantRes.ok) {
      const grantData = await grantRes.json();
      for (const a of (grantData.results || []).slice(0, 5)) {
        const amount = parseFloat(a["Award Amount"]) || 0;
        results.push({
          id: `usa-grant-${++id}`,
          source: "Federal Grant",
          category: "contracts",
          description: `${formatMoney(amount)} grant from ${a["Awarding Agency"] || "Unknown"} — ${a["Description"]?.slice(0, 100) || "No description"}`,
          details: {
            Recipient: a["Recipient Name"] || name,
            "Grant Amount": formatMoney(amount),
            Agency: a["Awarding Agency"] || "N/A",
            Type: a["Award Type"] || "N/A",
            "Start Date": a["Start Date"] || "N/A",
            "End Date": a["End Date"] || "N/A",
            Description: a["Description"] || "N/A",
          },
          sourceUrl: a["internal_id"]
            ? `https://www.usaspending.gov/award/${a["internal_id"]}`
            : `https://www.usaspending.gov/search`,
        });
      }
    }
  } catch (err) {
    console.error("[USASpending] Search failed:", err);
  }

  return results;
}

// ============================================================
// 4. ProPublica Nonprofit Explorer — 990 tax filings
//    Free, no key needed for basic search.
// ============================================================
export async function searchProPublicaNonprofits(name: string): Promise<RecordResult[]> {
  const results: RecordResult[] = [];
  let id = 0;

  try {
    const url = `https://projects.propublica.org/nonprofits/api/v2/search.json?q=${encodeURIComponent(name)}`;
    const res = await fetch(url);

    if (res.ok) {
      const data = await res.json();
      const orgs = data.organizations || [];

      for (const org of orgs.slice(0, 10)) {
        const revenue = org.income_amount ? formatMoney(org.income_amount) : "N/A";
        results.push({
          id: `pp-${++id}`,
          source: "ProPublica Nonprofit Record",
          category: "business",
          description: `${org.name} (${org.city || "Unknown"}, ${org.state || "Unknown"}) — Revenue: ${revenue}`,
          details: {
            Name: org.name || "N/A",
            EIN: org.ein ? String(org.ein) : "N/A",
            City: org.city || "N/A",
            State: org.state || "N/A",
            "NTEE Code": org.ntee_code || "N/A",
            "Total Revenue": revenue,
            "Subsection": org.subseccd ? `501(c)(${org.subseccd})` : "N/A",
          },
          sourceUrl: org.ein
            ? `https://projects.propublica.org/nonprofits/organizations/${org.ein}`
            : undefined,
        });
      }
    }
  } catch (err) {
    console.error("[ProPublica] Search failed:", err);
  }

  return results;
}

// ============================================================
// 5. Florida SunBiz — State Business Registrations
//    NOTE: This requires a backend proxy due to CORS.
//    For now, we try the Vercel endpoint. If it fails, we skip gracefully.
// ============================================================
export async function searchSunBiz(name: string): Promise<RecordResult[]> {
  const results: RecordResult[] = [];

  try {
    // Try the Vercel backend proxy
    const res = await fetch("https://records-detective-ai.vercel.app/api/search-sunbiz", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ searchName: name }),
    });

    if (res.ok) {
      const data = await res.json();
      if (data.success && data.results?.length > 0) {
        let id = 0;
        for (const entity of data.results.slice(0, 10)) {
          results.push({
            id: `sunbiz-${++id}`,
            source: "Florida SunBiz",
            category: "business",
            description: entity.entityName || `Business record for ${name}`,
            details: {
              "Entity Name": entity.entityName || "N/A",
              "Document Number": entity.documentNumber || "N/A",
              "Filing Date": entity.filingDate || "N/A",
              Status: entity.status || "N/A",
              "Principal Address": entity.principalAddress || "N/A",
            },
            sourceUrl: entity.detailUrl
              ? `https://search.sunbiz.org${entity.detailUrl}`
              : "https://search.sunbiz.org",
          });
        }
      }
    }
  } catch (err) {
    console.error("[SunBiz] Search failed (expected — needs backend proxy):", err);
  }

  return results;
}

// ============================================================
// MASTER SEARCH — Runs all databases in parallel
// ============================================================
export async function searchAll(
  name: string,
  state: string
): Promise<{ results: RecordResult[]; debug: ApiDebugInfo[] }> {
  const debug: ApiDebugInfo[] = [];

  const run = async (
    label: string,
    fn: () => Promise<RecordResult[]>
  ): Promise<RecordResult[]> => {
    const start = Date.now();
    try {
      const r = await fn();
      debug.push({
        api: label,
        status: "success",
        resultCount: r.length,
        duration: Date.now() - start,
      });
      return r;
    } catch (err) {
      debug.push({
        api: label,
        status: "error",
        resultCount: 0,
        error: String(err),
        duration: Date.now() - start,
      });
      return [];
    }
  };

  // Run all searches in parallel for speed
  const [fec, sec, usaSpending, nonprofits, sunbiz] = await Promise.all([
    run("FEC Campaign Finance", () => searchFEC(name, state)),
    run("SEC EDGAR", () => searchSEC(name)),
    run("USASpending.gov", () => searchUSASpending(name, state)),
    run("ProPublica Nonprofits", () => searchProPublicaNonprofits(name)),
    run("Florida SunBiz", () => searchSunBiz(name)),
  ]);

  const results = [...fec, ...sec, ...usaSpending, ...nonprofits, ...sunbiz];
  console.log("[recordsApi] searchAll complete:", {
    totalResults: results.length,
    debug,
  });

  return { results, debug };
}

// Keep backward-compatible export name
export type MockResult = RecordResult;
