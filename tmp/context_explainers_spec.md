# Record Tracer: Improve Result Context, Explainers & Next Steps

## OVERVIEW

Record Tracer already pulls live data from 10+ sources and generates an AI Subject Briefing. The results are powerful but reporters need better context to understand what results MEAN, what's noise vs signal, and what to do next — all without implying wrongdoing.

## PROBLEM 1: MATCH SCORES ARE CONFUSING

### Current behavior:
- ICIJ results show "58% match" for "CHARLIE LIMITED" when searching "Charlie Crist"
- This is a NAME-SIMILARITY match, not a CONNECTION match
- A reporter seeing "58% match" thinks there's a 58% chance Charlie Crist owns CHARLIE LIMITED
- That's NOT what it means

### Fix: Replace "match" with "name similarity" and add context

On every result card that shows a match percentage:

**Change:** `58% match` 
**To:** `58% name similarity`

And add a small tooltip or info icon (ℹ️) next to it that on hover/tap shows:
> "Name similarity indicates how closely the entity name matches your search term. It does NOT indicate a confirmed connection. Many entities share similar names. Always verify identity using additional details like addresses, dates, and jurisdictions."

### For match scores below 70%:
Show a muted label: `⚠️ Weak name match — verify independently`

### For match scores 70-89%:
Show: `Moderate name match — review details to confirm identity`

### For match scores 90%+:
Show: `Strong name match — likely relevant, verify details`

## PROBLEM 2: ICIJ OFFSHORE LEAKS NEEDS CONTEXT

### Current behavior:
The detail modal shows "Entity node extracted from the Panama Papers data" with no explanation of what that means for a reporter.

### Fix: Add an explainer block to the ICIJ section header AND to each detail modal

**Section header explainer** (below "Offshore Leaks (ICIJ)" heading):
```
ℹ️ About Offshore Leaks
These results come from the International Consortium of Investigative 
Journalists' database of 810,000+ offshore entities from the Panama Papers, 
Paradise Papers, Pandora Papers, and other leaked documents.

⚠️ IMPORTANT: Offshore entities have many legitimate uses including 
international business, estate planning, and asset protection. Appearing 
in this database does NOT indicate illegal activity. Names may match 
different individuals. Always verify identity using addresses, dates, 
and jurisdictions before drawing conclusions.
```

**In each detail modal**, add a "What This Means" section below RECORD DETAILS:

```
WHAT THIS MEANS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
This record shows an offshore entity named "CHARLIE FOUNDATION" that 
appeared in leaked documents from [Panama Papers / Paradise Papers / etc.].

The entity is classified as: [Offshore Entity / Officer / Intermediary / Address]

🔍 NEXT STEPS FOR REPORTERS:
• Check if this entity name matches your subject — "CHARLIE" is a 
  common name element; this may be a different person entirely
• Click "View on ICIJ" to see the full network graph showing 
  connected officers, addresses, and intermediaries
• Cross-reference any addresses or officer names against Sunbiz, 
  property records, and other sources in this search
• If the entity appears connected to your subject, file a public 
  records request for any associated financial disclosures

This listing does not imply any illegal conduct.
```

## PROBLEM 3: OPENSANCTIONS / PEP RESULTS NEED EXPLANATION

### Current behavior:
Shows "Sanctions/PEP Record · 95% match · Charlie Crist — Person (wd_peps, wd_categories, wikidata, us_congress, everypolitician, ann_pep_positions)"

A reporter sees "Sanctions" and panics. But this is a PEP (Politically Exposed Person) listing — completely expected for a former governor and congressman.

### Fix: Distinguish between SANCTIONS and PEP listings clearly

