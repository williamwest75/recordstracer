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
    const categorySummary = typeof body.categorySummary === "string" ? body.categorySummary.slice(0, 2000) : "";
    const resultCount = typeof body.resultCount === "number" ? body.resultCount : 0;

    if (!name) {
      return new Response(JSON.stringify({ error: "name is required" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const systemPrompt = `You are an expert public records request drafter for investigative journalists. Given a subject's name, state, and a summary of public records already found, generate a professional FOIA (Freedom of Information Act) or state Sunshine Law request letter.

RULES:
1. Determine the correct law based on the state:
   - Federal: Freedom of Information Act (5 U.S.C. § 552)
   - Florida: Florida Sunshine Law / Ch. 119
   - New York: FOIL (Freedom of Information Law)
   - California: California Public Records Act (CPRA)
   - Texas: Texas Public Information Act (TPIA)
   - Other states: Use the appropriate state public records law name

2. The letter should be addressed to the most relevant agency based on the records found:
   - If court records found → Clerk of Court
   - If business records found → Secretary of State / Division of Corporations
   - If campaign finance found → State Elections Commission / FEC
   - If contracts found → relevant federal agency procurement office
   - If property records found → County Property Appraiser / Assessor
   - If multiple categories → address to the single most relevant agency

3. Structure the letter with:
   - Date
   - "To: [Agency Name]" with generic placeholder for address
   - "Re: Public Records Request — [Subject Name]"
   - Opening paragraph citing the specific law
   - Itemized list of records requested, based on what categories were found
   - Request for fee waiver citing journalistic/public interest purpose
   - Response deadline per the applicable law
   - Closing with signature block placeholder

4. Keep the tone professional, formal, and legally precise
5. Request SPECIFIC record types based on the search results found (don't request everything generically)
6. Include a fee waiver request citing journalistic purpose
7. Do NOT include any fictional details — use placeholders like [Your Name], [Your Organization], [Agency Address]
8. Output plain text only, no markdown formatting`;

    const userPrompt = `Subject: ${name}
State: ${state || "Federal / National"}
Records already found (${resultCount} total): ${categorySummary}

Generate a targeted FOIA/public records request letter for the most relevant agency based on these findings.`;

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
      return new Response(JSON.stringify({ error: "AI service unavailable" }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const data = await response.json();
    const letter = data.choices?.[0]?.message?.content || "";

    return new Response(JSON.stringify({ letter }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("generate-foia-letter error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
