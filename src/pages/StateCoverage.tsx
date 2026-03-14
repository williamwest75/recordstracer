import { useMemo, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import { MapPin, Building2, Scale, Vote, Home, Gavel, FileSearch, ArrowLeft } from "lucide-react";
import Header from "@/components/landing/Header";
import Footer from "@/components/landing/Footer";
import UsMap from "@/components/coverage/UsMap";
import { getAllStateRecords, type StateRecordSet } from "@/data/state-records-registry";

function totalSources(s: StateRecordSet) {
  return s.statewide.length + s.licenses.length + s.campaignFinance.length + s.federal.length + s.propertyCounties.length + s.clerkCounties.length;
}

function deepLinkCount(s: StateRecordSet) {
  return [...s.statewide, ...s.licenses, ...s.campaignFinance, ...s.federal].filter(r => r.deepLinkable).length;
}

const categoryIcons = [
  { key: "statewide", icon: Gavel, label: "Statewide" },
  { key: "licenses", icon: Scale, label: "Licenses" },
  { key: "campaignFinance", icon: Vote, label: "Campaign Finance" },
  { key: "federal", icon: Building2, label: "Federal" },
  { key: "propertyCounties", icon: Home, label: "Property" },
  { key: "clerkCounties", icon: FileSearch, label: "Clerk" },
] as const;

const StateCoverage = () => {
  const navigate = useNavigate();
  const states = useMemo(() => getAllStateRecords(), []);
  const totalAll = useMemo(() => states.reduce((sum, s) => sum + totalSources(s), 0), [states]);
  const totalDeep = useMemo(() => states.reduce((sum, s) => sum + deepLinkCount(s), 0), [states]);

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      <main className="flex-1">
        {/* Hero */}
        <section className="border-b border-border bg-card/50">
          <div className="container mx-auto px-4 lg:px-8 py-12 md:py-16">
            <Link to="/" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mb-6">
              <ArrowLeft className="h-3.5 w-3.5" /> Back to Home
            </Link>
            <div className="flex items-center gap-3 mb-4">
              <MapPin className="h-7 w-7 text-accent" />
              <h1 className="font-heading text-3xl md:text-4xl font-bold text-foreground tracking-tight">
                50-State Coverage
              </h1>
            </div>
            <p className="text-muted-foreground max-w-2xl text-lg">
              Record Tracer links directly to government databases in every U.S. state.
              Below is a breakdown of every data source we connect to.
            </p>
            <div className="flex gap-6 mt-6">
              <div className="text-center">
                <p className="text-3xl font-bold text-accent">{states.length}</p>
                <p className="text-xs text-muted-foreground uppercase tracking-wide">States</p>
              </div>
              <div className="text-center">
                <p className="text-3xl font-bold text-foreground">{totalAll.toLocaleString()}</p>
                <p className="text-xs text-muted-foreground uppercase tracking-wide">Total Sources</p>
              </div>
              <div className="text-center">
                <p className="text-3xl font-bold text-foreground">{totalDeep}</p>
                <p className="text-xs text-muted-foreground uppercase tracking-wide">Deep-Linked</p>
              </div>
            </div>
          </div>
        </section>

        {/* Grid */}
        <section className="container mx-auto px-4 lg:px-8 py-10">
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {states.map((s) => {
              const total = totalSources(s);
              const deep = deepLinkCount(s);
              return (
                <button
                  onClick={() => navigate(`/?state=${encodeURIComponent(s.stateName)}`)}
                  key={s.stateCode}
                  className="rounded-lg border border-border bg-card p-4 hover:border-accent/40 transition-colors text-left cursor-pointer group"
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-accent bg-accent/10 rounded px-1.5 py-0.5">
                        {s.stateCode}
                      </span>
                      <h2 className="font-heading text-sm font-semibold text-foreground">{s.stateName}</h2>
                    </div>
                    <span className="text-xs text-muted-foreground">{total} sources</span>
                  </div>
                  <div className="flex flex-wrap gap-x-3 gap-y-1.5 text-xs text-muted-foreground">
                    {categoryIcons.map(({ key, icon: Icon, label }) => {
                      const count = key === "propertyCounties" || key === "clerkCounties"
                        ? s[key].length
                        : s[key as keyof Pick<StateRecordSet, "statewide" | "licenses" | "campaignFinance" | "federal">].length;
                      if (count === 0) return null;
                      return (
                        <span key={key} className="inline-flex items-center gap-1">
                          <Icon className="h-3 w-3" />
                          {count} {label}
                        </span>
                      );
                    })}
                  </div>
                  {deep > 0 && (
                    <p className="text-[11px] text-accent mt-2">{deep} deep-linked</p>
                  )}
                </button>
              );
            })}
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default StateCoverage;
