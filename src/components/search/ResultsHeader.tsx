import { Link } from "react-router-dom";
import { ArrowLeft, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { generateReport, type ReportData } from "@/lib/generateReport";
import type { MockResult } from "@/lib/recordsApi";
import SearchAlertButton from "@/components/search/SearchAlertButton";

interface ResultsHeaderProps {
  name: string;
  state: string;
  results: MockResult[];
  searchTimestamp: Date | null;
}

const ResultsHeader = ({ name, state, results, searchTimestamp }: ResultsHeaderProps) => {
  const handleDownload = () => {
    const briefingEl = document.querySelector('[data-briefing-summary]');
    let findings: ReportData["findings"];
    let nextSteps: ReportData["nextSteps"];
    let crossReferences: ReportData["crossReferences"];
    try {
      const f = briefingEl?.getAttribute('data-briefing-findings');
      if (f) findings = JSON.parse(f);
      const n = briefingEl?.getAttribute('data-briefing-nextsteps');
      if (n) nextSteps = JSON.parse(n);
      const c = briefingEl?.getAttribute('data-briefing-crossrefs');
      if (c) crossReferences = JSON.parse(c);
    } catch { /* ignore parse errors */ }

    generateReport({
      name,
      state,
      results,
      briefingSummary: briefingEl?.getAttribute('data-briefing-summary') || undefined,
      findings,
      nextSteps,
      crossReferences,
      timestamp: searchTimestamp || new Date(),
    });
  };

  return (
    <>
      <Link to="/" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground mb-6">
        <ArrowLeft className="h-4 w-4" /> Back to search
      </Link>

      <h1 className="font-heading text-2xl md:text-3xl font-bold text-foreground">
        Results for: <span className="text-accent">{name}</span>{state !== "All States / National" ? ` in ${state}` : " (National)"}
      </h1>

      <div className="flex items-center justify-between mt-1">
        <p className="text-muted-foreground text-sm">
          {results.length} records found across multiple databases
          {searchTimestamp && (
            <span className="text-muted-foreground/50 ml-2 text-xs">
              · Generated {searchTimestamp.toLocaleString("en-US", { month: "short", day: "numeric", year: "numeric", hour: "numeric", minute: "2-digit" })}
            </span>
          )}
        </p>
        <div className="flex items-center gap-2 shrink-0">
          <SearchAlertButton subjectName={name} state={state} />
          <Button variant="outline" size="sm" className="gap-1.5" onClick={handleDownload}>
            <Download className="h-3.5 w-3.5" />
            Download Report
          </Button>
        </div>
      </div>
    </>
  );
};

export default ResultsHeader;
