import { useSearchParams, Link } from "react-router-dom";
import { Building2, Vote, Scale, Home, BadgeCheck, ExternalLink, Bookmark, Loader2, ArrowLeft, X, FolderPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import Header from "@/components/landing/Header";
import Footer from "@/components/landing/Footer";
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";

interface MockResult {
  id: string;
  source: string;
  description: string;
  category: string;
  details: Record<string, string>;
  sourceUrl?: string;
}

const CATEGORY_META: Record<string, { icon: typeof Building2; label: string }> = {
  business: { icon: Building2, label: "Business Registrations" },
  donations: { icon: Vote, label: "Campaign Donations (FEC)" },
  court: { icon: Scale, label: "Court Records" },
  property: { icon: Home, label: "Property Records" },
  licenses: { icon: BadgeCheck, label: "Professional Licenses" },
};

function generateMockResults(name: string, state: string): MockResult[] {
  return [
    {
      id: "1", source: `${state} Secretary of State`, category: "business",
      description: `Registered agent for ${name} Holdings LLC, filed 2021.`,
      sourceUrl: "#",
      details: { "Entity Name": `${name} Holdings LLC`, "Entity Type": "Limited Liability Company", "Status": "Active", "Filed Date": "03/15/2021", "Registered Agent": name, "Principal Address": `742 Evergreen Terrace, ${state}`, "Annual Report Due": "03/15/2026" },
    },
    {
      id: "2", source: `${state} Division of Corporations`, category: "business",
      description: `Officer listed on ${name} Enterprises Inc., active status.`,
      sourceUrl: "#",
      details: { "Entity Name": `${name} Enterprises Inc.`, "Entity Type": "Corporation", "Status": "Active", "Role": "Officer / Director", "Incorporation Date": "11/02/2018", "State": state, "EIN": "XX-XXX4829" },
    },
    {
      id: "3", source: "FEC Individual Contributions", category: "donations",
      description: `$2,800 contribution to PAC "Citizens for Progress", Q3 2023.`,
      sourceUrl: "https://www.fec.gov",
      details: { "Contributor": name, "Amount": "$2,800", "Recipient": "Citizens for Progress PAC", "Date": "09/12/2023", "Filing Period": "Q3 2023", "Employer": "Self-employed", "Occupation": "Real Estate" },
    },
    {
      id: "4", source: "State Campaign Finance Board", category: "donations",
      description: `Multiple contributions totaling $5,200 in 2022 election cycle.`,
      details: { "Contributor": name, "Total Amount": "$5,200", "Election Cycle": "2022", "Number of Contributions": "4", "Recipients": "Various state candidates", "Largest Single": "$1,500" },
    },
    {
      id: "5", source: `${state} Circuit Court`, category: "court",
      description: `Civil case #2022-CV-4521 — contract dispute, resolved.`,
      details: { "Case Number": "2022-CV-4521", "Court": `${state} Circuit Court`, "Type": "Civil — Contract Dispute", "Filed": "06/14/2022", "Status": "Resolved / Closed", "Parties": `${name} v. Greenfield Contractors Inc.`, "Disposition": "Settlement reached" },
    },
    {
      id: "6", source: `${state} County Recorder`, category: "property",
      description: `Property deed recorded at 1420 Oak Ave, assessed value $385,000.`,
      details: { "Address": "1420 Oak Ave", "Owner": name, "Assessed Value": "$385,000", "Parcel ID": "12-34-56-789", "Recorded": "08/22/2020", "Type": "Single Family Residential", "Land Area": "0.28 acres" },
    },
    {
      id: "7", source: `${state} Property Appraiser`, category: "property",
      description: `Two parcels registered under ${name}, total assessed $720,000.`,
      details: { "Owner": name, "Total Parcels": "2", "Combined Assessed Value": "$720,000", "Parcel 1": "1420 Oak Ave — $385,000", "Parcel 2": "980 Palm Dr — $335,000", "Tax Year": "2025" },
    },
    {
      id: "8", source: `${state} Licensing Board`, category: "licenses",
      description: `Active real estate broker license #RB-88421, expires 2025.`,
      details: { "License Number": "RB-88421", "Type": "Real Estate Broker", "Status": "Active", "Issued": "01/10/2019", "Expires": "01/10/2025", "Holder": name, "Disciplinary Actions": "None" },
    },
  ];
}

const SearchResults = () => {
  const [searchParams] = useSearchParams();
  const name = searchParams.get("name") || "Unknown";
  const state = searchParams.get("state") || "Unknown";
  const [loading, setLoading] = useState(true);
  const [results, setResults] = useState<MockResult[]>([]);
  const [selectedResult, setSelectedResult] = useState<MockResult | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    const timer = setTimeout(() => {
      setResults(generateMockResults(name, state));
      setLoading(false);
    }, 1500);
    return () => clearTimeout(timer);
  }, [name, state]);

  const grouped = results.reduce<Record<string, MockResult[]>>((acc, r) => {
    (acc[r.category] ??= []).push(r);
    return acc;
  }, {});

  const handleSaveToInvestigation = (result: MockResult) => {
    toast({ title: "Saved", description: `"${result.source}" added to your investigation.` });
    setSelectedResult(null);
  };

  const categoryForResult = (result: MockResult) => CATEGORY_META[result.category];

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      <main className="flex-1 container mx-auto px-4 lg:px-8 py-10 max-w-4xl">
        <Link to="/" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground mb-6">
          <ArrowLeft className="h-4 w-4" /> Back to search
        </Link>

        <h1 className="font-heading text-2xl md:text-3xl font-bold text-foreground">
          Results for: <span className="text-accent">{name}</span> in {state}
        </h1>
        <p className="text-muted-foreground mt-1 text-sm">
          Searching public records across multiple databases…
        </p>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-24 gap-3">
            <Loader2 className="h-8 w-8 animate-spin text-accent" />
            <p className="text-muted-foreground text-sm">Scanning databases…</p>
          </div>
        ) : (
          <div className="mt-8 space-y-8">
            {Object.entries(CATEGORY_META).map(([key, { icon: Icon, label }]) => {
              const items = grouped[key] || [];
              return (
                <section key={key}>
                  <div className="flex items-center gap-2 mb-3">
                    <Icon className="h-5 w-5 text-accent" />
                    <h2 className="font-heading text-lg font-semibold text-foreground">{label}</h2>
                    <span className="text-xs text-muted-foreground ml-1">({items.length})</span>
                  </div>

                  {items.length === 0 ? (
                    <p className="text-sm text-muted-foreground italic pl-7">No records found in this category.</p>
                  ) : (
                    <div className="space-y-3 pl-7">
                      {items.map((item) => (
                        <div key={item.id} className="border border-border rounded-lg p-4 bg-card flex flex-col sm:flex-row sm:items-center gap-3">
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold text-foreground">{item.source}</p>
                            <p className="text-sm text-muted-foreground mt-0.5">{item.description}</p>
                          </div>
                          <div className="flex items-center gap-2 shrink-0">
                            <Button variant="outline" size="sm" className="gap-1.5" onClick={() => setSelectedResult(item)}>
                              <ExternalLink className="h-3.5 w-3.5" /> View Details
                            </Button>
                            <Button variant="ghost" size="sm" className="gap-1.5 text-muted-foreground" onClick={() => handleSaveToInvestigation(item)}>
                              <Bookmark className="h-3.5 w-3.5" /> Save
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </section>
              );
            })}
          </div>
        )}
      </main>
      <Footer />

      {/* Record Detail Modal */}
      <Dialog open={!!selectedResult} onOpenChange={(open) => !open && setSelectedResult(null)}>
        <DialogContent className="sm:max-w-lg max-h-[85vh] overflow-y-auto">
          {selectedResult && (() => {
            const meta = categoryForResult(selectedResult);
            const Icon = meta?.icon ?? Building2;
            return (
              <>
                <DialogHeader>
                  <div className="flex items-center gap-2 text-accent mb-1">
                    <Icon className="h-4 w-4" />
                    <span className="text-xs font-medium uppercase tracking-wide">{meta?.label}</span>
                  </div>
                  <DialogTitle className="font-heading text-lg leading-snug">
                    {selectedResult.source}
                  </DialogTitle>
                  <p className="text-sm text-muted-foreground mt-1">{selectedResult.description}</p>
                </DialogHeader>

                <Separator className="my-2" />

                <div className="space-y-3">
                  <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Record Details</h3>
                  <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-2 text-sm">
                    {Object.entries(selectedResult.details).map(([key, value]) => (
                      <div key={key} className="contents">
                        <dt className="font-medium text-foreground whitespace-nowrap">{key}</dt>
                        <dd className="text-muted-foreground">{value}</dd>
                      </div>
                    ))}
                  </dl>
                </div>

                {selectedResult.sourceUrl && (
                  <>
                    <Separator className="my-2" />
                    <div>
                      <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-2">Source</h3>
                      <a
                        href={selectedResult.sourceUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 text-sm text-accent hover:underline"
                      >
                        <ExternalLink className="h-3.5 w-3.5" /> View on {selectedResult.source}
                      </a>
                    </div>
                  </>
                )}

                <Separator className="my-2" />

                <div className="flex items-center gap-2 justify-end">
                  <Button variant="outline" size="sm" onClick={() => setSelectedResult(null)}>
                    Close
                  </Button>
                  <Button variant="accent" size="sm" className="gap-1.5" onClick={() => handleSaveToInvestigation(selectedResult)}>
                    <FolderPlus className="h-3.5 w-3.5" /> Save to Investigation
                  </Button>
                </div>
              </>
            );
          })()}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default SearchResults;
