import { useState, useEffect } from "react";
import { Sparkles, Loader2, AlertCircle, ChevronDown, Search, CheckCircle, Newspaper, Link2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
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

const FLAG_STYLES: Record<string, { icon: string; label: string; bg: string; border: string; text: string }> = {
  red: { icon: "🔴", label: "Investigate", bg: "bg-destructive/5", border: "border-destructive/20", text: "text-destructive" },
  yellow: { icon: "🟡", label: "Notable", bg: "bg-warning-bg", border: "border-warning-border", text: "text-warning" },
  green: { icon: "🟢", label: "Routine", bg: "bg-success-bg", border: "border-success-border", text: "text-success" },
  blue: { icon: "🔵", label: "Context", bg: "bg-info-bg", border: "border-info-border", text: "text-info" },
};

const RISK_STYLES: Record<string, { label: string; bg: string; dot: string; text: string }> = {
  low: { label: "Low", bg: "bg-success-bg", dot: "bg-success", text: "text-success" },
  moderate: { label: "Moderate", bg: "bg-info-bg", dot: "bg-info", text: "text-info" },
  elevated: { label: "Elevated", bg: "bg-warning-bg", dot: "bg-warning", text: "text-warning" },
  high: { label: "High", bg: "bg-destructive/10", dot: "bg-destructive", text: "text-destructive" },
};

const DIFFICULTY_STYLES: Record<string, { bg: string; text: string }> = {
  Beginner: { bg: "bg-success-bg", text: "text-success" },
  Intermediate: { bg: "bg-warning-bg", text: "text-warning" },
  Advanced: { bg: "bg-destructive/10", text: "text-destructive" },
};

const AiSubjectSummary = ({ name, state, results }: AiSubjectSummaryProps) => {
  const { user } = useAuth();
  const [briefing, setBriefing] = useState<Briefing | null>(null);
  const [fallbackSummary, setFallbackSummary] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [expandedSections, setExpandedSections] = useState({
    findings: true,
    steps: true,
    angles: false,
    crossRefs: false,
  });

  const toggleSection = (key: keyof typeof expandedSections) => {
    setExpandedSections(prev => ({ ...prev, [key]: !prev[key] }));
  };

  useEffect(() => {
    if (results.length === 0) {
      setLoading(false);
      return;
    }

    const categoryCounts: Record<string, { count: number; highlights: string[] }> = {};
    for (const r of results) {
      if (!categoryCounts[r.category]) {
        categoryCounts[r.category] = { count: 0, highlights: [] };
      }
      categoryCounts[r.category].count++;
      if (categoryCounts[r.category].highlights.length < 3) {
        categoryCounts[r.category].highlights.push(r.description);
      }
    }

    const resultsSummary = Object.entries(categoryCounts)
      .map(([cat, { count, highlights }]) =>
        `${cat}: ${count} record(s). Examples: ${highlights.join("; ")}`
      )
      .join("\n");

    let cancelled = false;
    setLoading(true);
    setError("");

    supabase.functions
      .invoke("subject-summary", {
        body: { name, state, resultsSummary },
      })
      .then(({ data, error: fnError }) => {
        if (cancelled) return;
        if (fnError) {
          setError("Could not generate briefing");
          console.error("Summary error:", fnError);
        } else if (data?.error) {
          setError(data.error);
        } else if (data?.briefing) {
          setBriefing(data.briefing);
          // Persist risk_level and flag counts to the search record
          if (user) {
            const flagCount: Record<string, number> = { red: 0, yellow: 0, green: 0, blue: 0 };
            for (const f of (data.briefing.findings || [])) {
              if (flagCount[f.flag] !== undefined) flagCount[f.flag]++;
            }
            supabase
              .from("searches")
              .update({ risk_level: data.briefing.riskLevel, flag_count: flagCount })
              .eq("user_id", user.id)
              .eq("subject_name", name)
              .eq("state", state)
              .order("created_at", { ascending: false })
              .limit(1)
              .then(() => {});
          }
          // Fallback plain text
          setFallbackSummary(data.summary);
        }
        setLoading(false);
      })
      .catch(() => {
        if (!cancelled) {
          setError("Could not generate briefing");
          setLoading(false);
        }
      });

    return () => { cancelled = true; };
  }, [name, state, results]);

  if (results.length === 0) return null;

  const risk = briefing ? (RISK_STYLES[briefing.riskLevel] || RISK_STYLES.moderate) : null;

  return (
    <div className="border border-accent/30 rounded-xl overflow-hidden bg-card shadow-sm">
      {/* Header */}
      <div className="bg-gradient-to-r from-accent/5 to-accent/10 px-5 py-4 border-b border-accent/20 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <Sparkles className="h-5 w-5 text-accent" />
          <div>
            <h2 className="font-heading text-sm font-semibold uppercase tracking-wider text-accent">
              AI Subject Briefing
            </h2>
            {briefing && (
              <p className="text-xs text-muted-foreground mt-0.5">
                {results.length} records across multiple databases
              </p>
            )}
          </div>
        </div>
        {risk && (
          <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full ${risk.bg} border border-current/10`}>
            <div className={`w-2 h-2 rounded-full ${risk.dot}`} />
            <span className={`text-xs font-semibold ${risk.text}`}>{risk.label} Interest</span>
          </div>
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
          {/* Executive Summary */}
          <div className="px-5 py-4 border-b border-border">
            <p className="text-sm text-foreground leading-relaxed font-body">{briefing.summary}</p>
          </div>

          {/* Key Findings */}
          <div>
            <button
              onClick={() => toggleSection("findings")}
              className="w-full flex items-center justify-between px-5 py-3 border-b border-border/50 hover:bg-muted/30 transition-colors"
            >
              <span className="flex items-center gap-2 text-sm font-semibold text-foreground">
                <Search className="h-4 w-4" />
                Key Findings
                <span className="bg-accent/10 text-accent text-[11px] font-semibold px-2 py-0.5 rounded-full">
                  {briefing.findings.length}
                </span>
              </span>
              <ChevronDown className={`h-4 w-4 text-muted-foreground transition-transform ${expandedSections.findings ? "rotate-180" : ""}`} />
            </button>

            {expandedSections.findings && (
              <div className="px-5 py-4 space-y-3">
                {briefing.findings.map((finding, i) => {
                  const flag = FLAG_STYLES[finding.flag] || FLAG_STYLES.blue;
                  return (
                    <div key={i} className={`flex gap-3 p-4 rounded-lg ${flag.bg} border ${flag.border}`}>
                      <div className="flex flex-col items-center gap-1 pt-0.5 min-w-[36px]">
                        <span className="text-base">{flag.icon}</span>
                        <span className={`text-[9px] font-bold uppercase tracking-wide ${flag.text}`}>
                          {flag.label}
                        </span>
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1 flex-wrap">
                          <h4 className="text-sm font-bold text-foreground">{finding.title}</h4>
                          <span className="text-[11px] text-muted-foreground bg-muted px-2 py-0.5 rounded">
                            {finding.database}
                          </span>
                        </div>
                        <p className="text-[13px] text-foreground/80 leading-relaxed">{finding.detail}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Recommended Next Steps */}
          <div>
            <button
              onClick={() => toggleSection("steps")}
              className="w-full flex items-center justify-between px-5 py-3 border-b border-border/50 hover:bg-muted/30 transition-colors"
            >
              <span className="flex items-center gap-2 text-sm font-semibold text-foreground">
                <CheckCircle className="h-4 w-4" />
                Recommended Next Steps
              </span>
              <ChevronDown className={`h-4 w-4 text-muted-foreground transition-transform ${expandedSections.steps ? "rotate-180" : ""}`} />
            </button>

            {expandedSections.steps && (
              <div className="px-5 py-4">
                {briefing.nextSteps.map((step, i) => (
                  <div key={i} className="flex gap-3 items-start py-2.5 border-b border-border/30 last:border-0">
                    <div className="w-6 h-6 rounded-full bg-accent/10 border border-accent/30 flex items-center justify-center text-[11px] font-bold text-accent shrink-0 mt-0.5">
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
              <button
                onClick={() => toggleSection("angles")}
                className="w-full flex items-center justify-between px-5 py-3 border-b border-border/50 hover:bg-muted/30 transition-colors"
              >
                <span className="flex items-center gap-2 text-sm font-semibold text-foreground">
                  <Newspaper className="h-4 w-4" />
                  Story Angles
                  <span className="bg-info-bg text-info text-[10px] font-semibold px-2 py-0.5 rounded-full">NEW</span>
                </span>
                <ChevronDown className={`h-4 w-4 text-muted-foreground transition-transform ${expandedSections.angles ? "rotate-180" : ""}`} />
              </button>

              {expandedSections.angles && (
                <div className="px-5 py-4 space-y-3">
                  {briefing.storyAngles.map((angle, i) => {
                    const diff = DIFFICULTY_STYLES[angle.difficulty] || DIFFICULTY_STYLES.Intermediate;
                    return (
                      <div key={i} className="p-4 rounded-lg border border-border bg-muted/20">
                        <div className="flex items-center justify-between mb-2 flex-wrap gap-2">
                          <h4 className="text-sm font-bold text-foreground">{angle.angle}</h4>
                          <span className={`text-[10px] font-semibold uppercase tracking-wide px-2.5 py-1 rounded-full ${diff.bg} ${diff.text}`}>
                            {angle.difficulty}
                          </span>
                        </div>
                        <p className="text-[13px] text-muted-foreground leading-relaxed">{angle.description}</p>
                      </div>
                    );
                  })}
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
