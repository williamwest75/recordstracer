import Header from "@/components/landing/Header";
import Footer from "@/components/landing/Footer";
import GdeltNewsSearch from "@/components/GdeltNewsSearch";

const GdeltNews = () => (
  <div className="min-h-screen flex flex-col bg-background">
    <Header />
    <main className="flex-1">
      <GdeltNewsSearch />
    </main>
    <Footer />
  </div>
);

export default GdeltNews;
