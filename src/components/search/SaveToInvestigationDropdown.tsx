import { useState, useEffect, useRef } from "react";
import { Bookmark, Check, Plus, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import type { MockResult } from "@/lib/recordsApi";

interface Investigation {
  id: string;
  title: string;
}

interface SaveToInvestigationDropdownProps {
  result: MockResult;
}

const SaveToInvestigationDropdown = ({ result }: SaveToInvestigationDropdownProps) => {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [investigations, setInvestigations] = useState<Investigation[]>([]);
  const [creatingNew, setCreatingNew] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [saving, setSaving] = useState(false);
  const [savedToName, setSavedToName] = useState<string | null>(null);
  const [alreadySaved, setAlreadySaved] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  // Close on outside click
  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  const fetchInvestigations = async () => {
    if (!user) return;
    const { data } = await supabase
      .from("investigations")
      .select("id, title")
      .eq("user_id", user.id)
      .order("updated_at", { ascending: false });
    setInvestigations(data || []);
  };

  const handleOpen = () => {
    if (alreadySaved) return;
    fetchInvestigations();
    setCreatingNew(false);
    setNewTitle("");
    setOpen(true);
  };

  const saveToInvestigation = async (investigationId: string, investigationName: string) => {
    if (!user) return;
    setSaving(true);
    const { error } = await supabase.from("saved_results").insert({
      user_id: user.id,
      investigation_id: investigationId,
      result_data: {
        source: result.source,
        description: result.description,
        category: result.category,
        details: result.details,
        sourceUrl: result.sourceUrl,
      },
    });
    setSaving(false);
    if (!error) {
      setOpen(false);
      setSavedToName(investigationName);
      setAlreadySaved(true);
      setTimeout(() => setSavedToName(null), 2000);
    }
  };

  const handleCreateAndSave = async () => {
    if (!user || !newTitle.trim()) return;
    setSaving(true);
    const { data, error } = await supabase
      .from("investigations")
      .insert({ title: newTitle.trim(), user_id: user.id })
      .select("id, title")
      .single();
    if (error || !data) {
      setSaving(false);
      return;
    }
    await saveToInvestigation(data.id, data.title);
  };

  if (alreadySaved && !savedToName) {
    return (
      <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
        <Check className="h-3 w-3" /> Saved ✓
      </span>
    );
  }

  if (savedToName) {
    return (
      <span className="text-xs text-muted-foreground">
        Saved to {savedToName}
      </span>
    );
  }

  return (
    <div className="relative" ref={ref}>
      <Button
        variant="ghost"
        size="sm"
        className="gap-1.5 text-muted-foreground"
        onClick={handleOpen}
      >
        <Bookmark className="h-3.5 w-3.5" /> Save
      </Button>

      {open && (
        <div className="absolute right-0 top-full mt-1 z-50 w-64 rounded-md border border-border bg-popover shadow-md">
          {saving ? (
            <div className="flex items-center justify-center py-4">
              <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
            </div>
          ) : creatingNew ? (
            <div className="p-3 space-y-2">
              <Input
                placeholder="Investigation name…"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleCreateAndSave()}
                autoFocus
                className="h-8 text-sm"
              />
              <div className="flex gap-2">
                <Button size="sm" variant="accent" className="flex-1 h-7 text-xs" onClick={handleCreateAndSave}>
                  Save
                </Button>
                <Button size="sm" variant="ghost" className="h-7 text-xs" onClick={() => setCreatingNew(false)}>
                  Cancel
                </Button>
              </div>
            </div>
          ) : (
            <div className="py-1 max-h-48 overflow-y-auto">
              {investigations.length === 0 && (
                <p className="px-3 py-2 text-xs text-muted-foreground">No investigations yet</p>
              )}
              {investigations.map((inv) => (
                <button
                  key={inv.id}
                  onClick={() => saveToInvestigation(inv.id, inv.title)}
                  className="w-full text-left px-3 py-2 text-sm hover:bg-muted/50 transition-colors truncate"
                >
                  {inv.title}
                </button>
              ))}
              <div className="border-t border-border">
                <button
                  onClick={() => setCreatingNew(true)}
                  className="w-full text-left px-3 py-2 text-sm text-accent hover:bg-muted/50 transition-colors flex items-center gap-1.5"
                >
                  <Plus className="h-3.5 w-3.5" /> New Investigation
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default SaveToInvestigationDropdown;
