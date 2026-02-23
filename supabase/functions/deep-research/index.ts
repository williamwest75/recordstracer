import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { name, state, results } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    // Build structured data from results
    const categoryCounts: Record<string, { count: number; items: string[] }> = {};
    for (const r of (results || [])) {
      if (!categoryCounts[r.category]) categoryCounts[r.category] = { count: 0, items: [] };
      categoryCounts[r.category].count++;
      if (categoryCounts[r.category].items.length < 5) {
        categoryCounts[r.category].items.push(
          `${r.source}: ${r.description}` + (r.details ? ` | Details: ${Object.entries(r.details).slice(0, 4).map(([k, v]) => `${k}=${v}`).join(", ")}` : "")
        );
      }
    }

    const dataBlock = Object.entries(categoryCounts)
      .map(([cat, { count, items }]) => `## ${cat.toUpperCase()} (${count} records)\n${items.map(i => `- ${i}`).join("\n")}`)
      .join("\n\n");

    const systemPrompt = `You are an elite investigative research analyst producing a comprehensive narrative briefing for journalists and researchers.

Given a subject's name, location, and detailed public records data from multiple databases, produce a thorough investigative analysis.

FORMAT YOUR OUTPUT EXACTLY AS FOLLOWS:

**EXECUTIVE SUMMARY**
A 2-3 sentence overview of the subject's public footprint and most notable findings.

**FINANCIAL PROFILE**
Analyze all financial data: campaign contributions, federal contracts, grants, nonprofit revenue. Note patterns, amounts, timelines, and connections between donors/recipients.

**CORPORATE & BUSINESS CONNECTIONS**
Detail all business registrations, SEC filings, nonprofit affiliations. Map corporate structures and relationships.

**GOVERNMENT & POLITICAL TIES**
Analyze lobbying disclosures, political donations, government contracts. Identify patterns of influence or access.

**LEGAL & REGULATORY FLAGS**
Note any court records, sanctions, watchlist appearances, or regulatory actions.

**CROSS-DATABASE CONNECTIONS**
Identify notable connections BETWEEN different databases — e.g., a person who donates to a politician whose agency awarded them a contract.

**RECOMMENDED FOLLOW-UP LINES OF INQUIRY**
Provide 3-5 specific, actionable investigative leads based on gaps or patterns in the data.

RULES:
- Write in flowing prose, not bullet points (except follow-up leads)
- Use specific dollar amounts, dates, and names from the data
- Be factual — only reference data that was actually found
- If a category has no records, note the absence as potentially significant
- Flag any data points that seem unusual or warrant deeper investigation
- Do NOT speculate beyond what the data shows`;

    const userPrompt = `Subject: ${name}
Location: ${state}

PUBLIC RECORDS DATA:
${dataBlock}

Total records found: ${(results || []).length}

Produce a comprehensive investigative analysis.`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        stream: false,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded. Please try again shortly." }), {
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
      return new Response(JSON.stringify({ error: "Analysis unavailable" }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const data = await response.json();
    const analysis = data.choices?.[0]?.message?.content || "";

    return new Response(JSON.stringify({ analysis }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("deep-research error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
