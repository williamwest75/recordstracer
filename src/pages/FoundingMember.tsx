import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Shield, Star, MessageSquare } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import Header from "@/components/landing/Header";
import Footer from "@/components/landing/Footer";

const TOTAL_SPOTS = 100;
const FOUNDING_MEMBER_PRICE_ID = "price_1T4YxtCbx7NULXBjgcqZNAAs";

const FoundingMember = () => {
  const [spotsRemaining, setSpotsRemaining] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const fetchSpots = async () => {
    const { data, error } = await supabase.rpc("get_founding_member_count");
    if (!error && data !== null) {
      setSpotsRemaining(TOTAL_SPOTS - data);
    }
  };

  useEffect(() => {
    fetchSpots();

    const channel = supabase
      .channel("founding-members-count")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "founding_members" },
        () => {
          fetchSpots();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const isSoldOut = spotsRemaining !== null && spotsRemaining <= 0;

  const handleFoundingCheckout = async () => {
    if (!user) {
      navigate("/auth");
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("create-checkout", {
        body: { priceId: FOUNDING_MEMBER_PRICE_ID, foundingMember: true },
      });

      if (error) throw error;

      if (data?.sold_out) {
        toast({
          title: "Founding Member Spots Full",
          description: "All 100 spots have been claimed. Redirecting to regular pricing.",
          variant: "destructive",
        });
        fetchSpots(); // refresh count
        navigate("/pricing");
        return;
      }

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
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      <main className="flex-1 flex items-center justify-center px-4 py-16">
        <div className="max-w-xl w-full space-y-8">
          {isSoldOut ? (
            /* ---- SOLD OUT STATE ---- */
            <div className="text-center space-y-6">
              <Badge variant="secondary" className="text-sm px-3 py-1">Closed</Badge>
              <h1 className="text-4xl md:text-5xl font-heading font-bold tracking-tight text-foreground">
                Founding Member Spots Are Now Closed
              </h1>
              <p className="text-lg text-muted-foreground max-w-md mx-auto">
                All 100 founding member spots have been claimed. Thank you to our earliest supporters!
              </p>
              <p className="text-muted-foreground">
                You can still subscribe to Record Tracer at our standard pricing.
              </p>
              <Button size="lg" onClick={() => navigate("/pricing")}>
                View Pricing Plans
              </Button>
            </div>
          ) : (
            /* ---- AVAILABLE STATE ---- */
            <>
              {/* Headline */}
              <div className="text-center space-y-3">
                <Badge variant="destructive" className="text-sm px-3 py-1">Limited — 100 Spots</Badge>
                <h1 className="text-4xl md:text-5xl font-heading font-bold tracking-tight text-foreground">
                  Be First. Pay Less. Forever.
                </h1>
                <p className="text-lg text-muted-foreground max-w-md mx-auto">
                  Lock in <span className="font-semibold text-foreground">$49/month for life</span> — before public launch at $99/month. Only 100 spots available.
                </p>
              </div>

              {/* Spot Counter — live */}
              {spotsRemaining !== null && (
                <div className="text-center">
                  <div className="inline-flex items-center gap-2 bg-accent/10 border border-accent/20 rounded-full px-5 py-2">
                    <span className="text-2xl font-bold text-accent">{spotsRemaining}</span>
                    <span className="text-sm text-muted-foreground">of {TOTAL_SPOTS} founding member spots remaining</span>
                  </div>
                </div>
              )}

              {/* Benefits */}
              <Card className="border-accent/20 bg-card">
                <CardContent className="pt-6 space-y-4">
                  <div className="flex items-start gap-3">
                    <Shield className="h-5 w-5 text-accent mt-0.5 shrink-0" />
                    <p className="text-sm text-foreground">Full access to all Record Tracer databases at launch.</p>
                  </div>
                  <div className="flex items-start gap-3">
                    <Star className="h-5 w-5 text-accent mt-0.5 shrink-0" />
                    <p className="text-sm text-foreground">Founding member rate of <span className="font-semibold">$49/month locked permanently</span> — never increases.</p>
                  </div>
                  <div className="flex items-start gap-3">
                    <MessageSquare className="h-5 w-5 text-accent mt-0.5 shrink-0" />
                    <p className="text-sm text-foreground">Direct input into what features we build next.</p>
                  </div>
                </CardContent>
              </Card>

              {/* CTA */}
              <div className="text-center space-y-3">
                <Button size="lg" onClick={handleFoundingCheckout} disabled={loading}>
                  {loading ? "Loading…" : "Claim Your Founding Member Spot — $49/mo"}
                </Button>
                <p className="text-xs text-muted-foreground">
                  Cancel anytime. Your $49/mo rate stays locked as long as you're subscribed.
                </p>
              </div>
            </>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default FoundingMember;
