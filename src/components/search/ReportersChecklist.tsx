import { useState, useCallback } from "react";
import { ClipboardList, ChevronDown, ChevronRight, Mail, Copy, Printer, CheckSquare, Loader2, FileText, Link2 } from "lucide-react";
import type { RecordResult } from "@/lib/recordsApi";

interface Props {
  name: string;
  state: string;
  results: RecordResult[];
}

interface ChecklistItem {
  id: string;
  text: string;
  category: string;
  angle: string; // the investigative angle this item addresses
}

interface ExpandedContent {
  steps: string[];
  emailSubject: string;
  emailBody: string;
  questions: string[];
  sourceLinks: { label: string; url: string }[];
}

// Extract named people and orgs from results
function extractEntities(results: RecordResult[]): { people: string[]; orgs: string[]; sourceLinks: { label: string; url: string }[] } {
  const people: Set<string> = new Set();
  const orgs: Set<string> = new Set();
  const sourceLinks: { label: string; url: string }[] = [];

  for (const r of results) {
    if (r.returnedName) people.add(r.returnedName);
    if (r.details?.["Officer/Agent"]) people.add(r.details["Officer/Agent"]);
    if (r.details?.["Assigned To"]) people.add(r.details["Assigned To"]);
    if (r.details?.["Treasurer"]) people.add(r.details["Treasurer"]);
    if (r.details?.["Entity Name"]) orgs.add(r.details["Entity Name"]);
    if (r.details?.["Recipient"]) orgs.add(r.details["Recipient"]);
    if (r.sourceUrl) {
      sourceLinks.push({ label: r.source, url: r.sourceUrl });
    }
  }

  // Deduplicate source links by URL
  const seen = new Set<string>();
  const dedupedLinks = sourceLinks.filter(l => {
    if (seen.has(l.url)) return false;
    seen.add(l.url);
    return true;
  });

  return {
    people: Array.from(people).slice(0, 5),
    orgs: Array.from(orgs).slice(0, 5),
    sourceLinks: dedupedLinks.slice(0, 8),
  };
}

function buildChecklistItems(name: string, state: string, results: RecordResult[]): ChecklistItem[] {
  const categories = new Set(results.map(r => r.category));
  const items: ChecklistItem[] = [];

  items.push({
    id: "verify-identity",
    text: "Verify identity",
    angle: "Confirm high-confidence matches refer to your actual subject using addresses, dates, and corroborating identifiers",
    category: "always",
  });

  if (categories.has("offshore")) {
    items.push({
      id: "icij-network",
      text: "Investigate offshore connections",
      angle: "Check ICIJ network graphs for connected officers, intermediaries, and addresses linked to offshore entities",
      category: "offshore",
    });
  }

  if (categories.has("donations")) {
    items.push({
      id: "campaign-finance",
      text: "Trace campaign finance activity",
      angle: "Review full FEC donation history — amounts, recipients, dates, and any PAC connections",
      category: "donations",
    });
  }

  if (categories.has("court")) {
    items.push({
      id: "court-records",
      text: "Pull full court case records",
      angle: "Retrieve complete docket via PACER, including all filings, parties, and outcomes",
      category: "court",
    });
  }

  if (categories.has("business")) {
    items.push({
      id: "business-filings",
      text: "Review business registrations and filings",
      angle: "Identify all entities, officers, registered agents, and cross-reference addresses across filings",
      category: "business",
    });
  }

  if (categories.has("contracts")) {
    items.push({
      id: "federal-contracts",
      text: "Examine federal contracts and grants",
      angle: "Look for patterns in awarding agencies, contract scope, and any sole-source awards",
      category: "contracts",
    });
  }

  if (categories.has("lobbying")) {
    items.push({
      id: "lobbying",
      text: "Map lobbying relationships",
      angle: "Identify who is lobbying for whom, issue areas, and cross-reference with donation records",
      category: "lobbying",
    });
  }

  if (categories.has("sanctions") || categories.has("offshore")) {
    items.push({
      id: "foia-request",
      text: "File public records requests",
      angle: "Request financial disclosures, government contracts, or meeting minutes via FOIA where relevant",
      category: "foia",
    });
  }

  items.push({
    id: "state-records",
    text: `Search ${state !== "All States / National" ? state : "state"} records`,
    angle: `This search covers federal databases. Supplement with ${state !== "All States / National" ? state + "-specific" : "state-level"} sources for property, professional licenses, and local court filings`,
    category: "always",
  });

  if (categories.has("sanctions") || categories.has("offshore")) {
    items.push({
      id: "editor-review",
      text: "Consult editor and legal counsel",
      angle: "Before publishing findings from sanctions or offshore databases, verify identity and review with your editor and legal team",
      category: "legal",
    });
  }

  return items;
}

