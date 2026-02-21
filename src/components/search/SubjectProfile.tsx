import { Building2, Vote, Scale, FileText, AlertCircle, ExternalLink, Home, BadgeCheck, Globe } from "lucide-react";
import type { RecordResult } from "@/lib/recordsApi";

interface SubjectProfileProps {
  name: string;
  state: string;
  results: RecordResult[];
}

const CATEGORY_LABELS: Record<string, { icon: typeof Building2; label: string; singular: string; plural?: string }> = {
  business: { icon: Building2, label: "Business/SEC", singular: "filing" },
  donations: { icon: Vote, label: "FEC Campaign Finance", singular: "record" },
  contracts: { icon: FileText, label: "Federal Contracts", singular: "award" },
  court: { icon: Scale, label: "Court Records", singular: "case" },
  lobbying: { icon: FileText, label: "Lobbying", singular: "filing" },
  sanctions: { icon: AlertCircle, label: "Sanctions/Watchlists", singular: "match", plural: "matches" },
  offshore: { icon: Globe, label: "Offshore Leaks", singular: "record" },
  assets: { icon: Home, label: "Asset Records", singular: "registration" },
  property: { icon: Home, label: "Property", singular: "record" },
  licenses: { icon: BadgeCheck, label: "Licenses", singular: "license" },
};

const SubjectProfile = ({ name, state, results }: SubjectProfileProps) => {
  // Group results by category and count (exclude summary records for cleaner counts)
  const categoryCounts: Record<string, number> = {};
  for (const r of results) {
    categoryCounts[r.category] = (categoryCounts[r.category] || 0) + 1;
  }

  const activeCategories = Object.entries(categoryCounts)
    .filter(([_, count]) => count > 0)
    .sort((a, b) => b[1] - a[1]);

  if (activeCategories.length === 0) return null;

  const dbCount = activeCategories.length;
  const totalRecords = results.length;

  return (
    <div className="border border-border rounded-lg bg-card p-5 shadow-sm">
      <div className="flex items-start gap-3">
        <div className="h-10 w-10 rounded-full bg-accent/10 flex items-center justify-center shrink-0 mt-0.5">
          <Building2 className="h-5 w-5 text-accent" />
        </div>
        <div className="flex-1 min-w-0">
          <h2 className="font-heading text-lg font-bold text-foreground leading-tight">
            {name}
          </h2>
          <p className="text-sm text-muted-foreground mt-0.5">
            {state !== "All States / National" ? `${state} · ` : ""}
            Found in <span className="font-semibold text-foreground">{dbCount} database{dbCount !== 1 ? "s" : ""}</span>
            {" · "}
            <span className="font-semibold text-foreground">{totalRecords} total record{totalRecords !== 1 ? "s" : ""}</span>
          </p>

          {/* Category pills */}
          <div className="flex flex-wrap gap-2 mt-3">
            {activeCategories.map(([category, count]) => {
              const meta = CATEGORY_LABELS[category];
              if (!meta) return null;
              const Icon = meta.icon;
              return (
                <a
                  key={category}
                  href={`#category-${category}`}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium bg-muted text-foreground hover:bg-accent/10 hover:text-accent transition-colors"
                >
                  <Icon className="h-3 w-3" />
                  {count} {meta.label}
                </a>
              );
            })}
          </div>

          {/* Cross-reference summary */}
          <p className="text-xs text-muted-foreground mt-3 leading-relaxed">
            <span className="font-medium text-foreground">{name}</span>
            {" — Found in "}
            {activeCategories.map(([cat, count], i) => {
              const meta = CATEGORY_LABELS[cat];
              if (!meta) return null;
              const suffix = count === 1 ? meta.singular : (meta.plural || `${meta.singular}s`);
              return (
                <span key={cat}>
                  {i > 0 && i < activeCategories.length - 1 ? ", " : ""}
                  {i > 0 && i === activeCategories.length - 1 ? " and " : ""}
                  <span className="font-medium">{count} {meta.label} {suffix}</span>
                </span>
              );
            })}
            .
          </p>
        </div>
      </div>
    </div>
  );
};

export default SubjectProfile;
