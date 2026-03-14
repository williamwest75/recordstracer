import { Building2, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import type { MockResult } from "@/lib/recordsApi";

interface CategoryMeta {
  icon: typeof Building2;
  label: string;
}

interface RecordDetailModalProps {
  result: MockResult | null;
  onClose: () => void;
  categoryMeta: (r: MockResult) => CategoryMeta | undefined;
}

const RecordDetailModal = ({ result, onClose, categoryMeta }: RecordDetailModalProps) => {
  if (!result) return null;

  const meta = categoryMeta(result);
  const Icon = meta?.icon ?? Building2;

  return (
    <Dialog open={!!result} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-lg max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center gap-2 text-accent mb-1">
            <Icon className="h-4 w-4" />
            <span className="text-xs font-medium uppercase tracking-wide">{meta?.label}</span>
          </div>
          <DialogTitle className="font-heading text-lg leading-snug">{result.source}</DialogTitle>
          <p className="text-sm text-muted-foreground mt-1">{result.description}</p>
        </DialogHeader>
        <Separator className="my-2" />
        <div className="space-y-3">
          <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Record Details</h3>
          <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-2 text-sm">
            {Object.entries(result.details).map(([key, value]) => (
              <div key={key} className="contents">
                <dt className="font-medium text-foreground whitespace-nowrap">{key}</dt>
                <dd className="text-muted-foreground">{typeof value === "object" ? JSON.stringify(value) : String(value ?? "N/A")}</dd>
              </div>
            ))}
          </dl>
        </div>

        {/* What This Means — ICIJ */}
        {result.category === "offshore" && result.id !== "icij-summary" && (
          <div className="bg-info-bg/30 border border-info-border rounded-lg p-3 mt-2">
            <h4 className="text-xs font-semibold uppercase tracking-wide text-info mb-1.5">What This Means</h4>
            <p className="text-xs text-muted-foreground leading-relaxed mb-2">
              This record shows an offshore entity that appeared in leaked documents. The entity is classified as: <strong>{result.details?.Type || "Offshore Entity"}</strong>.
            </p>
            <p className="text-xs font-medium text-foreground mb-1">🔍 Next Steps for Reporters:</p>
            <ul className="text-xs text-muted-foreground space-y-1 list-disc pl-4">
              <li>Check if this entity name matches your subject — common name elements may produce coincidental matches</li>
              <li>Click "View on ICIJ" to see the full network graph showing connected officers, addresses, and intermediaries</li>
              <li>Cross-reference any addresses or officer names against business filings and other sources in this search</li>
            </ul>
            <p className="text-[11px] text-muted-foreground italic mt-2">This listing does not imply any illegal conduct.</p>
          </div>
        )}

        {/* What This Means — PEP vs Sanctions */}
        {result.category === "sanctions" && result.id !== "sanctions-summary" && (() => {
          const topics = (result.details?.Topics || "").toLowerCase();
          const datasets = (result.details?.["Sanctions Lists"] || "").toLowerCase();
          const isPEP = topics.includes("pep") || topics.includes("politic") || datasets.includes("pep") || datasets.includes("congress") || datasets.includes("politician") || datasets.includes("everypolitician");
          const isSanction = topics.includes("sanction") || datasets.includes("ofac") || datasets.includes("sdn") || datasets.includes("sanction");
          return isPEP && !isSanction ? (
            <div className="bg-info-bg/30 border border-info-border rounded-lg p-3 mt-2">
              <h4 className="text-xs font-semibold uppercase tracking-wide text-info mb-1.5">👤 Politically Exposed Person (PEP)</h4>
              <p className="text-xs text-muted-foreground leading-relaxed">
                PEP status means this person holds or held a public office. This is standard for elected officials and government appointees — it does NOT indicate sanctions, criminal activity, or wrongdoing. PEP databases exist to flag potential conflicts of interest in financial transactions.
              </p>
              <p className="text-xs font-medium text-foreground mt-2 mb-1">🔍 Next Steps:</p>
              <ul className="text-xs text-muted-foreground space-y-1 list-disc pl-4">
                <li>Check campaign finance records for related donations</li>
                <li>Review any disclosed financial interests</li>
                <li>Cross-reference with lobbying registrations</li>
              </ul>
            </div>
          ) : isSanction ? (
            <div className="bg-destructive/5 border border-destructive/20 rounded-lg p-3 mt-2">
              <h4 className="text-xs font-semibold uppercase tracking-wide text-destructive mb-1.5">🚨 Sanctions List Match</h4>
              <p className="text-xs text-muted-foreground leading-relaxed">
                This entity appears on one or more international sanctions lists. Sanctions are imposed by governments to restrict dealings with specific individuals, companies, or countries.
              </p>
              <p className="text-xs text-warning mt-2">⚠️ VERIFY: A name match does NOT confirm this is the same entity. Many entities share similar names.</p>
              <p className="text-xs font-medium text-foreground mt-2 mb-1">🔍 Next Steps:</p>
              <ul className="text-xs text-muted-foreground space-y-1 list-disc pl-4">
                <li>Click "View Details" to check the full sanctions record, including jurisdiction and listed reasons</li>
                <li>Verify the entity's registered address and officers match your subject</li>
                <li>Consult OFAC's SDN list for the most current status</li>
              </ul>
            </div>
          ) : null;
        })()}

        {result.sourceUrl && (
          <>
            <Separator className="my-2" />
            <div>
              <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-2">Source</h3>
              <a href={result.sourceUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 text-sm text-accent hover:underline">
                <ExternalLink className="h-3.5 w-3.5" /> View on {result.source}
              </a>
            </div>
          </>
        )}
        <Separator className="my-2" />
        <div className="flex items-center gap-2 justify-end">
          <Button variant="outline" size="sm" onClick={onClose}>Close</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default RecordDetailModal;
