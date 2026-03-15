import { useState, useCallback } from "react";
import { Bell, BellOff, BellRing, Loader2, Lock } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { useTierGating } from "@/hooks/use-tier-gating";

interface SearchAlertButtonProps {
  subjectName: string;
  state: string;
}

export default function SearchAlertButton({ subjectName, state }: SearchAlertButtonProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const gating = useTierGating();
  const hasAlertAccess = gating.hasAccess("investigator");
  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [hasAlert, setHasAlert] = useState(false);
  const [alertId, setAlertId] = useState<string | null>(null);

  const checkExisting = useCallback(async () => {
    if (!user) return;
    const { data } = await supabase
      .from("search_alerts")
      .select("id, email, is_active")
      .eq("user_id", user.id)
      .eq("subject_name", subjectName)
      .eq("state", state)
      .eq("is_active", true)
      .limit(1)
      .maybeSingle();
    if (data) {
      setHasAlert(true);
      setAlertId(data.id);
      setEmail((data as any).email || "");
    } else {
      setHasAlert(false);
      setAlertId(null);
      setEmail(user.email || "");
    }
  }, [user, subjectName, state]);

  const handleOpen = useCallback((isOpen: boolean) => {
    setOpen(isOpen);
    if (isOpen) checkExisting();
  }, [checkExisting]);

  const createAlert = useCallback(async () => {
    if (!user || !email.trim()) return;
    if (!/^[^@]+@[^@]+\.[^@]+$/.test(email.trim())) {
      toast({ title: "Invalid email", description: "Please enter a valid email." });
      return;
    }
    setLoading(true);
    const { error } = await supabase.from("search_alerts").insert({
      user_id: user.id,
      subject_name: subjectName,
      state,
      email: email.trim().toLowerCase(),
    });
    setLoading(false);
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Alert created", description: `You'll be notified when new records appear for ${subjectName}.` });
      setHasAlert(true);
      setOpen(false);
    }
  }, [user, email, subjectName, state, toast]);

  const disableAlert = useCallback(async () => {
    if (!alertId) return;
    setLoading(true);
    await supabase.from("search_alerts").update({ is_active: false }).eq("id", alertId);
    setLoading(false);
    setHasAlert(false);
    setAlertId(null);
    toast({ title: "Alert disabled", description: `Notifications for ${subjectName} have been turned off.` });
    setOpen(false);
  }, [alertId, subjectName, toast]);

  if (!hasAlertAccess) {
    return (
      <Link to="/pricing">
        <Button variant="outline" size="sm" className="gap-1.5 text-muted-foreground">
          <Lock className="h-3.5 w-3.5" /> Alerts (Investigator+)
        </Button>
      </Link>
    );
  }

  return (
    <Dialog open={open} onOpenChange={handleOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-1.5">
          {hasAlert ? (
            <><BellRing className="h-3.5 w-3.5 text-accent" /> Alert Active</>
          ) : (
            <><Bell className="h-3.5 w-3.5" /> Set Alert</>
          )}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <BellRing className="h-5 w-5 text-accent" />
            Record Alert
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 mt-2">
          <p className="text-sm text-muted-foreground">
            Get notified when new public records appear for <strong className="text-foreground">{subjectName}</strong> in <strong className="text-foreground">{state}</strong>.
          </p>

          {hasAlert ? (
            <div className="space-y-3">
              <div className="flex items-center gap-2 rounded-lg border border-accent/30 bg-accent/5 px-4 py-3">
                <BellRing className="h-4 w-4 text-accent shrink-0" />
                <span className="text-sm text-foreground">Alert is active. You'll receive emails at <strong>{email}</strong>.</span>
              </div>
              <Button variant="outline" onClick={disableAlert} disabled={loading} className="w-full gap-1.5">
                {loading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <BellOff className="h-3.5 w-3.5" />}
                Disable Alert
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1 block">Email for notifications</label>
                <Input
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="your@email.com"
                  type="email"
                />
              </div>
              <Button onClick={createAlert} disabled={loading || !email.trim()} className="w-full gap-1.5">
                {loading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Bell className="h-3.5 w-3.5" />}
                Enable Alert
              </Button>
            </div>
          )}

          <p className="text-[11px] text-muted-foreground/60">
            We'll check for new records periodically and email you when changes are detected.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
