import {
  Building2,
  Vote,
  Scale,
  Home,
  BadgeCheck,
  MoreHorizontal,
} from "lucide-react";

const features = [
  {
    icon: Building2,
    title: "Business Registrations",
    description: "Search Secretary of State records for corporate filings, LLCs, and registered agents.",
  },
  {
    icon: Vote,
    title: "Campaign Donations",
    description: "FEC filings and political contributions at the federal, state, and local level.",
  },
  {
    icon: Scale,
    title: "Court Records",
    description: "Public legal documents including civil, criminal, and bankruptcy filings.",
  },
  {
    icon: Home,
    title: "Property Records",
    description: "Real estate ownership, deeds, mortgages, and assessment data by county.",
  },
  {
    icon: BadgeCheck,
    title: "Professional Licenses",
    description: "State licensing board records for doctors, lawyers, contractors, and more.",
  },
  {
    icon: MoreHorizontal,
    title: "More Coming Soon",
    description: "We're expanding our database coverage. New record types added regularly.",
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

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
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
