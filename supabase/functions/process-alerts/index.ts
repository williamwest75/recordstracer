import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, serviceRoleKey);

    // Get all active alerts
    const { data: alerts, error: alertsErr } = await supabase
      .from("search_alerts")
      .select("*")
      .eq("is_active", true);

    if (alertsErr) throw alertsErr;
    if (!alerts || alerts.length === 0) {
      return new Response(JSON.stringify({ processed: 0 }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    let processed = 0;
    let notified = 0;

    for (const alert of alerts) {
      try {
        // Call records-proxy for a quick check (FEC only for speed)
        const { data: fecData } = await supabase.functions.invoke("records-proxy", {
          body: { source: "fec", searchName: alert.subject_name, state: alert.state },
        });

        const currentIds: string[] = [];
        if (fecData?.success && fecData?.results) {
          for (const r of fecData.results) {
            currentIds.push(r.sub_id || r.transaction_id || String(r.contribution_receipt_amount));
          }
        }

        const previousIds: string[] = (alert.last_result_ids as string[]) || [];
        const newIds = currentIds.filter((id: string) => !previousIds.includes(id));

        // Update last checked
        await supabase
          .from("search_alerts")
          .update({
            last_checked_at: new Date().toISOString(),
            last_result_ids: currentIds,
          })
          .eq("id", alert.id);

        if (newIds.length > 0 && previousIds.length > 0) {
          // Log the notification (actual email sending would use the email infrastructure)
          console.log(`[Alert] ${newIds.length} new records for "${alert.subject_name}" → ${alert.email}`);
          notified++;
        }

        processed++;
      } catch (err) {
        console.error(`[Alert] Error processing alert ${alert.id}:`, err);
      }
    }

    return new Response(
      JSON.stringify({ processed, notified }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    console.error("[process-alerts] Error:", err);
    return new Response(
      JSON.stringify({ error: String(err) }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
