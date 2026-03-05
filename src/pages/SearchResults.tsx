import { useSearchParams, Link, useNavigate } from "react-router-dom";
import { Building2, Vote, Scale, Home, BadgeCheck, ExternalLink, ArrowLeft, AlertCircle, FileText, ChevronRight, List, Newspaper } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import Header from "@/components/landing/Header";
import Footer from "@/components/landing/Footer";
import AiSubjectSummary from "@/components/search/AiSubjectSummary";
import DeepResearchAnalyst from "@/components/search/DeepResearchAnalyst";
import NameMatchBadge from "@/components/search/NameMatchBadge";
import { getNameMatchConfidence } from "@/lib/nameMatch";
import { useState, useEffect, useMemo, useCallback, useRef } from "react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { searchAll, type MockResult, type ApiDebugInfo, type SearchOptions } from "@/lib/recordsApi";
import { sanitizeInput, sanitizeUrlParam, isValidName, isValidState } from "@/utils/validation";
import ErrorBoundary from "@/components/ErrorBoundary";
import DossierView from "@/components/dossier/DossierView";
import ReportersChecklist from "@/components/search/ReportersChecklist";
import NewsMentions from "@/components/NewsMentions";
import SaveToInvestigationDropdown from "@/components/search/SaveToInvestigationDropdown";





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


