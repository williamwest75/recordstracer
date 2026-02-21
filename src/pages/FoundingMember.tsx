import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, Shield, Star, MessageSquare } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import Header from "@/components/landing/Header";
import Footer from "@/components/landing/Footer";

const TOTAL_SPOTS = 100;

const FoundingMember = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("");
  const [spotsRemaining, setSpotsRemaining] = useState<number | null>(null);
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "duplicate" | "full">("idle");

  useEffect(() => {
    fetchSpots();
  }, []);

  const fetchSpots = async () => {
    const { count } = await supabase
      .from("founding_members")
      .select("*", { count: "exact", head: true });
    setSpotsRemaining(TOTAL_SPOTS - (count ?? 0));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !role) return;
    setStatus("loading");

    if (spotsRemaining !== null && spotsRemaining <= 0) {
      setStatus("full");
      return;
    }

    const { error } = await supabase
      .from("founding_members")
      .insert({ name: name.trim(), email: email.trim().toLowerCase(), role });

    if (error) {
      if (error.code === "23505") {
        setStatus("duplicate");
      } else {
        console.error(error);
        setStatus("idle");
      }
      return;
    }

    setStatus("success");
    fetchSpots();
  };

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

          {/* Spot Counter */}
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
                <p className="text-sm text-foreground">Full access to all Records Tracer databases at launch.</p>
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

          {/* Form or Confirmation */}
          {status === "success" ? (
            <Card className="border-accent/30 bg-accent/5">
              <CardContent className="pt-6 text-center space-y-3">
                <CheckCircle className="h-10 w-10 text-accent mx-auto" />
                <h2 className="text-xl font-semibold text-foreground">You're in.</h2>
                <p className="text-sm text-muted-foreground">
                  Watch your inbox — we'll email you the moment Records Tracer launches with your personal founding member access link.
                </p>
              </CardContent>
            </Card>
          ) : status === "duplicate" ? (
            <Card className="border-accent/30 bg-accent/5">
              <CardContent className="pt-6 text-center space-y-3">
                <CheckCircle className="h-10 w-10 text-accent mx-auto" />
                <h2 className="text-xl font-semibold text-foreground">You're already on the list.</h2>
                <p className="text-sm text-muted-foreground">We'll be in touch.</p>
              </CardContent>
            </Card>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <Input id="name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Jane Smith" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="jane@newsroom.com" required />
              </div>
              <div className="space-y-2">
                <Label>I am a...</Label>
                <Select value={role} onValueChange={setRole} required>
                  <SelectTrigger><SelectValue placeholder="Select your role" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Independent Journalist">Independent Journalist</SelectItem>
                    <SelectItem value="Newsroom Staff">Newsroom Staff</SelectItem>
                    <SelectItem value="Journalism Student">Journalism Student</SelectItem>
                    <SelectItem value="Researcher">Researcher</SelectItem>
                    <SelectItem value="Attorney">Attorney</SelectItem>
                    <SelectItem value="Other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button type="submit" variant="accent" className="w-full" size="lg" disabled={status === "loading" || !role}>
                {status === "loading" ? "Joining..." : "Claim My Founding Member Spot"}
              </Button>
            </form>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default FoundingMember;
