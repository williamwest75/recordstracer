# Record Tracer: Dossier View — Technical Spec & Lovable Prompt

## OVERVIEW

Transform Record Tracer from a link directory into an intelligence tool. When a reporter searches a name, Record Tracer will pull LIVE DATA from free public APIs and display it inline — campaign donations, federal court cases, court opinions, and news mentions — alongside an AI-generated background brief and a chronological timeline. The external link cards remain as "view full details" fallbacks.

---

## ARCHITECTURE

```
User searches "John Smith"
        │
        ▼
SearchResults page
        │
        ├──► supabase.functions.invoke("dossier-fec")
        │        → FEC OpenFEC API (free, key required)
        │        → Returns: donations, amounts, recipients, dates
        │
        ├──► supabase.functions.invoke("dossier-courtlistener")
        │        → CourtListener REST API v4 (free, token required)
        │        → Returns: court cases, dockets, opinions
        │
        ├──► supabase.functions.invoke("fetch-gdelt-news") [existing]
        │        → Returns: news mentions, tone, sources
        │
        └──► supabase.functions.invoke("dossier-brief")
                 → Takes combined results from above
                 → Calls OpenAI/Anthropic to generate plain-English summary
                 → Returns: 3-4 paragraph background brief
        │
        ▼
DossierView component renders:
  ┌─────────────────────────────────────┐
  │ Background Brief (AI summary)       │
  │ Timeline (all data points by date)  │
  │ Campaign Finance (FEC results)      │
  │ Court Records (CourtListener)       │
  │ News Mentions (GDELT - existing)    │
  │ Public Records Links (existing)     │
  └─────────────────────────────────────┘
```

---

## EDGE FUNCTION 1: `dossier-fec`

