import { Users, Database, ChevronDown, ChevronRight } from "lucide-react";
import { useState } from "react";
import type { EntityCluster } from "@/lib/entityResolution";

const CATEGORY_LABELS: Record<string, string> = {
  business: "Business/SEC",
  donations: "FEC",
  contracts: "Contracts",
  court: "Court",
  lobbying: "Lobbying",
  sanctions: "Sanctions",
  offshore: "Offshore Leaks",
  assets: "Assets",
  property: "Property",
  licenses: "Licenses",
};

interface EntityClusterCardProps {
  clusters: EntityCluster[];
}

const EntityClusterCard = ({ clusters }: EntityClusterCardProps) => {
  const [expanded, setExpanded] = useState<string | null>(null);

  if (clusters.length === 0) return null;

  return (
    <div className="border border-border rounded-xl bg-card shadow-sm overflow-hidden">
      <div className="px-5 py-4 border-b border-border">
        <div className="flex items-center gap-2">
          <Users className="h-4 w-4 text-accent" />
          <h2 className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
            Entity Resolution
          </h2>
          <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-accent/10 text-accent">
            {clusters.length} {clusters.length === 1 ? "entity" : "entities"} identified
          </span>
        </div>
        <p className="text-xs text-muted-foreground mt-1">
          Records across multiple databases that likely refer to the same person
        </p>
      </div>

      <div className="divide-y divide-border">
        {clusters.map((cluster) => {
          const isExpanded = expanded === cluster.id;
          return (
            <div key={cluster.id}>
              <button
                onClick={() => setExpanded(isExpanded ? null : cluster.id)}
                className="w-full flex items-center gap-3 px-5 py-3.5 hover:bg-muted/30 transition-colors text-left"
              >
                <div className="h-9 w-9 rounded-full bg-accent/10 border border-accent/20 flex items-center justify-center shrink-0">
                  <Users className="h-4 w-4 text-accent" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-foreground">{cluster.canonicalName}</p>
                  <p className="text-xs text-muted-foreground">
                    {cluster.records.length} records across{" "}
                    {cluster.databases.map(d => CATEGORY_LABELS[d] || d).join(", ")}
                  </p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  {cluster.databases.map((db) => (
                    <span
                      key={db}
                      className="text-[10px] font-medium px-2 py-0.5 rounded bg-muted text-muted-foreground"
                    >
                      {CATEGORY_LABELS[db] || db}
                    </span>
                  ))}
                  {isExpanded ? (
                    <ChevronDown className="h-4 w-4 text-muted-foreground" />
                  ) : (
                    <ChevronRight className="h-4 w-4 text-muted-foreground" />
                  )}
                </div>
              </button>

              {isExpanded && (
                <div className="px-5 pb-4 space-y-2">
                  {/* Shared attributes */}
                  {cluster.sharedAttributes.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-3">
                      {cluster.sharedAttributes.map((attr, i) => (
                        <span
                          key={i}
                          className="inline-flex items-center gap-1 text-[11px] px-2.5 py-1 rounded-full bg-success/10 text-success border border-success/20"
                        >
                          <Database className="h-3 w-3" />
                          {attr}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Individual records */}
                  {cluster.records.map((record) => (
                    <div
                      key={record.id}
                      className="flex items-start gap-3 p-3 rounded-lg bg-muted/20 border border-border/50"
                    >
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-muted text-muted-foreground shrink-0 mt-0.5">
                        {CATEGORY_LABELS[record.category] || record.category}
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium text-foreground">{record.source}</p>
                        <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{record.description}</p>
                        {record.returnedName && (
                          <p className="text-[11px] text-muted-foreground/70 mt-1">
                            Name as filed: {record.returnedName}
                          </p>
                        )}
                      </div>
                      {record.sourceUrl && (
                        <a
                          href={record.sourceUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-[11px] text-accent hover:underline shrink-0"
                        >
                          View ↗
                        </a>
                      )}
                    </div>
                  ))}

                  <p className="text-[11px] text-muted-foreground italic pt-1">
                    Grouping is based on name similarity and shared attributes. Verify independently.
                  </p>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default EntityClusterCard;
