import { useState } from "react";
import { ExternalLink, ChevronRight } from "lucide-react";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Button } from "@/components/ui/button";
import NameMatchBadge from "@/components/search/NameMatchBadge";
import SaveToInvestigationDropdown from "@/components/search/SaveToInvestigationDropdown";
import { getNameMatchConfidence } from "@/lib/nameMatch";
import { classifyOffshoreRecords } from "@/lib/offshoreRelevance";
import type { RecordResult } from "@/lib/recordsApi";

interface OffshoreSectionProps {
  items: RecordResult[];
  name: string;
  state: string;
  onViewDetails: (r: RecordResult) => void;
}

const OffshoreRecordItem = ({
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

const OffshoreLeaksSection = ({ items, name, state, onViewDetails }: OffshoreSectionProps) => {
  const [showWeak, setShowWeak] = useState(false);

  const { summaryRecord, high, possible, weak, hiddenCount, totalEntityCount, credibleCount } =
    classifyOffshoreRecords(items, name, state);

  const weakCount = weak.length + hiddenCount;

  return (
    <Collapsible>
      <CollapsibleTrigger className="w-full flex items-center justify-between py-3 px-4 border border-border rounded-lg hover:bg-muted/30 transition-colors group">
        <span className="flex items-center gap-2">
          <ExternalLink className="h-4 w-4 text-muted-foreground" />
          <span className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Offshore Leaks (ICIJ)</span>
          <span className="text-[10px] text-muted-foreground/70">({items.length})</span>
        </span>
        <ChevronRight className="h-4 w-4 text-muted-foreground transition-transform group-data-[state=open]:rotate-90" />
      </CollapsibleTrigger>
      <CollapsibleContent className="pt-3 pb-1 space-y-2 pl-4">
        {/* Summary record */}
        {summaryRecord && (
          <OffshoreRecordItem item={summaryRecord} name={name} onViewDetails={onViewDetails} />
        )}

        {/* No credible matches message */}
        {credibleCount === 0 && totalEntityCount > 0 && (
          <div className="py-3 px-4 border border-border rounded-lg bg-muted/10">
            <p className="text-sm text-muted-foreground">
              ICIJ Offshore Leaks — {totalEntityCount} record{totalEntityCount !== 1 ? "s" : ""} returned, none meet minimum match threshold.
            </p>
          </div>
        )}

        {/* High confidence */}
        {high.map(({ record }) => (
          <OffshoreRecordItem key={record.id} item={record} name={name} onViewDetails={onViewDetails} />
        ))}

        {/* Possible match */}
        {possible.map(({ record }) => (
          <OffshoreRecordItem
            key={record.id}
            item={record}
            name={name}
            onViewDetails={onViewDetails}
            annotation="Entity name similarity requires manual verification"
          />
        ))}

        {/* Weak matches — collapsed by default */}
        {weakCount > 0 && !showWeak && (
          <div className="py-3 text-center">
            <p className="text-xs text-muted-foreground">
              {weakCount} record{weakCount !== 1 ? "s" : ""} with weak or no name match not shown.
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
          <OffshoreRecordItem
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
      </CollapsibleContent>
    </Collapsible>
  );
};

export default OffshoreLeaksSection;
