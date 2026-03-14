import { useState } from "react";
import { Scale, ChevronRight, ExternalLink, Info } from "lucide-react";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Button } from "@/components/ui/button";
import NameMatchBadge from "@/components/search/NameMatchBadge";
import SaveToInvestigationDropdown from "@/components/search/SaveToInvestigationDropdown";
import { getNameMatchConfidence } from "@/lib/nameMatch";
import { classifyCourtRecords } from "@/lib/courtRelevance";
import type { RecordResult } from "@/lib/recordsApi";

interface CourtRecordsSectionProps {
  items: RecordResult[];
  name: string;
  state: string;
  onViewDetails: (r: RecordResult) => void;
}

const CourtRecordItem = ({
  item,
  name,
  onViewDetails,
  annotation,
}: {
  item: RecordResult;
  name: string;
  onViewDetails: (r: RecordResult) => void;
  annotation?: string;
}) => (
  <div className="border border-border rounded-lg p-4 bg-card flex flex-col gap-3">
    <div className="flex flex-col sm:flex-row sm:items-start gap-3">
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <p className="text-sm font-semibold text-foreground">{item.source}</p>
          {item.returnedName && (
            <NameMatchBadge
              confidence={getNameMatchConfidence(name, item.returnedName)}
              searchedName={name}
              returnedName={item.returnedName}
              source={item.source}
            />
          )}
        </div>
        <p className="text-sm text-muted-foreground mt-0.5">{item.description}</p>
        {annotation && (
          <p className="text-xs text-muted-foreground mt-1">{annotation}</p>
        )}
      </div>
      <div className="flex items-center gap-2 shrink-0">
        <Button variant="outline" size="sm" className="gap-1.5" onClick={() => onViewDetails(item)}>
          <ExternalLink className="h-3.5 w-3.5" /> View
        </Button>
        <SaveToInvestigationDropdown result={item} />
      </div>
    </div>
    {item.sourceUrl && (
      <div className="text-right">
        <a
          href={item.sourceUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="text-[12px] text-muted-foreground hover:text-foreground underline underline-offset-2"
        >
          Source: {item.source} ↗
        </a>
      </div>
    )}
  </div>
);

const CourtRecordsSection = ({ items, name, state, onViewDetails }: CourtRecordsSectionProps) => {
  const [showWeak, setShowWeak] = useState(false);

  const { high, possible, weak, hiddenCount } = classifyCourtRecords(items, name, state);
  const weakCount = weak.length + hiddenCount;
  const visibleCount = high.length + possible.length;

  return (
    <Collapsible>
      <CollapsibleTrigger className="w-full flex items-center justify-between py-3 px-4 border border-border rounded-lg hover:bg-muted/30 transition-colors group">
        <span className="flex items-center gap-2">
          <Scale className="h-4 w-4 text-muted-foreground" />
          <span className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Court Records</span>
          <span className="text-[10px] text-muted-foreground/70">({items.length})</span>
        </span>
        <ChevronRight className="h-4 w-4 text-muted-foreground transition-transform group-data-[state=open]:rotate-90" />
      </CollapsibleTrigger>
      <CollapsibleContent className="pt-3 pb-1 space-y-2 pl-4">
        {/* High confidence */}
        {high.map(({ record }) => (
          <CourtRecordItem key={record.id} item={record} name={name} onViewDetails={onViewDetails} />
        ))}

        {/* Possible match */}
        {possible.map(({ record }) => (
          <CourtRecordItem
            key={record.id}
            item={record}
            name={name}
            onViewDetails={onViewDetails}
            annotation="Connection to subject requires verification"
          />
        ))}

        {/* Weak matches — collapsed by default */}
        {weakCount > 0 && !showWeak && (
          <div className="py-3 text-center">
            <p className="text-xs text-muted-foreground">
              Results filtered by relevance. {weakCount} record{weakCount !== 1 ? "s" : ""} with weak name matches not shown.
            </p>
            <button
              onClick={() => setShowWeak(true)}
              className="text-xs text-muted-foreground hover:text-foreground underline underline-offset-2 mt-1"
            >
              Show all records
            </button>
          </div>
        )}

        {showWeak && weak.map(({ record }) => (
          <CourtRecordItem
            key={record.id}
            item={record}
            name={name}
            onViewDetails={onViewDetails}
            annotation="Weak name match — likely unrelated to subject"
          />
        ))}

        {showWeak && weakCount > 0 && (
          <div className="py-2 text-center">
            <button
              onClick={() => setShowWeak(false)}
              className="text-xs text-muted-foreground hover:text-foreground underline underline-offset-2"
            >
              Hide weak matches
            </button>
          </div>
        )}

        {visibleCount === 0 && weakCount === 0 && (
          <p className="text-xs text-muted-foreground py-3 text-center">No court records found.</p>
        )}

        {/* PACER guidance */}
        <div className="mt-3 p-3.5 rounded-lg bg-info-bg/30 border border-info-border/40">
          <div className="flex items-start gap-2">
            <Info className="h-3.5 w-3.5 text-info shrink-0 mt-0.5" />
            <div>
              <p className="text-xs text-muted-foreground leading-relaxed">
                These results come from the RECAP archive of PACER filings. Recently filed cases, sealed records,
                and cases not previously accessed may not appear.
              </p>
              <a
                href={`https://pcl.uscourts.gov/pcl/pages/search.jsf`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-xs text-accent hover:underline mt-1.5 font-medium"
              >
                <ExternalLink className="h-3 w-3" />
                Search PACER directly for complete federal court records ↗
              </a>
            </div>
          </div>
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
};

export default CourtRecordsSection;
