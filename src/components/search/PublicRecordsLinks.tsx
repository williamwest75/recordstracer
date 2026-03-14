import { useState, useCallback } from "react";
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
  Copy,
  Check,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import type { RecordSource, CountyPropertySource } from "@/data/florida-public-records";
import { getStateRecords, getSupportedStates } from "@/data/state-records-registry";

const ICON_MAP: Record<string, React.ElementType> = {
  Briefcase, Stethoscope, Scale, DollarSign, Building2, Gavel,
  ShieldAlert, AlertTriangle, Vote, FileText, Home, Search,
};

interface PublicRecordsLinksProps {
  searchName: string;
  state: string;
}

function getSourceUrl(source: RecordSource, searchName: string): string {
  if (source.deepLinkable && source.urlTemplate) {
    return source.urlTemplate.replace("${name}", encodeURIComponent(searchName));
  }
  return source.searchUrl;
}

function SourceCard({ source, searchName }: { source: RecordSource; searchName: string }) {
  const Icon = ICON_MAP[source.icon] || Search;
  const url = getSourceUrl(source, searchName);
  const isDeepLinked = source.deepLinkable === true;

  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className={`group flex items-start gap-3 rounded-lg border p-3 transition-colors ${
        isDeepLinked
          ? "border-accent/30 bg-accent/5 hover:border-accent/60 hover:bg-accent/10"
          : "border-border bg-card hover:border-accent/40 hover:bg-accent/5"
      }`}
    >
      <div className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-md ${
        isDeepLinked ? "bg-accent/20 text-accent" : "bg-accent/10 text-accent"
      }`}>
        <Icon className="h-4 w-4" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-foreground group-hover:text-accent transition-colors leading-tight">
          {source.name}
        </p>
        <p className="text-xs text-muted-foreground mt-0.5">{source.agency}</p>
        <p className="text-xs text-muted-foreground/70 mt-0.5 line-clamp-1">{source.description}</p>
        {isDeepLinked ? (
          <p className="text-xs font-medium text-accent mt-1.5">
            Search for "{searchName}" →
          </p>
        ) : (
          <p className="text-xs text-muted-foreground/60 mt-1.5">
            Open search page · enter name manually
          </p>
        )}
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
  const [copied, setCopied] = useState(false);

  const stateData = getStateRecords(state);

  const copyName = useCallback(() => {
    navigator.clipboard.writeText(searchName).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }, [searchName]);

  if (!stateData) {
    return (
      <section className="rounded-lg border border-border bg-card p-4 space-y-2">
        <div className="flex items-center gap-2">
          <Search className="h-5 w-5 text-muted-foreground" />
          <h2 className="font-heading text-lg font-semibold text-foreground">Public Records Links</h2>
        </div>
        <p className="text-sm text-muted-foreground">
          State-specific public records links are available for{" "}
          {getSupportedStates().join(", ")}. 
          Select one of these states to see deep-linked record portals.
        </p>
      </section>
    );
  }

  const visiblePropertyCounties = showAllCounties
    ? stateData.propertyCounties
    : stateData.propertyCounties.slice(0, DEFAULT_COUNTIES);

  return (
    <section className="space-y-4">
      <div className="flex items-center gap-2 flex-wrap">
        <Search className="h-5 w-5 text-accent" />
        <h2 className="font-heading text-lg font-semibold text-foreground">
          {stateData.stateName} Public Records
        </h2>
        <span className="text-xs text-muted-foreground ml-1">
          Search for "{searchName}" in state databases
        </span>
        <Button variant="outline" size="sm" onClick={copyName} className="ml-auto h-7 gap-1.5 text-xs">
          {copied ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
          {copied ? "Copied!" : "Copy Name"}
        </Button>
      </div>

      {stateData.licenses.length > 0 && (
        <div className="space-y-2">
          <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground pl-1">Professional Licenses</h3>
          <div className="grid gap-2 sm:grid-cols-2">
            {stateData.licenses.map((s) => <SourceCard key={s.id} source={s} searchName={searchName} />)}
          </div>
        </div>
      )}

      {stateData.campaignFinance.length > 0 && (
        <div className="space-y-2">
          <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground pl-1">Political & Campaign Finance</h3>
          <div className="grid gap-2 sm:grid-cols-2">
            {stateData.campaignFinance.map((s) => <SourceCard key={s.id} source={s} searchName={searchName} />)}
          </div>
        </div>
      )}

      {stateData.federal.length > 0 && (
        <div className="space-y-2">
          <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground pl-1">Federal Records</h3>
          <div className="grid gap-2 sm:grid-cols-2">
            {stateData.federal.map((s) => <SourceCard key={s.id} source={s} searchName={searchName} />)}
          </div>
        </div>
      )}

      {stateData.statewide.length > 0 && (
        <div className="space-y-2">
          <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground pl-1">Statewide Records</h3>
          <div className="grid gap-2 sm:grid-cols-2">
            {stateData.statewide.map((s) => <SourceCard key={s.id} source={s} searchName={searchName} />)}
          </div>
        </div>
      )}

      {stateData.propertyCounties.length > 0 && (
        <div className="space-y-2">
          <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground pl-1">County Property Appraisers</h3>
          <div className="flex flex-wrap gap-1.5">
            {visiblePropertyCounties.map((s) => <CountyLink key={s.county} source={s} />)}
          </div>
          {stateData.propertyCounties.length > DEFAULT_COUNTIES && (
            <button
              onClick={() => setShowAllCounties((v) => !v)}
              className="inline-flex items-center gap-1 text-xs text-accent hover:underline font-medium"
            >
              {showAllCounties ? (
                <><ChevronUp className="h-3 w-3" /> Show fewer</>
              ) : (
                <><ChevronDown className="h-3 w-3" /> Show all {stateData.propertyCounties.length} counties</>
              )}
            </button>
          )}
        </div>
      )}

      {stateData.clerkCounties.length > 0 && (
        <div className="space-y-2">
          <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground pl-1">County Clerk / Official Records</h3>
          <div className="flex flex-wrap gap-1.5">
            {stateData.clerkCounties.map((s) => <CountyLink key={s.county} source={s} />)}
          </div>
        </div>
      )}

      <p className="text-[11px] text-muted-foreground/60 pl-1">
        These links open external government websites. Deep-linked sources pre-populate the search name; others require manual entry.
      </p>
    </section>
  );
}
