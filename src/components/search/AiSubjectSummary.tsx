import { useState, useEffect } from "react";
import { Sparkles, Loader2, AlertCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import type { RecordResult } from "@/lib/recordsApi";

interface AiSubjectSummaryProps {
  name: string;
  state: string;
  results: RecordResult[];
}

const AiSubjectSummary = ({ name, state, results }: AiSubjectSummaryProps) => {
  const [summary, setSummary] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (results.length === 0) {
      setLoading(false);
      return;
    }

    // Build a compact summary of results for the AI
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
          setError("Could not generate summary");
          console.error("Summary error:", fnError);
        } else if (data?.error) {
          setError(data.error);
        } else {
          setSummary(data?.summary || "");
        }
        setLoading(false);
      })
      .catch(() => {
        if (!cancelled) {
          setError("Could not generate summary");
          setLoading(false);
        }
      });

    return () => { cancelled = true; };
  }, [name, state, results]);

  if (results.length === 0) return null;

  return (
    <div className="border border-accent/30 rounded-lg bg-accent/5 p-5">
      <div className="flex items-center gap-2 mb-3">
        <Sparkles className="h-4 w-4 text-accent" />
        <h2 className="font-heading text-sm font-semibold uppercase tracking-wide text-accent">
          AI Subject Briefing
        </h2>
      </div>
      {loading ? (
        <div className="flex items-center gap-2 text-sm text-muted-foreground py-2">
          <Loader2 className="h-4 w-4 animate-spin" />
          Analyzing records and generating briefing…
        </div>
      ) : error ? (
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <AlertCircle className="h-3.5 w-3.5" />
          {error}
        </div>
      ) : (
        <p className="text-sm text-foreground leading-relaxed">{summary}</p>
      )}
    </div>
  );
};

export default AiSubjectSummary;
