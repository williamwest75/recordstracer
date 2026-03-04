import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Auth check
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

    const { searchName, fecData, courtData, newsData } = await req.json();

    if (!searchName) {
      return new Response(
        JSON.stringify({ error: "searchName required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
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

    // Use Lovable AI (Gemini) — no external API key needed
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      return new Response(
        JSON.stringify({ error: "AI API key not configured" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const aiRes = await fetch("https://api.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${LOVABLE_API_KEY}`,
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: "You are a concise newsroom research assistant. Write factual background briefs for journalists." },
          { role: "user", content: prompt },
        ],
        temperature: 0.3,
        max_tokens: 500,
      }),
    });

    if (!aiRes.ok) {
      const errText = await aiRes.text();
      console.error("[dossier-brief] AI API error:", aiRes.status, errText.slice(0, 200));
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
    console.error("[dossier-brief] error:", err);
    return new Response(
      JSON.stringify({ error: "Internal error", message: String(err) }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
