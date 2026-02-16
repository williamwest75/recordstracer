import { Globe, Sparkles, Users } from "lucide-react";

const badges = [
  { icon: Globe, label: "50 states covered" },
  { icon: Sparkles, label: "AI-powered analysis" },
  { icon: Users, label: "Built by journalists" },
];

const Badges = () => (
  <section className="border-y border-border bg-card/50">
    <div className="container mx-auto px-4 lg:px-8 py-6 flex flex-wrap items-center justify-center gap-8 md:gap-16">
      {badges.map(({ icon: Icon, label }) => (
        <div key={label} className="flex items-center gap-2 text-muted-foreground">
          <Icon className="h-5 w-5 text-accent" />
          <span className="text-sm font-semibold tracking-wide uppercase">{label}</span>
        </div>
      ))}
    </div>
  </section>
);

export default Badges;
