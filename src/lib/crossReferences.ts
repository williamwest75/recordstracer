import type { RecordResult } from "@/lib/recordsApi";

/**
 * Detect cross-references: the same entity (name, employer, address, business)
 * appearing across two or more distinct data source categories.
 */
export function detectCrossReferences(
  results: RecordResult[],
  subjectName: string,
): string[] {
  const refs: string[] = [];
  const seen = new Set<string>();

  const addUnique = (ref: string) => {
    const key = ref.toLowerCase();
    if (!seen.has(key)) {
      seen.add(key);
      refs.push(ref);
    }
  };

  // Group records by category
  const byCategory: Record<string, RecordResult[]> = {};
  for (const r of results) {
    (byCategory[r.category] ??= []).push(r);
  }

  const fecRecords = byCategory["donations"] || [];
  const courtRecords = byCategory["court"] || [];
  const sanctionsRecords = byCategory["sanctions"] || [];
  const businessRecords = byCategory["business"] || [];
  const offshoreRecords = byCategory["offshore"] || [];

  const normalize = (s: string) =>
    s.toLowerCase().replace(/[^a-z0-9 ]/g, "").replace(/\s+/g, " ").trim();

  const subjectNorm = normalize(subjectName);
  const subjectParts = subjectNorm.split(" ").filter(p => p.length >= 2);
  const subjectLast = subjectParts[subjectParts.length - 1] || "";
  const subjectFirst = subjectParts[0] || "";

  // Helper: check if a name matches the subject (full or close variant)
  const isSubjectName = (name: string) => {
    const n = normalize(name);
    return n.includes(subjectNorm) ||
      n.includes(`${subjectLast} ${subjectFirst}`) ||
      n.includes(`${subjectLast}, ${subjectFirst}`);
  };

  // 1. Subject name in FEC AND court records
  const subjectInFec = fecRecords.some(r => {
    const contrib = normalize(r.details?.Contributor || "");
    return contrib.includes(subjectNorm) || contrib.includes(`${subjectLast}, ${subjectFirst}`);
  });
  const subjectInCourt = courtRecords.some(r => {
    const caseName = normalize(r.details?.["Case Name"] || r.description || "");
    return caseName.includes(subjectLast) && caseName.includes(subjectFirst);
  });
  if (subjectInFec && subjectInCourt) {
    addUnique(`"${subjectName}" appears in both FEC campaign finance records and federal court records.`);
  }

  // 2. Subject name in FEC AND PEP/sanctions
  const subjectInSanctions = sanctionsRecords.some(r => {
    const name = normalize(r.details?.Name || "");
    return isSubjectName(name);
  });
  if (subjectInFec && subjectInSanctions) {
    addUnique(`"${subjectName}" appears in both FEC campaign finance records and PEP/sanctions databases.`);
  }

  // 3. Employer/business names from FEC → check against SunBiz
  const employers = new Set<string>();
  for (const r of fecRecords) {
    const employer = r.details?.Employer || "";
    if (employer && employer !== "N/A" && employer.length >= 3) {
      employers.add(employer);
    }
  }

  const sunbizEntities = new Set<string>();
  for (const r of businessRecords) {
    const entityName = r.details?.["Entity Name"] || "";
    if (entityName) sunbizEntities.add(normalize(entityName));
  }

  for (const employer of employers) {
    const empNorm = normalize(employer);
    // Check exact or substring match against SunBiz entities
    for (const entity of sunbizEntities) {
      if (entity.includes(empNorm) || empNorm.includes(entity)) {
        addUnique(`"${employer}" appears as an employer in FEC records and as a registered entity in business filings.`);
        break;
      }
    }
    // Even if no SunBiz match found, flag it as a potential cross-reference to check
    if (empNorm.includes(subjectLast) && !seen.has(`"${employer}" appears as an employer in FEC records and as a registered entity in business filings.`.toLowerCase())) {
      addUnique(`"${employer}" listed as employer in FEC records shares the subject's surname — verify against business registry filings.`);
    }
  }

  // 4. Same address across sources
  const addressesBySource: Record<string, Set<string>> = {};
  for (const r of results) {
    const city = r.details?.City || "";
    const state = r.details?.State || r.details?.["State"] || "";
    const address = r.details?.Address || r.details?.["Street Address"] || "";
    if (city && city !== "N/A" && state && state !== "N/A") {
      const key = normalize(`${city} ${state}`);
      (addressesBySource[key] ??= new Set()).add(r.category);
    }
    if (address && address !== "N/A" && address.length >= 5) {
      const key = normalize(address);
      (addressesBySource[key] ??= new Set()).add(r.category);
    }
  }
  // Only flag addresses that span 3+ categories (city+state is too broad for just 2)
  for (const [addr, categories] of Object.entries(addressesBySource)) {
    if (categories.size >= 3) {
      const catNames = [...categories].map(c => categoryLabel(c)).join(", ");
      addUnique(`The same location (${addr}) appears across ${categories.size} data sources: ${catNames}.`);
    }
  }

  // 5. Same business entity in offshore AND SunBiz
  for (const r of offshoreRecords) {
    if (r.id === "icij-summary") continue;
    const entityName = normalize(r.details?.Name || "");
    if (!entityName || entityName.length < 4) continue;
    for (const sunbiz of sunbizEntities) {
      if (sunbiz.includes(entityName) || entityName.includes(sunbiz)) {
        const displayName = r.details?.Name || "Entity";
        addUnique(`"${displayName}" appears in both ICIJ Offshore Leaks and business registry filings.`);
        break;
      }
    }
  }

  // 6. Subject in sanctions AND court
  if (subjectInSanctions && subjectInCourt) {
    addUnique(`"${subjectName}" appears in both PEP/sanctions databases and federal court records.`);
  }

  return refs;
}

function categoryLabel(cat: string): string {
  const labels: Record<string, string> = {
    donations: "FEC Campaign Finance",
    court: "Court Records",
    business: "Business Filings",
    sanctions: "Sanctions/PEP",
    offshore: "Offshore Leaks",
    contracts: "Federal Contracts",
    lobbying: "Lobbying Disclosures",
    assets: "Asset Records",
    property: "Property Records",
    licenses: "Professional Licenses",
  };
  return labels[cat] || cat;
}
