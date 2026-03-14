import { useMemo } from "react";
import { Building2, Vote, Scale, FileText, AlertCircle, ExternalLink, Home, BadgeCheck, Globe, BarChart3, Shield } from "lucide-react";
import type { RecordResult } from "@/lib/recordsApi";

interface Props {
  name: string;
  state: string;
  results: RecordResult[];
}

const CATEGORY_CONFIG: Record<string, { icon: typeof Building2; label: string; singular: string; color: string }> = {
  business: { icon: Building2, label: "Business/SEC", singular: "filing", color: "text-blue-600 dark:text-blue-400" },
  donations: { icon: Vote, label: "Campaign Finance", singular: "record", color: "text-emerald-600 dark:text-emerald-400" },
  contracts: { icon: FileText, label: "Federal Contracts", singular: "award", color: "text-violet-600 dark:text-violet-400" },
  court: { icon: Scale, label: "Court Records", singular: "case", color: "text-amber-600 dark:text-amber-400" },
  lobbying: { icon: FileText, label: "Lobbying", singular: "filing", color: "text-indigo-600 dark:text-indigo-400" },
  sanctions: { icon: AlertCircle, label: "Sanctions/Watchlists", singular: "match", color: "text-red-600 dark:text-red-400" },
  offshore: { icon: Globe, label: "Offshore Leaks", singular: "record", color: "text-orange-600 dark:text-orange-400" },
  assets: { icon: Home, label: "Asset Records", singular: "registration", color: "text-teal-600 dark:text-teal-400" },
  property: { icon: Home, label: "Property", singular: "record", color: "text-cyan-600 dark:text-cyan-400" },
  licenses: { icon: BadgeCheck, label: "Licenses", singular: "license", color: "text-lime-600 dark:text-lime-400" },
};

const RecordProfileSummary = ({ name, state, results }: Props) => {
  const profile = useMemo(() => {
    const categoryCounts: Record<string, number> = {};
    let totalDonations = 0;
    let totalContracts = 0;

    for (const r of results) {
      categoryCounts[r.category] = (categoryCounts[r.category] || 0) + 1;

      // Extract dollar amounts
      if (r.category === "donations") {
        const amt = r.details?.Amount;
        if (amt) {
          const num = parseFloat(amt.replace(/[^0-9.-]/g, ""));
          if (!isNaN(num)) totalDonations += num;
        }
      }
      if (r.category === "contracts") {
        const amt = r.details?.["Award Amount"] || r.details?.["Grant Amount"];
        if (amt) {
          const num = parseFloat(amt.replace(/[^0-9.-]/g, ""));
          if (!isNaN(num)) totalContracts += num;
        }
      }
    }

    const dbCount = Object.keys(categoryCounts).length;
    const sortedCategories = Object.entries(categoryCounts)
      .sort((a, b) => b[1] - a[1]);

    return { categoryCounts, dbCount, sortedCategories, totalDonations, totalContracts };
  }, [results]);

  if (results.length === 0) return null;

  const fmt = (n: number) => new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(n);

  return (
    <div className="border border-border rounded-xl overflow-hidden bg-card shadow-sm">
      <div className="px-5 py-4 border-b border-border flex items-center gap-2">
        <BarChart3 className="h-4 w-4 text-muted-foreground" />
        <h2 className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
          Record Profile Summary
        </h2>
      </div>

      <div className="px-5 py-4">
        {/* Headline stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-5">
          <div className="text-center p-3 rounded-lg bg-muted/30 border border-border/50">
            <div className="text-2xl font-bold text-foreground">{results.length}</div>
            <div className="text-[11px] text-muted-foreground font-medium">Total Records</div>
          </div>
          <div className="text-center p-3 rounded-lg bg-muted/30 border border-border/50">
            <div className="text-2xl font-bold text-foreground">{profile.dbCount}</div>
            <div className="text-[11px] text-muted-foreground font-medium">Databases</div>
          </div>
          {profile.totalDonations > 0 && (
            <div className="text-center p-3 rounded-lg bg-muted/30 border border-border/50">
              <div className="text-lg font-bold text-foreground">{fmt(profile.totalDonations)}</div>
              <div className="text-[11px] text-muted-foreground font-medium">Donations</div>
            </div>
          )}
          {profile.totalContracts > 0 && (
            <div className="text-center p-3 rounded-lg bg-muted/30 border border-border/50">
              <div className="text-lg font-bold text-foreground">{fmt(profile.totalContracts)}</div>
              <div className="text-[11px] text-muted-foreground font-medium">Contracts</div>
            </div>
          )}
        </div>

        {/* Category breakdown */}
        <div className="space-y-2">
          {profile.sortedCategories.map(([cat, count]) => {
            const config = CATEGORY_CONFIG[cat];
            if (!config) return null;
            const Icon = config.icon;
            const pct = Math.round((count / results.length) * 100);

            return (
              <div key={cat} className="flex items-center gap-3">
                <Icon className={`h-4 w-4 shrink-0 ${config.color}`} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-medium text-foreground">{config.label}</span>
                    <span className="text-xs text-muted-foreground">
                      {count} {count === 1 ? config.singular : `${config.singular}s`}
                    </span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-1.5">
                    <div
                      className="h-1.5 rounded-full bg-accent transition-all"
                      style={{ width: `${Math.max(pct, 4)}%` }}
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Factual disclaimer */}
        <p className="text-[10px] text-muted-foreground mt-4 leading-relaxed">
          This summary counts records returned by database searches. Record matches do not confirm identity or imply wrongdoing.
        </p>
      </div>
    </div>
  );
};

export default RecordProfileSummary;
