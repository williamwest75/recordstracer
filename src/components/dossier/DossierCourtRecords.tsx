import { useState } from "react";
import { Scale, ExternalLink, ChevronDown, AlertCircle } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import type { DossierCourtData } from "@/lib/dossier-types";

interface Props {
  data: DossierCourtData | undefined;
  isLoading: boolean;
  isError: boolean;
  searchName: string;
}

const DEFAULT_VISIBLE = 5;

const DossierCourtRecords = ({ data, isLoading, isError, searchName }: Props) => {
  const [docketsExpanded, setDocketsExpanded] = useState(false);
  const [opinionsExpanded, setOpinionsExpanded] = useState(false);

  if (isError) {
    return (
      <div className="border border-border rounded-lg p-4 bg-muted/30 text-sm text-muted-foreground">
        <AlertCircle className="h-4 w-4 inline mr-1.5" />
        Unable to fetch court records.{" "}
        <a
          href={`https://www.courtlistener.com/?q=${encodeURIComponent(searchName)}`}
          target="_blank"
          rel="noopener noreferrer"
          className="text-accent hover:underline"
        >
          Search directly on CourtListener →
        </a>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="border border-border rounded-lg p-5 bg-card space-y-3">
        <div className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">⚖️ Federal Court Records</div>
        <Skeleton className="h-16 w-full" />
        <Skeleton className="h-16 w-full" />
        <p className="text-xs text-muted-foreground italic">Searching federal courts…</p>
      </div>
    );
  }

  if (!data) return null;

  const dockets = data.dockets?.results || [];
  const opinions = data.opinions?.results || [];
  const visibleDockets = docketsExpanded ? dockets : dockets.slice(0, DEFAULT_VISIBLE);
  const visibleOpinions = opinionsExpanded ? opinions : opinions.slice(0, DEFAULT_VISIBLE);

  return (
    <div className="border border-border rounded-lg p-5 bg-card space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-2">
          <Scale className="h-5 w-5 text-accent" />
          <h2 className="font-heading text-lg font-semibold text-foreground">Federal Court Records</h2>
          <span className="text-xs text-muted-foreground">
            {data.dockets?.total_count || 0} dockets · {data.opinions?.total_count || 0} opinions
          </span>
        </div>
        <a
          href={`https://www.courtlistener.com/?q=${encodeURIComponent(searchName)}`}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 text-xs text-accent hover:underline"
        >
          View on CourtListener <ExternalLink className="h-3 w-3" />
        </a>
      </div>

      {/* Dockets */}
      <div>
        <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-2">Dockets ({data.dockets?.total_count || 0})</h3>
        {dockets.length === 0 ? (
          <p className="text-sm text-muted-foreground italic">No federal court dockets found in the RECAP Archive.</p>
        ) : (
          <div className="space-y-2">
            {visibleDockets.map((d, i) => (
              <a
                key={i}
                href={d.url || "#"}
                target="_blank"
                rel="noopener noreferrer"
                className="block border border-border rounded-md p-3 bg-background hover:bg-muted/50 transition-colors"
              >
                <p className="text-sm font-semibold text-foreground">{d.case_name}</p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {d.court} · {d.docket_number}
                  {d.date_filed && ` · Filed ${new Date(d.date_filed).toLocaleDateString("en-US", { year: "numeric", month: "short" })}`}
                  {d.date_terminated ? ` · Terminated ${new Date(d.date_terminated).toLocaleDateString("en-US", { year: "numeric", month: "short" })}` : " · Active"}
                </p>
                {d.suit_nature && <p className="text-xs text-muted-foreground">{d.suit_nature}</p>}
              </a>
            ))}
            {dockets.length > DEFAULT_VISIBLE && !docketsExpanded && (
              <button onClick={() => setDocketsExpanded(true)} className="inline-flex items-center gap-1.5 text-sm text-accent hover:underline font-medium pt-1">
                <ChevronDown className="h-3.5 w-3.5" /> Show all {dockets.length} dockets
              </button>
            )}
          </div>
        )}
      </div>

      {/* Opinions */}
      <div>
        <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-2">Opinions ({data.opinions?.total_count || 0})</h3>
        {opinions.length === 0 ? (
          <p className="text-sm text-muted-foreground italic">No court opinions found.</p>
        ) : (
          <div className="space-y-2">
            {visibleOpinions.map((o, i) => (
              <a
                key={i}
                href={o.url || "#"}
                target="_blank"
                rel="noopener noreferrer"
                className="block border border-border rounded-md p-3 bg-background hover:bg-muted/50 transition-colors"
              >
                <p className="text-sm font-semibold text-foreground">{o.case_name}</p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {o.court}
                  {o.date_filed && ` · ${new Date(o.date_filed).toLocaleDateString("en-US", { year: "numeric", month: "short" })}`}
                  {o.citation && ` · ${o.citation}`}
                </p>
                {o.snippet && (
                  <p className="text-xs text-muted-foreground mt-1 line-clamp-2" dangerouslySetInnerHTML={{ __html: o.snippet }} />
                )}
              </a>
            ))}
            {opinions.length > DEFAULT_VISIBLE && !opinionsExpanded && (
              <button onClick={() => setOpinionsExpanded(true)} className="inline-flex items-center gap-1.5 text-sm text-accent hover:underline font-medium pt-1">
                <ChevronDown className="h-3.5 w-3.5" /> Show all {opinions.length} opinions
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default DossierCourtRecords;