**For PEP records** (where type contains "pep" or "politician"):
```
┌─────────────────────────────────────────────────────┐
│ 👤 Politically Exposed Person (PEP)    95% match     │
│                                                      │
│ Charlie Crist — Person                               │
│ Sources: Wikidata, US Congress, EveryPolitician       │
│                                                      │
│ ℹ️ PEP status means this person holds or held a      │
│ public office. This is standard for elected           │
│ officials and government appointees — it does NOT     │
│ indicate sanctions, criminal activity, or wrongdoing. │
│ PEP databases exist to flag potential conflicts of    │
│ interest in financial transactions.                   │
│                                                      │
│ 🔍 NEXT STEPS:                                       │
│ • Check campaign finance records for related donations│
│ • Review any disclosed financial interests            │
│ • Cross-reference with lobbying registrations         │
└─────────────────────────────────────────────────────┘
```

**For actual SANCTIONS records** (where type contains "sanction"):
```
┌─────────────────────────────────────────────────────┐
│ 🚨 Sanctions List Match                 50% match    │
│                                                      │
│ Vitol — Company                                      │
│ Source: ir_uani_business_registry                     │
│                                                      │
│ ⚠️ This entity appears on one or more international  │
│ sanctions lists. Sanctions are imposed by governments │
│ to restrict dealings with specific individuals,       │
│ companies, or countries.                              │
│                                                      │
│ ⚠️ VERIFY: A 50% name match does NOT confirm this    │
│ is the same entity. Many companies share similar      │
│ names.                                               │
│                                                      │
│ 🔍 NEXT STEPS:                                       │
│ • Click "View Details" to check the full sanctions    │
│   record, including jurisdiction and listed reasons   │
│ • Verify the entity's registered address and officers │
│   match your subject                                 │
│ • Consult OFAC's SDN list for the most current status │
└─────────────────────────────────────────────────────┘
```

**For the "[object Object]" bug** visible in the screenshots:
The "Global Sanctions & PEPs Summary" card shows `[object Object] record(s) found across global sanctions lists and PEP databases`. This is a rendering bug — the result count is being passed as an object instead of a number. Fix this by extracting the count properly.

## PROBLEM 4: AI SUBJECT BRIEFING NEEDS LEGAL GUARDRAILS

### Current behavior:
The AI briefing says things like "Records indicate Charlie Crist is associated with 13 offshore entities" — this implies a direct connection that may not exist. The ICIJ results matched on "CHARLIE" which is just a first-name fragment match.

### Fix: Update the AI briefing prompt with strict language rules

Add these rules to the AI prompt that generates the Subject Briefing:

```
LANGUAGE RULES — FOLLOW EXACTLY:

1. NEVER say a person "is associated with" or "is connected to" results. 
   Instead say "X records were returned matching or partially matching 
   this name."

2. NEVER imply ownership, control, or involvement with offshore entities.
   Instead say "Offshore entity records with similar names were found in 
   the ICIJ database. These may or may not relate to the search subject."

3. For WEAK matches (below 70% similarity), explicitly note: "These are 
   weak name matches that likely refer to different individuals or entities."

4. For PEP/sanctions results, always distinguish between:
   - PEP listings (normal for public officials — say so explicitly)
   - Actual sanctions (flag but note name match strength)

5. ALWAYS include this disclaimer at the end of every briefing:
   "This summary is generated from public database searches. Name matches 
   do not confirm identity or imply wrongdoing. All findings require 
   independent verification before use in reporting."

6. NEVER use words: "guilty", "criminal", "illegal", "fraud", "corrupt", 
   "dirty", "suspicious" — use neutral language like "warrants further 
   review", "merits additional verification", "notable for further research"

7. When referencing match counts, always qualify:
   WRONG: "13 offshore entities are linked to this person"
   RIGHT: "13 offshore entity records contain names similar to the search 
   term. Most appear to be coincidental name matches."
```

### Updated briefing structure:

