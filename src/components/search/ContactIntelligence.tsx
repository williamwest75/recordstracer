import { useState, useEffect } from "react";
import { Phone, MapPin, ExternalLink, User, Loader2, Building2, Landmark, Briefcase } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import NameMatchBadge from "./NameMatchBadge";
import { getNameMatchConfidence } from "@/lib/nameMatch";

interface ContactResult {
  source: string;
  name: string;
  address?: string | null;
  phone?: string | null;
  office?: string | null;
  party?: string | null;
  role?: string | null;
  employer?: string | null;
  occupation?: string | null;
  candidateId?: string;
  committeeId?: string;
  sourceUrl?: string;
}

interface PropertyLink {
  county: string;
  url: string;
  label: string;
}

interface ContactIntelligenceProps {
  searchName: string;
  state: string;
}

/** Convert "BERNIER, JACQUES" → "Jacques Bernier" */
function formatName(rawName: string): string {
  if (!rawName) return "";
  const parts = rawName.split(",").map(p => p.trim());
  if (parts.length === 2) {
    return parts
      .reverse()
      .map(p => p.charAt(0).toUpperCase() + p.slice(1).toLowerCase())
      .join(" ");
  }
  return rawName
    .split(" ")
    .map(p => p.charAt(0).toUpperCase() + p.slice(1).toLowerCase())
    .join(" ");
}

/** Convert "8709 NOTTINGHAM POINTE WAY, FT MYERS, FL, 33912" to title case, keeping state abbreviations */
function formatAddress(rawAddress: string): string {
  if (!rawAddress) return "";
  return rawAddress
    .split(" ")
    .map(word => {
      if (word.length === 2 && /^[A-Z]{2}$/.test(word.replace(",", ""))) return word;
      if (/^\d{5}(-\d{4})?$/.test(word.replace(",", ""))) return word.replace(",", "");
      return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
    })
    .join(" ")
    .replace(/,\s*/g, ", ");
}

/** Handle "NOT EMPLOYED" / "NONE" / "N/A" gracefully */
function formatEmployment(raw: string | undefined | null): string | null {
  if (!raw) return null;
  const upper = raw.toUpperCase().trim();
  if (["NOT EMPLOYED", "NONE", "N/A", "INFORMATION REQUESTED", "SELF-EMPLOYED", "SELF EMPLOYED"].includes(upper)) {
    if (upper === "SELF-EMPLOYED" || upper === "SELF EMPLOYED") return "Self-employed";
    return null;
  }
  return raw.charAt(0).toUpperCase() + raw.slice(1).toLowerCase();
}

