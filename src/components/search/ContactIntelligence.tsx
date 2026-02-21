import { useState, useEffect } from "react";
import { Phone, MapPin, ExternalLink, User, Loader2, Building2, Landmark } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";

interface ContactResult {
  source: string;
  name: string;
  address?: string | null;
  phone?: string | null;
  office?: string | null;
  party?: string | null;
  role?: string | null;
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
          {contacts.map((c, i) => (
            <div key={i} className="flex items-start gap-3 p-3 rounded-md bg-muted/40 border border-border/50">
              <div className="h-8 w-8 rounded-full bg-accent/10 flex items-center justify-center shrink-0 mt-0.5">
                <User className="h-4 w-4 text-accent" />
              </div>
              <div className="flex-1 min-w-0 text-sm">
                <p className="font-semibold text-foreground">{c.name}</p>
                <p className="text-xs text-muted-foreground">{c.source}</p>

                {c.address && (
                  <div className="flex items-start gap-1.5 mt-1.5">
                    <MapPin className="h-3.5 w-3.5 text-muted-foreground shrink-0 mt-0.5" />
                    <span className="text-foreground">{c.address}</span>
                  </div>
                )}

                {c.phone && (
                  <div className="flex items-center gap-1.5 mt-1">
                    <Phone className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                    <span className="text-foreground">{c.phone}</span>
                  </div>
                )}

                {(c.office || c.party || c.role) && (
                  <p className="text-xs text-muted-foreground mt-1">
                    {[c.office, c.party, c.role].filter(Boolean).join(" · ")}
                  </p>
                )}

                {c.sourceUrl && (
                  <a
                    href={c.sourceUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-xs text-accent hover:underline mt-1.5"
                  >
                    <ExternalLink className="h-3 w-3" /> View source filing
                  </a>
                )}
              </div>
            </div>
          ))}
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
              <a
                key={i}
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
              >
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
      <p className="text-[11px] text-muted-foreground mt-4 leading-relaxed border-t border-border pt-3">
        Contact information sourced from public campaign filings, business registrations, and property records.
      </p>
    </div>
  );
};

export default ContactIntelligence;
