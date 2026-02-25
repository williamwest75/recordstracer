import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Check } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth, TIERS, TierKey } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

const tierFeatures: Record<TierKey, string[]> = {
  solo: [
    "50 searches per month",
    "Basic public records",
    "AI subject summaries",
    "Email support",
  ],
  investigator: [
    "200 searches per month",
    "Full public records suite",
    "Deep research analyst",
    "Contact intelligence",
    "Priority support",
  ],
  newsroom: [
    "Unlimited searches",
    "Everything in Investigator",
    "Team collaboration tools",
    "API access",
    "Dedicated account manager",
  ],
};

const Pricing = () => {
  const { user, subscribed, subscriptionTier } = useAuth();
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
    <div className="min-h-screen bg-background">
      <div className="max-w-6xl mx-auto px-4 py-16 sm:py-24">
        <div className="text-center mb-16">
          <h1
            className="text-4xl sm:text-5xl font-bold text-foreground mb-4"
            style={{ fontFamily: "var(--font-heading)" }}
          >
            Choose Your Plan
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Unlock the full power of public records intelligence. All plans include a 7-day free trial.
          </p>
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
                      ? "border-accent ring-2 ring-accent"
                      : isPopular
                      ? "border-primary ring-2 ring-primary"
                      : "border-border"
                  } bg-card`}
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
                      className={isPopular ? "" : ""}
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
    </div>
  );
};

export default Pricing;
