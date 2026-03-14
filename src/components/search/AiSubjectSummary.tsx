import { useState, useEffect, useMemo } from "react";
import { Loader2, AlertCircle, ChevronDown, Search, CheckCircle, Newspaper, Link2, ExternalLink } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { detectCrossReferences } from "@/lib/crossReferences";
import type { RecordResult } from "@/lib/recordsApi";

interface Finding {
  flag: "red" | "yellow" | "green" | "blue";
  title: string;
  detail: string;
  database: string;
  actionable: boolean;
}

interface StoryAngle {
  angle: string;
  description: string;
  difficulty: "Beginner" | "Intermediate" | "Advanced";
}

interface Briefing {
  summary: string;
  riskLevel: "low" | "moderate" | "elevated" | "high";
  findings: Finding[];
  nextSteps: string[];
  storyAngles: StoryAngle[];
  crossReferences?: string[];
}

interface AiSubjectSummaryProps {
  name: string;
  state: string;
  results: RecordResult[];
}

/** Map a finding's database field to an external source URL */
function getDatabaseSourceUrl(database: string, name: string, _state: string): string | null {
  const db = database.toLowerCase();
  const enc = encodeURIComponent(name);
  if (db.includes("fec") || db.includes("campaign")) return `https://www.fec.gov/data/receipts/?contributor_name=${enc}`;
  if (db.includes("sunbiz") || db.includes("florida")) return `https://search.sunbiz.org/Inquiry/CorporationSearch/SearchResults?searchTerm=${enc}`;
  if (db.includes("sec") || db.includes("edgar")) return `https://www.sec.gov/cgi-bin/browse-edgar?company=${enc}&action=getcompany`;
  if (db.includes("icij") || db.includes("offshore")) return `https://offshoreleaks.icij.org/search?q=${enc}`;
  if (db.includes("usaspending") || db.includes("contract") || db.includes("grant")) return `https://www.usaspending.gov/search`;
  if (db.includes("court") || db.includes("pacer")) return `https://www.courtlistener.com/?q=${enc}&type=r&order_by=score+desc`;
  if (db.includes("sanction") || db.includes("pep") || db.includes("opensanctions")) return `https://www.opensanctions.org/search/?q=${enc}`;
  if (db.includes("propublica") || db.includes("nonprofit")) return `https://projects.propublica.org/nonprofits/search?q=${enc}`;
  if (db.includes("lobbying") || db.includes("lda") || db.includes("senate")) return `https://lda.senate.gov/filings/public/filing/search/?client_name=${enc}`;
  if (db.includes("faa") || db.includes("aircraft")) return `https://registry.faa.gov/AircraftInquiry/Search/NameResult?Nametxt=${enc}`;
  if (db.includes("gdelt") || db.includes("news")) return null;
  return null;
}



const SectionHeading = ({ children, onClick, expanded, count }: { children: React.ReactNode; onClick: () => void; expanded: boolean; count?: number }) => (
  <button
    onClick={onClick}
    className="w-full flex items-center justify-between px-5 py-3 border-b border-border/50 hover:bg-muted/30 transition-colors"
  >
    <span className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
      {children}
      {count !== undefined && (
        <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-muted text-muted-foreground">
          {count}
        </span>
      )}
    </span>
    <ChevronDown className={`h-4 w-4 text-muted-foreground transition-transform ${expanded ? "rotate-180" : ""}`} />
  </button>
);

