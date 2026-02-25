import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "npm:@supabase/supabase-js@2.57.2";

const FOUNDING_MEMBER_PRICE_ID = "price_1T4YxtCbx7NULXBjgcqZNAAs";
const SOLO_PRICE_ID = "price_1T4XnBCbx7NULXBjQvvjF4R2";
const FOUNDING_MEMBER_LIMIT = 100;

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : "";
  console.log(`[CREATE-CHECKOUT] ${step}${detailsStr}`);
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const supabaseClient = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
    { auth: { persistSession: false } }
  );

  try {
    logStep("Function started");

    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    if (!stripeKey) throw new Error("STRIPE_SECRET_KEY is not set");

    const authHeader = req.headers.get("Authorization")!;
    const token = authHeader.replace("Bearer ", "");
    const { data } = await supabaseClient.auth.getUser(token);
    const user = data.user;
    if (!user?.email) throw new Error("User not authenticated or email not available");
    logStep("User authenticated", { email: user.email });

    const { priceId, foundingMember } = await req.json();
    if (!priceId) throw new Error("priceId is required");
    logStep("Price ID received", { priceId, foundingMember });

    let finalPriceId = priceId;

    // Server-side founding member enforcement
    if (foundingMember) {
      const { data: currentCount, error: rpcError } = await supabaseClient.rpc("get_founding_member_count");
      if (rpcError) {
        logStep("ERROR checking founding member count", { error: rpcError.message });
        throw new Error("Could not verify founding member availability");
      }
      const count = currentCount ?? 0;
      logStep("Founding member count check", { count, limit: FOUNDING_MEMBER_LIMIT });

      if (count >= FOUNDING_MEMBER_LIMIT) {
        logStep("Founding member spots full, returning sold_out");
        return new Response(JSON.stringify({ sold_out: true }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 200,
        });
      }

      // Force the founding member price regardless of what was sent
      finalPriceId = FOUNDING_MEMBER_PRICE_ID;
      logStep("Founding member spot available, using founding member price", { finalPriceId });
    }

    const stripe = new Stripe(stripeKey, { apiVersion: "2025-08-27.basil" });

    const customers = await stripe.customers.list({ email: user.email, limit: 1 });
    let customerId;
    if (customers.data.length > 0) {
      customerId = customers.data[0].id;
    }

    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      customer_email: customerId ? undefined : user.email,
      line_items: [{ price: finalPriceId, quantity: 1 }],
      mode: "subscription",
      success_url: `${req.headers.get("origin")}/dashboard?checkout=success`,
      cancel_url: `${req.headers.get("origin")}/pricing?checkout=cancelled`,
    });

    logStep("Checkout session created", { sessionId: session.id });

    return new Response(JSON.stringify({ url: session.url }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    logStep("ERROR", { message: msg });
    return new Response(JSON.stringify({ error: msg }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