/* Collapsible source record section for a single category */
const SourceRecordSection = ({
  categoryKey, icon: Icon, label, items, name, onViewDetails,
}: {
  categoryKey: string;
  icon: typeof Building2;
  label: string;
  items: MockResult[];
  name: string;
  onViewDetails: (r: MockResult) => void;
}) => (
  <Collapsible>
    <CollapsibleTrigger className="w-full flex items-center justify-between py-3 px-4 border border-border rounded-lg hover:bg-muted/30 transition-colors group">
      <span className="flex items-center gap-2">
        <Icon className="h-4 w-4 text-muted-foreground" />
        <span className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">{label}</span>
        <span className="text-[10px] text-muted-foreground/70">({items.length})</span>
      </span>
      <ChevronRight className="h-4 w-4 text-muted-foreground transition-transform group-data-[state=open]:rotate-90" />
    </CollapsibleTrigger>
    <CollapsibleContent className="pt-3 pb-1 space-y-2 pl-4">
      {items.map((item) => (
        <div key={item.id} className="border border-border rounded-lg p-4 bg-card flex flex-col gap-3">
          <div className="flex flex-col sm:flex-row sm:items-start gap-3">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <p className="text-sm font-semibold text-foreground">{item.source}</p>
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
              <Button variant="outline" size="sm" className="gap-1.5" onClick={() => onViewDetails(item)}>
                <ExternalLink className="h-3.5 w-3.5" /> View
              </Button>
              <SaveToInvestigationDropdown result={item} />
            </div>
          </div>
          {/* Direct outbound source link */}
          {item.sourceUrl && (
            <div className="text-right">
              <a
                href={item.sourceUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[12px] text-muted-foreground hover:text-foreground underline underline-offset-2"
              >
                Source: {item.source} ↗
              </a>
            </div>
          )}
        </div>
      ))}
    </CollapsibleContent>
  </Collapsible>
);

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
  const [searchTimestamp, setSearchTimestamp] = useState<Date | null>(null);
  const { toast } = useToast();
  const { user, subscribed, subscriptionLoading, loading: authLoading } = useAuth();

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
          setSearchTimestamp(new Date());
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



  const grouped = results.reduce<Record<string, MockResult[]>>((acc, r) => {
    (acc[r.category] ??= []).push(r);
    return acc;
  }, {});

  const tocItems = useMemo(() => {
    const items: { id: string; label: string; count?: number }[] = [];
    items.push({ id: "source-briefing", label: "AI Subject Briefing" });
    for (const [key, { label }] of Object.entries(CATEGORY_META)) {
      const count = grouped[key]?.length ?? 0;
      if (count > 0) items.push({ id: `source-${key}`, label, count });
    }
    items.push({ id: "source-news-coverage", label: "News Coverage" });
    items.push({ id: "source-dossier", label: "Investigative Dossier" });
    items.push({ id: "source-deep-research", label: "Deep Research Analyst" });
    items.push({ id: "source-checklist", label: "Reporter's Checklist" });
    return items;
  }, [results, grouped]);

  const [activeSection, setActiveSection] = useState("source-briefing");
  const activeSectionRef = useRef(activeSection);
  activeSectionRef.current = activeSection;

  useEffect(() => {
    if (tocItems.length === 0) return;
    const sectionIds = tocItems.map((t) => t.id);
    const ratios = new Map<string, number>();

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          ratios.set(entry.target.id, entry.intersectionRatio);
        }
        let best = "";
        let bestRatio = -1;
        for (const id of sectionIds) {
          const r = ratios.get(id) ?? 0;
          if (r > bestRatio) {
            bestRatio = r;
            best = id;
          }
        }
        if (best && bestRatio > 0) {
          setActiveSection(best);
        }
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

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      <main className="flex-1 container mx-auto px-4 lg:px-8 py-10 max-w-5xl">
        <Link to="/" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground mb-6">
          <ArrowLeft className="h-4 w-4" /> Back to search
        </Link>

        {/* 1. Search Header */}
        <h1 className="font-heading text-2xl md:text-3xl font-bold text-foreground">
          Results for: <span className="text-accent">{name}</span>{state !== "All States / National" ? ` in ${state}` : " (National)"}
        </h1>

        {loading ? (
          <p className="text-muted-foreground mt-3 text-sm">Searching public records…</p>
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
          <>
            <p className="text-muted-foreground mt-1 text-sm">
              {results.length} records found across multiple databases
              {searchTimestamp && (
                <span className="text-muted-foreground/50 ml-2 text-xs">
                  · Generated {searchTimestamp.toLocaleString("en-US", { month: "short", day: "numeric", year: "numeric", hour: "numeric", minute: "2-digit" })}
                </span>
              )}
            </p>

            {/* 2. Editorial Brief — full width, generous spacing */}
            <div id="source-briefing" className="mt-10 mb-12 scroll-mt-24">
              <ErrorBoundary><AiSubjectSummary name={name} state={state} results={results} /></ErrorBoundary>
            </div>

            {/* 3. Section Divider */}
            <div className="relative my-10">
              <Separator />
              <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-background px-4 text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
                Source Records
              </span>
            </div>

            {/* 4. Source Records with sticky TOC */}
            <div className="flex gap-8 relative">
              {/* Sticky TOC sidebar */}
              <nav className="hidden lg:block w-48 shrink-0">
                <div className="sticky top-24">
                  <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground mb-3 flex items-center gap-1.5">
                    <List className="h-3 w-3" /> Contents
                  </p>
                  <ul className="space-y-1 pl-3">
                    {tocItems.map((item) => {
                      const isActive = activeSection === item.id;
                      return (
                        <li key={item.id}>
                          <a
                            href={`#${item.id}`}
                            onClick={(e) => {
                              e.preventDefault();
                              scrollToSection(item.id);
                            }}
                            className={`block text-[11px] py-1 leading-tight ${
                              isActive
                                ? "text-foreground border-l-2 border-foreground pl-3 -ml-[2px]"
                                : "text-muted-foreground hover:text-foreground pl-3"
                            }`}
                          >
                            {item.label}
                            {item.count !== undefined && (
                              <span className="text-muted-foreground/50 ml-1">({item.count})</span>
                            )}
                          </a>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              </nav>

              {/* Main source records column */}
              <div className="flex-1 min-w-0 space-y-2">
                {Object.entries(CATEGORY_META).map(([key, { icon: Icon, label }]) => {
                  const items = (grouped[key] || []).sort((a, b) => (b.relevance ?? 0) - (a.relevance ?? 0));
                  if (items.length === 0) return null;
                  return (
                    <div key={key} id={`source-${key}`} className="scroll-mt-24">
                      <SourceRecordSection
                        categoryKey={key}
                        icon={Icon}
                        label={label}
                        items={items}
                        name={name}
                        onViewDetails={setSelectedResult}
                      />
                    </div>
                  );
                })}

                {/* News Coverage section */}
                <div id="source-news-coverage" className="scroll-mt-24 border border-border rounded-lg p-4">
                  <NewsMentions searchQuery={name} defaultExpanded={false} />
                </div>

                {/* Dossier deep-dive sections as collapsible */}
                <div id="source-dossier" className="scroll-mt-24">
                  <Collapsible>
                    <CollapsibleTrigger className="w-full flex items-center justify-between py-3 px-4 border border-border rounded-lg hover:bg-muted/30 transition-colors group">
                      <span className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Investigative Dossier</span>
                      <ChevronRight className="h-4 w-4 text-muted-foreground transition-transform group-data-[state=open]:rotate-90" />
                    </CollapsibleTrigger>
                    <CollapsibleContent className="pt-4 pb-2">
                      <ErrorBoundary><DossierView searchName={name} state={state} /></ErrorBoundary>
                    </CollapsibleContent>
                  </Collapsible>
                </div>

                <div id="source-deep-research" className="scroll-mt-24">
                  <Collapsible>
                    <CollapsibleTrigger className="w-full flex items-center justify-between py-3 px-4 border border-border rounded-lg hover:bg-muted/30 transition-colors group">
                      <span className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Deep Research Analyst</span>
                      <ChevronRight className="h-4 w-4 text-muted-foreground transition-transform group-data-[state=open]:rotate-90" />
                    </CollapsibleTrigger>
                    <CollapsibleContent className="pt-4 pb-2">
                      <ErrorBoundary><DeepResearchAnalyst name={name} state={state} results={results} /></ErrorBoundary>
                    </CollapsibleContent>
                  </Collapsible>
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
        )}
      </main>

      {/* 5. Footer Disclaimer */}
      {!loading && results.length > 0 && (
        <div className="border-t border-border bg-muted/30 px-4 py-6 text-center">
          <p className="text-[11px] text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            Record matches do not confirm identity or imply wrongdoing. All findings require independent verification prior to publication.
          </p>
        </div>
      )}
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
                        <dd className="text-muted-foreground">{typeof value === "object" ? JSON.stringify(value) : String(value ?? "N/A")}</dd>
                      </div>
                    ))}
                  </dl>
                </div>

                {/* What This Means — ICIJ */}
                {selectedResult.category === "offshore" && selectedResult.id !== "icij-summary" && (
                  <div className="bg-info-bg/30 border border-info-border rounded-lg p-3 mt-2">
                    <h4 className="text-xs font-semibold uppercase tracking-wide text-info mb-1.5">What This Means</h4>
                    <p className="text-xs text-muted-foreground leading-relaxed mb-2">
                      This record shows an offshore entity that appeared in leaked documents. The entity is classified as: <strong>{selectedResult.details?.Type || "Offshore Entity"}</strong>.
                    </p>
                    <p className="text-xs font-medium text-foreground mb-1">🔍 Next Steps for Reporters:</p>
                    <ul className="text-xs text-muted-foreground space-y-1 list-disc pl-4">
                      <li>Check if this entity name matches your subject — common name elements may produce coincidental matches</li>
                      <li>Click "View on ICIJ" to see the full network graph showing connected officers, addresses, and intermediaries</li>
                      <li>Cross-reference any addresses or officer names against business filings and other sources in this search</li>
                    </ul>
                    <p className="text-[11px] text-muted-foreground italic mt-2">This listing does not imply any illegal conduct.</p>
                  </div>
                )}

                {/* What This Means — PEP vs Sanctions */}
                {selectedResult.category === "sanctions" && selectedResult.id !== "sanctions-summary" && (() => {
                  const topics = (selectedResult.details?.Topics || "").toLowerCase();
                  const datasets = (selectedResult.details?.["Sanctions Lists"] || "").toLowerCase();
                  const isPEP = topics.includes("pep") || topics.includes("politic") || datasets.includes("pep") || datasets.includes("congress") || datasets.includes("politician") || datasets.includes("everypolitician");
                  const isSanction = topics.includes("sanction") || datasets.includes("ofac") || datasets.includes("sdn") || datasets.includes("sanction");
                  return isPEP && !isSanction ? (
                    <div className="bg-info-bg/30 border border-info-border rounded-lg p-3 mt-2">
                      <h4 className="text-xs font-semibold uppercase tracking-wide text-info mb-1.5">👤 Politically Exposed Person (PEP)</h4>
                      <p className="text-xs text-muted-foreground leading-relaxed">
                        PEP status means this person holds or held a public office. This is standard for elected officials and government appointees — it does NOT indicate sanctions, criminal activity, or wrongdoing. PEP databases exist to flag potential conflicts of interest in financial transactions.
                      </p>
                      <p className="text-xs font-medium text-foreground mt-2 mb-1">🔍 Next Steps:</p>
                      <ul className="text-xs text-muted-foreground space-y-1 list-disc pl-4">
                        <li>Check campaign finance records for related donations</li>
                        <li>Review any disclosed financial interests</li>
                        <li>Cross-reference with lobbying registrations</li>
                      </ul>
                    </div>
                  ) : isSanction ? (
                    <div className="bg-destructive/5 border border-destructive/20 rounded-lg p-3 mt-2">
                      <h4 className="text-xs font-semibold uppercase tracking-wide text-destructive mb-1.5">🚨 Sanctions List Match</h4>
                      <p className="text-xs text-muted-foreground leading-relaxed">
                        This entity appears on one or more international sanctions lists. Sanctions are imposed by governments to restrict dealings with specific individuals, companies, or countries.
                      </p>
                      <p className="text-xs text-warning mt-2">⚠️ VERIFY: A name match does NOT confirm this is the same entity. Many entities share similar names.</p>
                      <p className="text-xs font-medium text-foreground mt-2 mb-1">🔍 Next Steps:</p>
                      <ul className="text-xs text-muted-foreground space-y-1 list-disc pl-4">
                        <li>Click "View Details" to check the full sanctions record, including jurisdiction and listed reasons</li>
                        <li>Verify the entity's registered address and officers match your subject</li>
                        <li>Consult OFAC's SDN list for the most current status</li>
                      </ul>
                    </div>
                  ) : null;
                })()}
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
                </div>
              </>
            );
          })()}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default SearchResults;
