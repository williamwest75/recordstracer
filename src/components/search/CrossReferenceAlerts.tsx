import { useMemo, useState } from "react";
import { Link2, ChevronDown, MapPin, Briefcase, Phone, Building2, AlertTriangle } from "lucide-react";
import type { RecordResult } from "@/lib/recordsApi";

interface Props {
  results: RecordResult[];
  searchName: string;
}

interface ConnectionAlert {
  type: "address" | "employer" | "phone" | "entity" | "name";
  value: string;
  categories: string[];
  records: { source: string; detail: string }[];
  strength: "strong" | "moderate" | "weak";
}

const CATEGORY_LABELS: Record<string, string> = {
  donations: "FEC Campaign Finance",
  court: "Court Records",
  business: "Business Filings",
  sanctions: "Sanctions/PEP",
  offshore: "Offshore Leaks",
  contracts: "Federal Contracts",
  lobbying: "Lobbying Disclosures",
  assets: "Asset Records",
  property: "Property Records",
  licenses: "Professional Licenses",
};

function normalize(s: string): string {
  return s.toLowerCase().replace(/[^a-z0-9 ]/g, "").replace(/\s+/g, " ").trim();
}

function detectConnectionAlerts(results: RecordResult[], searchName: string): ConnectionAlert[] {
  const alerts: ConnectionAlert[] = [];

  // 1. Employer cross-references
  const employerMap = new Map<string, { categories: Set<string>; records: { source: string; detail: string }[] }>();
  for (const r of results) {
    const employer = r.details?.Employer || r.details?.["Awarding Agency"] || "";
    if (employer && employer !== "N/A" && employer.length >= 3) {
      const key = normalize(employer);
      if (!employerMap.has(key)) employerMap.set(key, { categories: new Set(), records: [] });
      const entry = employerMap.get(key)!;
      entry.categories.add(r.category);
      if (entry.records.length < 3) {
        entry.records.push({ source: r.source, detail: r.description.slice(0, 100) });
      }
    }
  }
  for (const [key, { categories, records }] of employerMap) {
    if (categories.size >= 2) {
      alerts.push({
        type: "employer",
        value: records[0]?.source.includes("FEC") ? (results.find(r => normalize(r.details?.Employer || "") === key)?.details?.Employer || key) : key,
        categories: [...categories],
        records,
        strength: categories.size >= 3 ? "strong" : "moderate",
      });
    }
  }

  // 2. Address/location cross-references
  const locationMap = new Map<string, { categories: Set<string>; records: { source: string; detail: string }[] }>();
  for (const r of results) {
    const city = r.details?.City || "";
    const state = r.details?.State || "";
    const address = r.details?.Address || r.details?.["Street Address"] || "";

    if (address && address !== "N/A" && address.length >= 8) {
      const key = normalize(address);
      if (!locationMap.has(key)) locationMap.set(key, { categories: new Set(), records: [] });
      const entry = locationMap.get(key)!;
      entry.categories.add(r.category);
      if (entry.records.length < 3) {
        entry.records.push({ source: r.source, detail: `${address} (${city}, ${state})` });
      }
    }
  }
  for (const [, { categories, records }] of locationMap) {
    if (categories.size >= 2) {
      alerts.push({
        type: "address",
        value: records[0]?.detail || "Shared address",
        categories: [...categories],
        records,
        strength: categories.size >= 3 ? "strong" : "moderate",
      });
    }
  }

  // 3. Entity name cross-references (same org/entity in multiple categories)
  const entityMap = new Map<string, { categories: Set<string>; records: { source: string; detail: string }[] }>();
  for (const r of results) {
    const entityName = r.details?.["Entity Name"] || r.details?.Registrant || r.details?.Client || r.details?.Recipient || "";
    if (entityName && entityName !== "N/A" && entityName.length >= 4) {
      const key = normalize(entityName);
      if (key === normalize(searchName)) continue; // skip the search subject
      if (!entityMap.has(key)) entityMap.set(key, { categories: new Set(), records: [] });
      const entry = entityMap.get(key)!;
      entry.categories.add(r.category);
      if (entry.records.length < 3) {
        entry.records.push({ source: r.source, detail: r.description.slice(0, 100) });
      }
    }
  }
  for (const [key, { categories, records }] of entityMap) {
    if (categories.size >= 2) {
      const displayName = results.find(r => {
        const n = r.details?.["Entity Name"] || r.details?.Registrant || r.details?.Client || r.details?.Recipient || "";
        return normalize(n) === key;
      })?.details?.["Entity Name"] || key;
      alerts.push({
        type: "entity",
        value: displayName,
        categories: [...categories],
        records,
        strength: categories.size >= 3 ? "strong" : "moderate",
      });
    }
  }

  // Sort by strength then by number of categories
  alerts.sort((a, b) => {
    const s = { strong: 3, moderate: 2, weak: 1 };
    return (s[b.strength] - s[a.strength]) || (b.categories.length - a.categories.length);
  });

  return alerts;
}

