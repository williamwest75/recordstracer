import { useState, useCallback } from "react";
import { Copy, Check, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import type { DossierBriefData } from "@/lib/dossier-types";

interface Props {
  data: DossierBriefData | undefined;
  isLoading: boolean;
  isError: boolean;
}

const DossierBrief = ({ data, isLoading, isError }: Props) => {
  const [copied, setCopied] = useState(false);

  const copyBrief = useCallback(() => {
    if (!data?.brief) return;
    navigator.clipboard.writeText(data.brief);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [data?.brief]);

  if (isError) {
    return (
      <div className="border border-border rounded-lg p-4 bg-muted/30 text-sm text-muted-foreground">
        <AlertCircle className="h-4 w-4 inline mr-1.5" />
        Unable to generate background brief right now.
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="border border-border rounded-lg p-5 bg-card space-y-3">
        <div className="flex items-center gap-2 text-sm font-semibold text-muted-foreground uppercase tracking-wide">
          📋 Background Brief
        </div>
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-11/12" />
        <Skeleton className="h-4 w-10/12" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-9/12" />
        <p className="text-xs text-muted-foreground italic">Generating background brief…</p>
      </div>
    );
  }

  if (!data) return null;

  const sources = data.data_sources;

  return (
    <div className="border border-border rounded-lg p-5 bg-card space-y-3">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">📋 Background Brief</h2>
        <Button variant="ghost" size="sm" className="gap-1.5 text-xs" onClick={copyBrief}>
          {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
          {copied ? "Copied" : "Copy Brief"}
        </Button>
      </div>

      <div className="text-sm text-foreground leading-relaxed whitespace-pre-line">
        {data.brief}
      </div>

      <div className="flex items-center gap-2 flex-wrap pt-1">
        <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded-full ${sources.fec ? "bg-success/15 text-success" : "bg-muted text-muted-foreground"}`}>
          FEC {sources.fec ? "✓" : "✗"}
        </span>
        <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded-full ${sources.court_dockets ? "bg-success/15 text-success" : "bg-muted text-muted-foreground"}`}>
          Courts {sources.court_dockets ? "✓" : "✗"}
        </span>
        <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded-full ${sources.news ? "bg-success/15 text-success" : "bg-muted text-muted-foreground"}`}>
          News {sources.news ? "✓" : "✗"}
        </span>
      </div>

      <p className="text-[11px] text-muted-foreground italic border-t border-border pt-2">
        ⚠️ AI-generated summary based on public records. Verify all facts independently before publication.
      </p>
    </div>
  );
};

export default DossierBrief;
