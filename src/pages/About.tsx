import Header from "@/components/landing/Header";
import Footer from "@/components/landing/Footer";

const About = () => (
  <div className="min-h-screen flex flex-col bg-background">
    <Header />
    <main className="flex-1">
      {/* Hero */}
      <section className="py-16 md:py-24 bg-primary">
        <div className="container mx-auto px-4 lg:px-8 text-center">
          <h1 className="font-heading text-4xl md:text-5xl font-bold text-primary-foreground mb-4">
            About Record Tracer
          </h1>
          <p className="text-lg md:text-xl max-w-2xl mx-auto text-accent">
            Built by a journalist. For journalists.
          </p>
        </div>
      </section>

      {/* Content */}
      <section className="py-16">
        <div className="container mx-auto px-4 lg:px-8 max-w-3xl space-y-16">

          {/* Origin */}
          <div className="space-y-5">
            <p className="text-foreground/90 text-lg leading-relaxed">
              Record Tracer was not built in a Silicon Valley office by a team of engineers who thought journalism needed disrupting. It was built by a working journalist who spent 30 years doing the job and got tired of watching the tools fall short.
            </p>
            <p className="text-foreground/90 text-lg leading-relaxed">
              The investigative research that used to require a dedicated team, a research budget, and days of work should not be out of reach for an independent journalist, a one-person newsroom, or a multimedia journalist covering three beats alone on deadline. Record Tracer exists to close that gap.
            </p>
            <p className="text-foreground/90 text-lg leading-relaxed">
              The idea is simple. Every journalist deserves access to the same investigative research capabilities as the biggest newsrooms in the country. SEC filings, FEC campaign finance records, federal contracts, court records, and state corporate filings — cross-referenced, analyzed, and delivered in seconds. Not days.
            </p>
            <p className="text-foreground/90 text-lg leading-relaxed">
              Deep Research Analyst takes it one step further. It does not just surface the data. It reads the data the way a veteran investigative journalist would, flags what matters, and tells you exactly where to look next.
            </p>
          </div>

          {/* Quote */}
          <blockquote className="border-l-4 border-accent pl-6 py-4 italic text-xl font-heading text-foreground/80">
            "AI is not here to replace you as a journalist. But you, as a journalist, can use AI to save journalism."
          </blockquote>

          {/* Who Built This */}
          <div className="space-y-5">
            <h2 className="font-heading text-3xl font-bold text-foreground">Who Built This</h2>
            <p className="text-foreground/90 text-lg leading-relaxed">
              Joey West is a 30-year broadcast journalism veteran based in the Tampa Bay area of Florida. He is the founder of Record Tracer, AgendaTrace, and Blue Current News — three AI-powered journalism tools built to give independent journalists, MMJs, journalism students, and news desert communities the resources to do the work that matters.
            </p>
            <p className="text-foreground/90 text-lg leading-relaxed">
              He is not a technologist. He is a journalist who built the tools he always wished existed.
            </p>
          </div>

          {/* Mission */}
          <div className="space-y-5">
            <h2 className="font-heading text-3xl font-bold text-foreground">Our Mission</h2>
            <p className="text-foreground/90 text-lg leading-relaxed">
              More than 50 million Americans currently have limited or no access to reliable local news. In over 1,000 U.S. counties, there is not one full-time journalist. City council meetings go unreported. School board votes go unchallenged. Environmental violations go undocumented.
            </p>
            <p className="text-foreground/90 text-lg leading-relaxed">
              Record Tracer is built for the journalists willing to cover those communities. For the students just starting out. For the MMJs doing everything alone on deadline. For anyone who believes accountability journalism is worth fighting for.
            </p>
          </div>

          {/* Closing */}
          <div className="text-center py-8">
            <p className="font-heading text-2xl font-bold text-foreground mb-2">
              One tool. One journalist. One community at a time.
            </p>
            <p className="text-lg font-semibold text-accent">
              #SaveJournalism
            </p>
          </div>

        </div>
      </section>
    </main>
    <Footer />
  </div>
);

export default About;
