import type { RecordResult } from "@/lib/recordsApi";

export interface ScoredOffshoreRecord {
  record: RecordResult;
  score: number;
  tier: "high" | "possible" | "weak" | "hidden";
}

// Common first names that produce false positives in ICIJ
const COMMON_FIRST_NAMES = new Set([
  "jack", "john", "james", "robert", "michael", "william", "david", "richard",
  "joseph", "thomas", "charles", "daniel", "matthew", "mark", "donald", "paul",
  "george", "edward", "brian", "steven", "peter", "andrew", "frank", "henry",
  "mary", "patricia", "jennifer", "linda", "elizabeth", "barbara", "susan",
  "margaret", "dorothy", "lisa", "nancy", "karen", "betty", "helen", "sandra",
]);

/**
 * Score an ICIJ offshore entity record for relevance to the search subject.
 */
export function scoreOffshoreRecord(
  record: RecordResult,
  subjectName: string,
  subjectState: string,
): ScoredOffshoreRecord {
  // Skip summary records — they're handled separately
  if (record.id === "icij-summary") {
    return { record, score: 100, tier: "high" };
  }

  let score = 0;
  const nameLower = subjectName.toLowerCase().trim();
  const nameParts = nameLower.split(/\s+/).filter(p => p.length >= 1);
  const firstName = nameParts[0] || "";
  const lastName = nameParts[nameParts.length - 1] || "";
  const fullName = nameLower;

  const entityName = (record.details?.Name || record.description || "").toLowerCase();
  const allText = Object.values(record.details || {}).join(" ").toLowerCase();

  // Check full name match (+40)
  const hasFullName = entityName.includes(fullName) ||
    entityName.includes(`${lastName}, ${firstName}`) ||
    entityName.includes(`${lastName} ${firstName}`);

  if (hasFullName) {
    score += 40;
  } else {
    // Check name variant match (+30) — e.g. "W. Jack Latvala" matching "Jack Latvala"
    const hasLastName = entityName.includes(lastName);
    const hasFirstName = entityName.includes(firstName);

    if (hasLastName && hasFirstName) {
      score += 30; // variant match
    } else if (hasLastName && !hasFirstName) {
      // Last name only — could be coincidence
      // Check if entity name has a different first name
      const entityWords = entityName.replace(/[^a-z\s]/g, "").split(/\s+/).filter(w => w.length >= 2);
      const hasDifferentFirst = entityWords.some(w => w !== lastName && w !== firstName && w.length >= 3);
      if (hasDifferentFirst) {
        score -= 40; // demonstrably different person
      } else {
        score -= 20; // ambiguous
      }
    } else if (hasFirstName && !hasLastName) {
      // First name only — almost certainly different person
      if (COMMON_FIRST_NAMES.has(firstName)) {
        score -= 25; // common first name, no surname overlap
      } else {
        score -= 20;
      }
    } else {
      // Neither name matches meaningfully
      score -= 30;
    }
  }

  // +20: jurisdiction/country matches subject's state
  const stateLower = subjectState.toLowerCase();
  if (stateLower && stateLower !== "all states / national") {
    if (allText.includes(stateLower) || allText.includes("united states") || allText.includes("usa")) {
      score += 20;
    }
  }

  // +20: Address matches subject's known location
  // Check for state abbreviation or city names in details
  const stateAbbrs: Record<string, string> = { florida: "fl", "new york": "ny", california: "ca", texas: "tx" };
  const abbr = stateAbbrs[stateLower] || "";
  if (abbr && allText.includes(`, ${abbr}`) || allText.includes(` ${abbr} `)) {
    score += 20;
  }

  // +10: Entity type consistent with business activity
  const entityType = (record.details?.Type || "").toLowerCase();
  const businessTypes = ["company", "corporation", "llc", "limited", "trust", "foundation"];
  if (businessTypes.some(t => entityType.includes(t))) {
    score += 10;
  }

  // -30: Entity jurisdiction is clearly foreign with no connection
  const foreignJurisdictions = [
    "british virgin islands", "bvi", "cayman", "panama", "seychelles",
    "bahamas", "bermuda", "jersey", "guernsey", "isle of man", "liechtenstein",
    "hong kong", "singapore", "cyprus", "malta", "luxembourg",
  ];
  const hasNoUSConnection = !allText.includes("united states") && !allText.includes("usa") &&
    !allText.includes(stateLower) && !(abbr && allText.includes(abbr));
  const isForeignJurisdiction = foreignJurisdictions.some(j => allText.includes(j));
  if (isForeignJurisdiction && hasNoUSConnection && !hasFullName) {
    score -= 30;
  }

  // Determine tier
  let tier: ScoredOffshoreRecord["tier"];
  if (score < 0) tier = "hidden";
  else if (score < 30) tier = "weak";
  else if (score < 60) tier = "possible";
  else tier = "high";

  return { record, score, tier };
}

/**
 * Score and partition offshore records into tiers.
 * The summary record is always returned separately.
 */
export function classifyOffshoreRecords(
  records: RecordResult[],
  subjectName: string,
  subjectState: string,
): {
  summaryRecord: RecordResult | null;
  high: ScoredOffshoreRecord[];
  possible: ScoredOffshoreRecord[];
  weak: ScoredOffshoreRecord[];
  hiddenCount: number;
  totalEntityCount: number;
  credibleCount: number;
} {
  const summaryRecord = records.find(r => r.id === "icij-summary") || null;
  const entityRecords = records.filter(r => r.id !== "icij-summary");

  const scored = entityRecords.map(r => scoreOffshoreRecord(r, subjectName, subjectState));
  scored.sort((a, b) => b.score - a.score);

  const high = scored.filter(s => s.tier === "high");
  const possible = scored.filter(s => s.tier === "possible");
  const weak = scored.filter(s => s.tier === "weak");
  const hiddenCount = scored.filter(s => s.tier === "hidden").length;

  return {
    summaryRecord,
    high,
    possible,
    weak,
    hiddenCount,
    totalEntityCount: entityRecords.length,
    credibleCount: high.length + possible.length,
  };
}
