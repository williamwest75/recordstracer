import { useState } from "react";
import { DollarSign, ExternalLink, ChevronDown, AlertCircle } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import type { DossierFecData } from "@/lib/dossier-types";

interface Props {
  data: DossierFecData | undefined;
  isLoading: boolean;
  isError: boolean;
  searchName: string;
}

const DEFAULT_VISIBLE = 5;

const DossierCampaignFinance = ({ data, isLoading, isError, searchName }: Props) => {
  const [expanded, setExpanded] = useState(false);

  if (isError) {
    return (
      <div className="border border-border rounded-lg p-4 bg-muted/30 text-sm text-muted-foreground">
        <AlertCircle className="h-4 w-4 inline mr-1.5" />
        Unable to fetch campaign finance data.{" "}
        <a
          href={`https://www.fec.gov/data/receipts/individual-contributions/?contributor_name=${encodeURIComponent(searchName)}`}
          target="_blank"
          rel="noopener noreferrer"
          className="text-accent hover:underline"
        >
          Search directly on FEC.gov →
        </a>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="border border-border rounded-lg p-5 bg-card space-y-3">
        <div className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">💰 Campaign Finance</div>
        <Skeleton className="h-16 w-full" />
        <Skeleton className="h-16 w-full" />
        <Skeleton className="h-16 w-full" />
        <p className="text-xs text-muted-foreground italic">Searching FEC records…</p>
      </div>
    );
  }

  if (!data) return null;

  const contributions = data.contributions || [];
  const summary = data.summary;
  const visibleItems = expanded ? contributions : contributions.slice(0, DEFAULT_VISIBLE);
  const hasMore = contributions.length > DEFAULT_VISIBLE;

  return (
    <div className="border border-border rounded-lg p-5 bg-card space-y-3">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-2">
          <DollarSign className="h-5 w-5 text-accent" />
          <h2 className="font-heading text-lg font-semibold text-foreground">Campaign Finance</h2>
          <span className="text-xs text-muted-foreground">
            {summary.contribution_count} results · ${summary.total_amount.toLocaleString()} total
          </span>
        </div>
        <a
          href={`https://www.fec.gov/data/receipts/individual-contributions/?contributor_name=${encodeURIComponent(searchName)}`}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 text-xs text-accent hover:underline"
        >
          View on FEC <ExternalLink className="h-3 w-3" />
        </a>
      </div>

      {contributions.length === 0 ? (
        <p className="text-sm text-muted-foreground italic">
          No federal political contributions over $200 found for this name.
        </p>
      ) : (
        <div className="space-y-2">
          {visibleItems.map((c, i) => (
            <div
              key={i}
              className={`border border-border rounded-md p-3 flex flex-col sm:flex-row sm:items-center gap-2 ${
                c.amount >= 1000 ? "bg-accent/5" : "bg-background"
              }`}
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-sm font-bold text-foreground">${c.amount.toLocaleString()}</span>
                  <span className="text-sm text-muted-foreground">→</span>
                  <span className="text-sm font-medium text-foreground">{c.committee_name}</span>
                </div>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {c.date ? new Date(c.date).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" }) : ""}
                  {c.contributor_city && ` · ${c.contributor_city}, ${c.contributor_state}`}
                  {c.contributor_employer && ` · ${c.contributor_occupation || ""} at ${c.contributor_employer}`}
                </p>
              </div>
              {c.fec_url && (
                <a href={c.fec_url} target="_blank" rel="noopener noreferrer" className="text-xs text-accent hover:underline shrink-0">
                  <ExternalLink className="h-3 w-3" />
                </a>
              )}
            </div>
          ))}
          {hasMore && !expanded && (
            <button
              onClick={() => setExpanded(true)}
              className="inline-flex items-center gap-1.5 text-sm text-accent hover:underline font-medium pt-1"
            >
              <ChevronDown className="h-3.5 w-3.5" />
              Show all {contributions.length} contributions
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default DossierCampaignFinance;
