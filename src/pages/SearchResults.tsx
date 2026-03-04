import { useSearchParams, Link, useNavigate } from "react-router-dom";
import { Building2, Vote, Scale, Home, BadgeCheck, ExternalLink, Bookmark, Loader2, ArrowLeft, FolderPlus, Plus, AlertCircle, FileText, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import Header from "@/components/landing/Header";
import Footer from "@/components/landing/Footer";
import SubjectProfile from "@/components/search/SubjectProfile";
import ContactIntelligence from "@/components/search/ContactIntelligence";
import AiSubjectSummary from "@/components/search/AiSubjectSummary";
import DeepResearchAnalyst from "@/components/search/DeepResearchAnalyst";
import NewsMentions from "@/components/NewsMentions";
import NameMatchBadge from "@/components/search/NameMatchBadge";
import { getNameMatchConfidence } from "@/lib/nameMatch";
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { searchAll, type MockResult, type ApiDebugInfo, type SearchOptions } from "@/lib/recordsApi";
import { sanitizeInput, sanitizeUrlParam, isValidName, isValidState } from "@/utils/validation";
import ErrorBoundary from "@/components/ErrorBoundary";
import PublicRecordsLinks from "@/components/search/PublicRecordsLinks";
import DossierView from "@/components/dossier/DossierView";


interface Investigation {
  id: string;
  title: string;
}

const CATEGORY_META: Record<string, { icon: typeof Building2; label: string }> = {
  business: { icon: Building2, label: "Business Registrations & Filings" },
  donations: { icon: Vote, label: "Campaign Donations (FEC)" },
  contracts: { icon: FileText, label: "Government Contracts & Grants" },
  court: { icon: Scale, label: "Court Records" },
  lobbying: { icon: FileText, label: "Lobbying Disclosures" },
  sanctions: { icon: AlertCircle, label: "Sanctions & Watchlists" },
  offshore: { icon: ExternalLink, label: "Offshore Leaks (ICIJ)" },
  assets: { icon: Home, label: "Asset Records" },
  property: { icon: Home, label: "Property Records" },
  licenses: { icon: BadgeCheck, label: "Professional Licenses" },
};




const DEFAULT_VISIBLE = 3;

const SearchResults = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const rawName = sanitizeUrlParam(searchParams.get("name")) || "Unknown";
  const rawState = sanitizeUrlParam(searchParams.get("state")) || "Unknown";
  const name = sanitizeInput(rawName);
  const state = isValidState(rawState) ? rawState : "All States / National";
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [results, setResults] = useState<MockResult[]>([]);
  const [debugInfo, setDebugInfo] = useState<ApiDebugInfo[]>([]);
  const [selectedResult, setSelectedResult] = useState<MockResult | null>(null);
  const [saveModalResult, setSaveModalResult] = useState<MockResult | null>(null);
  const [investigations, setInvestigations] = useState<Investigation[]>([]);
  const [selectedInvestigationId, setSelectedInvestigationId] = useState("");
  const [newInvestigationTitle, setNewInvestigationTitle] = useState("");
  const [isCreatingNew, setIsCreatingNew] = useState(false);
  const [saving, setSaving] = useState(false);
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());
  const { toast } = useToast();
  const { user, subscribed, subscriptionLoading } = useAuth();

  useEffect(() => {
    // Redirect if not authenticated or not subscribed
    if (!user) {
      toast({ title: "Sign in required", description: "Please sign in or create an account to search records." });
      navigate("/auth");
      return;
    }
    if (!subscriptionLoading && !subscribed) {
      toast({ title: "Subscription required", description: "Choose a plan to start searching public records." });
      navigate("/pricing");
      return;
    }
    // Wait for subscription check to finish before searching
    if (subscriptionLoading) return;

    let cancelled = false;
    setLoading(true);
    setError(false);

    const skipParam = sanitizeUrlParam(searchParams.get("skip"));
    const options: SearchOptions = {
      skip: skipParam ? skipParam.split(",").filter(s => /^[a-z]+$/.test(s)) : undefined,
      middleInitial: sanitizeUrlParam(searchParams.get("mi"), 1) || undefined,
      dob: sanitizeUrlParam(searchParams.get("dob"), 10) || undefined,
      email: sanitizeUrlParam(searchParams.get("email"), 255) || undefined,
      streetAddress: sanitizeUrlParam(searchParams.get("address")) || undefined,
      city: sanitizeUrlParam(searchParams.get("city"), 100) || undefined,
    };

    const nameCheck = isValidName(name);
    if (!nameCheck.valid) {
      setError(true);
      setLoading(false);
      return;
    }

    searchAll(name, state, options)
      .then(async (data) => {
        if (!cancelled) {
          console.log("[SearchResults] searchAll returned", data.results.length, "results, debug:", data.debug);
          setResults(data.results);
          setDebugInfo(data.debug);
          setLoading(false);

          // Persist search metrics for dashboard previews
          if (user && data.results.length > 0) {
            const categoryCounts: Record<string, number> = {};
            for (const r of data.results) {
              categoryCounts[r.category] = (categoryCounts[r.category] || 0) + 1;
            }
            const dbCount = Object.keys(categoryCounts).length;
            const flagCount = { red: 0, yellow: 0, green: 0, blue: 0 };
            // We'll update risk_level later when AI summary returns; for now store counts
            await supabase
              .from("searches")
              .update({
                result_count: data.results.length,
                database_count: dbCount,
                flag_count: flagCount,
              })
              .eq("user_id", user.id)
              .eq("subject_name", name)
              .eq("state", state)
              .order("created_at", { ascending: false })
              .limit(1);
          }
        }
      })
      .catch((err) => {
        if (!cancelled) {
          console.error("[SearchResults] searchAll FAILED:", err);
          setError(true);
          setLoading(false);
        }
      });
    return () => { cancelled = true; };
  }, [name, state, searchParams, user, subscribed, subscriptionLoading, navigate]);

  const fetchInvestigations = async () => {
    if (!user) return;
    const { data } = await supabase
      .from("investigations")
      .select("id, title")
      .eq("user_id", user.id)
      .order("updated_at", { ascending: false });
    setInvestigations(data || []);
  };

  const openSaveModal = (result: MockResult) => {
    if (!user) {
      toast({ title: "Sign in to save", description: "Create an account to save results to investigations.", variant: "destructive" });
      return;
    }
    setSaveModalResult(result);
    setSelectedInvestigationId("");
    setNewInvestigationTitle("");
    setIsCreatingNew(false);
    fetchInvestigations();
  };

  const handleSave = async () => {
    if (!user || !saveModalResult) return;
    setSaving(true);

    let investigationId = selectedInvestigationId;
    let investigationName = "";

    if (isCreatingNew) {
      if (!newInvestigationTitle.trim()) {
        toast({ title: "Enter a name", description: "Please name your new investigation.", variant: "destructive" });
        setSaving(false);
        return;
      }
      const { data, error } = await supabase
        .from("investigations")
        .insert({ title: newInvestigationTitle.trim(), user_id: user.id })
        .select("id, title")
        .single();
      if (error || !data) {
        toast({ title: "Error", description: error?.message || "Could not create investigation.", variant: "destructive" });
        setSaving(false);
        return;
      }
      investigationId = data.id;
      investigationName = data.title;
    } else {
      if (!investigationId) {
        toast({ title: "Select an investigation", description: "Choose an investigation or create a new one.", variant: "destructive" });
        setSaving(false);
        return;
      }
      investigationName = investigations.find((i) => i.id === investigationId)?.title || "Investigation";
    }

    const { error } = await supabase.from("saved_results").insert({
      user_id: user.id,
      investigation_id: investigationId,
      result_data: {
        source: saveModalResult.source,
        description: saveModalResult.description,
        category: saveModalResult.category,
        details: saveModalResult.details,
        sourceUrl: saveModalResult.sourceUrl,
      },
    });

    setSaving(false);
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Saved", description: `Added to "${investigationName}"` });
      setSaveModalResult(null);
    }
  };

  const grouped = results.reduce<Record<string, MockResult[]>>((acc, r) => {
    (acc[r.category] ??= []).push(r);
    return acc;
  }, {});

  const categoryForResult = (result: MockResult) => CATEGORY_META[result.category];

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      <main className="flex-1 container mx-auto px-4 lg:px-8 py-10 max-w-4xl">
        <Link to="/" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground mb-6">
          <ArrowLeft className="h-4 w-4" /> Back to search
        </Link>

        <h1 className="font-heading text-2xl md:text-3xl font-bold text-foreground">
          Results for: <span className="text-accent">{name}</span>{state !== "All States / National" ? ` in ${state}` : " (National)"}
        </h1>
        <p className="text-muted-foreground mt-1 text-sm">Searching public records across multiple databases…</p>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-24 gap-3">
            <Loader2 className="h-8 w-8 animate-spin text-accent" />
            <p className="text-muted-foreground text-sm">Scanning FEC, SEC EDGAR, USASpending.gov, ProPublica, and state databases…</p>
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center py-24 gap-3">
            <AlertCircle className="h-8 w-8 text-destructive" />
            <p className="text-muted-foreground text-sm">Something went wrong. Please try again.</p>
            <Button variant="outline" size="sm" onClick={() => window.location.reload()}>Retry</Button>
          </div>
        ) : results.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 gap-3">
            <p className="text-muted-foreground text-sm">No public records found for this search.</p>
          </div>
        ) : (
          <div className="mt-8 space-y-8">
            <ErrorBoundary><AiSubjectSummary name={name} state={state} results={results} /></ErrorBoundary>
            <ErrorBoundary><SubjectProfile name={name} state={state} results={results} /></ErrorBoundary>
            <ErrorBoundary><ContactIntelligence searchName={name} state={state} /></ErrorBoundary>

            {/* Dossier View: Brief, Timeline, Campaign Finance, Court Records, News, Public Records */}
            <ErrorBoundary><DossierView searchName={name} state={state} /></ErrorBoundary>

            {/* ICIJ Offshore Leaks Explainer */}
            {grouped["offshore"]?.length > 0 && (
              <div className="border border-border rounded-lg p-4 bg-info-bg/30 text-sm" id="icij-explainer">
                <p className="font-semibold text-foreground mb-1">ℹ️ About Offshore Leaks</p>
                <p className="text-muted-foreground leading-relaxed">
                  These results come from the International Consortium of Investigative Journalists' database of 810,000+ offshore entities from the Panama Papers, Paradise Papers, Pandora Papers, and other leaked documents.
                </p>
                <p className="text-warning text-xs mt-2 leading-relaxed">
                  ⚠️ IMPORTANT: Offshore entities have many legitimate uses including international business, estate planning, and asset protection. Appearing in this database does NOT indicate illegal activity. Names may match different individuals. Always verify identity using addresses, dates, and jurisdictions before drawing conclusions.
                </p>
              </div>
            )}

            {/* OpenSanctions/PEP Explainer */}
            {grouped["sanctions"]?.length > 0 && (
              <div className="border border-border rounded-lg p-4 bg-info-bg/30 text-sm" id="sanctions-explainer">
                <p className="font-semibold text-foreground mb-1">ℹ️ About Sanctions & PEP Results</p>
                <p className="text-muted-foreground leading-relaxed">
                  These results come from OpenSanctions, which aggregates 100+ sanctions lists, PEP databases, and watchlists. <strong>PEP (Politically Exposed Person)</strong> listings are standard for current or former public officials and do NOT indicate wrongdoing. Actual sanctions matches are flagged separately.
                </p>
              </div>
            )}

            {Object.entries(CATEGORY_META).map(([key, { icon: Icon, label }]) => {
              const items = (grouped[key] || []).sort((a, b) => (b.relevance ?? 0) - (a.relevance ?? 0));
              const isExpanded = expandedCategories.has(key);
              const visibleItems = isExpanded ? items : items.slice(0, DEFAULT_VISIBLE);
              const hasMore = items.length > DEFAULT_VISIBLE;
              return (
                <section key={key} id={`category-${key}`}>
                  <div className="flex items-center gap-2 mb-3">
                    <Icon className="h-5 w-5 text-accent" />
                    <h2 className="font-heading text-lg font-semibold text-foreground">{label}</h2>
                    <span className="text-xs text-muted-foreground ml-1">({items.length})</span>
                  </div>
                  {items.length === 0 ? (
                    <p className="text-sm text-muted-foreground italic pl-7">No records found in this category.</p>
                  ) : (
                    <div className="space-y-3 pl-7">
                      {visibleItems.map((item) => (
                        <div key={item.id} className="border border-border rounded-lg p-4 bg-card flex flex-col sm:flex-row sm:items-start gap-3">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <p className="text-sm font-semibold text-foreground">{item.source}</p>
                              {item.relevance != null && (
                                <span
                                  className={`text-[10px] font-medium px-1.5 py-0.5 rounded-full ${
                                    item.relevance >= 90 ? "bg-accent/15 text-accent" :
                                    item.relevance >= 70 ? "bg-info-bg text-info" :
                                    "bg-muted text-muted-foreground"
                                  }`}
                                  title="Name similarity indicates how closely the entity name matches your search term. It does NOT indicate a confirmed connection. Many entities share similar names. Always verify identity using additional details like addresses, dates, and jurisdictions."
                                >
                                  {item.relevance}% name similarity
                                  {item.relevance < 70 && " · ⚠️ Weak — verify independently"}
                                  {item.relevance >= 70 && item.relevance < 90 && " · Moderate"}
                                  {item.relevance >= 90 && " · Strong"}
                                </span>
                              )}
                              {item.returnedName && (
                                <NameMatchBadge
                                  confidence={getNameMatchConfidence(name, item.returnedName)}
                                  searchedName={name}
                                  returnedName={item.returnedName}
                                  source={item.source}
                                />
                              )}
                            </div>
                            <p className="text-sm text-muted-foreground mt-0.5">{item.description}</p>
                          </div>
                          <div className="flex items-center gap-2 shrink-0">
                            <Button variant="outline" size="sm" className="gap-1.5" onClick={() => setSelectedResult(item)}>
                              <ExternalLink className="h-3.5 w-3.5" /> View Details
                            </Button>
                            <Button variant="ghost" size="sm" className="gap-1.5 text-muted-foreground" onClick={() => openSaveModal(item)}>
                              <Bookmark className="h-3.5 w-3.5" /> Save
                            </Button>
                          </div>
                        </div>
                      ))}
                      {hasMore && !isExpanded && (
                        <button
                          onClick={() => setExpandedCategories(prev => new Set(prev).add(key))}
                          className="inline-flex items-center gap-1.5 text-sm text-accent hover:underline font-medium pt-1"
                        >
                          <ChevronDown className="h-3.5 w-3.5" />
                          Show all {items.length} results
                        </button>
                      )}
                    </div>
                  )}
                </section>
              );
            })}
            <ErrorBoundary><DeepResearchAnalyst name={name} state={state} results={results} /></ErrorBoundary>
          </div>
        )}

        {/* Debug Info Panel */}
        {!loading && debugInfo.length > 0 && (
          <div className="mt-12 border border-border rounded-lg p-4 bg-muted/30">
            <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-3">🔧 Debug Info</h3>
            <div className="space-y-2">
              {debugInfo.map((d) => (
                <div key={d.api} className="flex items-center gap-3 text-sm">
                  <span className={`inline-block w-2 h-2 rounded-full ${d.status === "success" ? "bg-green-500" : "bg-red-500"}`} />
                  <span className="font-medium text-foreground w-40">{d.api}</span>
                  <span className="text-muted-foreground">
                    {d.status === "success"
                      ? `${d.resultCount} result(s)${d.duration ? ` in ${(d.duration / 1000).toFixed(1)}s` : ""}`
                      : `Error: ${d.error}`}
                  </span>
                </div>
              ))}
            </div>
            <p className="text-xs text-muted-foreground mt-3">Check browser console for full request/response logs.</p>
          </div>
        )}
      </main>
      <Footer />

      {/* Record Detail Modal */}
      <Dialog open={!!selectedResult} onOpenChange={(open) => !open && setSelectedResult(null)}>
        <DialogContent className="sm:max-w-lg max-h-[85vh] overflow-y-auto">
          {selectedResult && (() => {
            const meta = categoryForResult(selectedResult);
            const Icon = meta?.icon ?? Building2;
            return (
              <>
                <DialogHeader>
                  <div className="flex items-center gap-2 text-accent mb-1">
                    <Icon className="h-4 w-4" />
                    <span className="text-xs font-medium uppercase tracking-wide">{meta?.label}</span>
                  </div>
                  <DialogTitle className="font-heading text-lg leading-snug">{selectedResult.source}</DialogTitle>
                  <p className="text-sm text-muted-foreground mt-1">{selectedResult.description}</p>
                </DialogHeader>
                <Separator className="my-2" />
                <div className="space-y-3">
                  <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Record Details</h3>
                  <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-2 text-sm">
                    {Object.entries(selectedResult.details).map(([key, value]) => (
                      <div key={key} className="contents">
                        <dt className="font-medium text-foreground whitespace-nowrap">{key}</dt>
                        <dd className="text-muted-foreground">{value}</dd>
                      </div>
                    ))}
                  </dl>
                </div>
                {selectedResult.sourceUrl && (
                  <>
                    <Separator className="my-2" />
                    <div>
                      <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-2">Source</h3>
                      <a href={selectedResult.sourceUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 text-sm text-accent hover:underline">
                        <ExternalLink className="h-3.5 w-3.5" /> View on {selectedResult.source}
                      </a>
                    </div>
                  </>
                )}
                <Separator className="my-2" />
                <div className="flex items-center gap-2 justify-end">
                  <Button variant="outline" size="sm" onClick={() => setSelectedResult(null)}>Close</Button>
                  <Button variant="accent" size="sm" className="gap-1.5" onClick={() => { setSelectedResult(null); openSaveModal(selectedResult); }}>
                    <FolderPlus className="h-3.5 w-3.5" /> Save to Investigation
                  </Button>
                </div>
              </>
            );
          })()}
        </DialogContent>
      </Dialog>

      {/* Save to Investigation Modal */}
      <Dialog open={!!saveModalResult} onOpenChange={(open) => !open && setSaveModalResult(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="font-heading text-lg">Save to Investigation</DialogTitle>
            <p className="text-sm text-muted-foreground mt-1">
              Choose an investigation or create a new one.
            </p>
          </DialogHeader>

          {saveModalResult && (
            <div className="bg-muted/50 border border-border rounded-md p-3 text-sm">
              <p className="font-medium text-foreground">{saveModalResult.source}</p>
              <p className="text-muted-foreground text-xs mt-0.5">{saveModalResult.description}</p>
            </div>
          )}

          <div className="space-y-4 mt-2">
            {!isCreatingNew ? (
              <>
                <Select value={selectedInvestigationId} onValueChange={setSelectedInvestigationId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select an investigation…" />
                  </SelectTrigger>
                  <SelectContent>
                    {investigations.map((inv) => (
                      <SelectItem key={inv.id} value={inv.id}>{inv.title}</SelectItem>
                    ))}
                    {investigations.length === 0 && (
                      <div className="px-2 py-1.5 text-sm text-muted-foreground">No investigations yet</div>
                    )}
                  </SelectContent>
                </Select>
                <button
                  onClick={() => setIsCreatingNew(true)}
                  className="inline-flex items-center gap-1.5 text-sm text-accent hover:underline font-medium"
                >
                  <Plus className="h-3.5 w-3.5" /> Create new investigation
                </button>
              </>
            ) : (
              <>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">Investigation Name</label>
                  <Input
                    value={newInvestigationTitle}
                    onChange={(e) => setNewInvestigationTitle(e.target.value)}
                    placeholder="e.g. Byron Donalds — Florida Records"
                    autoFocus
                  />
                </div>
                <button
                  onClick={() => setIsCreatingNew(false)}
                  className="text-sm text-muted-foreground hover:underline"
                >
                  ← Back to existing investigations
                </button>
              </>
            )}
          </div>

          <div className="flex items-center gap-2 justify-end mt-4">
            <Button variant="outline" size="sm" onClick={() => setSaveModalResult(null)}>Cancel</Button>
            <Button variant="accent" size="sm" className="gap-1.5" onClick={handleSave} disabled={saving}>
              <Bookmark className="h-3.5 w-3.5" /> {saving ? "Saving…" : "Save"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default SearchResults;
