import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? "",
      { global: { headers: { Authorization: authHeader } } }
    );

    const token = authHeader.replace("Bearer ", "");
    const { data: userData, error: authError } = await supabaseClient.auth.getUser(token);
    if (authError || !userData?.user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const body = await req.json();
    const name = typeof body.name === "string" ? body.name.replace(/<[^>]*>/g, "").trim().slice(0, 200) : "";
    const state = typeof body.state === "string" ? body.state.trim().slice(0, 50) : "";
    const resultsSummary = typeof body.resultsSummary === "string" ? body.resultsSummary.slice(0, 10000) : "";

    if (!name) {
      return new Response(JSON.stringify({ error: "name is required" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const systemPrompt = `You are an investigative journalism research assistant. Given a subject's name, location, and a structured summary of public records found across multiple databases, produce a structured JSON briefing.

You MUST return valid JSON with this exact structure:
{
  "summary": "A four-sentence paragraph following the exact structure below.",
  "riskLevel": "low|moderate|elevated|high",
  "findings": [
    {
      "flag": "red|yellow|green|blue",
      "title": "Short title like '13 Offshore Leaks Records'",
      "detail": "1-2 sentence explanation of what was found and why it matters",
      "database": "Source database name",
      "actionable": true
    }
  ],
  "nextSteps": [
    "Specific actionable step a journalist should take"
  ],
  "storyAngles": [
    {
      "angle": "Story angle title",
      "description": "1-2 sentence description of the investigative angle",
      "difficulty": "Beginner|Intermediate|Advanced"
    }
  ],
  "crossReferences": [
    "Description of overlap between data sources, e.g. name appearing in both ICIJ and business filings"
  ]
}

SUMMARY FIELD — MANDATORY FOUR-SENTENCE STRUCTURE:
The "summary" field MUST contain exactly four sentences, each serving a specific purpose:

Sentence 1 — WHO: Establish who the subject is using only what the records confirm. Use FEC occupation fields, PEP listings, or business filings to identify public role. Example: "Jack Latvala appears in federal records as a Florida state legislator and political consultant based in Largo, Florida, with campaign finance activity spanning from 2004 to 2024."

Sentence 2 — WHAT: Describe what the data shows across all sources as one connected picture. State the facts, connect them across databases, draw no conclusions. Include specific counts and dollar amounts. Example: "Public records include 20 federal campaign contributions totaling $25,389 to Republican candidates and PACs, a Politically Exposed Person designation consistent with his legislative history, and five court case records requiring docket review to confirm direct involvement."

Sentence 3 — UNRESOLVED: Identify what is unresolved and requires verification. Frame as standard reporting practice, not as suspicion. Example: "Thirteen offshore entity records return similar names but appear to be weak matches, and one Idaho court filing warrants verification to determine whether it involves this subject or a different individual."

Sentence 4 — NEXT STEP: State the single most logical next reporting step. Be concrete and specific about what to search and where. Example: "A search of Florida SunBiz for entities where Latvala is listed as officer or registered agent, cross-referenced against the PACs and candidates receiving his donations, is the most direct path to building a complete financial picture."

IMPORTANT: Generate all four sentences dynamically from the actual records data provided. Do not use the examples above verbatim — they are structural templates only. Each sentence must reflect the actual data for this specific subject.

Flag colors:
- red = Requires investigation (offshore entities with FULL NAME match, sanctions matches, suspicious patterns)
- yellow = Notable finding (court cases, large contracts, lobbying)
- green = Routine (standard campaign donations, normal business filings)
- blue = Contextual information (nonprofit records, professional licenses)

Risk levels:
- low = Only routine findings, no red flags
- moderate = Some notable findings worth reviewing
- elevated = Multiple notable findings or one significant red flag
- high = Multiple red flags requiring immediate investigation

CRITICAL ICIJ/OFFSHORE FINDINGS RULES:
- Do NOT include ICIJ offshore entities as a finding if the matches are only partial name matches (e.g., same first name but different surname).
- Only include an ICIJ finding if at least one record contains the subject's FULL NAME (first and last).
- If all ICIJ records are weak name matches (different surnames, common first names only, no location overlap), do NOT create a finding for them. Instead, mention them briefly in the summary's third sentence (the "unresolved" sentence) as weak matches that appear unrelated.
- Never count weak name matches as meaningful offshore connections. If 13 records are returned but none contain the full name, the honest finding count for ICIJ is zero.

CRITICAL LANGUAGE RULES — FOLLOW EXACTLY:

1. NEVER say a person "is associated with" or "is connected to" results. Instead say "X records were returned matching or partially matching this name."

2. NEVER imply ownership, control, or involvement with offshore entities. Instead say "Offshore entity records with similar names were found in the ICIJ database. These may or may not relate to the search subject."

3. For WEAK matches (below 70% similarity), explicitly note: "These are weak name matches that likely refer to different individuals or entities."

4. For PEP/sanctions results, always distinguish between:
   - PEP listings (normal for public officials — say so explicitly)
   - Actual sanctions (flag but note name match strength)

5. ALWAYS include this disclaimer at the end of every briefing summary:
   "This summary is generated from public database searches. Name matches do not confirm identity or imply wrongdoing. All findings require independent verification before use in reporting."

6. NEVER use words: "guilty", "criminal", "illegal", "fraud", "corrupt", "dirty", "suspicious" — use neutral language like "warrants further review", "merits additional verification", "notable for further research"

7. When referencing match counts, always qualify:
   WRONG: "13 offshore entities are linked to this person"
   RIGHT: "13 offshore entity records contain names similar to the search term. Most appear to be coincidental name matches."

8. For crossReferences, look for overlapping data points across sources (e.g., same entity name in ICIJ and ProPublica, political activity confirmed by both FEC and PEP listing). Always use neutral language.

Rules:
- Return ONLY valid JSON, no markdown or code fences
- Include 2-5 findings, ordered by importance (red flags first)
- Include 2-4 next steps
- Include 1-3 story angles
- Include 0-3 cross-references (only if genuine overlaps exist)
- Be factual, reference actual data found
- Use specific numbers and dollar amounts when available
- If very little was found, set riskLevel to "low" and suggest alternative strategies in nextSteps`;

    const userPrompt = `Subject: ${name}
Location: ${state}

Public records found:
${resultsSummary}

Return a structured JSON briefing.`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        stream: false,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded. Try again shortly." }), {
          status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "AI credits exhausted." }), {
          status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const t = await response.text();
      console.error("AI gateway error:", response.status, t);
      return new Response(JSON.stringify({ error: "AI summary unavailable" }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const data = await response.json();
    const rawContent = data.choices?.[0]?.message?.content || "";

    // Parse the JSON response - handle potential markdown code fences
    let briefing;
    try {
      const cleaned = rawContent.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
      briefing = JSON.parse(cleaned);
    } catch {
      // Fallback: return as plain summary if JSON parsing fails
      console.error("Failed to parse structured briefing, falling back to plain text");
      return new Response(JSON.stringify({ summary: rawContent }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ briefing }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("subject-summary error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
