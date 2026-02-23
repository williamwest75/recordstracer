import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

const AnnouncementHero = () => (
  <section className="w-full bg-[#1A3A5C] py-16 md:py-24">
    <div className="container mx-auto px-4 lg:px-8 max-w-4xl text-center">
      <h1 className="font-heading text-3xl md:text-4xl lg:text-5xl font-bold text-white leading-tight mb-6">
        Record Tracer Does Not Just Find the Data. It Tells You What the Data Means.
      </h1>
      <p className="text-[#CBD5E1] text-base md:text-lg leading-relaxed mb-10 max-w-3xl mx-auto">
        Deep Research Analyst is a built-in AI investigative layer that reads your search results across all record types simultaneously — SEC filings, FEC campaign finance records, federal contracts, court records, and Florida corporate filings — and produces a structured investigative briefing in seconds. It finds the patterns. It flags the anomalies. It tells you exactly where to dig next. Think of it as having a veteran investigative editor sitting beside you, reading every document, and telling you what you might miss.
      </p>
      <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
        <Link to="/#how-it-works">
          <Button
            className="bg-white text-[#1A3A5C] hover:bg-white/90 font-semibold px-8 h-11 rounded-md"
          >
            See How It Works
          </Button>
        </Link>
        <Link to="/founding-member">
          <Button
            className="bg-[#C49A00] text-[#1A1A1A] hover:bg-[#C49A00]/90 font-semibold px-8 h-11 rounded-md"
          >
            Become a Founding Member
          </Button>
        </Link>
      </div>
    </div>
  </section>
);

export default AnnouncementHero;