const ICON_MAP = {
  address: MapPin,
  employer: Briefcase,
  phone: Phone,
  entity: Building2,
  name: AlertTriangle,
};

const STRENGTH_STYLES = {
  strong: "border-accent/40 bg-accent/5",
  moderate: "border-border bg-muted/20",
  weak: "border-border/50 bg-muted/10",
};

const CrossReferenceAlerts = ({ results, searchName }: Props) => {
  const alerts = useMemo(() => detectConnectionAlerts(results, searchName), [results, searchName]);
  const [expanded, setExpanded] = useState(true);

  if (alerts.length === 0) return null;

  return (
    <div className="border border-border rounded-xl overflow-hidden bg-card shadow-sm">
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full px-5 py-4 border-b border-border flex items-center justify-between hover:bg-muted/30 transition-colors"
      >
        <div className="flex items-center gap-2">
          <Link2 className="h-4 w-4 text-accent" />
          <h2 className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
            Connection Alerts
          </h2>
          <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-accent/10 text-accent">
            {alerts.length}
          </span>
        </div>
        <ChevronDown className={`h-4 w-4 text-muted-foreground transition-transform ${expanded ? "rotate-180" : ""}`} />
      </button>

      {expanded && (
        <div className="px-5 py-4 space-y-3">
          <p className="text-[11px] text-muted-foreground mb-3">
            These connections were detected when the same data point appeared across multiple record categories.
          </p>

          {alerts.map((alert, i) => {
            const Icon = ICON_MAP[alert.type];
            return (
              <div key={i} className={`p-4 rounded-lg border ${STRENGTH_STYLES[alert.strength]}`}>
                <div className="flex items-start gap-3">
                  <Icon className="h-4 w-4 text-accent shrink-0 mt-0.5" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <span className="text-sm font-semibold text-foreground capitalize">
                        Shared {alert.type}
                      </span>
                      {alert.strength === "strong" && (
                        <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-accent/10 text-accent">
                          Strong
                        </span>
                      )}
                    </div>
                    <p className="text-[13px] text-foreground/80 mb-2">
                      "{alert.value}" appears across {alert.categories.length} data sources:{" "}
                      <span className="font-medium">
                        {alert.categories.map(c => CATEGORY_LABELS[c] || c).join(", ")}
                      </span>
                    </p>
                    <div className="space-y-1">
                      {alert.records.map((rec, j) => (
                        <div key={j} className="text-[11px] text-muted-foreground flex items-start gap-1.5">
                          <span className="text-accent/60">→</span>
                          <span>{rec.source}: {rec.detail}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}

          <p className="text-[10px] text-muted-foreground mt-2 leading-relaxed">
            Connection alerts identify shared data points. They do not confirm relationships or imply wrongdoing.
          </p>
        </div>
      )}
    </div>
  );
};

export default CrossReferenceAlerts;
