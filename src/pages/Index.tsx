import Header from "@/components/landing/Header";
import HeroSearch from "@/components/landing/HeroSearch";
import Badges from "@/components/landing/Badges";
import FeatureGrid from "@/components/landing/FeatureGrid";
import Footer from "@/components/landing/Footer";

const Index = () => (
  <div className="min-h-screen flex flex-col bg-background">
    <Header />
    <main className="flex-1">
      <HeroSearch />
      <Badges />
      <FeatureGrid />
    </main>
    <Footer />
  </div>
);

export default Index;
