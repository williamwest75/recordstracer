import { FileSearch } from "lucide-react";
import { Link } from "react-router-dom";

const Footer = () => (
  <footer className="border-t border-border bg-card/50 py-10">
    <div className="container mx-auto px-4 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-4">
      <div className="flex items-center gap-2">
        <FileSearch className="h-5 w-5 text-accent" />
        <span className="font-heading text-lg font-bold text-foreground">Record Tracer</span>
      </div>
      <nav className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
        <Link to="/about" className="hover:text-foreground transition-colors">About Us</Link>
        <Link to="/news" className="hover:text-foreground transition-colors">News</Link>
        <Link to="/terms" className="hover:text-foreground transition-colors">Terms of Service</Link>
        <Link to="/privacy" className="hover:text-foreground transition-colors">Privacy Policy</Link>
        <span className="font-semibold text-accent">#SaveJournalism</span>
      </nav>
      <p className="text-sm text-muted-foreground">
        © {new Date().getFullYear()} Record Tracer. Built for investigative journalists.
      </p>
    </div>
  </footer>
);

export default Footer;
