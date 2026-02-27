import { useState, useRef, useEffect } from "react";
import { ChevronDown, AlertTriangle } from "lucide-react";
import type { MatchConfidence } from "@/lib/nameMatch";
import { MATCH_LABELS } from "@/lib/nameMatch";

interface NameMatchBadgeProps {
  confidence: MatchConfidence;
  searchedName: string;
  returnedName: string;
  source: string;
}

const BADGE_STYLES: Record<MatchConfidence, { bg: string; border: string; text: string; dot: string; icon: string }> = {
  exact: { bg: "bg-success-bg", border: "border-success-border", text: "text-success", dot: "bg-success", icon: "✓" },
  likely: { bg: "bg-info-bg", border: "border-info-border", text: "text-info", dot: "bg-info", icon: "≈" },
  possible: { bg: "bg-warning-bg", border: "border-warning-border", text: "text-warning", dot: "bg-warning", icon: "?" },
  weak: { bg: "bg-destructive/5", border: "border-destructive/20", text: "text-destructive", dot: "bg-destructive", icon: "!" },
};

const NameMatchBadge = ({ confidence, searchedName, returnedName, source }: NameMatchBadgeProps) => {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const style = BADGE_STYLES[confidence];
  const meta = MATCH_LABELS[confidence];

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  return (
    <div ref={ref} className="relative inline-block">
      <button
        onClick={() => setOpen(!open)}
        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md ${style.bg} border ${style.border} transition-colors hover:opacity-90`}
      >
        <span className={`w-4 h-4 rounded-full ${style.dot} text-white flex items-center justify-center text-[10px] font-bold`}>
          {style.icon}
        </span>
        <span className={`text-[11px] font-semibold ${style.text}`}>{meta.label}</span>
        <ChevronDown className={`h-3 w-3 ${style.text} transition-transform ${open ? "rotate-180" : ""}`} />
      </button>

      {open && (
        <div className="absolute top-full left-0 mt-2 z-20 w-80 bg-card border border-border rounded-lg shadow-lg p-4">
          <p className="text-xs text-muted-foreground mb-3">{meta.description}</p>

          <div className="bg-muted rounded-lg p-3 mb-3">
            <div className="flex justify-between items-center mb-2">
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">You Searched</p>
                <p className="text-sm font-semibold text-foreground">{searchedName}</p>
              </div>
              <span className="text-lg text-muted-foreground">→</span>
              <div className="text-right">
                <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Record Found</p>
                <p className="text-sm font-semibold text-foreground">{returnedName}</p>
              </div>
            </div>
            <p className="text-[11px] text-muted-foreground">Source: {source}</p>
          </div>

          {confidence !== "exact" && (
            <div className="bg-warning-bg border border-warning-border rounded-md p-2.5 flex gap-2 items-start">
              <AlertTriangle className="h-3.5 w-3.5 text-warning shrink-0 mt-0.5" />
              <p className="text-[11px] text-warning leading-relaxed">
                Verify this match independently before publishing. Name variants may refer to different individuals.
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default NameMatchBadge;
