import { useState, useCallback } from "react";
import { Share2, UserPlus, X, Check, Copy, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

interface ShareInvestigationDialogProps {
  investigationId: string;
  investigationTitle: string;
}

interface ShareEntry {
  id: string;
  shared_with_email: string;
  permission: string;
  created_at: string;
}

export default function ShareInvestigationDialog({
  investigationId,
  investigationTitle,
}: ShareInvestigationDialogProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [permission, setPermission] = useState<"read" | "edit">("read");
  const [shares, setShares] = useState<ShareEntry[]>([]);
  const [loading, setLoading] = useState(false);

  const loadShares = useCallback(async () => {
    const { data } = await supabase
      .from("investigation_shares")
      .select("id, shared_with_email, permission, created_at")
      .eq("investigation_id", investigationId)
      .order("created_at", { ascending: false });
    if (data) setShares(data as ShareEntry[]);
  }, [investigationId]);

  const handleOpen = useCallback((isOpen: boolean) => {
    setOpen(isOpen);
    if (isOpen) loadShares();
  }, [loadShares]);

  const addShare = useCallback(async () => {
    if (!email.trim() || !user) return;
    const emailClean = email.trim().toLowerCase();
    if (!/^[^@]+@[^@]+\.[^@]+$/.test(emailClean)) {
      toast({ title: "Invalid email", description: "Please enter a valid email address." });
      return;
    }
    setLoading(true);
    const { error } = await supabase.from("investigation_shares").insert({
      investigation_id: investigationId,
      shared_with_email: emailClean,
      shared_by: user.id,
      permission,
    });
    setLoading(false);
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Shared", description: `Invited ${emailClean} with ${permission} access.` });
      setEmail("");
      loadShares();
    }
  }, [email, permission, investigationId, user, toast, loadShares]);

  const removeShare = useCallback(async (shareId: string) => {
    await supabase.from("investigation_shares").delete().eq("id", shareId);
    setShares(prev => prev.filter(s => s.id !== shareId));
    toast({ title: "Removed", description: "Access has been revoked." });
  }, [toast]);

  return (
    <Dialog open={open} onOpenChange={handleOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon" className="h-8 w-8" title="Share investigation">
          <Share2 className="h-4 w-4 text-muted-foreground" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Users className="h-5 w-5 text-accent" />
            Share "{investigationTitle}"
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 mt-2">
          <div className="flex gap-2">
            <Input
              placeholder="colleague@newsroom.com"
              value={email}
              onChange={e => setEmail(e.target.value)}
              onKeyDown={e => e.key === "Enter" && addShare()}
              className="flex-1"
            />
            <Select value={permission} onValueChange={(v) => setPermission(v as "read" | "edit")}>
              <SelectTrigger className="w-[100px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="read">View</SelectItem>
                <SelectItem value="edit">Edit</SelectItem>
              </SelectContent>
            </Select>
            <Button onClick={addShare} disabled={loading || !email.trim()} size="sm" className="gap-1">
              <UserPlus className="h-3.5 w-3.5" /> Add
            </Button>
          </div>

          {shares.length > 0 ? (
            <div className="space-y-2">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                Shared with
              </p>
              {shares.map(share => (
                <div key={share.id} className="flex items-center justify-between gap-2 py-2 px-3 rounded-lg bg-muted/30 border border-border">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">{share.shared_with_email}</p>
                    <p className="text-[11px] text-muted-foreground">
                      {share.permission === "edit" ? "Can edit" : "View only"}
                    </p>
                  </div>
                  <button onClick={() => removeShare(share.id)} className="text-muted-foreground hover:text-destructive">
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground text-center py-4">
              No collaborators yet. Add a colleague's email above.
            </p>
          )}

          <p className="text-[11px] text-muted-foreground/60">
            Collaborators must have a Record Tracer account with the same email to access shared investigations.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
