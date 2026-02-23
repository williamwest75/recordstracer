import Header from "@/components/landing/Header";
import Footer from "@/components/landing/Footer";

const Privacy = () => (
  <div className="min-h-screen flex flex-col bg-background">
    <Header />
    <main className="flex-1 container mx-auto px-4 lg:px-8 py-12 max-w-3xl">
      <h1 className="font-heading text-3xl font-bold text-foreground mb-6">Privacy Policy</h1>
      <p className="text-muted-foreground">Content coming soon.</p>
    </main>
    <Footer />
  </div>
);

export default Privacy;
