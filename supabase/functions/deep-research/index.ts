import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "npm:@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    // Authenticate the request
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? "",
      { global: { headers: { Authorization: authHeader } } }
    );

    const token = authHeader.replace("Bearer ", "");
    const { data: userData, error: authError } = await supabase.auth.getUser(token);
    if (authError || !userData?.user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const body = await req.json();
    const name = typeof body.name === "string" ? body.name.replace(/<[^>]*>/g, "").trim().slice(0, 200) : "";
    const state = typeof body.state === "string" ? body.state.trim().slice(0, 50) : "";
    const results = Array.isArray(body.results) ? body.results.slice(0, 500) : [];

    if (!name) {
      return new Response(JSON.stringify({ error: "name is required" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

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

    const systemPrompt = `You are the Deep Research Analyst, a veteran investigative research tool built for journalists. You will receive a set of public records search results that may include SEC filings, FEC campaign finance records, federal contracts from USASpending.gov, federal court records, Florida corporate filings, lobbying disclosures, sanctions/watchlists, offshore leaks, nonprofit records, and FAA aircraft registry data. Your job is to analyze all results together and produce a structured investigative briefing in the following format:

**SUMMARY**
A two to three sentence plain language summary of who this person or entity is based on the records.

**KEY FINDINGS**
A bulleted list of the most significant findings across all record types. Flag any patterns such as contracts awarded to companies connected to political donors, overlapping corporate relationships, legal history, or unusual financial activity.

**RED FLAGS**
List any specific items that warrant deeper journalistic scrutiny. Be specific about what makes each item notable.

**SUGGESTED NEXT STEPS**
List three to five specific follow-up actions the journalist should take to verify and develop these findings. Include specific document requests, databases to check, or sources to contact.

IMPORTANT RULES:
- You are a research assistant, not a publisher. Every finding you surface must be framed as something to investigate further, not as established fact.
- Never make definitive accusations.
- Always use language such as "records suggest," "warrants further review," or "may indicate."
- Your role is to point the journalist in the right direction, not to reach conclusions for them.
- Use specific dollar amounts, dates, and names from the data provided.
- If very little data was found, say so honestly and focus your next steps on alternative search strategies.
- Do NOT fabricate or infer data that was not provided in the records.`;

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
