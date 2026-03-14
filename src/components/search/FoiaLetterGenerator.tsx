import { useState } from "react";
import { FileText, Loader2, Copy, Check, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import type { RecordResult } from "@/lib/recordsApi";

interface Props {
  name: string;
  state: string;
  results: RecordResult[];
}

const FoiaLetterGenerator = ({ name, state, results }: Props) => {
  const [letter, setLetter] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();

  const generateLetter = async () => {
    setLoading(true);
    try {
      // Build a compact summary of categories found
      const categoryCounts: Record<string, number> = {};
      for (const r of results) {
        categoryCounts[r.category] = (categoryCounts[r.category] || 0) + 1;
      }
      const categorySummary = Object.entries(categoryCounts)
        .map(([cat, count]) => `${cat}: ${count}`)
        .join(", ");

      const { data, error } = await supabase.functions.invoke("generate-foia-letter", {
        body: { name, state, categorySummary, resultCount: results.length },
      });

      if (error) throw error;
      if (data?.error) throw new Error(data.error);

      setLetter(data.letter || "Could not generate letter.");
    } catch (err) {
      console.error("FOIA generation error:", err);
      toast({
        title: "Error",
        description: err instanceof Error ? err.message : "Could not generate letter",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = async () => {
    if (!letter) return;
    await navigator.clipboard.writeText(letter);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    toast({ title: "Copied", description: "Letter copied to clipboard" });
  };

  const handleDownload = () => {
    if (!letter) return;
    const blob = new Blob([letter], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `FOIA_Request_${name.replace(/\s+/g, "_")}_${new Date().toISOString().split("T")[0]}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="border border-border rounded-xl overflow-hidden bg-card shadow-sm">
      <div className="px-5 py-4 border-b border-border">
        <div className="flex items-center gap-2">
          <FileText className="h-4 w-4 text-muted-foreground" />
          <h2 className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
            FOIA / Public Records Request Generator
          </h2>
        </div>
        <p className="text-xs text-muted-foreground mt-1">
          AI-drafted request letter based on search findings, pre-filled with relevant agencies and record types.
        </p>
      </div>

      <div className="p-5">
        {!letter && !loading && (
          <div className="text-center py-4">
            <p className="text-sm text-muted-foreground mb-4">
              Generate a targeted FOIA/Sunshine Law request letter based on the {results.length} records found for <span className="font-medium text-foreground">{name}</span>.
            </p>
            <Button onClick={generateLetter} variant="outline" size="sm" className="gap-2">
              <FileText className="h-4 w-4" />
              Draft Request Letter
            </Button>
          </div>
        )}

        {loading && (
          <div className="flex items-center justify-center gap-2 py-8">
            <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
            <span className="text-sm text-muted-foreground">Drafting targeted request letter…</span>
          </div>
        )}

        {letter && (
          <div>
            <div className="flex items-center justify-end gap-2 mb-3">
              <Button variant="ghost" size="sm" className="gap-1.5 h-7 text-xs" onClick={handleCopy}>
                {copied ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                {copied ? "Copied" : "Copy"}
              </Button>
              <Button variant="ghost" size="sm" className="gap-1.5 h-7 text-xs" onClick={handleDownload}>
                <Download className="h-3 w-3" />
                Download .txt
              </Button>
            </div>

            <div className="bg-muted/30 border border-border rounded-lg p-4 max-h-[500px] overflow-y-auto">
              <pre className="text-[13px] text-foreground whitespace-pre-wrap font-body leading-relaxed">
                {letter}
              </pre>
            </div>

            <div className="mt-3 flex items-center gap-2">
              <Button variant="outline" size="sm" className="gap-1.5 text-xs" onClick={generateLetter}>
                <FileText className="h-3.5 w-3.5" />
                Regenerate
              </Button>
            </div>

            <p className="text-[10px] text-muted-foreground mt-4 leading-relaxed">
              This letter is AI-generated and should be reviewed, customized, and verified before sending. 
              Ensure compliance with your jurisdiction's specific FOIA/Sunshine Law requirements.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default FoiaLetterGenerator;
