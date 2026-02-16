import { useSearchParams, Link } from "react-router-dom";
import { Building2, Vote, Scale, Home, BadgeCheck, ExternalLink, Bookmark, Loader2, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import Header from "@/components/landing/Header";
import Footer from "@/components/landing/Footer";
import { useState, useEffect } from "react";

interface MockResult {
  id: string;
  source: string;
  description: string;
  category: string;
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
    { id: "1", source: `${state} Secretary of State`, description: `Registered agent for ${name} Holdings LLC, filed 2021.`, category: "business" },
    { id: "2", source: `${state} Division of Corporations`, description: `Officer listed on ${name} Enterprises Inc., active status.`, category: "business" },
    { id: "3", source: "FEC Individual Contributions", description: `$2,800 contribution to PAC "Citizens for Progress", Q3 2023.`, category: "donations" },
    { id: "4", source: "State Campaign Finance Board", description: `Multiple contributions totaling $5,200 in 2022 election cycle.`, category: "donations" },
    { id: "5", source: `${state} Circuit Court`, description: `Civil case #2022-CV-4521 — contract dispute, resolved.`, category: "court" },
    { id: "6", source: `${state} County Recorder`, description: `Property deed recorded at 1420 Oak Ave, assessed value $385,000.`, category: "property" },
    { id: "7", source: `${state} Property Appraiser`, description: `Two parcels registered under ${name}, total assessed $720,000.`, category: "property" },
    { id: "8", source: `${state} Licensing Board`, description: `Active real estate broker license #RB-88421, expires 2025.`, category: "licenses" },
  ];
}

const SearchResults = () => {
  const [searchParams] = useSearchParams();
  const name = searchParams.get("name") || "Unknown";
  const state = searchParams.get("state") || "Unknown";
  const [loading, setLoading] = useState(true);
  const [results, setResults] = useState<MockResult[]>([]);

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
                            <Button variant="outline" size="sm" className="gap-1.5">
                              <ExternalLink className="h-3.5 w-3.5" /> View Details
                            </Button>
                            <Button variant="ghost" size="sm" className="gap-1.5 text-muted-foreground">
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
    </div>
  );
};

export default SearchResults;
