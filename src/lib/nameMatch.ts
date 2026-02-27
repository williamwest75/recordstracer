/**
 * Name match confidence scoring
 * Compares a searched name against a returned name from a data source
 */

export type MatchConfidence = "exact" | "likely" | "possible" | "weak";

function normalize(s: string): string {
  return s.toLowerCase().replace(/[^a-z0-9 ]/g, "").replace(/\s+/g, " ").trim();
}

function extractParts(name: string): string[] {
  // Handle "LAST, FIRST" format
  const commaIndex = name.indexOf(",");
  if (commaIndex > 0) {
    const parts = name.split(",").map(p => p.trim());
    return parts.reverse().flatMap(p => p.split(/\s+/)).map(p => normalize(p)).filter(p => p.length >= 2);
  }
  return name.split(/\s+/).map(p => normalize(p)).filter(p => p.length >= 2);
}

export function getNameMatchConfidence(searchedName: string, returnedName: string): MatchConfidence {
  const sNorm = normalize(searchedName);
  const rNorm = normalize(returnedName);

  // Exact match
  if (sNorm === rNorm) return "exact";

  const sParts = extractParts(searchedName);
  const rParts = extractParts(returnedName);

  if (sParts.length === 0 || rParts.length === 0) return "weak";

  // Check if all parts match (regardless of order) - "exact" with reordering
  const sSet = new Set(sParts);
  const rSet = new Set(rParts);
  if (sSet.size === rSet.size && [...sSet].every(p => rSet.has(p))) return "exact";

  // Likely: all searched parts appear in returned (or vice versa)
  const allSearchInResult = sParts.every(sp => rParts.some(rp => rp === sp || rp.startsWith(sp) || sp.startsWith(rp)));
  const allResultInSearch = rParts.every(rp => sParts.some(sp => sp === rp || sp.startsWith(rp) || rp.startsWith(sp)));

  if (allSearchInResult || allResultInSearch) return "likely";

  // Possible: last name matches + first initial matches
  const sLast = sParts[sParts.length - 1];
  const rLast = rParts[rParts.length - 1];
  const sFirst = sParts[0];
  const rFirst = rParts[0];

  const lastMatch = sLast === rLast || rParts.includes(sLast) || sParts.includes(rLast);
  const firstInitialMatch = sFirst && rFirst && (sFirst[0] === rFirst[0]);

  if (lastMatch && firstInitialMatch) return "possible";
  if (lastMatch) return "possible";

  // Weak
  return "weak";
}

export const MATCH_LABELS: Record<MatchConfidence, { label: string; description: string }> = {
  exact: { label: "Exact Match", description: "Name matches exactly as searched" },
  likely: { label: "Likely Match", description: "Name variant detected — likely the same individual" },
  possible: { label: "Possible Match", description: "Similar name found — independent verification required" },
  weak: { label: "Weak Match", description: "Low confidence — may be a different individual entirely" },
};