async function generateExpandedContent(
  item: ChecklistItem,
  name: string,
  state: string,
  entities: { people: string[]; orgs: string[]; sourceLinks: { label: string; url: string }[] }
): Promise<ExpandedContent> {
  const primaryPerson = entities.people[0] || name;
  const relevantLinks = entities.sourceLinks.filter(l =>
    l.label.toLowerCase().includes(item.category) ||
    item.category === "always" ||
    item.category === "foia" ||
    item.category === "legal"
  );

  const prompt = `You are an investigative journalism coach helping a reporter follow up on public records findings.

Search subject: "${name}" (${state})
Checklist item: "${item.text}"
Investigative angle: "${item.angle}"
Named people found in records: ${entities.people.join(", ") || "none identified"}
Organizations found: ${entities.orgs.join(", ") || "none identified"}

Generate a JSON response with exactly this structure:
{
  "steps": ["step 1", "step 2", "step 3", "step 4"],
  "emailSubject": "subject line",
  "emailBody": "full email body",
  "questions": ["question 1", "question 2", "question 3", "question 4", "question 5"]
}

Rules:
- steps: 4 concrete, actionable steps specific to this angle. Start each with a verb.
- emailSubject: professional, neutral subject line for a records/interview request
- emailBody: a complete, neutral, professional inquiry email. Address to "${primaryPerson}" if it's a person, otherwise keep generic with [Name] placeholder. Sign off as "A reporter" with [Publication] placeholder. Do NOT imply wrongdoing. Frame as seeking comment or clarification.
- questions: 5 specific questions a reporter should answer through reporting on this angle. Frame as things to find out, not things to ask the subject directly.
- Return ONLY valid JSON. No markdown, no preamble.`;

  try {
    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "claude-sonnet-4-20250514",
        max_tokens: 1000,
        messages: [{ role: "user", content: prompt }],
      }),
    });

    const data = await response.json();
    const text = data.content?.find((b: any) => b.type === "text")?.text || "";
    const clean = text.replace(/```json|```/g, "").trim();
    const parsed = JSON.parse(clean);

    return {
      steps: parsed.steps || [],
      emailSubject: parsed.emailSubject || "",
      emailBody: parsed.emailBody || "",
      questions: parsed.questions || [],
      sourceLinks: relevantLinks,
    };
  } catch {
    return {
      steps: ["Review all records for this category", "Cross-reference with other sources", "Verify identity of all named parties", "Document your findings"],
      emailSubject: `Records inquiry regarding ${name}`,
      emailBody: `Dear [Name],\n\nI am a reporter working on a story and seeking comment regarding public records related to ${name}. I would appreciate the opportunity to speak with you.\n\nPlease contact me at your earliest convenience.\n\nA reporter\n[Publication]`,
      questions: ["What is the full scope of this activity?", "Are the named parties the same individuals as the subject?", "What is the timeline of events?", "Are there related entities not yet identified?", "What public records remain to be obtained?"],
      sourceLinks: relevantLinks,
    };
  }
}

