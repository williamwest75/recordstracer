import { Button } from "@/components/ui/button";
import { FileSearch, Menu, X } from "lucide-react";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

const Header = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  return (
    <header className="border-b border-border bg-card/80 backdrop-blur-sm sticky top-0 z-50">
      <div className="container mx-auto flex items-center justify-between h-16 px-4 lg:px-8">
        <Link to="/" className="flex items-center gap-2.5">
          <FileSearch className="h-6 w-6 text-accent" />
          <span className="font-heading text-xl font-bold tracking-tight text-foreground">Record Tracer</span>
        </Link>

        <nav className="hidden md:flex items-center gap-8">
          <Link to="/" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">Home</Link>
          <a href="#how-it-works" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">How It Works</a>
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
  );
};

export default Header;
