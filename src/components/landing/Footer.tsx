import { FileSearch } from "lucide-react";

const Footer = () => (
  <footer className="border-t border-border bg-card/50 py-10">
    <div className="container mx-auto px-4 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-4">
      <div className="flex items-center gap-2">
        <FileSearch className="h-5 w-5 text-accent" />
        <span className="font-heading text-lg font-bold text-foreground">Record Tracer</span>
      </div>
      <p className="text-sm text-muted-foreground">
        © {new Date().getFullYear()} Record Tracer. Built for investigative journalists.
      </p>
    </div>
  </footer>
);

export default Footer;
