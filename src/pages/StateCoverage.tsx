import { useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import { MapPin, Building2, Scale, Vote, Home, Gavel, FileSearch, ArrowLeft } from "lucide-react";
import Header from "@/components/landing/Header";
import Footer from "@/components/landing/Footer";
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

// Simplified SVG paths for US states — viewBox 0 0 960 600
const STATE_PATHS: Record<string, string> = {
  AL: "M628,425 L628,468 L622,493 L631,494 L632,502 L619,502 L612,493 L612,425Z",
  AK: "M161,485 L183,485 L183,510 L193,520 L183,530 L161,530 L150,520 L150,510Z",
  AZ: "M205,395 L275,395 L275,470 L240,490 L205,470Z",
  AR: "M560,415 L610,415 L610,460 L560,460Z",
  CA: "M120,285 L165,285 L185,340 L185,430 L150,455 L120,430Z",
  CO: "M295,305 L385,305 L385,365 L295,365Z",
  CT: "M852,215 L876,210 L880,230 L858,235Z",
  DE: "M810,305 L822,298 L825,320 L812,320Z",
  FL: "M645,465 L700,460 L730,495 L720,535 L685,555 L660,530 L640,495Z",
  GA: "M650,395 L695,395 L700,458 L650,465Z",
  HI: "M260,515 L295,510 L300,530 L270,535Z",
  ID: "M220,175 L260,175 L275,265 L235,285 L220,250Z",
  IL: "M580,275 L610,275 L615,365 L590,380 L575,365 L575,310Z",
  IN: "M620,280 L650,275 L655,360 L620,365Z",
  IA: "M510,250 L575,250 L575,305 L510,305Z",
  KS: "M420,335 L510,335 L510,390 L420,390Z",
  KY: "M620,345 L700,335 L710,365 L640,375 L620,365Z",
  LA: "M555,462 L605,462 L610,510 L580,520 L555,500Z",
  ME: "M870,115 L895,105 L905,150 L880,180 L870,155Z",
  MD: "M765,300 L810,290 L815,320 L770,325Z",
  MA: "M850,195 L890,190 L892,205 L852,210Z",
  MI: "M600,175 L650,175 L660,195 L640,230 L615,250 L600,230Z M620,145 L660,140 L665,175 L625,180Z",
  MN: "M480,135 L545,135 L545,230 L480,230Z",
  MS: "M590,420 L618,420 L618,493 L605,500 L590,490Z",
  MO: "M520,320 L575,320 L580,400 L540,415 L520,395Z",
  MT: "M260,120 L380,120 L380,195 L260,195Z",
  NE: "M380,275 L475,270 L480,325 L380,330Z",
  NV: "M185,260 L230,260 L240,385 L195,385Z",
  NH: "M862,145 L878,140 L880,190 L862,195Z",
  NJ: "M820,260 L835,250 L838,300 L822,310Z",
  NM: "M260,395 L345,395 L345,485 L260,485Z",
  NY: "M770,170 L845,160 L855,210 L810,235 L775,230 L770,200Z",
  NC: "M675,370 L780,360 L790,385 L760,395 L675,395Z",
  ND: "M390,130 L475,130 L475,195 L390,195Z",
  OH: "M655,265 L705,260 L710,335 L660,340Z",
  OK: "M390,395 L505,395 L510,380 L510,340 L420,340 L420,380 L390,395Z",
  OR: "M120,160 L215,160 L220,245 L145,260 L120,230Z",
  PA: "M735,235 L815,225 L820,280 L740,285Z",
  RI: "M870,215 L880,212 L882,228 L872,230Z",
  SC: "M690,390 L745,375 L760,400 L720,420 L690,410Z",
  SD: "M390,200 L475,200 L475,268 L390,273Z",
  TN: "M610,375 L720,365 L725,395 L610,405Z",
  TX: "M345,400 L445,395 L505,400 L510,450 L490,510 L440,545 L380,530 L345,485Z",
  UT: "M245,270 L300,270 L300,375 L245,385Z",
  VT: "M848,140 L862,138 L864,190 L850,193Z",
  VA: "M700,310 L790,300 L800,345 L720,360 L695,340Z",
  WA: "M135,95 L225,95 L225,165 L145,170 L135,140Z",
  WV: "M710,295 L740,290 L750,340 L730,360 L710,340Z",
  WI: "M540,145 L595,150 L600,240 L545,245 L535,210Z",
  WY: "M285,195 L375,195 L375,275 L285,275Z",
};

function getMapColor(count: number, min: number, max: number): string {
  const t = max === min ? 1 : (count - min) / (max - min);
  const h = 210 + t * (43 - 210);
  const s = 15 + t * (100 - 15);
  const l = 80 - t * 38;
  return `hsl(${h}, ${s}%, ${l}%)`;
}

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