const AiSubjectSummary = ({ name, state, results }: AiSubjectSummaryProps) => {
  const { user } = useAuth();
  const [expandedSections, setExpandedSections] = useState({
    findings: true,
    steps: true,
    angles: false,
    crossRefs: false,
  });

  const toggleSection = (key: keyof typeof expandedSections) => {
    setExpandedSections(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const resultsSummary = (() => {
    if (results.length === 0) return "";
    const categoryCounts: Record<string, { count: number; highlights: string[] }> = {};
    for (const r of results) {
      if (!categoryCounts[r.category]) categoryCounts[r.category] = { count: 0, highlights: [] };
      categoryCounts[r.category].count++;
      if (categoryCounts[r.category].highlights.length < 3) categoryCounts[r.category].highlights.push(r.description);
    }
    return Object.entries(categoryCounts)
      .map(([cat, { count, highlights }]) => `${cat}: ${count} record(s). Examples: ${highlights.join("; ")}`)
      .join("\n");
  })();

  const { data: briefingData, isLoading: loading, error: queryError } = useQuery({
    queryKey: ["subject-briefing", name, state],
    queryFn: async () => {
      const { data, error: fnError } = await supabase.functions.invoke("subject-summary", {
        body: { name, state, resultsSummary },
      });
      if (fnError) throw fnError;
      if (data?.error) throw new Error(data.error);
      return data as { briefing?: Briefing; summary?: string };
    },
    enabled: results.length > 0 && !!name && name.length >= 2,
    staleTime: 1000 * 60 * 30,
  });

  const briefing = briefingData?.briefing ?? null;
  const fallbackSummary = briefingData?.summary ?? "";
  const error = queryError ? (queryError instanceof Error ? queryError.message : "Could not generate briefing") : "";

  // Client-side cross-reference detection merged with AI-generated ones
  const allCrossReferences = useMemo(() => {
    const clientRefs = detectCrossReferences(results, name);
    const aiRefs = briefing?.crossReferences || [];
    // Merge, deduplicate by normalized content
    const seen = new Set<string>();
    const merged: string[] = [];
    for (const ref of [...clientRefs, ...aiRefs]) {
      const key = ref.toLowerCase().replace(/[^a-z0-9]/g, "");
      if (!seen.has(key)) {
        seen.add(key);
        merged.push(ref);
      }
    }
    return merged;
  }, [results, name, briefing?.crossReferences]);

  // Persist risk_level and flag counts when briefing arrives
  useEffect(() => {
    if (!briefing || !user) return;
    const flagCount: Record<string, number> = { red: 0, yellow: 0, green: 0, blue: 0 };
    for (const f of (briefing.findings || [])) {
      if (flagCount[f.flag] !== undefined) flagCount[f.flag]++;
    }
    supabase
      .from("searches")
      .update({ risk_level: briefing.riskLevel, flag_count: flagCount })
      .eq("user_id", user.id)
      .eq("subject_name", name)
      .eq("state", state)
      .order("created_at", { ascending: false })
      .limit(1)
      .then(() => {});
  }, [briefing, user, name, state]);

  if (results.length === 0) return null;

  return (
    <div
      className="border border-border rounded-xl overflow-hidden bg-card shadow-sm"
      data-briefing-summary={briefing?.summary || fallbackSummary || ""}
      data-briefing-findings={briefing?.findings ? JSON.stringify(briefing.findings) : ""}
      data-briefing-nextsteps={briefing?.nextSteps ? JSON.stringify(briefing.nextSteps) : ""}
      data-briefing-crossrefs={allCrossReferences.length > 0 ? JSON.stringify(allCrossReferences) : ""}
    >
      {/* Header */}
      <div className="px-5 py-4 border-b border-border">
        <h2 className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
          Subject Briefing
        </h2>
        {briefing && (
          <p className="text-xs text-muted-foreground mt-0.5">
            {results.length} records across multiple databases
          </p>
        )}
      </div>

      {loading ? (
        <div className="flex items-center gap-2 text-sm text-muted-foreground py-8 px-5 justify-center">
          <Loader2 className="h-4 w-4 animate-spin" />
          Analyzing records and generating structured briefing…
        </div>
      ) : error ? (
        <div className="flex items-center gap-2 text-sm text-muted-foreground py-6 px-5 justify-center">
          <AlertCircle className="h-3.5 w-3.5" />
          {error}
        </div>
      ) : fallbackSummary ? (
        <div className="p-5">
          <p className="text-sm text-foreground leading-relaxed">{fallbackSummary}</p>
        </div>
      ) : briefing ? (
        <>
          {/* Four-sentence summary */}
          <div className="px-5 py-4 border-b border-border">
            <p className="text-sm text-foreground leading-relaxed font-body">{briefing.summary}</p>
          </div>

          {/* Key Findings */}
          <div>
            <SectionHeading onClick={() => toggleSection("findings")} expanded={expandedSections.findings} count={briefing.findings.length}>
              <Search className="h-3.5 w-3.5" />
              Key Findings
            </SectionHeading>

            {expandedSections.findings && (
              <div className="px-5 py-4 space-y-3">
                {briefing.findings.map((finding, i) => (
                  <div key={i} className="p-4 rounded-lg border border-border bg-muted/20">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <h4 className="text-sm font-bold text-foreground">{finding.title}</h4>
                      <span className="text-[11px] text-muted-foreground bg-muted px-2 py-0.5 rounded">
                        {finding.database}
                      </span>
                    </div>
                    <p className="text-[13px] text-foreground/80 leading-relaxed">{finding.detail}</p>
                    {(() => {
                      const url = getDatabaseSourceUrl(finding.database, name, state);
                      return url ? (
                        <a
                          href={url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-[12px] text-accent hover:underline mt-2"
                        >
                          <ExternalLink className="h-3 w-3" /> View Records ↗
                        </a>
                      ) : null;
                    })()}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Next Steps */}
          <div>
            <SectionHeading onClick={() => toggleSection("steps")} expanded={expandedSections.steps}>
              <CheckCircle className="h-3.5 w-3.5" />
              Next Steps
            </SectionHeading>

            {expandedSections.steps && (
              <div className="px-5 py-4">
                {briefing.nextSteps.map((step, i) => (
                  <div key={i} className="flex gap-3 items-start py-2.5 border-b border-border/30 last:border-0">
                    <div className="w-6 h-6 rounded-full bg-muted border border-border flex items-center justify-center text-[11px] font-bold text-muted-foreground shrink-0 mt-0.5">
                      {i + 1}
                    </div>
                    <p className="text-[13px] text-foreground leading-relaxed">{step}</p>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Story Angles */}
          {briefing.storyAngles && briefing.storyAngles.length > 0 && (
            <div>
              <SectionHeading onClick={() => toggleSection("angles")} expanded={expandedSections.angles}>
                <Newspaper className="h-3.5 w-3.5" />
                Story Angles
              </SectionHeading>

              {expandedSections.angles && (
                <div className="px-5 py-4 space-y-3">
                  {briefing.storyAngles.map((angle, i) => (
                    <div key={i} className="p-4 rounded-lg border border-border bg-muted/20">
                      <h4 className="text-sm font-normal text-foreground mb-1">{angle.angle}</h4>
                      <p className="text-[13px] text-muted-foreground leading-relaxed">{angle.description}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Cross-References */}
          {allCrossReferences.length > 0 && (
            <div>
              <SectionHeading onClick={() => toggleSection("crossRefs")} expanded={expandedSections.crossRefs} count={allCrossReferences.length}>
                <Link2 className="h-3.5 w-3.5" />
                Cross-References
              </SectionHeading>

              {expandedSections.crossRefs && (
                <div className="px-5 py-4 space-y-2">
                  {allCrossReferences.map((ref, i) => (
                    <div key={i} className="flex gap-2.5 items-start p-3 rounded-lg bg-muted/30 border border-border/50">
                      <span className="text-muted-foreground shrink-0">🔗</span>
                      <p className="text-[13px] text-foreground leading-relaxed">{ref}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </>
      ) : null}
    </div>
  );
};

export default AiSubjectSummary;
