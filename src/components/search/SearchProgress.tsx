import { CheckCircle2, Loader2, XCircle, SkipForward } from "lucide-react";
import type { SourceStatus } from "@/lib/recordsApi";

interface SearchProgressProps {
  sources: SourceStatus[];
  isComplete: boolean;
}

const statusIcon = (status: SourceStatus["status"]) => {
  switch (status) {
    case "loading":
      return <Loader2 className="h-3.5 w-3.5 animate-spin text-accent" />;
    case "success":
      return <CheckCircle2 className="h-3.5 w-3.5 text-success" />;
    case "error":
      return <XCircle className="h-3.5 w-3.5 text-destructive" />;
    case "skipped":
      return <SkipForward className="h-3.5 w-3.5 text-muted-foreground/50" />;
    default:
      return <div className="h-3.5 w-3.5 rounded-full border-2 border-border" />;
  }
};

const SearchProgress = ({ sources, isComplete }: SearchProgressProps) => {
  const completed = sources.filter(s => s.status === "success" || s.status === "error" || s.status === "skipped").length;
  const total = sources.length;
  const totalResults = sources.reduce((sum, s) => sum + s.resultCount, 0);
  const progressPct = total > 0 ? Math.round((completed / total) * 100) : 0;

  if (isComplete) return null;

  return (
    <div className="border border-border rounded-xl bg-card p-5 shadow-sm">
      {/* Progress bar */}
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
          Searching Public Records
        </h2>
        <span className="text-xs text-muted-foreground">
          {completed} of {total} sources
          {totalResults > 0 && (
            <span className="ml-2 font-semibold text-foreground">{totalResults} records found</span>
          )}
        </span>
      </div>

      <div className="w-full h-1.5 bg-muted rounded-full overflow-hidden mb-4">
        <div
          className="h-full bg-accent rounded-full transition-all duration-500 ease-out"
          style={{ width: `${progressPct}%` }}
        />
      </div>

      {/* Source grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2">
        {sources.map((source) => (
          <div
            key={source.label}
            className={`flex items-center gap-2 px-3 py-2 rounded-lg border transition-all duration-300 ${
              source.status === "loading"
                ? "border-accent/30 bg-accent/5"
                : source.status === "success" && source.resultCount > 0
                  ? "border-success/30 bg-success/5"
                  : source.status === "error"
                    ? "border-destructive/20 bg-destructive/5"
                    : "border-border bg-background"
            }`}
          >
            {statusIcon(source.status)}
            <div className="min-w-0 flex-1">
              <p className="text-[11px] font-medium text-foreground truncate leading-tight">
                {source.label.replace(" Campaign Finance", "").replace(".gov", "")}
              </p>
              {source.status === "success" && source.resultCount > 0 && (
                <p className="text-[10px] text-success font-semibold">{source.resultCount} found</p>
              )}
              {source.status === "success" && source.resultCount === 0 && (
                <p className="text-[10px] text-muted-foreground">No records</p>
              )}
              {source.status === "error" && (
                <p className="text-[10px] text-destructive">Failed</p>
              )}
              {source.status === "loading" && (
                <p className="text-[10px] text-accent">Searching…</p>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SearchProgress;