```
AI SUBJECT BRIEFING
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

[Summary paragraph — neutral language, qualified claims]

WHAT WE FOUND:
• FEC: 16 campaign contribution records matching this name
• CourtListener: 2,801 federal court records (common for public officials 
  who are frequently named in litigation)
• ICIJ Offshore Leaks: 13 entity records with similar names — most appear 
  to be coincidental matches (e.g., "CHARLIE LIMITED", "CHARLIE YEUNG")
• OpenSanctions: 3 records — 1 PEP listing (expected for elected officials), 
  2 low-confidence matches to unrelated entities

WHAT TO VERIFY:
• Review the ICIJ entities to determine if any share addresses or officers 
  with your subject — click "View on ICIJ" for network graphs
• The PEP listing is standard for a former governor — not an indicator of 
  wrongdoing
• Campaign finance records show donations primarily to Democratic committees 
  — verify amounts and dates on FEC.gov
• The high volume of court records is typical for a former state attorney 
  general and governor — filter by party name to find relevant cases

WHAT THIS SEARCH DOES NOT COVER:
• State court records (check Florida Courts portal)
• Property ownership (check county Property Appraiser)
• State-level campaign finance (check FL Division of Elections)
• Business ownership details (check Sunbiz for full filing history)

⚠️ This summary is generated from public database searches. Name matches 
do not confirm identity or imply wrongdoing. All findings require 
independent verification before use in reporting.
```

## PROBLEM 5: CONNECTIONS BETWEEN RESULTS

### Add a "Cross-References" section

When the AI briefing is generated, it should look for overlapping data points across sources and flag them:

```
CROSS-REFERENCES DETECTED:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

🔗 Name overlap: "CHARLIE FOUNDATION" appears in ICIJ Offshore Leaks 
   AND a ProPublica Nonprofits result. These may or may not be the same 
   entity — compare registered addresses and officers to determine.

🔗 Political activity: FEC records show donations to Democratic committees. 
   OpenSanctions PEP listing confirms public office history. These are 
   consistent and expected.

🔗 No overlapping addresses or officers were detected across sources 
   in this search.
```

This is where Record Tracer becomes uniquely valuable — no other tool connects dots across ICIJ, OpenSanctions, FEC, CourtListener, and GDELT in one view.

## PROBLEM 6: "WHAT TO DO NEXT" ACTIONABLE CARDS

### Add a "Reporter's Checklist" at the bottom of results

```
📋 REPORTER'S CHECKLIST
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Based on this search, here are recommended next steps:

□ Verify identity — Confirm that high-confidence matches (90%+) refer 
  to your actual subject using addresses, dates, and other identifiers

□ Check ICIJ network graphs — Click "View on ICIJ" for any offshore 
  entity matches to see connected officers and intermediaries

□ Review campaign finance details — Open FEC.gov to see full donation 
  history with dates, amounts, and recipient committees

□ Search state records — This search covers federal databases. Check 
  Florida-specific sources using the Public Records Links below:
  → FL Division of Elections (state campaign finance)
  → Sunbiz (corporate filings)  
  → County Property Appraiser (real estate)
  → FL Courts (state court cases)

□ File public records requests — If offshore entities or court cases 
  appear relevant, consider FOIA/public records requests for:
  → Financial disclosure statements
  → Government contract records
  → Meeting minutes or correspondence

□ Consult your editor — Before publishing any findings from sanctions 
  or offshore databases, review with your editor and legal counsel
```

## IMPLEMENTATION NOTES

1. The AI briefing prompt update is the highest priority — it affects every search result
2. The match score relabeling ("name similarity" instead of "match") is a quick UI fix
3. The PEP vs Sanctions distinction requires checking the result type/tags from OpenSanctions
4. The `[object Object]` bug in the Global Sanctions summary should be fixed immediately
5. The cross-references section requires the AI to receive all source results and look for overlaps
6. The Reporter's Checklist can be a static component that appears on every search result page

## LEGAL DISCLAIMER

Add a persistent footer or banner on every search results page:

```
Record Tracer searches publicly available government databases and open 
data sources. Search results reflect name-based matches and do not confirm 
identity, affiliation, or wrongdoing. Users are responsible for independently 
verifying all information before use in any publication or legal proceeding. 
Record Tracer is a research tool, not a background check service as defined 
under the Fair Credit Reporting Act (FCRA).
```

This FCRA disclaimer is important — it establishes that Record Tracer is NOT a consumer reporting agency and its results should not be used for employment, credit, or housing decisions. This is the same language LexisNexis uses for its non-FCRA products.
