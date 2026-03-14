import { Button } from "@/components/ui/button";
import { FileSearch, Menu, X, ChevronDown } from "lucide-react";
import BetaBanner from "@/components/BetaBanner";
import ThemeToggle from "@/components/ThemeToggle";
import { useState, useRef, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

const Header = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [aboutOpen, setAboutOpen] = useState(false);
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const dropdownRef = useRef<HTMLDivElement>(null);

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setAboutOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <>
    <BetaBanner />
    <header className="border-b border-border bg-card/80 backdrop-blur-sm sticky top-0 z-50">
      <div className="container mx-auto flex items-center justify-between h-16 px-4 lg:px-8">
        <Link to="/" className="flex items-center gap-2.5">
          <FileSearch className="h-6 w-6 text-accent" />
          <span className="font-heading text-xl font-bold tracking-tight text-foreground">Record Tracer</span>
        </Link>

        <nav className="hidden md:flex items-center gap-8">
          <Link to="/" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">Home</Link>
          <a href="#how-it-works" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">How It Works</a>

          {/* About dropdown */}
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setAboutOpen(!aboutOpen)}
              className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors inline-flex items-center gap-1"
            >
              About Us <ChevronDown className={`h-3.5 w-3.5 transition-transform ${aboutOpen ? "rotate-180" : ""}`} />
            </button>
            {aboutOpen && (
              <div className="absolute top-full left-0 mt-2 w-44 rounded-md border border-border bg-popover shadow-lg z-50 py-1">
                <Link to="/about" onClick={() => setAboutOpen(false)} className="block px-4 py-2 text-sm text-popover-foreground hover:bg-muted transition-colors">
                  About Us
                </Link>
                <Link to="/news" onClick={() => setAboutOpen(false)} className="block px-4 py-2 text-sm text-popover-foreground hover:bg-muted transition-colors">
                  News
                </Link>
              </div>
            )}
          </div>

          <Link to="/pricing" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">Pricing</Link>
          <Link to="/founding-member" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors inline-flex items-center gap-1.5">
            Founding Members
            <span className="bg-destructive text-destructive-foreground text-[10px] font-bold px-1.5 py-0.5 rounded-full leading-none">OPEN</span>
          </Link>
          {user ? (
            <>
              <Link to="/dashboard" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">Dashboard</Link>
              <button onClick={handleSignOut} className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">Sign Out</button>
            </>
          ) : (
            <>
              <Link to="/auth" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">Sign In</Link>
              <Link to="/auth">
                <Button variant="accent" size="sm">Get Started</Button>
              </Link>
            </>
          )}
        </nav>

        <button className="md:hidden p-2 text-foreground" onClick={() => setMobileOpen(!mobileOpen)} aria-label="Toggle menu">
          {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {mobileOpen && (
        <nav className="md:hidden border-t border-border bg-card px-4 py-4 space-y-3">
          <Link to="/" className="block text-sm font-medium text-muted-foreground hover:text-foreground">Home</Link>
          <Link to="/about" className="block text-sm font-medium text-muted-foreground hover:text-foreground">About Us</Link>
          <Link to="/news" className="block text-sm font-medium text-muted-foreground hover:text-foreground pl-4">News</Link>
          <Link to="/pricing" className="block text-sm font-medium text-muted-foreground hover:text-foreground">Pricing</Link>
          <Link to="/founding-member" className="block text-sm font-medium text-muted-foreground hover:text-foreground inline-flex items-center gap-1.5">
            Founding Members
            <span className="bg-destructive text-destructive-foreground text-[10px] font-bold px-1.5 py-0.5 rounded-full leading-none">OPEN</span>
          </Link>
          {user ? (
            <>
              <Link to="/dashboard" className="block text-sm font-medium text-muted-foreground hover:text-foreground">Dashboard</Link>
              <button onClick={handleSignOut} className="block text-sm font-medium text-muted-foreground hover:text-foreground">Sign Out</button>
            </>
          ) : (
            <>
              <Link to="/auth" className="block text-sm font-medium text-muted-foreground hover:text-foreground">Sign In</Link>
              <Link to="/auth">
                <Button variant="accent" size="sm" className="w-full">Get Started</Button>
              </Link>
            </>
          )}
        </nav>
      )}
    </header>
    </>
  );
};

export default Header;
