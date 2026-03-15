import { useSearchParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Building2, Vote, Scale, Home, BadgeCheck, ExternalLink, AlertCircle, FileText, ChevronRight, Newspaper, Shield, UserSearch, ShieldAlert, Leaf, BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import Header from "@/components/landing/Header";
import Footer from "@/components/landing/Footer";
import AiSubjectSummary from "@/components/search/AiSubjectSummary";
import DeepResearchAnalyst from "@/components/search/DeepResearchAnalyst";
import SearchProgress from "@/components/search/SearchProgress";
import { useState, useEffect, useMemo, useCallback, useRef } from "react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { searchAll, type MockResult, type SearchOptions, type SourceStatus } from "@/lib/recordsApi";
import { sanitizeInput, sanitizeUrlParam, isValidName, isValidState } from "@/utils/validation";
import ErrorBoundary from "@/components/ErrorBoundary";
import DossierView from "@/components/dossier/DossierView";
import ReportersChecklist from "@/components/search/ReportersChecklist";
import NewsMentions from "@/components/NewsMentions";
import CourtRecordsSection from "@/components/search/CourtRecordsSection";
import OffshoreLeaksSection from "@/components/search/OffshoreLeaksSection";
import MobileToc from "@/components/search/MobileToc";
import ContactIntelligence from "@/components/search/ContactIntelligence";
import EntityClusterCard from "@/components/search/EntityClusterCard";
import { clusterEntities } from "@/lib/entityResolution";
import ResultsHeader from "@/components/search/ResultsHeader";
import TocSidebar from "@/components/search/TocSidebar";
import RecordDetailModal from "@/components/search/RecordDetailModal";
import SourceRecordSection from "@/components/search/SourceRecordSection";
import NewResultsBadge from "@/components/search/NewResultsBadge";
import RelationshipMap from "@/components/search/RelationshipMap";
import RecordProfileSummary from "@/components/search/RecordProfileSummary";
import CrossReferenceAlerts from "@/components/search/CrossReferenceAlerts";
import FoiaLetterGenerator from "@/components/search/FoiaLetterGenerator";
import UpgradeGate from "@/components/search/UpgradeGate";
import { useTierGating } from "@/hooks/use-tier-gating";

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
  violations: { icon: ShieldAlert, label: "Violations & Enforcement" },
  foia: { icon: BookOpen, label: "FOIA Archive (MuckRock)" },
};

