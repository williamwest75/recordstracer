import { useState, useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Shield, Star, MessageSquare } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import Header from "@/components/landing/Header";
import Footer from "@/components/landing/Footer";

const TOTAL_SPOTS = 100;

const FoundingMember = () => {
  const [spotsRemaining, setSpotsRemaining] = useState<number | null>(null);

  const fetchSpots = async () => {
    const { data, error } = await supabase.rpc("get_founding_member_count");
    if (!error && data !== null) {
      setSpotsRemaining(TOTAL_SPOTS - data);
    }
  };

  useEffect(() => {
    fetchSpots();

    // Real-time subscription — update count when founding_members changes
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

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      <main className="flex-1 flex items-center justify-center px-4 py-16">
        <div className="max-w-xl w-full space-y-8">
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

          {/* CTA to pricing */}
          <div className="text-center">
            <p className="text-sm text-muted-foreground">
              Subscribe to any plan to automatically become a founding member while spots last.
            </p>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default FoundingMember;