const ContactIntelligence = ({ searchName, state }: ContactIntelligenceProps) => {
  const [contacts, setContacts] = useState<ContactResult[]>([]);
  const [propertyLinks, setPropertyLinks] = useState<PropertyLink[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(false);

    supabase.functions
      .invoke("records-proxy", {
        body: { source: "contact-intel", searchName, state },
      })
      .then(({ data, error: err }) => {
        if (cancelled) return;
        if (err || !data?.success) {
          console.error("[ContactIntel] Error:", err || data?.error);
          setError(true);
        } else {
          setContacts(data.contacts || []);
          setPropertyLinks(data.propertyLinks || []);
        }
        setLoading(false);
      })
      .catch(() => {
        if (!cancelled) {
          setError(true);
          setLoading(false);
        }
      });

    return () => { cancelled = true; };
  }, [searchName, state]);

  if (loading) {
    return (
      <div className="border border-border rounded-lg bg-card p-5 shadow-sm">
        <div className="flex items-center gap-2 mb-3">
          <Phone className="h-4 w-4 text-accent" />
          <h3 className="font-heading text-sm font-semibold uppercase tracking-wide text-muted-foreground">
            Contact Intelligence
          </h3>
        </div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" />
          Searching public filings for contact information…
        </div>
      </div>
    );
  }

  if (error && contacts.length === 0 && propertyLinks.length === 0) return null;
  if (contacts.length === 0 && propertyLinks.length === 0) return null;

  return (
    <div className="border border-border rounded-lg bg-card p-5 shadow-sm">
      <div className="flex items-center gap-2 mb-4">
        <Phone className="h-4 w-4 text-accent" />
        <h3 className="font-heading text-sm font-semibold uppercase tracking-wide text-muted-foreground">
          Contact Intelligence
        </h3>
        <span className="text-xs text-muted-foreground ml-auto">
          {contacts.length} source{contacts.length !== 1 ? "s" : ""}
        </span>
      </div>

      {/* Contact records */}
      {contacts.length > 0 && (
        <div className="space-y-3 mb-4">
          {contacts.map((c, i) => {
            const displayName = formatName(c.name);
            const displayAddress = c.address ? formatAddress(c.address) : null;
            const employer = formatEmployment(c.employer as string | undefined);
            const occupation = formatEmployment(c.occupation as string | undefined);
            const confidence = getNameMatchConfidence(searchName, c.name);

            return (
              <div key={i} className="p-4 rounded-lg bg-muted/30 border border-border/50">
                {/* Header with name + match badge */}
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-accent/10 border border-accent/20 flex items-center justify-center shrink-0">
                      <User className="h-5 w-5 text-accent" />
                    </div>
                    <div>
                      <p className="text-base font-semibold text-foreground">{displayName}</p>
                      <p className="text-xs text-muted-foreground">via {c.source}</p>
                    </div>
                  </div>
                  <NameMatchBadge
                    confidence={confidence}
                    searchedName={searchName}
                    returnedName={c.name}
                    source={c.source}
                  />
                </div>

                {/* Details grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {displayAddress && (
                    <div className="p-3 rounded-md bg-background border border-border/40">
                      <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-1">
                        Address (from filing)
                      </p>
                      <div className="flex items-start gap-1.5">
                        <MapPin className="h-3.5 w-3.5 text-muted-foreground shrink-0 mt-0.5" />
                        <span className="text-sm text-foreground">{displayAddress}</span>
                      </div>
                    </div>
                  )}

                  {(employer || occupation) ? (
                    <div className="p-3 rounded-md bg-background border border-border/40">
                      <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-1">
                        Employment (self-reported)
                      </p>
                      <div className="flex items-start gap-1.5">
                        <Briefcase className="h-3.5 w-3.5 text-muted-foreground shrink-0 mt-0.5" />
                        <span className="text-sm text-foreground">
                          {employer || occupation || "Not listed in filing"}
                        </span>
                      </div>
                    </div>
                  ) : (
                    <div className="p-3 rounded-md bg-background border border-border/40">
                      <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-1">
                        Employment (self-reported)
                      </p>
                      <p className="text-sm text-muted-foreground italic">Not listed in filing</p>
                    </div>
                  )}
                </div>

                {(c.office || c.party || c.role) && (
                  <p className="text-xs text-muted-foreground mt-2.5">
                    {[c.office, c.party, c.role].filter(Boolean).join(" · ")}
                  </p>
                )}

                {c.sourceUrl && (
                  <a
                    href={c.sourceUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-xs text-accent hover:underline mt-2"
                  >
                    <ExternalLink className="h-3 w-3" /> View source filing
                  </a>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Property appraiser links */}
      {propertyLinks.length > 0 && (
        <div className="border-t border-border pt-3">
          <div className="flex items-center gap-1.5 mb-2">
            <Landmark className="h-3.5 w-3.5 text-muted-foreground" />
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
              Property Records Lookup
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            {propertyLinks.map((link, i) => (
              <a key={i} href={link.url} target="_blank" rel="noopener noreferrer">
                <Button variant="outline" size="sm" className="gap-1.5 text-xs h-7">
                  <Building2 className="h-3 w-3" />
                  {link.label}
                </Button>
              </a>
            ))}
          </div>
        </div>
      )}

      {/* Disclaimer */}
      <p className="text-[11px] text-muted-foreground mt-4 leading-relaxed border-t border-border pt-3 italic">
        Contact details sourced from public filings. Accuracy depends on information provided at time of filing. Verify before use.
      </p>
    </div>
  );
};

export default ContactIntelligence;
