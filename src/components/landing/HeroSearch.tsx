import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Search, ChevronDown, ChevronUp, CalendarIcon, RotateCcw } from "lucide-react";
import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { sanitizeInput, isValidName, isValidState } from "@/utils/validation";

const US_STATES = [
  "All States / National",
  "Alabama","Alaska","Arizona","Arkansas","California","Colorado","Connecticut",
  "Delaware","District of Columbia","Florida","Georgia","Hawaii","Idaho","Illinois",
  "Indiana","Iowa","Kansas","Kentucky","Louisiana","Maine","Maryland","Massachusetts",
  "Michigan","Minnesota","Mississippi","Missouri","Montana","Nebraska","Nevada",
  "New Hampshire","New Jersey","New Mexico","New York","North Carolina","North Dakota",
  "Ohio","Oklahoma","Oregon","Pennsylvania","Rhode Island","South Carolina",
  "South Dakota","Tennessee","Texas","Utah","Vermont","Virginia","Washington",
  "West Virginia","Wisconsin","Wyoming",
];

export interface SearchFilters {
  middleInitial: string;
  dob: string;
  email: string;
  streetAddress: string;
  city: string;
  toggles: Record<string, boolean>;
}

export const DEFAULT_TOGGLES: Record<string, boolean> = {
  business: true,
  fec: true,
  court: true,
  contracts: true,
  sunbiz: true,
  contact: true,
  occrp: true,
};

export const TOGGLE_LABELS: Record<string, string> = {
  business: "Business Filings & SEC",
  fec: "Campaign Finance / FEC",
  court: "Federal Court Records",
  contracts: "Federal Contracts / USASpending",
  sunbiz: "Florida State Records / SunBiz",
  contact: "Contact Intelligence",
  occrp: "Investigative Documents / OCCRP",
};

const NAME_SUFFIXES = ["", "Jr.", "Sr.", "II", "III", "IV", "V", "Esq."];

