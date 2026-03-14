import { Building2, ExternalLink, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import NameMatchBadge from "@/components/search/NameMatchBadge";
import SaveToInvestigationDropdown from "@/components/search/SaveToInvestigationDropdown";
import { getNameMatchConfidence } from "@/lib/nameMatch";
import type { MockResult } from "@/lib/recordsApi";

interface SourceRecordSectionProps {
  categoryKey: string;
  icon: typeof Building2;
  label: string;
  items: MockResult[];
  name: string;
  onViewDetails: (r: MockResult) => void;
}

const SourceRecordSection = ({
  categoryKey, icon: Icon, label, items, name, onViewDetails,
}: SourceRecordSectionProps) => (
  <Collapsible>
    <CollapsibleTrigger className="w-full flex items-center justify-between py-3 px-4 border border-border rounded-lg hover:bg-muted/30 transition-colors group">
      <span className="flex items-center gap-2">
        <Icon className="h-4 w-4 text-muted-foreground" />
        <span className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">{label}</span>
        <span className="text-[10px] text-muted-foreground/70">({items.length})</span>
      </span>
      <ChevronRight className="h-4 w-4 text-muted-foreground transition-transform group-data-[state=open]:rotate-90" />
    </CollapsibleTrigger>
    <CollapsibleContent className="pt-3 pb-1 space-y-2 pl-4">
      {items.map((item) => (
        <div key={item.id} className="border border-border rounded-lg p-4 bg-card flex flex-col gap-3">
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
      ))}
    </CollapsibleContent>
  </Collapsible>
);

export default SourceRecordSection;
