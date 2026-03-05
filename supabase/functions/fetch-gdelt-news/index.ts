import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "npm:@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

/** Parse the service-account JSON and mint a short-lived OAuth2 token. */
async function getAccessToken(sa: {
  client_email: string;
  private_key: string;
  token_uri: string;
}): Promise<string> {
  const now = Math.floor(Date.now() / 1000);
  const header = btoa(JSON.stringify({ alg: "RS256", typ: "JWT" }));
  const payload = btoa(
    JSON.stringify({
      iss: sa.client_email,
      scope: "https://www.googleapis.com/auth/bigquery.readonly",
      aud: sa.token_uri,
      iat: now,
      exp: now + 3600,
    })
  );

  const pemBody = sa.private_key
    .replace(/-----BEGIN PRIVATE KEY-----/, "")
    .replace(/-----END PRIVATE KEY-----/, "")
    .replace(/\n/g, "");
  const binaryKey = Uint8Array.from(atob(pemBody), (c) => c.charCodeAt(0));

  const cryptoKey = await crypto.subtle.importKey(
    "pkcs8",
    binaryKey,
    { name: "RSASSA-PKCS1-v1_5", hash: "SHA-256" },
    false,
    ["sign"]
  );

  const signatureInput = new TextEncoder().encode(`${header}.${payload}`);
  const sig = await crypto.subtle.sign("RSASSA-PKCS1-v1_5", cryptoKey, signatureInput);
  const signature = btoa(String.fromCharCode(...new Uint8Array(sig)))
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");

  const jwt = `${header}.${payload}.${signature}`;

  const tokenRes = await fetch(sa.token_uri, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: `grant_type=urn%3Aietf%3Aparams%3Aoauth%3Agrant-type%3Ajwt-bearer&assertion=${jwt}`,
  });

  if (!tokenRes.ok) {
    const text = await tokenRes.text();
    throw new Error(`Token exchange failed (${tokenRes.status}): ${text}`);
  }
  const { access_token } = await tokenRes.json();
  return access_token;
}

/** Run a BigQuery query and return rows. */
async function queryBigQuery(
  accessToken: string,
  projectId: string,
  sql: string
): Promise<any[]> {
  const url = `https://bigquery.googleapis.com/bigquery/v2/projects/${projectId}/queries`;
  const res = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      query: sql,
      useLegacySql: false,
      maxResults: 50,
    }),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`BigQuery error (${res.status}): ${text}`);
  }

  const data = await res.json();
  const fields = (data.schema?.fields ?? []).map((f: any) => f.name);
  return (data.rows ?? []).map((row: any) =>
    Object.fromEntries(row.f.map((cell: any, i: number) => [fields[i], cell.v]))
  );
}