function ExportDocument({ checkedItems, expandedContents, name, state, results }: {
  checkedItems: Set<string>;
  expandedContents: Map<string, ExpandedContent>;
  name: string;
  state: string;
  results: RecordResult[];
}) {
  const items = buildChecklistItems(name, state, results).filter(i => checkedItems.has(i.id));
  if (items.length === 0) return null;

  const text = [
    `INVESTIGATIVE ACTION PLAN`,
    `Subject: ${name} | ${state}`,
    `Generated: ${new Date().toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}`,
    `RecordsTracer — recordtracer.com`,
    ``,
    `═══════════════════════════════════════`,
    ``,
    ...items.flatMap((item, i) => {
      const content = expandedContents.get(item.id);
      const lines = [
        `${i + 1}. ${item.text.toUpperCase()}`,
        `   ${item.angle}`,
        ``,
      ];
      if (content) {
        lines.push(`   STEPS:`);
        content.steps.forEach((s, si) => lines.push(`   ${si + 1}. ${s}`));
        lines.push(``);
        lines.push(`   QUESTIONS TO ANSWER:`);
        content.questions.forEach((q, qi) => lines.push(`   ${qi + 1}. ${q}`));
        lines.push(``);
        if (content.emailBody) {
          lines.push(`   DRAFT INQUIRY EMAIL:`);
          lines.push(`   Subject: ${content.emailSubject}`);
          lines.push(``);
          content.emailBody.split("\n").forEach(l => lines.push(`   ${l}`));
          lines.push(``);
        }
        if (content.sourceLinks.length > 0) {
          lines.push(`   SOURCE LINKS:`);
          content.sourceLinks.forEach(l => lines.push(`   • ${l.label}: ${l.url}`));
          lines.push(``);
        }
        lines.push(`───────────────────────────────────────`);
        lines.push(``);
      }
      return lines;
    }),
    `This document was generated by RecordsTracer. All findings require independent verification prior to publication.`,
    `Record matches do not confirm identity or imply wrongdoing.`,
  ].join("\n");

  return text;
}

const CATEGORY_COLORS: Record<string, string> = {
  offshore: "bg-amber-50 text-amber-700 border-amber-200",
  donations: "bg-blue-50 text-blue-700 border-blue-200",
  court: "bg-red-50 text-red-700 border-red-200",
  business: "bg-purple-50 text-purple-700 border-purple-200",
  contracts: "bg-green-50 text-green-700 border-green-200",
  lobbying: "bg-orange-50 text-orange-700 border-orange-200",
  foia: "bg-cyan-50 text-cyan-700 border-cyan-200",
  legal: "bg-rose-50 text-rose-700 border-rose-200",
  always: "bg-gray-50 text-gray-600 border-gray-200",
};

const CATEGORY_LABELS: Record<string, string> = {
  offshore: "Offshore",
  donations: "Campaign Finance",
  court: "Court Records",
  business: "Business",
  contracts: "Contracts",
  lobbying: "Lobbying",
  foia: "FOIA",
  legal: "Legal Review",
  always: "General",
};

