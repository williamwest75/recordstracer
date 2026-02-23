import Header from "@/components/landing/Header";
import Footer from "@/components/landing/Footer";

const About = () => (
  <div className="min-h-screen flex flex-col bg-background">
    <Header />
    <main className="flex-1">
      {/* Hero */}
      <section className="py-16 md:py-24" style={{ backgroundColor: "hsl(210, 36%, 23%)" }}>
        <div className="container mx-auto px-4 lg:px-8 text-center">
          <h1 className="font-heading text-4xl md:text-5xl font-bold text-white mb-4">
            About Record Tracer
          </h1>
          <p className="text-lg md:text-xl max-w-2xl mx-auto" style={{ color: "hsl(43, 100%, 38%)" }}>
            Built for investigative journalists. Powered by public records.
          </p>
        </div>
      </section>

      {/* Content placeholder */}
      <section className="py-16">
        <div className="container mx-auto px-4 lg:px-8 max-w-3xl">
          <div className="prose prose-lg mx-auto">
            <p className="text-muted-foreground text-lg leading-relaxed">
              Full page content coming soon. This page will describe the mission, team, and values behind Record Tracer.
            </p>
          </div>
        </div>
      </section>
    </main>
    <Footer />
  </div>
);

export default About;
