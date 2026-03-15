import {
  Building2,
  Vote,
  Scale,
  ShieldAlert,
  Leaf,
  HardHat,
  FileSearch,
  Globe,
  Brain,
  UserSearch,
  Network,
  FileText,
} from "lucide-react";

const features = [
  {
    icon: Building2,
    title: "Business & Corporate Filings",
    description: "Secretary of State records, LLCs, registered agents, and UCC filings across all 50 states.",
  },
  {
    icon: Scale,
    title: "Court & Legal Records",
    description: "Civil, criminal, and bankruptcy filings via CourtListener and PACER — federal and state.",
  },
  {
    icon: Vote,
    title: "Campaign Finance & Lobbying",
    description: "FEC donations, PAC networks, dark money trackers via OpenSecrets, and state-level filings.",
  },
  {
    icon: ShieldAlert,
    title: "Sanctions & Watchlists",
    description: "OFAC SDN list, OpenSanctions, ICIJ Offshore Leaks, and SAM.gov federal debarments.",
  },
  {
    icon: HardHat,
    title: "OSHA, EPA & FDA Enforcement",
    description: "Workplace safety violations, environmental actions, FDA recalls, and compliance records.",
  },
  {
    icon: Brain,
    title: "AI-Powered Analysis",
    description: "Subject briefings, Deep Research Analyst, entity resolution, and cross-reference alerts — all automated.",
  },
  {
    icon: FileSearch,
    title: "FOIA & Investigative Docs",
    description: "Search MuckRock's FOIA archive, generate custom FOIA letters, and browse OCCRP Aleph leak databases.",
  },
  {
    icon: Network,
    title: "Relationship Mapping",
    description: "Visual network maps showing connections between people, companies, and organizations across records.",
  },
  {
    icon: UserSearch,
    title: "Contact Intelligence",
    description: "Locate professional profiles, organizational affiliations, and contact pathways for subjects.",
  },
  {
    icon: FileText,
    title: "Investigative Dossier",
    description: "Auto-generated dossiers with timelines, campaign finance analysis, court record summaries, and export to PDF/DOCX.",
  },
  {
    icon: Leaf,
    title: "Property & License Records",
    description: "Property ownership, professional licenses, SEC insider trades, and government contracts.",
  },
  {
    icon: Globe,
    title: "20+ Databases — One Search",
    description: "Batch search up to 50 names, set email alerts for new records, and collaborate with your newsroom team.",
  },
];

const FeatureGrid = () => (
  <section id="how-it-works" className="py-20 lg:py-28">
    <div className="container mx-auto px-4 lg:px-8">
      <div className="text-center max-w-2xl mx-auto mb-14">
        <h2 className="font-heading text-3xl md:text-4xl font-bold text-foreground">
          One search. Every public record.
        </h2>
        <p className="mt-3 text-muted-foreground text-lg">
          Access the databases that matter for your investigation — all from a single platform.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
        {features.map(({ icon: Icon, title, description }) => (
          <div
            key={title}
            className="group border border-border rounded-lg p-6 bg-card hover:shadow-md transition-shadow"
          >
            <div className="h-10 w-10 rounded-md bg-accent/10 flex items-center justify-center mb-4">
              <Icon className="h-5 w-5 text-accent" />
            </div>
            <h3 className="font-heading text-lg font-semibold text-foreground mb-1.5">
              {title}
            </h3>
            <p className="text-sm text-muted-foreground leading-relaxed">{description}</p>
          </div>
        ))}
      </div>
    </div>
  </section>
);

export default FeatureGrid;
