import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import Header from "@/components/landing/Header";
import Footer from "@/components/landing/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search, FolderOpen, Clock, Plus, Trash2, Crown, Bookmark, FolderPlus } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import type { Tables } from "@/integrations/supabase/types";
import InvestigationCard from "@/components/dashboard/InvestigationCard";

const Dashboard = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [searches, setSearches] = useState<Tables<"searches">[]>([]);
  const [investigations, setInvestigations] = useState<Tables<"investigations">[]>([]);
  const [savedResults, setSavedResults] = useState<Record<string, any[]>>({});
  const [newInvTitle, setNewInvTitle] = useState("");
  const [tab, setTab] = useState<"searches" | "investigations">("searches");
  const [foundingMemberNumber, setFoundingMemberNumber] = useState<number | null>(null);
  // Save-to-investigation modal state
  const [saveSearch, setSaveSearch] = useState<Tables<"searches"> | null>(null);
  const [saveInvId, setSaveInvId] = useState("");
  const [saveNewTitle, setSaveNewTitle] = useState("");
  const [isCreatingNew, setIsCreatingNew] = useState(false);
  const [saving, setSaving] = useState(false);

  const loadFoundingMemberStatus = async () => {
    if (!user) return;
    const { data, error } = await supabase
      .from("founding_members")
      .select("founding_member_number")
      .eq("user_id", user.id)
      .limit(1)
      .maybeSingle();

    if (!error && data) {
      setFoundingMemberNumber(data.founding_member_number);
    }
  };

  const loadData = async () => {
    const [s, i, sr] = await Promise.all([
      supabase.from("searches").select("*").order("created_at", { ascending: false }),
      supabase.from("investigations").select("*").order("created_at", { ascending: false }),
      supabase.from("saved_results").select("*").order("created_at", { ascending: false }),
    ]);
    if (s.data) setSearches(s.data);
    if (i.data) setInvestigations(i.data);
    if (sr.data) {
      const grouped: Record<string, any[]> = {};
      for (const r of sr.data) {
        const invId = r.investigation_id || "__unassigned";
        (grouped[invId] ??= []).push(r);
      }
      setSavedResults(grouped);
    }
  };

  const createInvestigation = async () => {
    if (!newInvTitle.trim() || !user) return;
    const { error } = await supabase.from("investigations").insert({ title: newInvTitle.trim(), user_id: user.id });
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      setNewInvTitle("");
      loadData();
    }
  };

  const deleteSearch = async (id: string) => {
    await supabase.from("searches").delete().eq("id", id);
    setSearches((prev) => prev.filter((s) => s.id !== id));
  };

  const clearAllSearches = async () => {
    if (!user) return;
    await supabase.from("searches").delete().eq("user_id", user.id);
    setSearches([]);
    toast({ title: "Cleared", description: "All search history has been removed." });
  };

  const deleteInvestigation = async (id: string) => {
    // Delete saved results first (cascade), then the investigation
    await supabase.from("saved_results").delete().eq("investigation_id", id);
    await supabase.from("investigations").delete().eq("id", id);
    loadData();
  };

  const deleteSavedResult = async (resultId: string) => {
    await supabase.from("saved_results").delete().eq("id", resultId);
    loadData();
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      <main className="flex-1 container mx-auto px-4 lg:px-8 py-10 max-w-4xl">
        <div className="flex items-center gap-3 mb-6">
          <h1 className="font-heading text-2xl md:text-3xl font-bold text-foreground">Dashboard</h1>
          {foundingMemberNumber !== null && (
            <div className="inline-flex items-center gap-1.5 bg-gradient-to-r from-accent/20 to-accent/10 border border-accent/30 rounded-full px-3 py-1">
              <Crown className="h-4 w-4 text-accent" />
              <span className="text-sm font-semibold text-accent">
                Founding Member #{foundingMemberNumber}
              </span>
            </div>
          )}
        </div>

        {/* Tabs */}
        <div className="flex gap-1 border-b border-border mb-6">
          <button
            onClick={() => setTab("searches")}
            className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${
              tab === "searches" ? "border-accent text-foreground" : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            <Clock className="h-4 w-4 inline mr-1.5 -mt-0.5" /> Recent Searches
          </button>
          <button
            onClick={() => setTab("investigations")}
            className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${
              tab === "investigations" ? "border-accent text-foreground" : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            <FolderOpen className="h-4 w-4 inline mr-1.5 -mt-0.5" /> My Investigations
          </button>
        </div>

        {tab === "searches" && (
          <div>
            {searches.length === 0 ? (
              <div className="text-center py-16">
                <Search className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
                <p className="text-muted-foreground">No searches yet.</p>
                <Link to="/">
                  <Button variant="accent" size="sm" className="mt-3">Start Searching</Button>
                </Link>
              </div>
            ) : (
              <>
                <div className="flex justify-end mb-3">
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-muted-foreground hover:text-destructive gap-1.5"
                      >
                        <Trash2 className="h-3.5 w-3.5" /> Clear All
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Clear all search history?</AlertDialogTitle>
                        <AlertDialogDescription>
                          This will permanently delete all {searches.length} search{searches.length !== 1 ? "es" : ""} from your history. This action cannot be undone.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={clearAllSearches} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                          Delete All
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
                <div className="space-y-3">
                  {searches.map((s) => {
                    const rc = (s as any).result_count as number | null;
                    const dc = (s as any).database_count as number | null;
                    const rl = (s as any).risk_level as string | null;
                    return (
                      <div
                        key={s.id}
                        className="border border-border rounded-lg p-4 bg-card hover:shadow-sm transition-shadow flex items-center gap-3"
                      >
                        <Link
                          to={`/search-results?name=${encodeURIComponent(s.subject_name)}&state=${encodeURIComponent(s.state)}`}
                          className="flex-1 min-w-0"
                        >
                          <div className="flex items-center justify-between">
                            <p className="text-sm font-semibold text-foreground">{s.subject_name}</p>
                            {rl && (
                              <span className={`text-[10px] font-semibold uppercase px-2 py-0.5 rounded-full ${
                                rl === "high" ? "bg-destructive/15 text-destructive" :
                                rl === "elevated" ? "bg-warning/15 text-warning" :
                                rl === "moderate" ? "bg-accent/15 text-accent" :
                                "bg-success/15 text-success"
                              }`}>
                                {rl} risk
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-muted-foreground mt-0.5">
                            {s.state}{s.city ? `, ${s.city}` : ""} · {new Date(s.created_at).toLocaleDateString()}
                            {rc != null && rc > 0 && (
                              <span className="ml-2 font-medium text-foreground">{rc} record{rc !== 1 ? "s" : ""} across {dc} database{dc !== 1 ? "s" : ""}</span>
                            )}
                          </p>
                        </Link>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="shrink-0 text-muted-foreground hover:text-destructive"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Delete this search?</AlertDialogTitle>
                              <AlertDialogDescription>
                                This will permanently remove the search for "{s.subject_name}" from your history.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction onClick={() => deleteSearch(s.id)} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                                Delete
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    );
                  })}
                </div>
              </>
            )}
          </div>
        )}

        {tab === "investigations" && (
          <div>
            <div className="flex gap-2 mb-6">
              <Input
                placeholder="New investigation title…"
                value={newInvTitle}
                onChange={(e) => setNewInvTitle(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && createInvestigation()}
                className="max-w-sm"
              />
              <Button variant="accent" size="sm" onClick={createInvestigation} className="gap-1">
                <Plus className="h-4 w-4" /> Create
              </Button>
            </div>

            {investigations.length === 0 ? (
              <div className="text-center py-16">
                <FolderOpen className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
                <p className="text-muted-foreground">No investigations yet. Create one above.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {investigations.map((inv) => (
                  <InvestigationCard
                    key={inv.id}
                    investigation={inv}
                    savedResults={savedResults[inv.id] || []}
                    onDelete={deleteInvestigation}
                    onDeleteResult={deleteSavedResult}
                  />
                ))}
              </div>
            )}
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
};

export default Dashboard;