const HeroSearch = () => {
  const [panelOpen, setPanelOpen] = useState(false);
  const [name, setName] = useState("");
  const [suffix, setSuffix] = useState("");
  const [state, setState] = useState("All States / National");

  // Advanced filters
  const [middleInitial, setMiddleInitial] = useState("");
  const [dob, setDob] = useState<Date | undefined>();
  const [email, setEmail] = useState("");
  const [streetAddress, setStreetAddress] = useState("");
  const [city, setCity] = useState("");
  const [additionalInfo, setAdditionalInfo] = useState("");
  const [toggles, setToggles] = useState<Record<string, boolean>>({ ...DEFAULT_TOGGLES });

  const navigate = useNavigate();
  const { user, subscribed, subscriptionLoading } = useAuth();
  const { toast } = useToast();

  const resetFilters = () => {
    setSuffix("");
    setMiddleInitial("");
    setDob(undefined);
    setEmail("");
    setStreetAddress("");
    setCity("");
    setAdditionalInfo("");
    setToggles({ ...DEFAULT_TOGGLES });
  };

  const isDefault =
    !suffix && !middleInitial && !dob && !email && !streetAddress && !city && !additionalInfo &&
    Object.keys(DEFAULT_TOGGLES).every((k) => toggles[k] === DEFAULT_TOGGLES[k]);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();

    const sanitizedName = sanitizeInput(name);
    const nameCheck = isValidName(sanitizedName);
    if (!nameCheck.valid) {
      toast({ title: "Invalid name", description: nameCheck.reason });
      return;
    }
    if (!isValidState(state)) {
      toast({ title: "Invalid state", description: "Please select a valid US state." });
      return;
    }

    if (!user) {
      toast({ title: "Sign in required", description: "Please sign in or create an account to search records." });
      navigate("/auth");
      return;
    }

    if (!subscribed && !subscriptionLoading) {
      toast({ title: "Subscription required", description: "Choose a plan to start searching public records." });
      navigate("/pricing");
      return;
    }

    const actualSuffix = suffix && suffix !== "none" ? suffix : "";
    const fullName = actualSuffix ? `${sanitizedName} ${actualSuffix}` : sanitizedName;

    if (user) {
      await supabase.from("searches").insert({
        user_id: user.id,
        subject_name: fullName,
        state,
        city: city || null,
        additional_info: additionalInfo || null,
      });
    }

    const params = new URLSearchParams();
    params.set("name", fullName);
    params.set("state", state);
    if (middleInitial) params.set("mi", middleInitial);
    if (dob) params.set("dob", format(dob, "yyyy-MM-dd"));
    if (email) params.set("email", email);
    if (streetAddress) params.set("address", streetAddress);
    if (city) params.set("city", city);
    if (additionalInfo) params.set("info", additionalInfo);

    // Only encode disabled toggles
    const disabledToggles = Object.entries(toggles)
      .filter(([, v]) => !v)
      .map(([k]) => k);
    if (disabledToggles.length > 0) {
      params.set("skip", disabledToggles.join(","));
    }

    navigate(`/search-results?${params.toString()}`);
  };

  const handleToggle = (key: string, checked: boolean) => {
    setToggles((prev) => ({ ...prev, [key]: checked }));
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

        <form onSubmit={handleSearch} className="mt-10 bg-card border border-border rounded-lg p-6 shadow-sm text-left">
          <div className="grid grid-cols-1 md:grid-cols-[1fr_auto_1fr] gap-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">
                Subject Name
              </label>
              <Input placeholder="e.g., John Smith" className="bg-background" value={name} onChange={(e) => setName(e.target.value)} required />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">
                Suffix
              </label>
              <Select value={suffix} onValueChange={setSuffix}>
                <SelectTrigger className="bg-background w-24">
                  <SelectValue placeholder="—" />
                </SelectTrigger>
                <SelectContent className="bg-popover">
                  {NAME_SUFFIXES.map((s) => (
                    <SelectItem key={s || "none"} value={s || "none"}>{s || "None"}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
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

          {/* Collapsible Refine Search Panel */}
          <Collapsible open={panelOpen} onOpenChange={setPanelOpen}>
            <div className="flex items-center justify-between mt-5">
              <CollapsibleTrigger asChild>
                <button
                  type="button"
                  className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors font-medium"
                >
                  Refine Search {panelOpen ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
                </button>
              </CollapsibleTrigger>
              <Button type="submit" variant="accent" size="lg" className="gap-2 text-base px-8">
                <Search className="h-4 w-4" />
                Search Records
              </Button>
            </div>

            <CollapsibleContent className="mt-5 space-y-6 border-t border-border pt-5">
              {/* Identify the Person */}
              <div>
                <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-3">Identify the Person</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-1.5">
                      Middle Initial <span className="text-muted-foreground">(opt.)</span>
                    </label>
                    <Input
                      placeholder="e.g., J"
                      className="bg-background"
                      maxLength={1}
                      value={middleInitial}
                      onChange={(e) => setMiddleInitial(e.target.value.toUpperCase().slice(0, 1))}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-1.5">
                      Date of Birth <span className="text-muted-foreground">(opt.)</span>
                    </label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className={cn(
                            "w-full justify-start text-left font-normal bg-background",
                            !dob && "text-muted-foreground"
                          )}
                          type="button"
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {dob ? format(dob, "PPP") : "Pick a date"}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={dob}
                          onSelect={setDob}
                          disabled={(date) => date > new Date() || date < new Date("1900-01-01")}
                          initialFocus
                          className={cn("p-3 pointer-events-auto")}
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-1.5">
                      Email Address <span className="text-muted-foreground">(opt.)</span>
                    </label>
                    <Input
                      placeholder="e.g., john@example.com"
                      type="email"
                      className="bg-background"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    />
                  </div>
                </div>
              </div>

              {/* Narrow the Location */}
              <div>
                <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-3">Narrow the Location</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-1.5">
                      Street Address <span className="text-muted-foreground">(opt.)</span>
                    </label>
                    <Input
                      placeholder="e.g., 123 Main St"
                      className="bg-background"
                      value={streetAddress}
                      onChange={(e) => setStreetAddress(e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-1.5">
                      City <span className="text-muted-foreground">(opt.)</span>
                    </label>
                    <Input
                      placeholder="e.g., Austin"
                      className="bg-background"
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                    />
                  </div>
                </div>
              </div>

              {/* Search Scope Toggles */}
              <div>
                <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-3">Search These Records</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {Object.entries(TOGGLE_LABELS).map(([key, label]) => (
                    <label key={key} className="flex items-center justify-between gap-3 rounded-md border border-border bg-background px-3 py-2.5 cursor-pointer">
                      <span className="text-sm text-foreground">{label}</span>
                      <Switch
                        checked={toggles[key]}
                        onCheckedChange={(checked) => handleToggle(key, checked)}
                      />
                    </label>
                  ))}
                </div>
              </div>

              {/* Reset */}
              {!isDefault && (
                <button
                  type="button"
                  onClick={resetFilters}
                  className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors underline underline-offset-2"
                >
                  <RotateCcw className="h-3.5 w-3.5" /> Reset Filters
                </button>
              )}
            </CollapsibleContent>
          </Collapsible>
        </form>
      </div>
    </section>
  );
};

export default HeroSearch;
