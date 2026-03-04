import { useState } from "react";
import { ClipboardList, ChevronDown, ExternalLink } from "lucide-react";
import type { RecordResult } from "@/lib/recordsApi";

interface Props {
  name: string;
  state: string;
  results: RecordResult[];
}

const ReportersChecklist = ({ name, state, results }: Props) => {
  const [expanded, setExpanded] = useState(false);

  const categories = new Set(results.map(r => r.category));
  const hasOffshore = categories.has("offshore");
  const hasSanctions = categories.has("sanctions");
  const hasDonations = categories.has("donations");
  const hasCourt = categories.has("court");

  const items = [
    {
      text: "Verify identity — Confirm that high-confidence matches (90%+) refer to your actual subject using addresses, dates, and other identifiers",
      always: true,
    },
    {
      text: "Check ICIJ network graphs — Click \"View on ICIJ\" for any offshore entity matches to see connected officers and intermediaries",
      always: hasOffshore,
    },
    {
      text: "Review campaign finance details — Open FEC.gov to see full donation history with dates, amounts, and recipient committees",
      always: hasDonations,
    },
    {
      text: `Search state records — This search covers federal databases. Check ${state !== "All States / National" ? state + "-specific" : "state-specific"} sources using the Public Records Links below`,
      always: true,
    },
    {
      text: "File public records requests — If offshore entities or court cases appear relevant, consider FOIA/public records requests for financial disclosure statements, government contract records, or meeting minutes",
      always: hasOffshore || hasCourt,
    },
    {
      text: "Consult your editor — Before publishing any findings from sanctions or offshore databases, review with your editor and legal counsel",
      always: hasSanctions || hasOffshore,
    },
  ].filter(i => i.always);

  if (items.length === 0) return null;

  return (
    <div className="border border-border rounded-lg bg-card overflow-hidden">
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between px-5 py-4 hover:bg-muted/30 transition-colors"
      >
        <div className="flex items-center gap-2.5">
          <ClipboardList className="h-5 w-5 text-accent" />
          <h2 className="font-heading text-sm font-semibold uppercase tracking-wider text-muted-foreground">
            Reporter's Checklist
          </h2>
        </div>
        <ChevronDown className={`h-4 w-4 text-muted-foreground transition-transform ${expanded ? "rotate-180" : ""}`} />
      </button>

      {expanded && (
        <div className="px-5 pb-5 border-t border-border pt-4">
          <p className="text-xs text-muted-foreground mb-4">Based on this search, here are recommended next steps:</p>
          <div className="space-y-3">
            {items.map((item, i) => (
              <label key={i} className="flex gap-3 items-start cursor-pointer group">
                <input type="checkbox" className="mt-1 rounded border-border accent-accent" />
                <span className="text-sm text-foreground leading-relaxed group-hover:text-accent transition-colors">
                  {item.text}
                </span>
              </label>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ReportersChecklist;
