import { useState } from "react";
import { FileSearch, Loader2, Copy, Check, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import type { RecordResult } from "@/lib/recordsApi";
import { useToast } from "@/hooks/use-toast";

interface DeepResearchAnalystProps {
  name: string;
  state: string;
  results: RecordResult[];
}

const DeepResearchAnalyst = ({ name, state, results }: DeepResearchAnalystProps) => {
  const [analysis, setAnalysis] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();

  const generateAnalysis = async () => {
    setLoading(true);
    setError("");
    setAnalysis("");

    try {
      const { data, error: fnError } = await supabase.functions.invoke("deep-research", {
        body: { name, state, results },
      });

      if (fnError) {
        setError("Could not generate analysis. Please try again.");
        console.error("Deep research error:", fnError);
      } else if (data?.error) {
        setError(data.error);
      } else {
        setAnalysis(data?.analysis || "");
      }
    } catch {
      setError("Could not generate analysis. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = async () => {
    try {
      const disclaimer = "\n\nDeep Research Analyst output is for informational purposes only. All findings must be independently verified before publication.";
      await navigator.clipboard.writeText(analysis + disclaimer);
      setCopied(true);
      toast({ title: "Copied to clipboard" });
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast({ title: "Failed to copy", variant: "destructive" });
    }
  };

  if (results.length === 0) return null;

  // Simple markdown-like rendering: bold, headers, line breaks
  const renderAnalysis = (text: string) => {
    const lines = text.split("\n");
    return lines.map((line, i) => {
      const trimmed = line.trim();
      if (!trimmed) return <br key={i} />;

      // Bold headers like **EXECUTIVE SUMMARY**
      if (/^\*\*(.+)\*\*$/.test(trimmed)) {
        const content = trimmed.replace(/^\*\*/, "").replace(/\*\*$/, "");
        return (
          <h3 key={i} className="font-heading text-sm font-bold uppercase tracking-wide text-foreground mt-5 mb-2 first:mt-0">
            {content}
          </h3>
        );
      }

      // Inline bold
      const parts = trimmed.split(/(\*\*[^*]+\*\*)/g);
      const rendered = parts.map((part, j) => {
        if (part.startsWith("**") && part.endsWith("**")) {
          return <strong key={j}>{part.slice(2, -2)}</strong>;
        }
        return part;
      });

      // Bullet points
      if (trimmed.startsWith("- ") || trimmed.startsWith("• ")) {
        return (
          <li key={i} className="text-sm text-foreground/90 leading-relaxed ml-4 list-disc">
            {rendered.slice(0).map((r, idx) => typeof r === 'string' && idx === 0 ? r.replace(/^[-•]\s*/, '') : r)}
          </li>
        );
      }

      // Numbered items
      if (/^\d+\.\s/.test(trimmed)) {
        return (
          <li key={i} className="text-sm text-foreground/90 leading-relaxed ml-4 list-decimal">
            {rendered.map((r, idx) => typeof r === 'string' && idx === 0 ? r.replace(/^\d+\.\s*/, '') : r)}
          </li>
        );
      }

      return (
        <p key={i} className="text-sm text-foreground/90 leading-relaxed">
          {rendered}
        </p>
      );
    });
  };

  return (
    <section className="mt-10">
      {/* Header bar */}
      <div className="bg-primary rounded-t-lg px-5 py-3 flex items-center gap-2.5">
        <FileSearch className="h-4.5 w-4.5 text-primary-foreground/80" />
        <h2 className="font-heading text-sm font-semibold uppercase tracking-wider text-primary-foreground">
          Deep Research Analyst
        </h2>
      </div>

      <div className="border border-t-0 border-border rounded-b-lg bg-card p-5">
        {!analysis && !loading && !error && (
          <div className="flex flex-col items-center gap-3 py-4">
            <p className="text-sm text-muted-foreground text-center max-w-md">
              Generate a comprehensive investigative analysis from all {results.length} records found across multiple databases.
            </p>
            <Button
              onClick={generateAnalysis}
              variant="accent"
              size="sm"
              className="gap-2"
            >
              <FileSearch className="h-4 w-4" />
              Generate Analysis
            </Button>
          </div>
        )}

        {loading && (
          <div className="flex items-center gap-2.5 text-sm text-muted-foreground py-6 justify-center">
            <Loader2 className="h-4 w-4 animate-spin" />
            Analyzing {results.length} records across all databases…
          </div>
        )}

        {error && !loading && (
          <div className="flex flex-col items-center gap-3 py-4">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <AlertCircle className="h-4 w-4" />
              {error}
            </div>
            <Button onClick={generateAnalysis} variant="outline" size="sm">
              Try Again
            </Button>
          </div>
        )}

        {analysis && !loading && (
          <>
            {/* Analysis card with gold left border */}
            <div className="border-l-4 border-[hsl(42,70%,55%)] bg-muted/30 rounded-r-md p-5 space-y-1">
              {renderAnalysis(analysis)}
            </div>

            <div className="flex items-center justify-between mt-4">
              <p className="text-xs text-muted-foreground italic max-w-lg">
                Deep Research Analyst output is for informational purposes only. All findings must be independently verified before publication.
              </p>
              <div className="flex items-center gap-2 shrink-0 ml-4">
                <Button
                  variant="outline"
                  size="sm"
                  className="gap-1.5"
                  onClick={copyToClipboard}
                >
                  {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                  {copied ? "Copied" : "Copy Analysis"}
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={generateAnalysis}
                  className="text-muted-foreground"
                >
                  Regenerate
                </Button>
              </div>
            </div>
          </>
        )}
      </div>
    </section>
  );
};

export default DeepResearchAnalyst;
