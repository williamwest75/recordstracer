import type { RecordResult } from "@/lib/recordsApi";

export interface ScoredCourtRecord {
  record: RecordResult;
  score: number;
  tier: "high" | "possible" | "weak" | "hidden";
}

/**
 * Score a court record for relevance to the search subject.
 * Returns a numeric score and confidence tier.
 */
export function scoreCourtRecord(
  record: RecordResult,
  subjectName: string,
  subjectState: string,
  subjectCity?: string,
): ScoredCourtRecord {
  let score = 0;
  const nameLower = subjectName.toLowerCase();
  const nameParts = nameLower.split(/\s+/).filter(p => p.length >= 2);
  const lastName = nameParts[nameParts.length - 1] || "";
  const firstName = nameParts[0] || "";
  const fullName = nameLower;

  const caseName = (record.details?.["Case Name"] || record.description || "").toLowerCase();
  const court = (record.details?.Court || "").toLowerCase();
  const cause = (record.details?.Cause || "").toLowerCase();
  const suitNature = (record.details?.["Nature of Suit"] || "").toLowerCase();
  const description = (record.description || "").toLowerCase();
  const allText = `${caseName} ${court} ${cause} ${suitNature} ${description}`;

  // +40: Subject's full name appears as a named party
  if (caseName.includes(fullName) || caseName.includes(`${lastName}, ${firstName}`)) {
    score += 40;
  } else {
    // Check for partial name match (first OR last only)
    const hasLast = caseName.includes(lastName);
    const hasFirst = caseName.includes(firstName);
    if (hasLast && !hasFirst) {
      // Only last name — check if it's a common word or just partial
      score -= 30; // partial name match penalty
    } else if (hasFirst && !hasLast) {
      score -= 30;
    }
  }

  // +20: Subject's state appears in the record
  const stateLower = subjectState.toLowerCase();
  if (stateLower && stateLower !== "all states / national") {
    if (court.includes(stateLower) || allText.includes(stateLower)) {
      score += 20;
    }
  }

  // +20: Subject's city appears
  if (subjectCity) {
    const cityLower = subjectCity.toLowerCase();
    if (allText.includes(cityLower)) {
      score += 10;
    }
  }

  // +15: Record type matches political/public figure background
  // (redistricting, election law, campaign finance, lobbying, legislative)
  const politicalKeywords = [
    "redistricting", "election", "campaign", "ballot", "voter", "voting",
    "legislat", "reapportion", "political", "lobbyist", "lobbying",
    "ethics", "sunshine", "public record", "government", "municipal",
  ];
  if (politicalKeywords.some(kw => allText.includes(kw))) {
    score += 15;
  }

  // +10: Filing date within plausible active period (2000-present for most subjects)
  const dateFiled = record.details?.["Date Filed"] || "";
  if (dateFiled) {
    const year = parseInt(dateFiled.substring(0, 4), 10);
    if (!isNaN(year) && year >= 2000 && year <= new Date().getFullYear()) {
      score += 10;
    }
  }

  // +10: Subject's employer or known entity named
  // (We check if the subject name appears in a party context beyond just the case name)
  if (record.source === "Court Party Record") {
    const partyName = (record.details?.Name || "").toLowerCase();
    if (partyName.includes(fullName)) {
      score += 10;
    }
  }

  // -20: Bankruptcy filing with no named individual match
  const isBankruptcy = allText.includes("bankrupt") || suitNature.includes("bankrupt");
  if (isBankruptcy && !caseName.includes(fullName)) {
    score -= 20;
  }

  // -20: Company/org case with no named individual
  const orgIndicators = ["inc.", "llc", "corp", "ltd", "l.p.", "co.", "association", "foundation", "fund"];
  const isOrgCase = orgIndicators.some(ind => caseName.includes(ind));
  if (isOrgCase && !caseName.includes(fullName)) {
    score -= 20;
  }

  // Determine tier
  let tier: ScoredCourtRecord["tier"];
  if (score < 0) tier = "hidden";
  else if (score < 40) tier = "weak";
  else if (score < 70) tier = "possible";
  else tier = "high";

  return { record, score, tier };
}

/**
 * Score and partition court records into tiers.
 */
export function classifyCourtRecords(
  records: RecordResult[],
  subjectName: string,
  subjectState: string,
  subjectCity?: string,
): {
  high: ScoredCourtRecord[];
  possible: ScoredCourtRecord[];
  weak: ScoredCourtRecord[];
  hiddenCount: number;
} {
  const scored = records.map(r => scoreCourtRecord(r, subjectName, subjectState, subjectCity));
  scored.sort((a, b) => b.score - a.score);

  return {
    high: scored.filter(s => s.tier === "high"),
    possible: scored.filter(s => s.tier === "possible"),
    weak: scored.filter(s => s.tier === "weak"),
    hiddenCount: scored.filter(s => s.tier === "hidden").length,
  };
}