const SearchResults = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const rawName = sanitizeUrlParam(searchParams.get("name")) || "Unknown";
  const rawState = sanitizeUrlParam(searchParams.get("state")) || "Unknown";
  const name = sanitizeInput(rawName);
  const state = isValidState(rawState) ? rawState : "All States / National";
  const [selectedResult, setSelectedResult] = useState<MockResult | null>(null);
  const [sourceProgress, setSourceProgress] = useState<SourceStatus[]>([]);
  const [streamedResults, setStreamedResults] = useState<MockResult[]>([]);
  const { toast } = useToast();
  const { user, subscribed, subscriptionLoading, loading: authLoading } = useAuth();

  // Tier gating
  const gating = useTierGating();
  const [searchLimitReached, setSearchLimitReached] = useState(false);

  // Check search limit on mount
  useEffect(() => {
    if (!user) return;
    supabase.rpc("get_search_usage", { p_user_id: user.id }).then(({ data }) => {
      if (data !== null && gating.searchLimit !== Infinity && data >= gating.searchLimit) {
        setSearchLimitReached(true);
      }
    });
  }, [user, gating.searchLimit]);

  // Re-search change detection: load previous result IDs from sessionStorage
  const previousResultIds = useMemo(() => {
    try {
      const key = `prev_results_${name}_${state}`;
      const stored = sessionStorage.getItem(key);
      return stored ? new Set<string>(JSON.parse(stored)) : null;
    } catch { return null; }
  }, [name, state]);

  // Auth guard
  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      toast({ title: "Sign in required", description: "Please sign in or create an account to search records." });
      navigate("/auth");
      return;
    }
    if (subscriptionLoading) return;
    if (!subscribed) {
      toast({ title: "Subscription required", description: "Choose a plan to start searching public records." });
      navigate("/pricing");
      return;
    }
  }, [user, subscribed, subscriptionLoading, authLoading, navigate]);

  const skipParam = sanitizeUrlParam(searchParams.get("skip"));
  const searchOptions: SearchOptions = useMemo(() => ({
    skip: skipParam ? skipParam.split(",").filter(s => /^[a-z]+$/.test(s)) : undefined,
    middleInitial: sanitizeUrlParam(searchParams.get("mi"), 1) || undefined,
    dob: sanitizeUrlParam(searchParams.get("dob"), 10) || undefined,
    email: sanitizeUrlParam(searchParams.get("email"), 255) || undefined,
    streetAddress: sanitizeUrlParam(searchParams.get("address")) || undefined,
    city: sanitizeUrlParam(searchParams.get("city"), 100) || undefined,
  }), [searchParams]);

  const nameCheck = isValidName(name);
  const canSearch = !!user && !!subscribed && !authLoading && !subscriptionLoading && nameCheck.valid && !searchLimitReached;

  const handleProgress = useCallback((sources: SourceStatus[]) => {
    setSourceProgress(sources);
  }, []);

  // Progressive results callback — accumulate results as each source completes
  const handleResults = useCallback((newResults: MockResult[]) => {
    setStreamedResults(prev => [...prev, ...newResults]);
  }, []);

  // Reset streamed results when search params change
  useEffect(() => {
    setStreamedResults([]);
  }, [name, state, searchOptions]);

  const { data: searchData, isLoading: loading, isError: error } = useQuery({
    queryKey: ["search-results", name, state, searchOptions],
    queryFn: async () => {
      setStreamedResults([]);
      const data = await searchAll(name, state, searchOptions, handleProgress, handleResults);
      if (user && data.results.length > 0) {
        const categoryCounts: Record<string, number> = {};
        for (const r of data.results) {
          categoryCounts[r.category] = (categoryCounts[r.category] || 0) + 1;
        }
        const dbCount = Object.keys(categoryCounts).length;
        const flagCount = { red: 0, yellow: 0, green: 0, blue: 0 };
        await supabase
          .from("searches")
          .update({ result_count: data.results.length, database_count: dbCount, flag_count: flagCount })
          .eq("user_id", user.id)
          .eq("subject_name", name)
          .eq("state", state)
          .order("created_at", { ascending: false })
          .limit(1);
      }
      // Store current result IDs for future re-search comparison
      try {
        const key = `prev_results_${name}_${state}`;
        sessionStorage.setItem(key, JSON.stringify(data.results.map(r => r.id)));
      } catch { /* ignore storage errors */ }
      return data;
    },
    enabled: canSearch,
    staleTime: 1000 * 60 * 30,
  });

  // Use final results when query is done, otherwise use streamed results for progressive rendering
  const results = searchData?.results ?? streamedResults;
  const isSearchComplete = !!searchData;
  const searchTimestamp = useMemo(() => searchData ? new Date() : null, [searchData]);
  const entityClusters = useMemo(() => clusterEntities(results, name), [results, name]);

  // Change detection stats
  const changeStats = useMemo(() => {
    if (!previousResultIds || !isSearchComplete) return null;
    const newIds = results.filter(r => !previousResultIds.has(r.id));
    const removedCount = [...previousResultIds].filter(id => !results.some(r => r.id === id)).length;
    if (newIds.length === 0 && removedCount === 0) return { newCount: 0, removedCount: 0, unchanged: true };
    return { newCount: newIds.length, removedCount, unchanged: false };
  }, [results, previousResultIds, isSearchComplete]);

  const grouped = results.reduce<Record<string, MockResult[]>>((acc, r) => {
    (acc[r.category] ??= []).push(r);
    return acc;
  }, {});

  const tocItems = useMemo(() => {
    const items: { id: string; label: string; count?: number }[] = [];
    items.push({ id: "source-profile", label: "Record Profile Summary" });
    items.push({ id: "source-briefing", label: "AI Subject Briefing" });
    items.push({ id: "source-cross-refs", label: "Connection Alerts" });
    if (entityClusters.length > 0) {
      items.push({ id: "source-entities", label: "Entity Resolution", count: entityClusters.length });
    }
    for (const [key, { label }] of Object.entries(CATEGORY_META)) {
      const count = grouped[key]?.length ?? 0;
      if (count > 0) items.push({ id: `source-${key}`, label, count });
    }
    items.push({ id: "source-relationships", label: "Relationship Map" });
    items.push({ id: "source-contact-intel", label: "Contact Intelligence" });
    items.push({ id: "source-news-coverage", label: "News Coverage" });
    items.push({ id: "source-dossier", label: "Investigative Dossier" });
    items.push({ id: "source-deep-research", label: "Deep Research Analyst" });
    items.push({ id: "source-foia", label: "FOIA Letter Generator" });
    items.push({ id: "source-checklist", label: "Reporter's Checklist" });
    return items;
  }, [results, grouped, entityClusters]);

  const [activeSection, setActiveSection] = useState("source-briefing");
  const activeSectionRef = useRef(activeSection);
  activeSectionRef.current = activeSection;

  useEffect(() => {
    if (tocItems.length === 0) return;
    const sectionIds = tocItems.map((t) => t.id);
    const ratios = new Map<string, number>();
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) ratios.set(entry.target.id, entry.intersectionRatio);
        let best = "";
        let bestRatio = -1;
        for (const id of sectionIds) {
          const r = ratios.get(id) ?? 0;
          if (r > bestRatio) { bestRatio = r; best = id; }
        }
        if (best && bestRatio > 0) setActiveSection(best);
      },
      { threshold: [0, 0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1] }
    );
    for (const id of sectionIds) {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    }
    return () => observer.disconnect();
  }, [tocItems]);

  const scrollToSection = useCallback((id: string) => {
    setActiveSection(id);
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, []);

  const categoryForResult = (result: MockResult) => CATEGORY_META[result.category];

  const hasResults = results.length > 0;

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      <main className="flex-1 container mx-auto px-4 lg:px-8 py-10 max-w-5xl">
        {/* Show progress bar while loading (even if we have partial results) */}
        {loading && (
          <div className="mb-6">
            <SearchProgress sources={sourceProgress} isComplete={false} />
          </div>
        )}

        {error ? (
          <div className="flex flex-col items-center justify-center py-24 gap-3">
            <AlertCircle className="h-8 w-8 text-destructive" />
            <p className="text-muted-foreground text-sm">Something went wrong. Please try again.</p>
            <Button variant="outline" size="sm" onClick={() => window.location.reload()}>Retry</Button>
          </div>
        ) : !hasResults && !loading ? (
          <div className="flex flex-col items-center justify-center py-24 gap-3">
            <p className="text-muted-foreground text-sm">No public records found for this search.</p>
          </div>
        ) : hasResults ? (
          <>
            <ResultsHeader name={name} state={state} results={results} searchTimestamp={searchTimestamp} canExport={gating.canExport} />

            {/* Re-search change detection banner */}
            {changeStats && !changeStats.unchanged && (
              <div className="mt-3 flex items-center gap-2 rounded-lg border border-info-border bg-info-bg px-4 py-2.5">
                <span className="text-xs font-semibold text-info">
                  Re-search comparison:
                </span>
                {changeStats.newCount > 0 && (
                  <span className="text-xs font-medium text-success">
                    +{changeStats.newCount} new record{changeStats.newCount !== 1 ? "s" : ""}
                  </span>
                )}
                {changeStats.removedCount > 0 && (
                  <span className="text-xs font-medium text-destructive">
                    −{changeStats.removedCount} removed
                  </span>
                )}
              </div>
            )}
            {changeStats?.unchanged && (
              <div className="mt-3 flex items-center gap-2 rounded-lg border border-border bg-muted/30 px-4 py-2.5">
                <span className="text-xs text-muted-foreground">
                  No changes since your last search for this subject.
                </span>
              </div>
            )}

            {/* Record Profile Summary */}
            <div id="source-profile" className="mt-10 mb-6 scroll-mt-24">
              <ErrorBoundary><RecordProfileSummary name={name} state={state} results={results} /></ErrorBoundary>
            </div>

            {/* Editorial Brief */}
            <div id="source-briefing" className="mb-6 scroll-mt-24">
              <ErrorBoundary><AiSubjectSummary name={name} state={state} results={results} /></ErrorBoundary>
            </div>

            {/* Connection Alerts */}
            <div id="source-cross-refs" className="mb-12 scroll-mt-24">
              <ErrorBoundary><CrossReferenceAlerts results={results} searchName={name} /></ErrorBoundary>
            </div>

            {/* Section Divider */}
            <div className="relative my-10">
              <Separator />
              <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-background px-4 text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
                Source Records
              </span>
            </div>

            {/* Source Records with sticky TOC */}
            <div className="flex gap-8 relative">
              <TocSidebar items={tocItems} activeSection={activeSection} onNavigate={scrollToSection} />

              <div className="flex-1 min-w-0 space-y-2">
                {entityClusters.length > 0 && (
                  <div id="source-entities" className="scroll-mt-24">
                    <ErrorBoundary><EntityClusterCard clusters={entityClusters} /></ErrorBoundary>
                  </div>
                )}

                {Object.entries(CATEGORY_META).map(([key, { icon: Icon, label }]) => {
                  const items = (grouped[key] || []).sort((a, b) => (b.relevance ?? 0) - (a.relevance ?? 0));
                  if (items.length === 0) return null;

                  // Count new items in this category for re-search badge
                  const newCount = previousResultIds
                    ? items.filter(i => !previousResultIds.has(i.id)).length
                    : 0;

                  if (key === "court") {
                    return (
                      <div key={key} id={`source-${key}`} className="scroll-mt-24 relative">
                        {newCount > 0 && <NewResultsBadge count={newCount} />}
                        <CourtRecordsSection items={items} name={name} state={state} onViewDetails={setSelectedResult} />
                      </div>
                    );
                  }

                  if (key === "offshore") {
                    return (
                      <div key={key} id={`source-${key}`} className="scroll-mt-24 relative">
                        {newCount > 0 && <NewResultsBadge count={newCount} />}
                        <OffshoreLeaksSection items={items} name={name} state={state} onViewDetails={setSelectedResult} />
                      </div>
                    );
                  }

                  return (
                    <div key={key} id={`source-${key}`} className="scroll-mt-24 relative">
                      {newCount > 0 && <NewResultsBadge count={newCount} />}
                      <SourceRecordSection categoryKey={key} icon={Icon} label={label} items={items} name={name} onViewDetails={setSelectedResult} />
                    </div>
                  );
                })}

                <div id="source-relationships" className="scroll-mt-24">
                  <ErrorBoundary><RelationshipMap results={results} searchName={name} /></ErrorBoundary>
                </div>

                {/* Contact Intelligence — gated to Investigator+ */}
                <div id="source-contact-intel" className="scroll-mt-24">
                  <UpgradeGate requiredTier="investigator" featureName="Contact Intelligence" hasAccess={gating.canUseContactIntel}>
                    <ErrorBoundary><ContactIntelligence searchName={name} state={state} /></ErrorBoundary>
                  </UpgradeGate>
                </div>

                <div id="source-news-coverage" className="scroll-mt-24 border border-border rounded-lg p-4">
                  <NewsMentions searchQuery={name} defaultExpanded={false} />
                </div>

                {/* Investigative Dossier — gated to Investigator+ */}
                <div id="source-dossier" className="scroll-mt-24">
                  <UpgradeGate requiredTier="investigator" featureName="Investigative Dossier" hasAccess={gating.canUseDossier}>
                    <div className="border border-border rounded-xl overflow-hidden bg-card shadow-sm">
                      <div className="px-5 py-4 border-b border-border">
                        <h2 className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">Investigative Dossier</h2>
                        <p className="text-xs text-muted-foreground mt-0.5">Timeline, campaign finance, court records & public records directory</p>
                      </div>
                      <div className="p-4">
                        <ErrorBoundary><DossierView searchName={name} state={state} /></ErrorBoundary>
                      </div>
                    </div>
                  </UpgradeGate>
                </div>

                {/* Deep Research Analyst — gated to Investigator+ */}
                <div id="source-deep-research" className="scroll-mt-24">
                  <UpgradeGate requiredTier="investigator" featureName="Deep Research Analyst" hasAccess={gating.canUseDeepResearch}>
                    <ErrorBoundary><DeepResearchAnalyst name={name} state={state} results={results} /></ErrorBoundary>
                  </UpgradeGate>
                </div>

                <div id="source-foia" className="scroll-mt-24">
                  <ErrorBoundary><FoiaLetterGenerator name={name} state={state} results={results} /></ErrorBoundary>
                </div>

                <div id="source-checklist" className="scroll-mt-24">
                  <Collapsible>
                    <CollapsibleTrigger className="w-full flex items-center justify-between py-3 px-4 border border-border rounded-lg hover:bg-muted/30 transition-colors group">
                      <span className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Reporter's Checklist</span>
                      <ChevronRight className="h-4 w-4 text-muted-foreground transition-transform group-data-[state=open]:rotate-90" />
                    </CollapsibleTrigger>
                    <CollapsibleContent className="pt-4 pb-2">
                      <ErrorBoundary><ReportersChecklist name={name} state={state} results={results} /></ErrorBoundary>
                    </CollapsibleContent>
                  </Collapsible>
                </div>
              </div>
            </div>
          </>
        ) : null}
      </main>

      {hasResults && (
        <MobileToc items={tocItems} activeSection={activeSection} onNavigate={scrollToSection} />
      )}

      {hasResults && (
        <div className="border-t border-border bg-muted/30 px-4 py-6 text-center">
          <p className="text-[11px] text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            Record matches do not confirm identity or imply wrongdoing. All findings require independent verification prior to publication.
          </p>
        </div>
      )}
      <Footer />

      <RecordDetailModal result={selectedResult} onClose={() => setSelectedResult(null)} categoryMeta={categoryForResult} />
    </div>
  );
};

export default SearchResults;
