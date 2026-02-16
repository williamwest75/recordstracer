const BASE_URL = "https://public-records-detective.vercel.app/api";

export interface MockResult {
  id: string;
  source: string;
  description: string;
  category: string;
  details: Record<string, string>;
  sourceUrl?: string;
}

// --- SEC types ---
interface SECFiling {
  type: string;
  date: string;
  url: string;
}
interface SECCompany {
  name: string;
  filings: SECFiling[];
}
interface SECResponse {
  success: boolean;
  companies: SECCompany[];
  totalFilings: number;
}

// --- FEC types ---
interface FECContribution {
  date: string;
  amount: string | number;
  recipient: string;
}
interface FECResults {
  contributions: FECContribution[];
  candidates: unknown[];
  committees: unknown[];
}
interface FECResponse {
  success: boolean;
  results: FECResults;
  summary: Record<string, unknown>;
}

// --- SunBiz types ---
interface SunBizResponse {
  success: boolean;
  [key: string]: unknown;
}

async function post<T>(endpoint: string, body: Record<string, string>): Promise<T> {
  const res = await fetch(`${BASE_URL}${endpoint}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(`API error ${res.status}`);
  return res.json();
}

// --- Individual search functions ---

export async function searchSEC(name: string): Promise<MockResult[]> {
  try {
    const data = await post<SECResponse>("/search-sec", { searchName: name });
    if (!data.success || !data.companies?.length) return [];

    let id = 0;
    const results: MockResult[] = [];

    for (const company of data.companies) {
      // One result per company summarizing filings
      const filingsSummary = company.filings.slice(0, 3).map((f) => `${f.type} (${f.date})`).join(", ");
      results.push({
        id: `sec-${++id}`,
        source: "SEC EDGAR",
        category: "business",
        description: `${company.name} — ${company.filings.length} filing(s): ${filingsSummary}${company.filings.length > 3 ? "…" : ""}`,
        details: {
          "Company Name": company.name,
          "Total Filings": String(company.filings.length),
          ...Object.fromEntries(
            company.filings.slice(0, 5).map((f, i) => [`Filing ${i + 1}`, `${f.type} — ${f.date}`])
          ),
        },
        sourceUrl: company.filings[0]?.url,
      });
    }
    return results;
  } catch {
    console.error("SEC search failed");
    return [];
  }
}

export async function searchFEC(name: string, state: string): Promise<MockResult[]> {
  try {
    const data = await post<FECResponse>("/search-fec", { searchName: name, state });
    if (!data.success || !data.results?.contributions?.length) return [];

    let id = 0;
    const results: MockResult[] = [];

    for (const c of data.results.contributions.slice(0, 10)) {
      const amount = typeof c.amount === "number" ? `$${c.amount.toLocaleString()}` : String(c.amount);
      results.push({
        id: `fec-${++id}`,
        source: "FEC Individual Contributions",
        category: "donations",
        description: `${amount} contribution to ${c.recipient} on ${c.date}`,
        details: {
          Contributor: name,
          Amount: amount,
          Recipient: c.recipient,
          Date: c.date,
        },
        sourceUrl: "https://www.fec.gov",
      });
    }

    // Add summary result if available
    if (data.summary) {
      results.unshift({
        id: `fec-summary`,
        source: "FEC Summary",
        category: "donations",
        description: `Summary of FEC contributions for ${name}`,
        details: Object.fromEntries(
          Object.entries(data.summary).map(([k, v]) => [k, String(v)])
        ),
        sourceUrl: "https://www.fec.gov",
      });
    }

    return results;
  } catch {
    console.error("FEC search failed");
    return [];
  }
}

export async function searchSunBiz(name: string, state: string): Promise<MockResult[]> {
  try {
    const data = await post<SunBizResponse>("/search-sunbiz", { searchName: name, state });
    if (!data.success) return [];

    // Transform whatever shape comes back into results
    const entries = Object.entries(data).filter(([k]) => k !== "success");
    if (entries.length === 0) return [];

    const results: MockResult[] = [];
    let id = 0;

    // If there's an array field, iterate it
    for (const [key, value] of entries) {
      if (Array.isArray(value)) {
        for (const item of value.slice(0, 10)) {
          const details: Record<string, string> = {};
          if (typeof item === "object" && item !== null) {
            for (const [k, v] of Object.entries(item)) {
              details[k] = String(v);
            }
          }
          results.push({
            id: `sunbiz-${++id}`,
            source: "Florida SunBiz",
            category: "business",
            description: details["name"] || details["Entity Name"] || `${key} record for ${name}`,
            details,
            sourceUrl: details["url"] || details["detailUrl"],
          });
        }
      } else if (typeof value === "object" && value !== null) {
        const details: Record<string, string> = {};
        for (const [k, v] of Object.entries(value)) {
          details[k] = String(v);
        }
        results.push({
          id: `sunbiz-${++id}`,
          source: "Florida SunBiz",
          category: "business",
          description: `${key} record for ${name}`,
          details,
        });
      }
    }

    return results;
  } catch {
    console.error("SunBiz search failed");
    return [];
  }
}

export async function searchAll(name: string, state: string): Promise<MockResult[]> {
  const [sec, fec, sunbiz] = await Promise.all([
    searchSEC(name),
    searchFEC(name, state),
    searchSunBiz(name, state),
  ]);
  return [...sec, ...fec, ...sunbiz];
}
