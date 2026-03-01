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
  "summary": "2-3 sentence executive overview of what was found",
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
  ]
}

Flag colors:
- red = Requires investigation (offshore entities, sanctions matches, suspicious patterns)
- yellow = Notable finding (court cases, large contracts, lobbying)
- green = Routine (standard campaign donations, normal business filings)
- blue = Contextual information (nonprofit records, professional licenses)

Risk levels:
- low = Only routine findings, no red flags
- moderate = Some notable findings worth reviewing
- elevated = Multiple notable findings or one significant red flag
- high = Multiple red flags requiring immediate investigation

Rules:
- Return ONLY valid JSON, no markdown or code fences
- Include 2-5 findings, ordered by importance (red flags first)
- Include 2-4 next steps
- Include 1-3 story angles
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