/** Free GDELT Doc API fallback – no credentials needed. */
async function queryGdeltDocApi(query: string, days: number, mode: string, usOnly: boolean): Promise<{ rows: any[]; resultKey: string }> {
  const endDate = new Date();
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);
  const fmt = (d: Date) => d.toISOString().slice(0, 10).replace(/-/g, "");

  const queryStr = usOnly ? `${query} sourcelang:eng sourcecountry:US` : `${query} sourcelang:eng`;

  const params = new URLSearchParams({
    query: queryStr,
    mode: "ArtList",
    maxrecords: "50",
    format: "json",
    startdatetime: `${fmt(startDate)}000000`,
    enddatetime: `${fmt(endDate)}235959`,
  });

  const url = `https://api.gdeltproject.org/api/v2/doc/doc?${params}`;
  

  const res = await fetch(url);
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`GDELT Doc API error (${res.status}): ${text}`);
  }

  const data = await res.json();
  const articles = data.articles ?? [];

  const rows = articles.map((a: any) => {
    let tone = 0;
    if (a.tone != null) {
      const toneStr = String(a.tone);
      const firstVal = toneStr.split(";")[0];
      tone = parseFloat(firstVal) || 0;
    }
    return {
      SQLDATE: a.seendate?.replace(/[- :]/g, "").slice(0, 8) ?? "",
      Actor1Name: a.domain ?? a.sourcecountry ?? "Unknown",
      Actor2Name: a.title?.split(/[-–—:|]/)[0]?.trim().slice(0, 40) ?? "",
      EventCode: "01",
      GoldsteinScale: String(tone),
      NumMentions: String(a.socialimage ? 5 : 1),
      AvgTone: String(tone),
      SOURCEURL: a.url ?? "",
    };
  });

  return { rows, resultKey: "events" };
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Authenticate the request
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
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
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const body = await req.json();
    const query = typeof body.query === "string" ? body.query.replace(/<[^>]*>/g, "").trim().slice(0, 200) : "";
    const days = typeof body.days === "number" && body.days >= 1 && body.days <= 365 ? body.days : 7;
    const mode = typeof body.mode === "string" && ["events", "gkg", "mentions"].includes(body.mode) ? body.mode : "events";
    const usOnly = body.usOnly === true;

    if (!query) {
      return new Response(JSON.stringify({ error: "query is required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // ── Try BigQuery first ──
    let rows: any[] = [];
    let resultKey = "events";
    let usedFallback = false;

    const saJson = Deno.env.get("GOOGLE_SERVICE_ACCOUNT_JSON");

    if (saJson) {
      try {
        const sa = JSON.parse(saJson);
        const accessToken = await getAccessToken(sa);

        const dateLimit = new Date();
        dateLimit.setDate(dateLimit.getDate() - days);
        const dateStr = dateLimit.toISOString().slice(0, 10).replace(/-/g, "");

        // Strict sanitization: only allow alphanumeric, spaces, hyphens, periods, apostrophes
        const safeQuery = query.replace(/[^a-zA-Z0-9\s\-.']/g, "").trim().toLowerCase();
        if (!safeQuery) {
          throw new Error("Query contains no valid characters after sanitization");
        }
        // Escape BigQuery LIKE wildcards and backslashes
        const likeEscaped = safeQuery.replace(/\\/g, "\\\\").replace(/%/g, "\\%").replace(/_/g, "\\_");
        const dateParam = dateLimit.toISOString().slice(0, 10);

        let sql: string;

        if (mode === "gkg") {
          const gkgUsFilter = usOnly ? `AND V2Locations LIKE '%United States%'` : "";
          sql = `
            SELECT DATE, DocumentIdentifier AS url, V2Themes, V2Persons, V2Organizations, V2Tone
            FROM \`gdelt-bq.gdeltv2.gkg_partitioned\`
            WHERE _PARTITIONTIME >= TIMESTAMP("${dateParam}")
              AND LOWER(DocumentIdentifier) LIKE '%${likeEscaped}%'
              ${gkgUsFilter}
            ORDER BY DATE DESC
            LIMIT 50
          `;
          resultKey = "knowledge_graph";
        } else if (mode === "mentions") {
          const mentionsUsFilter = usOnly ? `AND ActionGeo_CountryCode = 'US'` : "";
          sql = `
            SELECT MentionDateTime, MentionSourceName, MentionIdentifier AS url, MentionDocTone, Confidence
            FROM \`gdelt-bq.gdeltv2.eventmentions_partitioned\`
            WHERE _PARTITIONTIME >= TIMESTAMP("${dateParam}")
              AND LOWER(MentionSourceName) LIKE '%${likeEscaped}%'
              ${mentionsUsFilter}
            ORDER BY MentionDateTime DESC
            LIMIT 50
          `;
          resultKey = "mentions";
        } else {
          const eventsUsFilter = usOnly ? `AND ActionGeo_CountryCode = 'US'` : "";
          sql = `
            SELECT SQLDATE, Actor1Name, Actor2Name, EventCode, GoldsteinScale, NumMentions, AvgTone, SOURCEURL
            FROM \`gdelt-bq.gdeltv2.events_partitioned\`
            WHERE _PARTITIONTIME >= TIMESTAMP("${dateParam}")
              AND (LOWER(Actor1Name) LIKE '%${likeEscaped}%'
                   OR LOWER(Actor2Name) LIKE '%${likeEscaped}%'
                   OR LOWER(SOURCEURL) LIKE '%${likeEscaped}%')
              ${eventsUsFilter}
            ORDER BY SQLDATE DESC, NumMentions DESC
            LIMIT 50
          `;
          resultKey = "events";
        }

        console.log("[GDELT-BQ] query executed for mode:", mode);
        rows = await queryBigQuery(accessToken, sa.project_id, sql);
        console.log("[GDELT-BQ] rows returned:", rows.length);
      } catch (bqErr) {
        console.warn("[GDELT-BQ] BigQuery failed, falling back to Doc API:", String(bqErr));
        rows = [];
      }
    }

    // ── Fallback to free GDELT Doc API ──
    if (rows.length === 0) {
      console.log("[GDELT] Using free Doc API fallback");
      usedFallback = true;
      const fallback = await queryGdeltDocApi(query, days, mode, usOnly);
      rows = fallback.rows;
      resultKey = fallback.resultKey;
    }

    return new Response(
      JSON.stringify({ [resultKey]: rows, mode, query, days, source: usedFallback ? "gdelt-doc-api" : "bigquery" }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    console.error("[GDELT] error", err);
    return new Response(JSON.stringify({ error: String(err) }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