const ReportersChecklist = ({ name, state, results }: Props) => {
  const [expanded, setExpanded] = useState(false);
  const [checkedItems, setCheckedItems] = useState<Set<string>>(new Set());
  const [openItems, setOpenItems] = useState<Set<string>>(new Set());
  const [expandedContents, setExpandedContents] = useState<Map<string, ExpandedContent>>(new Map());
  const [loadingItems, setLoadingItems] = useState<Set<string>>(new Set());
  const [copySuccess, setCopySuccess] = useState(false);
  const [activeTab, setActiveTab] = useState<Record<string, "steps" | "email" | "questions">>({}); 

  const entities = extractEntities(results);
  const items = buildChecklistItems(name, state, results);

  const handleCheck = useCallback(async (item: ChecklistItem) => {
    const isChecked = checkedItems.has(item.id);
    const newChecked = new Set(checkedItems);
    const newOpen = new Set(openItems);

    if (isChecked) {
      newChecked.delete(item.id);
      newOpen.delete(item.id);
    } else {
      newChecked.add(item.id);
      newOpen.add(item.id);

      // Generate content if not already loaded
      if (!expandedContents.has(item.id)) {
        setLoadingItems(prev => new Set(prev).add(item.id));
        const content = await generateExpandedContent(item, name, state, entities);
        setExpandedContents(prev => new Map(prev).set(item.id, content));
        setLoadingItems(prev => {
          const next = new Set(prev);
          next.delete(item.id);
          return next;
        });
      }
    }

    setCheckedItems(newChecked);
    setOpenItems(newOpen);
  }, [checkedItems, openItems, expandedContents, name, state, entities]);

  const toggleOpen = useCallback((id: string) => {
    setOpenItems(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const handleCopyExport = useCallback(() => {
    const text = ExportDocument({ checkedItems, expandedContents, name, state, results });
    if (!text) return;
    navigator.clipboard.writeText(text).then(() => {
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    });
  }, [checkedItems, expandedContents, name, state, results]);

  const handlePrint = useCallback(() => {
    const text = ExportDocument({ checkedItems, expandedContents, name, state, results });
    if (!text) return;
    const win = window.open("", "_blank");
    if (!win) return;
    win.document.write(`
      <html><head><title>Action Plan — ${name}</title>
      <style>
        body { font-family: 'Georgia', serif; max-width: 800px; margin: 40px auto; padding: 0 20px; color: #1a1a1a; line-height: 1.6; }
        pre { white-space: pre-wrap; font-family: 'Georgia', serif; font-size: 14px; }
      </style></head>
      <body><pre>${text.replace(/</g, "&lt;")}</pre></body></html>
    `);
    win.document.close();
    win.print();
  }, [checkedItems, expandedContents, name, state, results]);

  if (items.length === 0) return null;

  const checkedCount = checkedItems.size;

  return (
    <div className="border border-border rounded-lg bg-card overflow-hidden">
      {/* Header */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between px-5 py-4 hover:bg-muted/30 transition-colors"
      >
        <div className="flex items-center gap-2.5">
          <ClipboardList className="h-5 w-5 text-accent" />
          <h2 className="font-heading text-sm font-semibold uppercase tracking-wider text-muted-foreground">
            Reporter's Checklist
          </h2>
          {checkedCount > 0 && (
            <span className="text-[11px] bg-accent text-accent-foreground rounded-full px-2 py-0.5 font-semibold">
              {checkedCount} in progress
            </span>
          )}
        </div>
        <ChevronDown className={`h-4 w-4 text-muted-foreground transition-transform ${expanded ? "rotate-180" : ""}`} />
      </button>

      {expanded && (
        <div className="border-t border-border">
          <div className="px-5 pt-4 pb-2">
            <p className="text-xs text-muted-foreground mb-1">
              Check an item to expand step-by-step guidance, a draft inquiry email, and questions to pursue.
            </p>
            <p className="text-xs text-muted-foreground/60 mb-4">
              Checked items can be exported as a printable action plan.
            </p>
          </div>

          {/* Checklist items */}
          <div className="divide-y divide-border">
            {items.map((item) => {
              const isChecked = checkedItems.has(item.id);
              const isOpen = openItems.has(item.id);
              const isLoading = loadingItems.has(item.id);
              const content = expandedContents.get(item.id);
              const tab = activeTab[item.id] || "steps";

              return (
                <div key={item.id} className={`transition-colors ${isChecked ? "bg-accent/5" : ""}`}>
                  {/* Row */}
                  <div className="flex items-start gap-3 px-5 py-3">
                    <input
                      type="checkbox"
                      checked={isChecked}
                      onChange={() => handleCheck(item)}
                      className="mt-1 rounded border-border accent-accent cursor-pointer flex-shrink-0 w-4 h-4"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <p className={`text-sm font-semibold leading-snug ${isChecked ? "text-foreground" : "text-foreground"}`}>
                            {item.text}
                          </p>
                          <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">{item.angle}</p>
                        </div>
                        <div className="flex items-center gap-2 shrink-0 mt-0.5">
                          <span className={`text-[10px] font-semibold uppercase tracking-wide px-2 py-0.5 rounded border ${CATEGORY_COLORS[item.category]}`}>
                            {CATEGORY_LABELS[item.category]}
                          </span>
                          {isChecked && (
                            <button
                              onClick={() => toggleOpen(item.id)}
                              className="text-muted-foreground hover:text-foreground transition-colors"
                            >
                              <ChevronRight className={`h-4 w-4 transition-transform ${isOpen ? "rotate-90" : ""}`} />
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Expanded content */}
                  {isChecked && isOpen && (
                    <div className="mx-5 mb-4 border border-border rounded-lg overflow-hidden bg-background">
                      {isLoading ? (
                        <div className="flex items-center gap-2 px-4 py-6 text-muted-foreground text-sm">
                          <Loader2 className="h-4 w-4 animate-spin" />
                          Generating guidance for this angle…
                        </div>
                      ) : content ? (
                        <>
                          {/* Tabs */}
                          <div className="flex border-b border-border">
                            {(["steps", "email", "questions"] as const).map((t) => (
                              <button
                                key={t}
                                onClick={() => setActiveTab(prev => ({ ...prev, [item.id]: t }))}
                                className={`px-4 py-2.5 text-xs font-semibold uppercase tracking-wide transition-colors ${
                                  tab === t
                                    ? "border-b-2 border-accent text-accent"
                                    : "text-muted-foreground hover:text-foreground"
                                }`}
                              >
                                {t === "steps" ? "Next Steps" : t === "email" ? "Draft Email" : "Questions to Pursue"}
                              </button>
                            ))}
                          </div>

                          <div className="p-4">
                            {tab === "steps" && (
                              <ol className="space-y-2">
                                {content.steps.map((step, i) => (
                                  <li key={i} className="flex gap-3 text-sm text-foreground leading-relaxed">
                                    <span className="text-accent font-bold shrink-0 w-5">{i + 1}.</span>
                                    {step}
                                  </li>
                                ))}
                                {content.sourceLinks.length > 0 && (
                                  <div className="mt-4 pt-3 border-t border-border">
                                    <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground mb-2 flex items-center gap-1">
                                      <Link2 className="h-3 w-3" /> Relevant Sources
                                    </p>
                                    <div className="space-y-1">
                                      {content.sourceLinks.map((l, i) => (
                                        <a key={i} href={l.url} target="_blank" rel="noopener noreferrer"
                                          className="flex items-center gap-1.5 text-xs text-accent hover:underline">
                                          <span className="truncate">{l.label}</span>
                                          <span className="text-muted-foreground">↗</span>
                                        </a>
                                      ))}
                                    </div>
                                  </div>
                                )}
                              </ol>
                            )}

                            {tab === "email" && (
                              <div className="space-y-3">
                                <div className="bg-muted/40 rounded px-3 py-2">
                                  <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground mb-1">Subject</p>
                                  <p className="text-sm text-foreground">{content.emailSubject}</p>
                                </div>
                                <div className="bg-muted/40 rounded px-3 py-2">
                                  <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground mb-2">Body</p>
                                  <pre className="text-sm text-foreground whitespace-pre-wrap font-sans leading-relaxed">{content.emailBody}</pre>
                                </div>
                                <button
                                  onClick={() => navigator.clipboard.writeText(`Subject: ${content.emailSubject}\n\n${content.emailBody}`)}
                                  className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
                                >
                                  <Copy className="h-3 w-3" /> Copy email
                                </button>
                              </div>
                            )}

                            {tab === "questions" && (
                              <ol className="space-y-2">
                                {content.questions.map((q, i) => (
                                  <li key={i} className="flex gap-3 text-sm text-foreground leading-relaxed">
                                    <span className="text-muted-foreground font-semibold shrink-0 w-5">{i + 1}.</span>
                                    {q}
                                  </li>
                                ))}
                              </ol>
                            )}
                          </div>
                        </>
                      ) : null}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Export bar */}
          {checkedCount > 0 && (
            <div className="px-5 py-4 border-t border-border bg-muted/20 flex items-center justify-between gap-3">
              <p className="text-xs text-muted-foreground">
                <span className="font-semibold text-foreground">{checkedCount} item{checkedCount !== 1 ? "s" : ""}</span> selected for export
              </p>
              <div className="flex items-center gap-2">
                <button
                  onClick={handleCopyExport}
                  className="flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded border border-border hover:bg-muted transition-colors"
                >
                  {copySuccess ? <CheckSquare className="h-3.5 w-3.5 text-green-600" /> : <Copy className="h-3.5 w-3.5" />}
                  {copySuccess ? "Copied!" : "Copy Action Plan"}
                </button>
                <button
                  onClick={handlePrint}
                  className="flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded bg-accent text-accent-foreground hover:bg-accent/90 transition-colors"
                >
                  <Printer className="h-3.5 w-3.5" />
                  Print / Save PDF
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ReportersChecklist;
