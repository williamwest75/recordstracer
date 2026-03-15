import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version, x-api-key",
};

/** Validate that the user has an active Newsroom subscription */
async function validateNewsroomAccess(
  supabaseAdmin: ReturnType<typeof createClient>,
  userId: string
): Promise<{ ok: boolean; error?: string }> {
  // Check admin role first
  const { data: isAdmin } = await supabaseAdmin.rpc("has_role", {
    _user_id: userId,
    _role: "admin",
  });
  if (isAdmin) return { ok: true };

  // Check subscription via the subscriptions table for an active newsroom sub
  const { data: sub } = await supabaseAdmin
    .from("subscriptions")
    .select("plan, status")
    .eq("user_id", userId)
    .eq("status", "active")
    .maybeSingle();

  if (!sub) return { ok: false, error: "No active subscription" };

  // The newsroom product_id
  const NEWSROOM_PRODUCT_ID = "prod_U2d3nRVKMjE8tx";
  // Check if they have a Stripe subscription with the newsroom product
  const { data: checkData, error: checkError } = await supabaseAdmin.functions.invoke(
    "check-subscription",
    { body: {} }
  ).catch(() => ({ data: null, error: "Failed to check subscription" })) as any;

  // Fallback: check plan field directly
  if (sub.plan === "newsroom" || sub.plan === NEWSROOM_PRODUCT_ID) {
    return { ok: true };
  }

  return { ok: false, error: "CMS API requires Newsroom plan" };
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
  const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY")!;

  try {
    // Authenticate via Bearer token (user JWT) or X-API-Key header
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(
        JSON.stringify({ error: "Unauthorized — provide Bearer token" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabaseUser = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } },
    });

    const token = authHeader.replace("Bearer ", "");
    const { data: claimsData, error: claimsError } = await supabaseUser.auth.getClaims(token);
    if (claimsError || !claimsData?.claims) {
      return new Response(
        JSON.stringify({ error: "Invalid token" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const userId = claimsData.claims.sub as string;

    // Admin client for data access
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

    // Validate Newsroom tier
    const access = await validateNewsroomAccess(supabaseAdmin, userId);
    if (!access.ok) {
      return new Response(
        JSON.stringify({ error: access.error }),
        { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Route handling
    const url = new URL(req.url);
    const path = url.pathname.replace(/^\/cms-api\/?/, "").replace(/\/$/, "");

    // GET /investigations — list all investigations
    if (req.method === "GET" && (path === "" || path === "investigations")) {
      const { data, error } = await supabaseAdmin
        .from("investigations")
        .select("id, title, description, created_at, updated_at")
        .eq("user_id", userId)
        .order("updated_at", { ascending: false });

      if (error) throw error;

      return new Response(JSON.stringify({ investigations: data }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // GET /investigations/:id — single investigation with saved results
    if (req.method === "GET" && path.startsWith("investigations/")) {
      const invId = path.replace("investigations/", "");
      if (!invId || invId.length < 10) {
        return new Response(
          JSON.stringify({ error: "Invalid investigation ID" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      const [invRes, resultsRes] = await Promise.all([
        supabaseAdmin
          .from("investigations")
          .select("id, title, description, created_at, updated_at")
          .eq("id", invId)
          .eq("user_id", userId)
          .maybeSingle(),
        supabaseAdmin
          .from("saved_results")
          .select("id, result_data, notes, created_at")
          .eq("investigation_id", invId)
          .eq("user_id", userId)
          .order("created_at", { ascending: false }),
      ]);

      if (invRes.error) throw invRes.error;
      if (!invRes.data) {
        return new Response(
          JSON.stringify({ error: "Investigation not found" }),
          { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      return new Response(
        JSON.stringify({
          investigation: invRes.data,
          saved_results: resultsRes.data || [],
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // GET /searches — recent searches
    if (req.method === "GET" && path === "searches") {
      const limit = Math.min(parseInt(url.searchParams.get("limit") || "50"), 200);
      const { data, error } = await supabaseAdmin
        .from("searches")
        .select("id, subject_name, state, city, result_count, database_count, risk_level, created_at")
        .eq("user_id", userId)
        .order("created_at", { ascending: false })
        .limit(limit);

      if (error) throw error;

      return new Response(JSON.stringify({ searches: data }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(
      JSON.stringify({
        error: "Not found",
        available_endpoints: [
          "GET /investigations",
          "GET /investigations/:id",
          "GET /searches",
        ],
      }),
      { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    console.error("CMS API error:", err);
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
