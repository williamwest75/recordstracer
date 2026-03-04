import { useState } from "react";
import {
  ExternalLink,
  Briefcase,
  Stethoscope,
  Scale,
  DollarSign,
  Building2,
  Gavel,
  ShieldAlert,
  AlertTriangle,
  Vote,
  FileText,
  Home,
  ChevronDown,
  ChevronUp,
  Search,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  PROFESSIONAL_LICENSE_SOURCES,
  STATEWIDE_SOURCES,
  COUNTY_PROPERTY_SOURCES,
  COUNTY_CLERK_SOURCES,
  type RecordSource,
  type CountyPropertySource,
} from "@/data/florida-public-records";

const ICON_MAP: Record<string, React.ElementType> = {
  Briefcase,
  Stethoscope,
  Scale,
  DollarSign,
  Building2,
  Gavel,
  ShieldAlert,
  AlertTriangle,
  Vote,
  FileText,
  Home,
};

interface PublicRecordsLinksProps {
  searchName: string;
  state: string;
}

function SourceCard({ source }: { source: RecordSource }) {
  const Icon = ICON_MAP[source.icon] || Search;
  return (
    <a
      href={source.searchUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="group flex items-start gap-3 rounded-lg border border-border bg-card p-3 hover:border-accent/40 hover:bg-accent/5 transition-colors"
    >
      <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-accent/10 text-accent">
        <Icon className="h-4 w-4" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-foreground group-hover:text-accent transition-colors leading-tight">
          {source.name}
        </p>
        <p className="text-xs text-muted-foreground mt-0.5">{source.agency}</p>
        <p className="text-xs text-muted-foreground/70 mt-0.5 line-clamp-1">{source.description}</p>
      </div>
      <ExternalLink className="h-3.5 w-3.5 shrink-0 text-muted-foreground/50 group-hover:text-accent mt-1 transition-colors" />
    </a>
  );
}

function CountyLink({ source }: { source: CountyPropertySource }) {
  return (
    <a
      href={source.url}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex items-center gap-1.5 rounded-md border border-border bg-card px-3 py-1.5 text-xs font-medium text-foreground hover:border-accent/40 hover:text-accent transition-colors"
    >
      <Home className="h-3 w-3" />
      {source.county}
      <ExternalLink className="h-2.5 w-2.5 text-muted-foreground/50" />
    </a>
  );
}

const DEFAULT_COUNTIES = 8;

export default function PublicRecordsLinks({ searchName, state }: PublicRecordsLinksProps) {
  const [showAllCounties, setShowAllCounties] = useState(false);
  const isFlorida = state.toLowerCase().includes("florida") || state.toLowerCase() === "fl";

  if (!isFlorida) return null;

  const visiblePropertyCounties = showAllCounties
    ? COUNTY_PROPERTY_SOURCES
    : COUNTY_PROPERTY_SOURCES.slice(0, DEFAULT_COUNTIES);

  return (
    <section className="space-y-4">
      <div className="flex items-center gap-2">
        <Search className="h-5 w-5 text-accent" />
        <h2 className="font-heading text-lg font-semibold text-foreground">
          Florida Public Records
        </h2>
        <span className="text-xs text-muted-foreground ml-1">
          Search for "{searchName}" in state databases
        </span>
      </div>

      {/* Professional Licenses */}
      <div className="space-y-2">
        <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground pl-1">
          Professional Licenses
        </h3>
        <div className="grid gap-2 sm:grid-cols-2">
          {PROFESSIONAL_LICENSE_SOURCES.map((s) => (
            <SourceCard key={s.id} source={s} />
          ))}
        </div>
      </div>

      {/* Statewide Records */}
      <div className="space-y-2">
        <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground pl-1">
          Statewide Records
        </h3>
        <div className="grid gap-2 sm:grid-cols-2">
          {STATEWIDE_SOURCES.map((s) => (
            <SourceCard key={s.id} source={s} />
          ))}
        </div>
      </div>

      {/* County Property Appraisers */}
      <div className="space-y-2">
        <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground pl-1">
          County Property Appraisers
        </h3>
        <div className="flex flex-wrap gap-1.5">
          {visiblePropertyCounties.map((s) => (
            <CountyLink key={s.county} source={s} />
          ))}
        </div>
        {COUNTY_PROPERTY_SOURCES.length > DEFAULT_COUNTIES && (
          <button
            onClick={() => setShowAllCounties((v) => !v)}
            className="inline-flex items-center gap-1 text-xs text-accent hover:underline font-medium"
          >
            {showAllCounties ? (
              <>
                <ChevronUp className="h-3 w-3" /> Show fewer
              </>
            ) : (
              <>
                <ChevronDown className="h-3 w-3" /> Show all {COUNTY_PROPERTY_SOURCES.length} counties
              </>
            )}
          </button>
        )}
      </div>

      {/* County Clerk / Official Records */}
      <div className="space-y-2">
        <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground pl-1">
          County Clerk / Official Records
        </h3>
        <div className="flex flex-wrap gap-1.5">
          {COUNTY_CLERK_SOURCES.map((s) => (
            <CountyLink key={s.county} source={s} />
          ))}
        </div>
      </div>

      <p className="text-[11px] text-muted-foreground/60 pl-1">
        These links open external Florida government websites. Enter the subject's name to search each database.
      </p>
    </section>
  );
}
