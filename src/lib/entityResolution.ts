import type { RecordResult } from "@/lib/recordsApi";

export interface EntityCluster {
  id: string;
  canonicalName: string;
  records: RecordResult[];
  databases: string[];
  sharedAttributes: string[];
}

/** Normalize a name for comparison: lowercase, strip suffixes, flip "LAST, FIRST" → "first last" */
function normalizeName(raw: string): string {
  let n = raw.toLowerCase().trim();
  // Remove common suffixes
  n = n.replace(/\b(jr\.?|sr\.?|ii|iii|iv|v|esq\.?)\s*$/i, "").trim();
  // Handle "LAST, FIRST" format
  if (n.includes(",")) {
    const parts = n.split(",").map(p => p.trim());
    if (parts.length === 2 && parts[0].length > 0 && parts[1].length > 0) {
      n = `${parts[1]} ${parts[0]}`;
    }
  }
  // Remove extra whitespace, punctuation
  n = n.replace(/[^a-z\s]/g, "").replace(/\s+/g, " ").trim();
  return n;
}

/** Extract name parts as a set for fuzzy comparison */
function nameParts(normalized: string): Set<string> {
  return new Set(normalized.split(" ").filter(p => p.length > 1));
}

/** Compute similarity between two normalized names (0-1) */
function nameSimilarity(a: string, b: string): number {
  if (a === b) return 1;
  const partsA = nameParts(a);
  const partsB = nameParts(b);
  if (partsA.size === 0 || partsB.size === 0) return 0;

  let matches = 0;
  for (const p of partsA) {
    if (partsB.has(p)) matches++;
  }
  const total = Math.max(partsA.size, partsB.size);
  return matches / total;
}

/** Extract shared attributes between records */
function findSharedAttributes(records: RecordResult[]): string[] {
  const shared: string[] = [];
  const cities = new Set<string>();
  const states = new Set<string>();
  const employers = new Set<string>();

  for (const r of records) {
    const details = r.details || {};
    for (const [key, val] of Object.entries(details)) {
      if (!val || typeof val !== "string") continue;
      const v = val.trim().toLowerCase();
      if (v === "n/a" || v === "" || v === "unknown") continue;

      const kl = key.toLowerCase();
      if (kl.includes("city")) cities.add(v);
      if (kl.includes("state")) states.add(v);
      if (kl.includes("employer") || kl.includes("company") || kl.includes("organization")) employers.add(v);
    }
  }

  if (cities.size === 1) shared.push(`Same city: ${[...cities][0]}`);
  if (states.size === 1) shared.push(`Same state: ${[...states][0]}`);
  if (employers.size === 1 && employers.size > 0) shared.push(`Same employer: ${[...employers][0]}`);

  return shared;
}

/** Pick the best display name from a cluster */
function pickCanonicalName(records: RecordResult[]): string {
  // Prefer names that are already in "First Last" format (no commas, not all caps)
  for (const r of records) {
    const name = r.returnedName || r.source;
    if (name && !name.includes(",") && name !== name.toUpperCase()) {
      return name;
    }
  }
  // Fall back to normalizing the first returned name
  const first = records[0]?.returnedName || records[0]?.source || "Unknown";
  const normalized = normalizeName(first);
  return normalized
    .split(" ")
    .map(p => p.charAt(0).toUpperCase() + p.slice(1))
    .join(" ");
}

/**
 * Cluster records that likely refer to the same entity.
 * Returns clusters with 2+ records from different databases.
 */
export function clusterEntities(results: RecordResult[], searchName: string): EntityCluster[] {
  const searchNorm = normalizeName(searchName);
  const clusters: { normalized: string; records: RecordResult[] }[] = [];

  for (const record of results) {
    // Skip summary records
    if (record.id.endsWith("-summary")) continue;

    const recordName = normalizeName(record.returnedName || record.source || "");
    if (!recordName || nameSimilarity(recordName, searchNorm) < 0.5) continue;

    // Try to find an existing cluster
    let matched = false;
    for (const cluster of clusters) {
      if (nameSimilarity(recordName, cluster.normalized) >= 0.7) {
        cluster.records.push(record);
        matched = true;
        break;
      }
    }

    if (!matched) {
      clusters.push({ normalized: recordName, records: [record] });
    }
  }

  // Only return clusters spanning 2+ different categories (databases)
  return clusters
    .filter(c => {
      const categories = new Set(c.records.map(r => r.category));
      return categories.size >= 2 && c.records.length >= 2;
    })
    .map((c, i) => ({
      id: `entity-${i}`,
      canonicalName: pickCanonicalName(c.records),
      records: c.records,
      databases: [...new Set(c.records.map(r => r.category))],
      sharedAttributes: findSharedAttributes(c.records),
    }))
    .sort((a, b) => b.records.length - a.records.length);
}
