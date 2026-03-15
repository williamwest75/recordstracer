import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Check } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth, TIERS, TierKey } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import Header from "@/components/landing/Header";
import Footer from "@/components/landing/Footer";

const tierFeatures: Record<TierKey, string[]> = {
  solo: [
    "30 searches per month",
    "20+ public records databases in one search",
    "AI subject summaries & briefings",
    "Record profile & cross-reference alerts",
    "Entity resolution & relationship map",
    "News coverage monitoring (GDELT)",
    "FOIA letter generator",
    "Reporter's checklist",
    "3 saved investigations",
    "Email support",
  ],
  investigator: [
    "200 searches per month",
    "Everything in Solo, plus:",
    "Deep Research Analyst (AI-powered)",
    "Contact Intelligence",
    "Investigative Dossier with Timeline",
    "Campaign finance deep-dive (FEC)",
    "Court records analysis (CourtListener)",
    "PDF & Word report exports",
    "Unlimited saved investigations",
    "Search alerts & email monitoring",
    "Batch / bulk search (up to 50 names)",
    "Priority support",
  ],
  newsroom: [
    "Unlimited searches",
    "Everything in Investigator, plus:",
    "Team investigation sharing & collaboration",
    "CMS / webhook API integration",
    "Multi-user newsroom dashboard",
    "Dedicated account manager",
  ],
};

const Pricing = () => {
  const { user, subscribed, subscriptionTier, subscriptionEnd } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loadingTier, setLoadingTier] = useState<TierKey | null>(null);

  const handleCheckout = async (tierKey: TierKey) => {
    if (!user) {
      navigate("/auth");
      return;
    }

    setLoadingTier(tierKey);
    try {
      const { data, error } = await supabase.functions.invoke("create-checkout", {
        body: { priceId: TIERS[tierKey].price_id },
      });

      if (error) throw error;
      if (data?.url) {
        window.open(data.url, "_blank");
      }
    } catch (err: any) {
      toast({
        title: "Checkout Error",
        description: err.message || "Something went wrong",
        variant: "destructive",
      });
    } finally {
      setLoadingTier(null);
    }
  };

  const handleManageSubscription = async () => {
    try {
      const { data, error } = await supabase.functions.invoke("customer-portal");
      if (error) throw error;
      if (data?.url) {
        window.open(data.url, "_blank");
      }
    } catch (err: any) {
      toast({
        title: "Error",
        description: err.message || "Could not open subscription management",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      <main className="flex-1">
      <div className="max-w-6xl mx-auto px-4 py-16 sm:py-24">
        <div className="text-center mb-16">
          {subscribed && subscriptionTier ? (
            <>
              <div className="inline-flex items-center gap-2 bg-accent/10 text-accent px-4 py-2 rounded-full text-sm font-semibold mb-6">
                <Check className="h-4 w-4" />
                You're on the {TIERS[subscriptionTier].name} plan
                {subscriptionEnd && (
                  <span className="text-muted-foreground font-normal ml-1">
                    · Renews {new Date(subscriptionEnd).toLocaleDateString()}
                  </span>
                )}
              </div>
              <h1
                className="text-4xl sm:text-5xl font-bold text-foreground mb-4"
                style={{ fontFamily: "var(--font-heading)" }}
              >
                Upgrade Your Plan
              </h1>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Need more power? Upgrade to unlock additional searches, features, and support.
              </p>
            </>
          ) : (
            <>
              <h1
                className="text-4xl sm:text-5xl font-bold text-foreground mb-4"
                style={{ fontFamily: "var(--font-heading)" }}
              >
                Choose Your Plan
              </h1>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Unlock the full power of public records intelligence. All plans include a 7-day free trial.
              </p>
            </>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {(Object.entries(TIERS) as [TierKey, typeof TIERS[TierKey]][]).map(
            ([key, tier]) => {
              const isCurrentPlan = subscribed && subscriptionTier === key;
              const isPopular = key === "investigator";

              return (
                <div
                  key={key}
                  className={`relative rounded-lg border p-8 flex flex-col ${
                    isCurrentPlan
                      ? "border-accent ring-2 ring-accent bg-accent/5 shadow-lg shadow-accent/10"
                      : isPopular
                      ? "border-primary ring-2 ring-primary bg-card"
                      : "border-border bg-card"
                  }`}
                >
                  {isCurrentPlan && (
                    <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-accent text-accent-foreground text-xs font-semibold px-3 py-1 rounded-full">
                      Your Plan
                    </span>
                  )}
                  {isPopular && !isCurrentPlan && (
                    <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground text-xs font-semibold px-3 py-1 rounded-full">
                      Most Popular
                    </span>
                  )}

                  <h2
                    className="text-2xl font-bold text-foreground mb-2"
                    style={{ fontFamily: "var(--font-heading)" }}
                  >
                    {tier.name}
                  </h2>
                  <div className="mb-6">
                    <span className="text-4xl font-bold text-foreground">${tier.price}</span>
                    <span className="text-muted-foreground">/month</span>
                  </div>

                  <ul className="space-y-3 mb-8 flex-1">
                    {tierFeatures[key].map((feature) => (
                      <li key={feature} className="flex items-start gap-2">
                        <Check className="h-5 w-5 text-accent mt-0.5 shrink-0" />
                        <span className="text-foreground text-sm">{feature}</span>
                      </li>
                    ))}
                  </ul>

                  {isCurrentPlan ? (
                    <Button variant="outline" onClick={handleManageSubscription}>
                      Manage Subscription
                    </Button>
                  ) : (
                    <Button
                      variant={isPopular ? "default" : "outline"}
                      onClick={() => handleCheckout(key)}
                      disabled={loadingTier === key}
                    >
                      {loadingTier === key ? "Loading…" : "Get Started"}
                    </Button>
                  )}
                </div>
              );
            }
          )}
        </div>
      </div>
      </main>
      <Footer />
    </div>
  );
};

export default Pricing;
