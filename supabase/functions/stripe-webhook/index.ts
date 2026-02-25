import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "npm:@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : "";
  console.log(`[STRIPE-WEBHOOK] ${step}${detailsStr}`);
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
  if (!stripeKey) {
    logStep("ERROR", { message: "STRIPE_SECRET_KEY not set" });
    return new Response(JSON.stringify({ error: "Server misconfigured" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const webhookSecret = Deno.env.get("STRIPE_WEBHOOK_SECRET");
  const stripe = new Stripe(stripeKey, { apiVersion: "2025-08-27.basil" });

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
    { auth: { persistSession: false } }
  );

  try {
    const body = await req.text();
    let event: Stripe.Event;

    if (webhookSecret) {
      const signature = req.headers.get("stripe-signature");
      if (!signature) throw new Error("Missing stripe-signature header");
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
      logStep("Webhook signature verified", { type: event.type });
    } else {
      event = JSON.parse(body) as Stripe.Event;
      logStep("WARNING: No webhook secret, skipping signature verification", { type: event.type });
    }

    const relevantEvents = [
      "customer.subscription.created",
      "customer.subscription.updated",
      "customer.subscription.deleted",
      "checkout.session.completed",
    ];

    if (!relevantEvents.includes(event.type)) {
      logStep("Ignoring irrelevant event", { type: event.type });
      return new Response(JSON.stringify({ received: true }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (event.type === "checkout.session.completed") {
      const session = event.data.object as Stripe.Checkout.Session;
      if (session.mode !== "subscription" || !session.subscription) {
        logStep("Checkout not subscription mode, skipping");
        return new Response(JSON.stringify({ received: true }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      // Determine product from the subscription line items
      const subscriptionId = typeof session.subscription === "string"
        ? session.subscription
        : session.subscription.id;
      const sub = await stripe.subscriptions.retrieve(subscriptionId, { expand: ["items.data.price.product"] });
      const productObj = sub.items?.data?.[0]?.price?.product;
      const productName = typeof productObj === "object" && productObj !== null
        ? (productObj as Stripe.Product).name?.toLowerCase() ?? ""
        : "";

      // Determine which product this is for
      let product: string | null = null;
      if (productName.includes("agendatrace") || productName.includes("agenda")) {
        product = "agendatrace";
      } else {
        product = "recordtracer";
      }

      // Look up user by email
      const customerEmail = session.customer_email ?? session.customer_details?.email ?? null;
      let userId: string | null = null;
      if (customerEmail) {
        const { data: users } = await supabase.auth.admin.listUsers();
        const matched = users?.users?.find((u) => u.email === customerEmail);
        if (matched) userId = matched.id;
      }

      if (userId && product) {
        // Check founding member count
        const { data: currentCount } = await supabase.rpc("get_founding_member_count");
        const count = currentCount ?? 0;

        if (count < 100) {
          const nextNumber = count + 1;
          const { error: fmError } = await supabase
            .from("founding_members")
            .insert({
              user_id: userId,
              email: customerEmail!.toLowerCase(),
              product,
              founding_member_number: nextNumber,
            });

          if (fmError) {
            // Duplicate is okay — user already a founding member for this product
            if (fmError.code !== "23505") {
              logStep("ERROR inserting founding member", { error: fmError.message });
            } else {
              logStep("User already a founding member for this product");
            }
          } else {
            logStep("Founding member created", { number: nextNumber, product, userId });
          }
        } else {
          logStep("Founding member spots full", { count });
        }
      }

      logStep("Checkout completed, subscription events will follow", { subscriptionId });
      return new Response(JSON.stringify({ received: true }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Handle subscription events
    const subscription = event.data.object as Stripe.Subscription;
    const customerId =
      typeof subscription.customer === "string"
        ? subscription.customer
        : subscription.customer.id;

    // Look up customer email
    const customer = await stripe.customers.retrieve(customerId);
    const email = (customer as Stripe.Customer).email ?? null;

    // Try to find the Supabase user by email
    let userId: string | null = null;
    if (email) {
      const { data: users } = await supabase.auth.admin.listUsers();
      const matchedUser = users?.users?.find((u) => u.email === email);
      if (matchedUser) userId = matchedUser.id;
    }

    const plan =
      subscription.items?.data?.[0]?.price?.lookup_key ??
      subscription.items?.data?.[0]?.price?.id ??
      null;

    const subscriptionData = {
      stripe_customer_id: customerId,
      stripe_subscription_id: subscription.id,
      email,
      user_id: userId,
      plan,
      status: subscription.status,
    };

    logStep("Upserting subscription", subscriptionData);

    const { error: upsertError } = await supabase
      .from("subscriptions")
      .upsert(subscriptionData, { onConflict: "stripe_subscription_id" });

    if (upsertError) {
      logStep("ERROR upserting subscription", { error: upsertError.message });
      throw new Error(`Database error: ${upsertError.message}`);
    }

    logStep("Subscription upserted successfully");

    return new Response(JSON.stringify({ received: true }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    logStep("ERROR", { message: msg });
    return new Response(JSON.stringify({ error: msg }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
