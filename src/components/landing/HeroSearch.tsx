import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

const US_STATES = [
  "Alabama","Alaska","Arizona","Arkansas","California","Colorado","Connecticut",
  "Delaware","District of Columbia","Florida","Georgia","Hawaii","Idaho","Illinois",
  "Indiana","Iowa","Kansas","Kentucky","Louisiana","Maine","Maryland","Massachusetts",
  "Michigan","Minnesota","Mississippi","Missouri","Montana","Nebraska","Nevada",
  "New Hampshire","New Jersey","New Mexico","New York","North Carolina","North Dakota",
  "Ohio","Oklahoma","Oregon","Pennsylvania","Rhode Island","South Carolina",
  "South Dakota","Tennessee","Texas","Utah","Vermont","Virginia","Washington",
  "West Virginia","Wisconsin","Wyoming",
];

const HeroSearch = () => {
  const [showMore, setShowMore] = useState(false);
  const [name, setName] = useState("");
  const [state, setState] = useState("");
  const [city, setCity] = useState("");
  const [additionalInfo, setAdditionalInfo] = useState("");
  const navigate = useNavigate();
  const { user } = useAuth();

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !state) return;

    // Save search if logged in
    if (user) {
      await supabase.from("searches").insert({
        user_id: user.id,
        subject_name: name.trim(),
        state,
        city: city || null,
        additional_info: additionalInfo || null,
      });
    }

    navigate(`/search-results?name=${encodeURIComponent(name.trim())}&state=${encodeURIComponent(state)}`);
  };

  return (
    <section className="relative py-20 lg:py-28">
      <div className="container mx-auto px-4 lg:px-8 max-w-3xl text-center">
        <h1 className="font-heading text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-foreground leading-tight">
          Uncover the public record.
        </h1>
        <p className="mt-4 text-lg text-muted-foreground max-w-xl mx-auto">
          Public records research for investigative journalists. Search business filings,
          court records, campaign donations, and more — across all 50 states.
        </p>

        {/* Search Form */}
        <form onSubmit={handleSearch} className="mt-10 bg-card border border-border rounded-lg p-6 shadow-sm text-left">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">
                Subject Name
              </label>
              <Input placeholder="e.g., John Smith" className="bg-background" value={name} onChange={(e) => setName(e.target.value)} required />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">
                State
              </label>
              <Select value={state} onValueChange={setState}>
                <SelectTrigger className="bg-background">
                  <SelectValue placeholder="Select a state" />
                </SelectTrigger>
                <SelectContent className="bg-popover max-h-60">
                  {US_STATES.map((s) => (
                    <SelectItem key={s} value={s}>{s}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {showMore && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">
                  City <span className="text-muted-foreground">(optional)</span>
                </label>
                <Input placeholder="e.g., Austin" className="bg-background" value={city} onChange={(e) => setCity(e.target.value)} />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">
                  Additional Info <span className="text-muted-foreground">(optional)</span>
                </label>
                <Input placeholder="e.g., date of birth, company name" className="bg-background" value={additionalInfo} onChange={(e) => setAdditionalInfo(e.target.value)} />
              </div>
            </div>
          )}

          <div className="flex items-center justify-between mt-5">
            <button
              type="button"
              onClick={() => setShowMore(!showMore)}
              className="text-sm text-muted-foreground hover:text-foreground transition-colors underline underline-offset-2"
            >
              {showMore ? "Fewer options" : "More options"}
            </button>
            <Button type="submit" variant="accent" size="lg" className="gap-2 text-base px-8">
              <Search className="h-4 w-4" />
              Search Records
            </Button>
          </div>
        </form>
      </div>
    </section>
  );
};

export default HeroSearch;
