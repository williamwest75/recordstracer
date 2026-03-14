import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { MapPin } from "lucide-react";

const AnnouncementHero = () => (
  <section className="w-full bg-primary py-16 md:py-24">
    <div className="container mx-auto px-4 lg:px-8 max-w-4xl text-center">
      <div className="inline-flex items-center gap-2 rounded-full border border-accent/30 bg-accent/10 px-4 py-1.5 mb-6">
        <MapPin className="h-3.5 w-3.5 text-accent" />
        <span className="text-xs font-semibold text-accent uppercase tracking-wide">Now covering all 50 states</span>
      </div>
      <h1 className="font-heading text-3xl md:text-4xl lg:text-5xl font-bold text-primary-foreground leading-tight mb-3">
        One search. Every public record.
      </h1>
      <p className="text-primary-foreground/70 text-lg md:text-xl leading-relaxed mb-6 max-w-3xl mx-auto">
        Access the databases that matter for your investigation — across all 50 states, from a single platform.
      </p>
      <p className="text-primary-foreground/70 text-base md:text-lg leading-relaxed mb-4 max-w-3xl mx-auto text-left">
        Public records are a tool to help you tell a story — but finding them, connecting them, and knowing what they mean together is where most investigations stall. Record Tracer was built by a journalist as a tool for all journalists. One search pulls FEC campaign finance records, federal and state court filings, business registrations across all 50 states, sanctions databases, and offshore entity records simultaneously — then does something no database browser does. It reads the results across every source at once and tells you what the data shows, where the same name appears across multiple records, and what a journalist would do next. It finds the patterns. It flags the anomalies. Every finding links directly to its original government source. No assumptions. No conclusions. Just the facts, organized so anyone can follow them.
      </p>
      <p className="text-primary-foreground/70 text-sm md:text-base leading-relaxed mb-10 max-w-3xl mx-auto text-left italic mt-6">
        I am a journalist who built the tool I always wished existed.
      </p>
      <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
        <Link to="/#how-it-works">
          <Button
            className="bg-primary-foreground text-primary hover:bg-primary-foreground/90 font-semibold px-8 h-11 rounded-md"
          >
            See How It Works
          </Button>
        </Link>
        <Link to="/founding-member">
          <Button
            className="bg-accent text-accent-foreground hover:bg-accent/90 font-semibold px-8 h-11 rounded-md"
          >
            Become a Founding Member
          </Button>
        </Link>
        <Link to="/coverage">
          <Button
            variant="outline"
            className="border-primary-foreground/20 text-primary-foreground hover:bg-primary-foreground/10 font-semibold px-8 h-11 rounded-md"
          >
            View State Coverage
          </Button>
        </Link>
      </div>
    </div>
  </section>
);

export default AnnouncementHero;