### API Details
- **Base URL:** `https://api.open.fec.gov/v1`
- **Auth:** API key (free, register at https://api.data.gov/signup/)
- **Rate Limit:** 1,000 requests/hour per key
- **No cost.** Completely free.

### Environment Variable
```
FEC_API_KEY=your_api_key_here
```
Store in Supabase Edge Function secrets.

### Endpoint to Call
```
GET /schedules/schedule_a/
```
This returns itemized individual contributions (Schedule A filings).

### Request Parameters
```typescript
const params = new URLSearchParams({
  contributor_name: searchName,        // e.g. "John Smith"
  contributor_state: "FL",             // Pre-filter to Florida
  sort: "-contribution_receipt_date",  // Most recent first
  per_page: "20",                      // Top 20 results
  api_key: FEC_API_KEY,
  is_individual: "true",               // Only individual donors
});
```

### Full Edge Function: `supabase/functions/dossier-fec/index.ts`

```typescript
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { searchName, state = "FL", limit = 20 } = await req.json();

    if (!searchName || searchName.trim().length < 2) {
      return new Response(
        JSON.stringify({ error: "Search name required (min 2 characters)" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const FEC_API_KEY = Deno.env.get("FEC_API_KEY");
    if (!FEC_API_KEY) {
      return new Response(
        JSON.stringify({ error: "FEC API key not configured" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // --- 1. Fetch individual contributions (Schedule A) ---
    const scheduleAParams = new URLSearchParams({
      contributor_name: searchName.trim(),
      contributor_state: state,
      sort: "-contribution_receipt_date",
      per_page: String(Math.min(limit, 100)),
      api_key: FEC_API_KEY,
      is_individual: "true",
    });

    const scheduleAUrl = `https://api.open.fec.gov/v1/schedules/schedule_a/?${scheduleAParams}`;
    const scheduleARes = await fetch(scheduleAUrl);

    if (!scheduleARes.ok) {
      console.error("FEC Schedule A error:", scheduleARes.status, await scheduleARes.text());
      return new Response(
        JSON.stringify({ error: "FEC API request failed", status: scheduleARes.status }),
        { status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const scheduleAData = await scheduleARes.json();
    const rawResults = scheduleAData.results || [];

    // --- 2. Transform into clean structure ---
    const contributions = rawResults.map((r: any) => ({
      contributor_name: r.contributor_name || "",
      contributor_city: r.contributor_city || "",
      contributor_state: r.contributor_state || "",
      contributor_employer: r.contributor_employer || "",
      contributor_occupation: r.contributor_occupation || "",
      committee_name: r.committee?.name || r.committee_name || "",
      committee_id: r.committee_id || "",
      candidate_name: r.candidate_name || null,
      amount: r.contribution_receipt_amount || 0,
      date: r.contribution_receipt_date || "",
      receipt_type_description: r.receipt_type_description || "",
      fec_url: r.pdf_url || null,
    }));

    // --- 3. Calculate summary stats ---
    const totalAmount = contributions.reduce((sum: number, c: any) => sum + c.amount, 0);
    const uniqueCommittees = [...new Set(contributions.map((c: any) => c.committee_name))];
    const uniqueCandidates = [...new Set(contributions.filter((c: any) => c.candidate_name).map((c: any) => c.candidate_name))];
    const dateRange = contributions.length > 0
      ? {
          earliest: contributions[contributions.length - 1]?.date || null,
          latest: contributions[0]?.date || null,
        }
      : null;

    // Group by committee for top recipients
    const byCommittee: Record<string, number> = {};
    contributions.forEach((c: any) => {
      byCommittee[c.committee_name] = (byCommittee[c.committee_name] || 0) + c.amount;
    });
    const topRecipients = Object.entries(byCommittee)
      .map(([name, total]) => ({ name, total }))
      .sort((a, b) => (b.total as number) - (a.total as number))
      .slice(0, 5);

    return new Response(
      JSON.stringify({
        source: "fec",
        query: searchName,
        state,
        total_results: scheduleAData.pagination?.count || contributions.length,
        returned_results: contributions.length,
        summary: {
          total_amount: totalAmount,
          contribution_count: contributions.length,
          unique_committees: uniqueCommittees.length,
          unique_candidates: uniqueCandidates.length,
          top_recipients: topRecipients,
          date_range: dateRange,
        },
        contributions,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    console.error("dossier-fec error:", err);
    return new Response(
      JSON.stringify({ error: "Internal error", message: err.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
```

### Register in `supabase/config.toml`:
```toml
[functions.dossier-fec]
verify_jwt = false
```

---

## EDGE FUNCTION 2: `dossier-courtlistener`

### API Details
- **Base URL:** `https://www.courtlistener.com/api/rest/v4/`
- **Auth:** Token-based (free account at courtlistener.com)
- **Rate Limit:** 5,000 requests/day for authenticated users
- **No cost.** Free for non-commercial/journalism use.

### Environment Variable
```
COURTLISTENER_API_TOKEN=your_token_here
```

### Endpoints to Call
1. **RECAP Search** (federal court dockets): `GET /search/?q=NAME&type=r`
2. **Opinions Search** (case law): `GET /search/?q=NAME&type=o`

### Full Edge Function: `supabase/functions/dossier-courtlistener/index.ts`

```typescript
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const CL_BASE = "https://www.courtlistener.com";

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { searchName, limit = 10 } = await req.json();

    if (!searchName || searchName.trim().length < 2) {
      return new Response(
        JSON.stringify({ error: "Search name required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const CL_TOKEN = Deno.env.get("COURTLISTENER_API_TOKEN");
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    };
    if (CL_TOKEN) {
      headers["Authorization"] = `Token ${CL_TOKEN}`;
    }

    const encodedName = encodeURIComponent(searchName.trim());

    // --- 1. Search RECAP Archive (federal dockets) ---
    let dockets: any[] = [];
    let docketCount = 0;
    try {
      const recapUrl = `${CL_BASE}/api/rest/v4/search/?q=${encodedName}&type=r&order_by=score+desc&page_size=${limit}`;
      const recapRes = await fetch(recapUrl, { headers });

      if (recapRes.ok) {
        const recapData = await recapRes.json();
        docketCount = recapData.count || 0;
        dockets = (recapData.results || []).map((r: any) => ({
          case_name: r.caseName || r.case_name || "",
          docket_number: r.docketNumber || r.docket_number || "",
          court: r.court || r.court_id || "",
          date_filed: r.dateFiled || r.date_filed || null,
          date_terminated: r.date_terminated || null,
          suit_nature: r.suitNature || r.suit_nature || "",
          url: r.absolute_url ? `${CL_BASE}${r.absolute_url}` : null,
          docket_id: r.docket_id || r.id || null,
          snippet: r.snippet || "",
        }));
      } else {
        console.error("CourtListener RECAP error:", recapRes.status);
      }
    } catch (e) {
      console.error("RECAP fetch failed:", e);
    }

    // --- 2. Search Opinions (case law) ---
    let opinions: any[] = [];
    let opinionCount = 0;
    try {
      const opUrl = `${CL_BASE}/api/rest/v4/search/?q=${encodedName}&type=o&order_by=score+desc&page_size=${limit}`;
      const opRes = await fetch(opUrl, { headers });

      if (opRes.ok) {
        const opData = await opRes.json();
        opinionCount = opData.count || 0;
        opinions = (opData.results || []).map((r: any) => ({
          case_name: r.caseName || r.case_name || "",
          court: r.court || r.court_id || "",
          date_filed: r.dateFiled || r.date_filed || null,
          citation: r.citation || (r.citations && r.citations[0]) || "",
          status: r.status || "",
          url: r.absolute_url ? `${CL_BASE}${r.absolute_url}` : null,
          snippet: r.snippet || "",
        }));
      } else {
        console.error("CourtListener Opinions error:", opRes.status);
      }
    } catch (e) {
      console.error("Opinions fetch failed:", e);
    }

    return new Response(
      JSON.stringify({
        source: "courtlistener",
        query: searchName,
        dockets: {
          total_count: docketCount,
          returned: dockets.length,
          results: dockets,
        },
        opinions: {
          total_count: opinionCount,
          returned: opinions.length,
          results: opinions,
        },
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    console.error("dossier-courtlistener error:", err);
    return new Response(
      JSON.stringify({ error: "Internal error", message: err.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
```

### Register in `supabase/config.toml`:
```toml
[functions.dossier-courtlistener]
verify_jwt = false
```

---

## EDGE FUNCTION 3: `dossier-brief`

### Purpose
Takes the combined results from FEC, CourtListener, and GDELT, and generates a plain-English background brief using AI.

### Full Edge Function: `supabase/functions/dossier-brief/index.ts`

```typescript
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { searchName, fecData, courtData, newsData } = await req.json();

    const OPENAI_API_KEY = Deno.env.get("OPENAI_API_KEY");
    if (!OPENAI_API_KEY) {
      return new Response(
        JSON.stringify({ error: "AI API key not configured" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Build context from available data
    const sections: string[] = [];

    // FEC summary
    if (fecData?.summary && fecData.summary.contribution_count > 0) {
      const s = fecData.summary;
      const topRecips = s.top_recipients
        ?.slice(0, 3)
        .map((r: any) => `${r.name} ($${r.total.toLocaleString()})`)
        .join(", ");
      sections.push(
        `CAMPAIGN FINANCE: ${s.contribution_count} federal political contributions totaling $${s.total_amount.toLocaleString()} to ${s.unique_committees} committees. Date range: ${s.date_range?.earliest || "unknown"} to ${s.date_range?.latest || "unknown"}. Top recipients: ${topRecips || "N/A"}.`
      );
    } else {
      sections.push("CAMPAIGN FINANCE: No federal contributions over $200 found in FEC records.");
    }

    // Court summary
    if (courtData?.dockets?.total_count > 0) {
      const dkts = courtData.dockets.results.slice(0, 5);
      const caseList = dkts.map((d: any) => `"${d.case_name}" (${d.court}, filed ${d.date_filed || "unknown"})`).join("; ");
      sections.push(
        `FEDERAL COURT: ${courtData.dockets.total_count} federal court docket(s) found. Cases include: ${caseList}.`
      );
    } else {
      sections.push("FEDERAL COURT: No federal court dockets found in the RECAP Archive.");
    }

    if (courtData?.opinions?.total_count > 0) {
      sections.push(
        `COURT OPINIONS: ${courtData.opinions.total_count} court opinion(s) mention this name.`
      );
    }

    // News summary
    if (newsData?.length > 0) {
      const sources = [...new Set(newsData.slice(0, 10).map((n: any) => n.source || n.MentionSourceName || "Unknown"))];
      sections.push(
        `NEWS MENTIONS: Found in ${newsData.length} recent news article(s). Sources include: ${sources.slice(0, 5).join(", ")}.`
      );
    } else {
      sections.push("NEWS MENTIONS: No recent news coverage found.");
    }

    const prompt = `You are a newsroom research assistant generating a background brief for a journalist. Based ONLY on the data below, write a 3-4 paragraph plain-English summary about "${searchName}". 

Rules:
- Only state facts supported by the data. Never speculate.
- If a section has no results, say so briefly (e.g., "No federal court records were found.").
- Write in third person, past tense for events, present tense for status.
- Note any patterns: donation timing, recurring recipients, case types.
- End with a one-sentence note about what's NOT covered (state records, property, licenses — things the reporter should check manually via the links below).
- Keep it under 200 words. No bullet points. No headers. Just paragraphs.
- Do NOT include any disclaimer about AI or accuracy. The UI handles that.

DATA:
${sections.join("\n")}`;

    const aiRes = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          { role: "system", content: "You are a concise newsroom research assistant. Write factual background briefs for journalists." },
          { role: "user", content: prompt },
        ],
        temperature: 0.3,
        max_tokens: 500,
      }),
    });

    if (!aiRes.ok) {
      console.error("AI API error:", aiRes.status);
      return new Response(
        JSON.stringify({ error: "AI brief generation failed" }),
        { status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const aiData = await aiRes.json();
    const brief = aiData.choices?.[0]?.message?.content || "Unable to generate brief.";

    return new Response(
      JSON.stringify({
        brief,
        searchName,
        data_sources: {
          fec: fecData?.summary?.contribution_count > 0,
          court_dockets: courtData?.dockets?.total_count > 0,
          court_opinions: courtData?.opinions?.total_count > 0,
          news: newsData?.length > 0,
        },
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    console.error("dossier-brief error:", err);
    return new Response(
      JSON.stringify({ error: "Internal error", message: err.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
```

### Register in `supabase/config.toml`:
```toml
[functions.dossier-brief]
verify_jwt = false
```

---

## ENVIRONMENT VARIABLES TO SET

In Supabase Dashboard → Edge Functions → Secrets:

```
FEC_API_KEY=            # Free from https://api.data.gov/signup/
COURTLISTENER_API_TOKEN= # Free from https://www.courtlistener.com/sign-in/
OPENAI_API_KEY=          # For background brief generation (or swap for Anthropic)
```

---

## FRONTEND: DossierView Component

### File: `src/components/DossierView.tsx`

This is the main orchestrator component that calls all three edge functions in parallel, collects results, then calls the brief generator.

### Data Flow:
```
1. User submits search
2. DossierView fires 3 parallel requests:
   - dossier-fec
   - dossier-courtlistener
   - fetch-gdelt-news (existing)
3. When all 3 resolve, fire dossier-brief with combined data
4. Render all sections as results stream in (don't wait for brief to show FEC/court)
```

### React Query Setup:
```typescript
// Each data source is its own useQuery so sections render independently
const fecQuery = useQuery({
  queryKey: ["dossier-fec", searchName],
  queryFn: () => supabase.functions.invoke("dossier-fec", {
    body: { searchName, state: "FL" }
  }).then(({ data, error }) => { if (error) throw error; return data; }),
  enabled: !!searchName,
  staleTime: 1000 * 60 * 30, // 30 min cache
});

const courtQuery = useQuery({
  queryKey: ["dossier-court", searchName],
  queryFn: () => supabase.functions.invoke("dossier-courtlistener", {
    body: { searchName }
  }).then(({ data, error }) => { if (error) throw error; return data; }),
  enabled: !!searchName,
  staleTime: 1000 * 60 * 30,
});

const newsQuery = useQuery({
  queryKey: ["dossier-news", searchName],
  queryFn: () => supabase.functions.invoke("fetch-gdelt-news", {
    body: { query: searchName, days: 90, mode: "events", usOnly: true }
  }).then(({ data, error }) => { if (error) throw error; return data; }),
  enabled: !!searchName,
  staleTime: 1000 * 60 * 30,
});

// Brief fires after all data is available
const briefQuery = useQuery({
  queryKey: ["dossier-brief", searchName],
  queryFn: () => supabase.functions.invoke("dossier-brief", {
    body: {
      searchName,
      fecData: fecQuery.data,
      courtData: courtQuery.data,
      newsData: newsQuery.data?.events || [],
    }
  }).then(({ data, error }) => { if (error) throw error; return data; }),
  enabled: !!fecQuery.data && !!courtQuery.data && !!newsQuery.data,
  staleTime: 1000 * 60 * 30,
});
```

### UI Layout (top to bottom):

```
┌──────────────────────────────────────────────────────────┐
│ 🔍 Search: "John Smith"                    [Copy Name]   │
├──────────────────────────────────────────────────────────┤
│                                                          │
│ ┌──────────────────────────────────────────────────────┐ │
│ │ 📋 BACKGROUND BRIEF                                  │ │
│ │                                                      │ │
│ │ John Smith is a Hillsborough County resident who     │ │
│ │ has donated primarily to Republican candidates...    │ │
│ │                                                      │ │
│ │ ⚠️ AI-generated summary based on public records.     │ │
│ │ Verify all facts independently before publication.   │ │
│ └──────────────────────────────────────────────────────┘ │
│                                                          │
│ ┌──────────────────────────────────────────────────────┐ │
│ │ 📅 TIMELINE                                          │ │
│ │                                                      │ │
│ │ 2024 ──●── Donated $2,800 to DeSantis Victory       │ │
│ │        ──●── Mentioned in Tampa Bay Times            │ │
│ │ 2023 ──●── Smith v. ABC Corp filed (M.D. Fla.)      │ │
│ │        ──●── Donated $1,000 to Rick Scott            │ │
│ │ 2022 ──●── Donated $500 to FL GOP                   │ │
│ └──────────────────────────────────────────────────────┘ │
│                                                          │
│ ┌──────────────────────────────────────────────────────┐ │
│ │ 💰 CAMPAIGN FINANCE          3 results · $4,300 total│ │
│ │                                        [View on FEC] │ │
│ │ ┌──────────────────────────────────────────────────┐ │ │
│ │ │ $2,800 → DeSantis Victory · Mar 15, 2024        │ │ │
│ │ │ Tampa, FL · Self-employed / Real Estate          │ │ │
│ │ └──────────────────────────────────────────────────┘ │ │
│ │ ┌──────────────────────────────────────────────────┐ │ │
│ │ │ $1,000 → Rick Scott for Senate · Oct 2, 2023    │ │ │
│ │ │ Tampa, FL · Self-employed / Real Estate          │ │ │
│ │ └──────────────────────────────────────────────────┘ │ │
│ │ ┌──────────────────────────────────────────────────┐ │ │
│ │ │ $500 → Republican Party of FL · Jun 11, 2022     │ │ │
│ │ │ Tampa, FL · Self-employed / Real Estate          │ │ │
│ │ └──────────────────────────────────────────────────┘ │ │
│ └──────────────────────────────────────────────────────┘ │
│                                                          │
│ ┌──────────────────────────────────────────────────────┐ │
│ │ ⚖️ FEDERAL COURT RECORDS         2 dockets found     │ │
│ │                              [View on CourtListener] │ │
│ │ ┌──────────────────────────────────────────────────┐ │ │
│ │ │ Smith v. ABC Corporation                         │ │ │
│ │ │ M.D. Fla. · Case #8:23-cv-01234 · Filed 2023   │ │ │
│ │ │ Civil · Active                                   │ │ │
│ │ └──────────────────────────────────────────────────┘ │ │
│ │ ┌──────────────────────────────────────────────────┐ │ │
│ │ │ United States v. Smith                           │ │ │
│ │ │ S.D. Fla. · Case #1:21-cv-05678 · Filed 2021   │ │ │
│ │ │ Criminal · Terminated 2022                       │ │ │
│ │ └──────────────────────────────────────────────────┘ │ │
│ └──────────────────────────────────────────────────────┘ │
│                                                          │
│ ┌──────────────────────────────────────────────────────┐ │
│ │ 📰 NEWS MENTIONS                     7 articles      │ │
│ │                                                      │ │
│ │ (existing NewsMentions component from GDELT)         │ │
│ └──────────────────────────────────────────────────────┘ │
│                                                          │
│ ┌──────────────────────────────────────────────────────┐ │
│ │ 🔗 PUBLIC RECORDS LINKS                              │ │
│ │                                                      │ │
│ │ (existing PublicRecordsLinks component)              │ │
│ └──────────────────────────────────────────────────────┘ │
│                                                          │
└──────────────────────────────────────────────────────────┘
```

---

## TIMELINE COMPONENT

### File: `src/components/DossierTimeline.tsx`

Collects all dated events from FEC, CourtListener, and GDELT into a single chronological list.

### Data merging logic:
```typescript
interface TimelineEvent {
  date: string;       // ISO date string
  type: "donation" | "court" | "news";
  title: string;      // One-line summary
  detail: string;     // Secondary info
  url: string | null;
  amount?: number;    // For donations
}

function buildTimeline(fecData: any, courtData: any, newsData: any): TimelineEvent[] {
  const events: TimelineEvent[] = [];

  // FEC contributions
  if (fecData?.contributions) {
    fecData.contributions.forEach((c: any) => {
      if (c.date) {
        events.push({
          date: c.date,
          type: "donation",
          title: `$${c.amount.toLocaleString()} → ${c.committee_name}`,
          detail: c.contributor_employer
            ? `${c.contributor_city}, ${c.contributor_state} · ${c.contributor_employer}`
            : `${c.contributor_city}, ${c.contributor_state}`,
          url: c.fec_url,
          amount: c.amount,
        });
      }
    });
  }

  // CourtListener dockets
  if (courtData?.dockets?.results) {
    courtData.dockets.results.forEach((d: any) => {
      if (d.date_filed) {
        events.push({
          date: d.date_filed,
          type: "court",
          title: d.case_name,
          detail: `${d.court} · ${d.docket_number}${d.date_terminated ? " · Terminated " + d.date_terminated : " · Active"}`,
          url: d.url,
        });
      }
    });
  }

  // GDELT news events
  if (newsData) {
    const articles = newsData.events || newsData.knowledge_graph || newsData.mentions || [];
    articles.slice(0, 15).forEach((n: any) => {
      const rawDate = n.SQLDATE || n.DATE || n.MentionDateTime || "";
      // GDELT dates are YYYYMMDD format — convert to ISO
      const isoDate = rawDate.length === 8
        ? `${rawDate.slice(0,4)}-${rawDate.slice(4,6)}-${rawDate.slice(6,8)}`
        : rawDate;
      if (isoDate) {
        events.push({
          date: isoDate,
          type: "news",
          title: n.Actor1Name || n.MentionSourceName || "News mention",
          detail: n.SOURCEURL || n.url || "",
          url: n.SOURCEURL || n.url || null,
        });
      }
    });
  }

  // Sort descending (most recent first)
  events.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  return events;
}
```

### Visual rendering:
- Vertical line on the left
- Color-coded dots: green for donations, blue for court, orange for news
- Year headers when year changes between events
- Each event shows: date, colored icon, title, detail
- Clicking an event opens the external URL in new tab
- Show max 20 events with "Show all X events" toggle

---

## CAMPAIGN FINANCE SECTION COMPONENT

### File: `src/components/DossierCampaignFinance.tsx`

### Features:
- Header shows: count of contributions, total dollar amount
- "View all on FEC" link (deep-linked to FEC.gov with name pre-populated)
- Each contribution card shows: amount (large, bold), committee/candidate name, date, city/state, employer/occupation
- Color coding: amounts over $1,000 get a subtle highlight
- Collapsible: shows top 5 by default, "Show all X" to expand
- Empty state: "No federal political contributions over $200 found for this name."

---

## COURT RECORDS SECTION COMPONENT

### File: `src/components/DossierCourtRecords.tsx`

### Features:
- Split into two sub-sections: "Dockets" and "Opinions" (both collapsible)
- Header shows count for each
- "View on CourtListener" link (deep-linked with search name)
- Each docket card shows: case name (bold), court, docket number, filing date, terminated date or "Active", suit nature
- Each opinion card shows: case name, court, date, citation if available, snippet
- Clicking any card opens CourtListener URL in new tab
- Empty state: "No federal court records found for this name in the RECAP Archive."

---

## BACKGROUND BRIEF SECTION

### File: `src/components/DossierBrief.tsx`

### Features:
- Renders at the TOP of the dossier (first thing the reporter reads)
- Shows AI-generated 3-4 paragraph plain-English summary
- Loading state: "Generating background brief..." with skeleton
- Loads LAST (after all data sources return) since it depends on their data
- Small disclaimer at bottom: "AI-generated summary based on public records. Verify all facts independently before publication."
- Source indicators: small badges showing which data sources had results (FEC ✓, Courts ✓, News ✗)
- "Copy Brief" button to copy plain text to clipboard

---

## SEARCH TYPE DETECTION

Add to the search handler:

```typescript
type SearchType = "person" | "business" | "address";

function detectSearchType(query: string): SearchType {
  const q = query.trim().toLowerCase();

  // Business indicators
  if (/\b(llc|inc|corp|ltd|associates|group|partners|company|co\.|enterprises|holdings)\b/i.test(query)) {
    return "business";
  }

  // Address indicators (starts with number + contains road-like word)
  if (/^\d+\s/.test(q) && /\b(st|street|ave|avenue|rd|road|blvd|dr|drive|ln|lane|way|ct|court|pl|place|cir|circle)\b/.test(q)) {
    return "address";
  }

  return "person";
}
```

When `searchType === "business"`:
- Skip FEC individual contributions (search committee contributions instead)
- Emphasize Sunbiz link
- Show CourtListener with business name
- Show lobbyist registrations prominently

When `searchType === "address"`:
- Emphasize property appraiser link (auto-select county if possible)
- Skip FEC, skip CourtListener
- Show building permit links if available

When `searchType === "person"` (default):
- Full dossier: FEC + CourtListener + GDELT + Brief + all links

---

## INTEGRATION INTO SEARCH RESULTS PAGE

Replace the current search results layout with:

```tsx
// SearchResults.tsx (or wherever results are rendered)

{searchName && (
  <>
    {/* Existing Record Tracer results */}
    <ExistingSearchResults query={searchName} />

    {/* NEW: Dossier View */}
    <DossierView searchName={searchName} />

    {/* Existing: News Mentions (moved into DossierView, or kept separate) */}
    {/* Existing: Public Records Links (moved into DossierView, or kept separate) */}
  </>
)}
```

The DossierView component internally renders: Brief → Timeline → Campaign Finance → Court Records → News Mentions → Public Records Links (existing components).

---

## LOADING STATES

Each section loads independently and shows its own skeleton:

```
Brief:            [████████████████████░░░░░░░░] Generating...
Timeline:         Waiting for data sources...
Campaign Finance: [████░░░░░░] Searching FEC records...
Court Records:    [██████░░░░] Searching federal courts...
News Mentions:    [████████░░] Searching news sources...
Public Records:   (instant — these are just links, no API calls)
```

Sections that complete first render immediately. The reporter can start reading FEC results while CourtListener is still loading. The brief generates last since it needs all data.

---

## ERROR HANDLING

Each section handles errors independently — one API being down doesn't break the others:

```tsx
{fecQuery.isError && (
  <div className="text-sm text-muted-foreground bg-muted/50 rounded-lg p-4">
    Unable to fetch campaign finance data right now.
    <a href={`https://www.fec.gov/data/receipts/individual-contributions/?contributor_name=${encodeURIComponent(searchName)}&contributor_state=FL`}
       target="_blank" className="text-accent underline ml-1">
      Search directly on FEC.gov →
    </a>
  </div>
)}
```

If an API fails, fall back to the existing deep-link card. The reporter always has a path to the data.

---

## IMPLEMENTATION ORDER FOR LOVABLE

### Phase 1: Edge Functions (do first)
1. Create `dossier-fec` edge function
2. Create `dossier-courtlistener` edge function
3. Set environment secrets (FEC_API_KEY, COURTLISTENER_API_TOKEN)
4. Test both independently via Supabase dashboard

### Phase 2: Frontend Data Layer
5. Create `src/hooks/use-dossier.ts` with all 4 React Query hooks
6. Create `src/lib/dossier-types.ts` with TypeScript interfaces
7. Create `src/lib/timeline-builder.ts` with the timeline merge logic

### Phase 3: UI Components
8. Create `DossierCampaignFinance.tsx`
9. Create `DossierCourtRecords.tsx`
10. Create `DossierTimeline.tsx`
11. Create `DossierBrief.tsx`
12. Create `DossierView.tsx` (orchestrator that composes all above)

### Phase 4: Integration
13. Wire DossierView into the SearchResults page
14. Move News Mentions and Public Records Links under DossierView
15. Add search type detection
16. Create `dossier-brief` edge function (requires OPENAI_API_KEY)

### Phase 5: Polish
17. Error fallbacks with deep-link cards
18. Empty states for each section
19. Copy-to-clipboard on Brief
20. Loading skeletons
21. Mobile responsive layout

---

## API KEY REGISTRATION LINKS

Register these free API keys before implementation:

1. **FEC API Key:** https://api.data.gov/signup/
   - Instant approval, free, 1,000 requests/hour

2. **CourtListener Token:** https://www.courtlistener.com/sign-in/
   - Create free account, then go to Profile → API to get token
   - 5,000 requests/day

3. **OpenAI API Key:** https://platform.openai.com/api-keys
   - For the background brief generation
   - gpt-4o-mini is ~$0.15 per 1M input tokens (very cheap for short briefs)
   - Alternative: swap for Anthropic API if preferred
