import { useState, useCallback } from "react";
import { ClipboardList, ChevronDown, ChevronRight, Copy, Printer, CheckSquare, Loader2, Link2, FileText, ChevronLeft, Bell } from "lucide-react";
import type { RecordResult } from "@/lib/recordsApi";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

interface Props {
  name: string;
  state: string;
  results: RecordResult[];
}

interface ChecklistItem {
  id: string;
  text: string;
  category: string;
  angle: string;
}

interface ExpandedContent {
  steps: string[];
  emailSubject: string;
  emailBody: string;
  questions: string[];
  isRecordsRequest: boolean;
  sourceLinks: { label: string; url: string }[];
}

// ─── Records Request Builder State ───────────────────────────────────────────
interface RequestForm {
  requestType: "sunshine" | "foia";
  // Sunshine fields
  agencyName: string;
  agencyAddress: string;
  custodianName: string;
  recordsCategory: string;
  recordsDescription: string;
  format: string;
  expedited: string;
  requesterName: string;
  requesterOrg: string;
  requesterEmail: string;
  requesterPhone: string;
  // FOIA additional fields
  foiaAgency: string;
  foiaAddress: string;
  dateRangeStart: string;
  dateRangeEnd: string;
  feeWaiver: string;
}

const EMPTY_FORM: RequestForm = {
  requestType: "sunshine",
  agencyName: "", agencyAddress: "", custodianName: "",
  recordsCategory: "", recordsDescription: "", format: "electronic",
  expedited: "no", requesterName: "", requesterOrg: "",
  requesterEmail: "", requesterPhone: "",
  foiaAgency: "", foiaAddress: "",
  dateRangeStart: "2015-01-01", dateRangeEnd: new Date().toISOString().split("T")[0],
  feeWaiver: "yes",
};

const SUNSHINE_RECORD_CATEGORIES = [
  "Contracts and procurement records",
  "Financial records and expenditures",
  "Emails and correspondence",
  "Meeting minutes and agendas",
  "Personnel records (non-exempt)",
  "Property and asset records",
  "Permits and licenses",
  "Law enforcement records (non-exempt)",
  "Grant records and applications",
  "Other (describe below)",
];

const FOIA_RECORD_CATEGORIES = [
  "Contracts, task orders, and modifications",
  "Emails and internal correspondence",
  "Financial records and disbursements",
  "Inspection and audit reports",
  "Agency communications with named parties",
  "Enforcement actions and investigations",
  "Grant applications and awards",
  "Other (describe below)",
];

// ─── Letter Generators ────────────────────────────────────────────────────────

function generateSunshineLetter(form: RequestForm, subjectName: string): string {
  const today = new Date().toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });
  const deadline = new Date(); deadline.setDate(deadline.getDate() + 3); // Florida: promptly, typically 3 business days acknowledged
  const deadlineStr = deadline.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });

  const formatClause = form.format === "electronic"
    ? "I request records in electronic format where available (PDF, Excel, or Word). If electronic format is unavailable, I request inspection of the originals."
    : form.format === "inspection"
    ? "I request to inspect the records in person at your office. Please advise of available times."
    : "I request certified copies of all responsive records.";

  const expeditedClause = form.expedited === "yes"
    ? `I request expedited processing of this request as this matter involves an issue of imminent public concern. Delay in disclosure would impair the public interest in this information.`
    : "";

  const recordsDetail = form.recordsDescription
    ? `${form.recordsCategory ? form.recordsCategory + ", specifically: " : ""}${form.recordsDescription}`
    : form.recordsCategory;

  return `${form.requesterName || "[Your Name]"}
${form.requesterOrg || "[News Organization]"}
${form.requesterEmail || "[Email]"}
${form.requesterPhone || "[Phone]"}

${today}

${form.custodianName ? form.custodianName + "\n" : "Records Custodian\n"}${form.agencyName || "[Agency Name]"}
${form.agencyAddress || "[Agency Address, City, State, ZIP]"}

Re: Public Records Request Pursuant to Chapter 119, Florida Statutes
Subject: Records Related to ${subjectName}

Dear ${form.custodianName ? form.custodianName : "Records Custodian"}:

Pursuant to Article I, Section 24 of the Florida Constitution and Chapter 119, Florida Statutes, I hereby request access to and copies of the following public records held by ${form.agencyName || "[Agency Name]"}:

${recordsDetail || "[Describe the specific records requested]"}
${expeditedClause ? "\n" + expeditedClause.trim() + "\n" : ""}
${formatClause}

Under § 119.07(1)(a), F.S., you are required to permit inspection and copying of public records. If any portion of this request is denied, please cite the specific statutory exemption(s) relied upon and provide a written explanation as required by § 119.07(1)(f), F.S. Please also segregate and release all non-exempt portions of any partially exempt records.

I am a journalist with ${form.requesterOrg || "[News Organization]"} requesting these records for news-gathering purposes. Florida law does not require a requester to state a reason for requesting public records, but I am providing this context voluntarily.

Please acknowledge receipt of this request and advise of the estimated timeline for fulfillment. If there are any fees for duplication, please advise before incurring costs exceeding $25.

Thank you for your prompt attention to this request.

Sincerely,

${form.requesterName || "[Your Name]"}
${form.requesterOrg || "[News Organization]"}
${form.requesterEmail || "[Email]"}
${form.requesterPhone || "[Phone]"}

---
Florida Sunshine Law Reference: Chapter 119, F.S. | Art. I, §24, Florida Constitution
Send via email with read receipt OR certified mail. Retain a copy for your records.
If denied or delayed beyond a reasonable time, contact the Florida Attorney General's Office or consult legal counsel regarding a mandamus action.`;
}

function generateFoiaLetter(form: RequestForm, subjectName: string): string {
  const today = new Date().toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });
  const deadline = new Date(); deadline.setDate(deadline.getDate() + 20);
  const deadlineStr = deadline.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });

  const recordsDetail = form.recordsDescription
    ? `${form.recordsCategory ? form.recordsCategory + ", specifically: " : ""}${form.recordsDescription}`
    : form.recordsCategory || "[Describe specific records requested]";

  const feeClause = form.feeWaiver === "yes"
    ? `I request a fee waiver pursuant to 5 U.S.C. § 552(a)(4)(A)(iii). I am a journalist with ${form.requesterOrg || "[News Organization]"} requesting these records for news-gathering purposes in the public interest. Disclosure of this information is likely to contribute significantly to public understanding of government operations and is not primarily in my commercial interest. If a fee waiver is not granted, please notify me before incurring costs exceeding $25.`
    : "Please notify me before incurring any costs exceeding $25.";

  return `${form.requesterName || "[Your Name]"}
${form.requesterOrg || "[News Organization]"}
${form.requesterEmail || "[Email]"}
${form.requesterPhone || "[Phone]"}

${today}

FOIA Officer
${form.foiaAgency || form.agencyName || "[Agency Name]"}
${form.foiaAddress || form.agencyAddress || "[Agency FOIA Office Address]"}

Re: Freedom of Information Act Request — Records Pertaining to ${subjectName}

Dear FOIA Officer:

Pursuant to the Freedom of Information Act, 5 U.S.C. § 552, I hereby request access to and copies of the following records:

All records, documents, communications, and data related to ${subjectName}, including: ${recordsDetail}.

This request covers the period from ${form.dateRangeStart || "January 1, 2015"} to ${form.dateRangeEnd || "present"}.

${feeClause}

As provided by statute, I expect a determination within 20 business days of receipt (by ${deadlineStr}). If you deny any portion of this request, please cite the specific statutory exemption(s) and your reasoning, and release all segregable portions of otherwise exempt material.

Please confirm receipt of this request and provide a tracking number.

Sincerely,

${form.requesterName || "[Your Name]"}
${form.requesterOrg ? form.requesterOrg + "\n" : ""}${form.requesterEmail || "[Email]"}
${form.requesterPhone || "[Phone]"}

---
FOIA Reference: 5 U.S.C. § 552
Send via certified mail or email with delivery confirmation. Retain a copy for your records.
Appeals of denials may be submitted within 90 days to the agency's FOIA Appeals Officer.`;
}

// ─── Inline Request Tracker ───────────────────────────────────────────────────

const RequestTrackerInline = ({ subjectName, state, requestType, agencyName, recordsDescription, letterText, requesterName, requesterOrg, requesterEmail, onClose }: {
  subjectName: string; state: string; requestType: "sunshine" | "foia";
  agencyName: string; recordsDescription: string; letterText: string;
  requesterName?: string; requesterOrg?: string; requesterEmail?: string;
  onClose: () => void;
}) => {
  const { user } = useAuth();
  const today = new Date().toISOString().split("T")[0];
  const deadlineDays = requestType === "foia" ? 20 : 10;
  const deadline = new Date(); deadline.setDate(deadline.getDate() + deadlineDays);
  const deadlineStr = deadline.toISOString().split("T")[0];

  const [email, setEmail] = useState(requesterEmail || user?.email || "");
  const [filedDate, setFiledDate] = useState(today);
  const [customDate, setCustomDate] = useState("");
  const [notes, setNotes] = useState("");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");

  const inputCls = "w-full text-sm border border-border rounded px-3 py-2 bg-background text-foreground focus:outline-none focus:border-accent";
  const labelCls = "block text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-1";

  const handleSave = async () => {
    if (!user) { setError("Sign in to track requests."); return; }
    if (!email) { setError("Email required for reminders."); return; }
    setSaving(true); setError("");
    try {
      const { data: inserted, error: dbError } = await (supabase as any)
        .from("records_requests")
        .insert({
          user_id: user.id, subject_name: subjectName, state, request_type: requestType,
          agency_name: agencyName, records_description: recordsDescription,
          requester_name: requesterName || null, requester_email: email,
          requester_org: requesterOrg || null, filed_date: filedDate,
          legal_deadline: deadlineStr, custom_reminder_date: customDate || null,
          status: "filed", notes: notes || null, letter_text: letterText || null,
        })
        .select()
        .single();
      if (dbError) throw dbError;

      // Send confirmation email
      try {
        const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
        const supabaseKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;
        await fetch(`${supabaseUrl}/functions/v1/send-confirmation`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${supabaseKey}`,
          },
          body: JSON.stringify({
            email, requesterName, requesterOrg, subjectName, agencyName,
            requestType, filedDate, legalDeadline: deadlineStr,
            customDate, recordsDescription,
          }),
        });
      } catch (_) {}

      setSaved(true);
    } catch (err: any) { setError(err.message || "Failed to save."); }
    finally { setSaving(false); }
  };

  if (saved) return (
    <div className="border border-success-border bg-success-bg rounded-lg p-4">
      <div className="flex items-start gap-2">
        <CheckSquare className="h-4 w-4 text-success shrink-0 mt-0.5" />
        <div>
          <p className="text-sm font-semibold text-success">Request tracked!</p>
          <p className="text-xs text-success mt-1">Request saved. A confirmation has been sent to <strong>{email}</strong>. Reminders will follow on days 3, 10, 20, and 30{customDate ? ` plus your custom date` : ""}.</p>
          <p className="text-xs text-success mt-2">View and update this request in <strong>Dashboard → My Requests</strong>.</p>
        </div>
      </div>
    </div>
  );

  return (
    <div className="border border-accent/30 bg-accent/5 rounded-lg p-4 space-y-3">
      <div className="flex items-center justify-between">
        <p className="text-xs font-semibold uppercase tracking-wide text-foreground flex items-center gap-1.5"><Bell className="h-3.5 w-3.5 text-accent" /> Track &amp; Set Reminders</p>
        <button onClick={onClose} className="text-xs text-muted-foreground hover:text-foreground">✕</button>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className={labelCls}>Date Filed</label>
          <input type="date" className={inputCls} value={filedDate} onChange={e => setFiledDate(e.target.value)} />
        </div>
        <div>
          <label className={labelCls}>Custom Reminder (optional)</label>
          <input type="date" className={inputCls} value={customDate} min={today} onChange={e => setCustomDate(e.target.value)} />
        </div>
      </div>
      <div>
        <label className={labelCls}>Send Reminders To</label>
        <input type="email" className={inputCls} value={email} onChange={e => setEmail(e.target.value)} placeholder="your@email.com" />
      </div>
      <div>
        <label className={labelCls}>Notes (optional)</label>
        <input className={inputCls} value={notes} onChange={e => setNotes(e.target.value)} placeholder="Tracking number, contact name, etc." />
      </div>
      {error && <p className="text-xs text-destructive">{error}</p>}
      <p className="text-[11px] text-muted-foreground">Reminders at day 3, 10, 20, 30 · Deadline: {deadline.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}</p>
      <button onClick={handleSave} disabled={saving || !email}
        className="w-full flex items-center justify-center gap-2 py-2 rounded bg-accent text-accent-foreground text-sm font-semibold hover:bg-accent/90 disabled:opacity-40 transition-colors">
        {saving ? <><Loader2 className="h-4 w-4 animate-spin" /> Saving…</> : <><Bell className="h-4 w-4" /> Save &amp; Enable Reminders</>}
      </button>
    </div>
  );
};

// ─── Records Request Builder Component ───────────────────────────────────────

const RecordsRequestBuilder = ({ state, results, subjectName, onClose }: {
  state: string;
  results: RecordResult[];
  subjectName: string;
  onClose: () => void;
}) => {
  const isFL = state === "Florida" || state === "FL";
  const [step, setStep] = useState(1);
  const [showTracker, setShowTracker] = useState(false);
  const [form, setForm] = useState<RequestForm>({    ...EMPTY_FORM,
    requestType: isFL ? "sunshine" : "foia",
    agencyName: results.find(r => r.details?.["Awarding Agency"])?.details?.["Awarding Agency"] || "",
  });
  const [generatedLetter, setGeneratedLetter] = useState("");
  const [copySuccess, setCopySuccess] = useState(false);

  const set = (field: keyof RequestForm, value: string) =>
    setForm(prev => ({ ...prev, [field]: value }));

  const totalSteps = 4;
  const isSunshine = form.requestType === "sunshine";
  const categories = isSunshine ? SUNSHINE_RECORD_CATEGORIES : FOIA_RECORD_CATEGORIES;

  const handleGenerate = () => {
    const letter = isSunshine
      ? generateSunshineLetter(form, subjectName)
      : generateFoiaLetter(form, subjectName);
    setGeneratedLetter(letter);
    setStep(4);
  };

  const handlePrint = () => {
    const win = window.open("", "_blank");
    if (!win) return;
    const title = isSunshine ? "Florida Public Records Request" : "FOIA Request";
    win.document.write(`<html><head><title>${title} — ${subjectName}</title>
      <style>body{font-family:'Georgia',serif;max-width:700px;margin:40px auto;padding:0 20px;color:#1a1a1a;line-height:1.7;font-size:13px}pre{white-space:pre-wrap;font-family:'Georgia',serif;font-size:13px}h2{font-size:16px;border-bottom:1px solid #ccc;padding-bottom:8px}</style>
      </head><body><pre>${generatedLetter.replace(/</g, "&lt;")}</pre></body></html>`);
    win.document.close(); win.print();
  };

  const inputCls = "w-full text-sm border border-border rounded px-3 py-2 bg-background text-foreground focus:outline-none focus:border-accent";
  const labelCls = "block text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-1";
  const selectCls = `${inputCls} cursor-pointer`;

  return (
    <div className="border border-border rounded-lg bg-background overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 bg-muted/30 border-b border-border">
        <div className="flex items-center gap-2">
          <FileText className="h-4 w-4 text-accent" />
          <span className="text-xs font-semibold uppercase tracking-wide text-foreground">
            {isSunshine ? "Florida Sunshine Law Request Builder" : "FOIA Request Builder"}
          </span>
        </div>
        <div className="flex items-center gap-3">
          {step < 4 && (
            <span className="text-[11px] text-muted-foreground">Step {step} of {totalSteps - 1}</span>
          )}
          <button onClick={onClose} className="text-xs text-muted-foreground hover:text-foreground transition-colors">✕ Close</button>
        </div>
      </div>

      {/* Progress bar */}
      {step < 4 && (
        <div className="h-1 bg-muted">
          <div className="h-1 bg-accent transition-all" style={{ width: `${(step / (totalSteps - 1)) * 100}%` }} />
        </div>
      )}

      <div className="p-5">
        {/* Step 1: Request type + Agency */}
        {step === 1 && (
          <div className="space-y-4">
            <div>
              <p className="text-sm font-semibold text-foreground mb-1">What type of records request?</p>
              <p className="text-xs text-muted-foreground mb-3">
                {isFL ? "Florida searches can use the Sunshine Law for state/local agencies or FOIA for federal agencies." : "Select based on the agency you're requesting from."}
              </p>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { val: "sunshine", label: "Florida Sunshine Law", sub: "State & local agencies", color: isFL ? "border-accent bg-accent/5" : "border-border opacity-50" },
                  { val: "foia", label: "Federal FOIA", sub: "Federal agencies", color: "border-accent bg-accent/5" },
                ].map(opt => (
                  <button key={opt.val}
                    onClick={() => set("requestType", opt.val as any)}
                    className={`border-2 rounded-lg p-3 text-left transition-colors ${form.requestType === opt.val ? opt.color : "border-border hover:border-muted-foreground"}`}>
                    <p className="text-sm font-semibold text-foreground">{opt.label}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{opt.sub}</p>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className={labelCls}>Agency / Custodian Name *</label>
              <input className={inputCls} placeholder={isSunshine ? "e.g. City of Tampa, Clerk of Courts" : "e.g. Department of Defense"}
                value={form.agencyName} onChange={e => set("agencyName", e.target.value)} />
            </div>
            <div>
              <label className={labelCls}>Agency Mailing Address</label>
              <input className={inputCls} placeholder="Street, City, State ZIP"
                value={form.agencyAddress} onChange={e => set("agencyAddress", e.target.value)} />
            </div>
            {isSunshine && (
              <div>
                <label className={labelCls}>Records Custodian Name (if known)</label>
                <input className={inputCls} placeholder="e.g. Jane Smith, City Clerk"
                  value={form.custodianName} onChange={e => set("custodianName", e.target.value)} />
              </div>
            )}
          </div>
        )}

        {/* Step 2: Records being requested */}
        {step === 2 && (
          <div className="space-y-4">
            <div>
              <p className="text-sm font-semibold text-foreground mb-1">What records are you requesting?</p>
              <p className="text-xs text-muted-foreground mb-3">Select a category and describe the specific records. The more specific, the better — vague requests are easier to deny or delay.</p>
            </div>
            <div>
              <label className={labelCls}>Record Category</label>
              <select className={selectCls} value={form.recordsCategory} onChange={e => set("recordsCategory", e.target.value)}>
                <option value="">— Select a category —</option>
                {categories.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className={labelCls}>Specific Records Description *</label>
              <textarea className={`${inputCls} min-h-[100px] resize-y`}
                placeholder={`Describe as specifically as possible. Example: "All emails between [official] and [contractor] from January 2023 to present regarding contract #[number]"`}
                value={form.recordsDescription} onChange={e => set("recordsDescription", e.target.value)} />
              <p className="text-[11px] text-muted-foreground mt-1">Tip: Reference specific names, dates, contract numbers, or case numbers found in your search results.</p>
            </div>
            {!isSunshine && (
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={labelCls}>Date Range — From</label>
                  <input type="date" className={inputCls} value={form.dateRangeStart} onChange={e => set("dateRangeStart", e.target.value)} />
                </div>
                <div>
                  <label className={labelCls}>Date Range — To</label>
                  <input type="date" className={inputCls} value={form.dateRangeEnd} onChange={e => set("dateRangeEnd", e.target.value)} />
                </div>
              </div>
            )}
            <div>
              <label className={labelCls}>Preferred Format</label>
              <select className={selectCls} value={form.format} onChange={e => set("format", e.target.value)}>
                <option value="electronic">Electronic (PDF, Excel, Word) — preferred</option>
                <option value="inspection">Inspection only (in-person review)</option>
                <option value="certified">Certified copies</option>
              </select>
            </div>
            {isSunshine && (
              <div>
                <label className={labelCls}>Expedited Processing?</label>
                <select className={selectCls} value={form.expedited} onChange={e => set("expedited", e.target.value)}>
                  <option value="no">No — standard processing</option>
                  <option value="yes">Yes — imminent public interest (include justification)</option>
                </select>
              </div>
            )}
            {!isSunshine && (
              <div>
                <label className={labelCls}>Fee Waiver Request?</label>
                <select className={selectCls} value={form.feeWaiver} onChange={e => set("feeWaiver", e.target.value)}>
                  <option value="yes">Yes — journalism/public interest (recommended)</option>
                  <option value="no">No — I will pay reasonable fees</option>
                </select>
              </div>
            )}
          </div>
        )}

        {/* Step 3: Your information */}
        {step === 3 && (
          <div className="space-y-4">
            <div>
              <p className="text-sm font-semibold text-foreground mb-1">Your contact information</p>
              <p className="text-xs text-muted-foreground mb-3">
                {isSunshine
                  ? "Florida law does not require you to identify yourself, but including contact info allows the agency to notify you of fees, delays, or clarifications."
                  : "Required for FOIA tracking and fee waiver processing."}
              </p>
            </div>
            <div>
              <label className={labelCls}>Your Full Name (First &amp; Last)</label>
              <input className={inputCls} placeholder="e.g. Joe Blow" value={form.requesterName} onChange={e => set("requesterName", e.target.value)} />
            </div>
            <div>
              <label className={labelCls}>News Organization / Publication</label>
              <input className={inputCls} placeholder="e.g. Bay News 9, Tampa Bay Times" value={form.requesterOrg} onChange={e => set("requesterOrg", e.target.value)} />
            </div>
            <div>
              <label className={labelCls}>Email Address</label>
              <input type="email" className={inputCls} placeholder="you@publication.com" value={form.requesterEmail} onChange={e => set("requesterEmail", e.target.value)} />
            </div>
            <div>
              <label className={labelCls}>Phone Number</label>
              <input type="tel" className={inputCls} placeholder="(555) 555-5555" value={form.requesterPhone} onChange={e => set("requesterPhone", e.target.value)} />
            </div>

            {isSunshine && (
              <div className="bg-warning-bg border border-warning-border rounded px-3 py-2 mt-2">
                <p className="text-xs text-warning font-medium mb-1">Florida Sunshine Law — Key Facts</p>
                <ul className="text-xs text-warning space-y-1 list-disc pl-4">
                  <li>Agencies must acknowledge requests promptly and respond within a reasonable time (typically 3–10 business days)</li>
                  <li>You cannot be required to explain why you want records</li>
                  <li>Fees limited to actual cost of duplication — no research or staff time fees</li>
                  <li>If denied, you may petition the circuit court for a writ of mandamus</li>
                  <li>Contact: Florida AG Sunshine Law hotline: (866) 966-7226</li>
                </ul>
              </div>
            )}
            {!isSunshine && (
              <div className="bg-info-bg border border-info-border rounded px-3 py-2 mt-2">
                <p className="text-xs text-info font-medium mb-1">FOIA — Key Facts</p>
                <ul className="text-xs text-info space-y-1 list-disc pl-4">
                  <li>20 business days to respond (can be extended 10 days for unusual circumstances)</li>
                  <li>Fee waivers available for journalists and public interest requesters</li>
                  <li>Denials must cite specific exemptions — you have 90 days to appeal</li>
                  <li>FOIA Project tracks agency compliance: foiaproject.org</li>
                </ul>
              </div>
            )}
          </div>
        )}

        {/* Step 4: Generated letter */}
        {step === 4 && generatedLetter && (
          <div className="space-y-3">
            <div className="flex items-center justify-between mb-1">
              <p className="text-sm font-semibold text-foreground">
                {isSunshine ? "Florida Sunshine Law Request" : "FOIA Request"} — Ready to Send
              </p>
              <div className="flex items-center gap-2">
                <button onClick={() => { navigator.clipboard.writeText(generatedLetter); setCopySuccess(true); setTimeout(() => setCopySuccess(false), 2000); }}
                  className="flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded border border-border hover:bg-muted transition-colors">
                  {copySuccess ? <CheckSquare className="h-3.5 w-3.5 text-green-600" /> : <Copy className="h-3.5 w-3.5" />}
                  {copySuccess ? "Copied!" : "Copy"}
                </button>
                <button onClick={handlePrint}
                  className="flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded bg-accent text-accent-foreground hover:bg-accent/90 transition-colors">
                  <Printer className="h-3.5 w-3.5" /> Print / PDF
                </button>
              </div>
            </div>
            <div className="bg-muted/30 border border-border rounded px-4 py-3 max-h-[420px] overflow-y-auto">
              <pre className="text-xs text-foreground whitespace-pre-wrap font-sans leading-relaxed">{generatedLetter}</pre>
            </div>
            {!showTracker ? (
              <button onClick={() => setShowTracker(true)}
                className="w-full flex items-center justify-center gap-2 py-3 border border-dashed border-accent/50 rounded-lg text-xs font-semibold text-accent hover:bg-accent/5 transition-colors">
                <Bell className="h-4 w-4" /> Track this request &amp; get email reminders →
              </button>
            ) : (
              <RequestTrackerInline
                subjectName={subjectName}
                state={state}
                requestType={form.requestType}
                agencyName={form.agencyName}
                recordsDescription={form.recordsDescription}
                letterText={generatedLetter}
                requesterName={form.requesterName}
                requesterOrg={form.requesterOrg}
                requesterEmail={form.requesterEmail}
                onClose={() => setShowTracker(false)}
              />
            )}
            <button onClick={() => setStep(1)} className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors mt-1">
              <ChevronLeft className="h-3 w-3" /> Edit request
            </button>
          </div>
        )}

        {/* Navigation */}
        {step < 4 && (
          <div className="flex items-center justify-between mt-6 pt-4 border-t border-border">
            <button onClick={() => setStep(s => s - 1)} disabled={step === 1}
              className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors disabled:opacity-30">
              <ChevronLeft className="h-3 w-3" /> Back
            </button>
            {step < 3 ? (
              <button onClick={() => setStep(s => s + 1)}
                className="flex items-center gap-1.5 text-xs font-semibold px-4 py-2 rounded bg-accent text-accent-foreground hover:bg-accent/90 transition-colors">
                Continue <ChevronRight className="h-3 w-3" />
              </button>
            ) : (
              <button onClick={handleGenerate}
                disabled={!form.recordsDescription && !form.recordsCategory}
                className="flex items-center gap-1.5 text-xs font-semibold px-4 py-2 rounded bg-accent text-accent-foreground hover:bg-accent/90 disabled:opacity-40 transition-colors">
                <FileText className="h-3.5 w-3.5" /> Generate Letter
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

// ─── Entity Extraction ────────────────────────────────────────────────────────

function extractEntities(results: RecordResult[]) {
  const people = new Set<string>();
  const orgs = new Set<string>();
  const sourceLinks: { label: string; url: string }[] = [];
  const seen = new Set<string>();

  for (const r of results) {
    if (r.returnedName) people.add(r.returnedName);
    if (r.details?.["Officer/Agent"]) people.add(r.details["Officer/Agent"]);
    if (r.details?.["Assigned To"]) people.add(r.details["Assigned To"]);
    if (r.details?.["Treasurer"]) people.add(r.details["Treasurer"]);
    if (r.details?.["Entity Name"]) orgs.add(r.details["Entity Name"]);
    if (r.details?.["Recipient"]) orgs.add(r.details["Recipient"]);
    if (r.details?.["Registrant"]) orgs.add(r.details["Registrant"]);
    if (r.details?.["Client"]) orgs.add(r.details["Client"]);
    if (r.sourceUrl && !seen.has(r.sourceUrl)) {
      seen.add(r.sourceUrl);
      sourceLinks.push({ label: r.source, url: r.sourceUrl });
    }
  }
  return {
    people: Array.from(people).filter(p => p && p !== "N/A").slice(0, 8),
    orgs: Array.from(orgs).filter(o => o && o !== "N/A").slice(0, 8),
    sourceLinks: sourceLinks.slice(0, 10),
  };
}

function buildFindingsSummary(category: string, results: RecordResult[], name: string): string {
  const relevant = ["always", "foia", "legal", "state"].includes(category) ? results : results.filter(r => r.category === category);
  const lines: string[] = [`Search subject: "${name}"`, `Records (${relevant.length}):`, ``];
  for (const r of relevant.slice(0, 15)) {
    lines.push(`SOURCE: ${r.source}`, `DESCRIPTION: ${r.description}`);
    const keyDetails = Object.entries(r.details || {}).filter(([k, v]) => v && v !== "N/A" && !["PACER Lookup", "Disclaimer", "Source"].includes(k)).slice(0, 8).map(([k, v]) => `  ${k}: ${v}`).join("\n");
    if (keyDetails) lines.push(keyDetails);
    lines.push("");
  }
  return lines.join("\n");
}

async function generateExpandedContent(item: ChecklistItem, name: string, state: string, results: RecordResult[], entities: ReturnType<typeof extractEntities>): Promise<ExpandedContent> {
  const isRecordsRequest = item.id === "foia-request";
  const findingsSummary = buildFindingsSummary(item.category, results, name);
  const relevantLinks = entities.sourceLinks.filter(l => ["always", "foia", "legal", "state"].includes(item.category) || l.label.toLowerCase().includes(item.category));

  const prompt = `You are a senior investigative journalist with 50 years of experience who has broken hundreds of major stories. You are mentoring a junior reporter.

Analyze the ACTUAL RECORDS BELOW and give SPECIFIC investigative guidance. Every step and question must reference real data from the records. Never generic.

=== ACTUAL RECORDS FOUND ===
${findingsSummary}
Named individuals: ${entities.people.join(", ") || "none beyond subject"}
Organizations: ${entities.orgs.join(", ") || "none identified"}
State: ${state}
Checklist item: "${item.text}"
Angle: "${item.angle}"
=== END RECORDS ===

Return JSON:
{
  "steps": ["step1","step2","step3","step4","step5"],
  "emailSubject": "subject",
  "emailBody": "body",
  "questions": ["q1","q2","q3","q4","q5","q6","q7"]
}

STEPS: Must reference specific data found. Concrete actions. Most urgent first.
QUESTIONS: Must cite specific findings. 50-year veteran level — what patterns are anomalous, what needs explaining, what's conspicuously absent? Suggest story angles.
EMAIL: Neutral professional inquiry to ${entities.people[0] || "[Subject or Representative]"}. Reference public records. Offer comment. 3 paragraphs max. Sign as "A reporter at [Publication]".

Return ONLY valid JSON.`;

  try {
    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ model: "claude-sonnet-4-20250514", max_tokens: 1500, messages: [{ role: "user", content: prompt }] }),
    });
    const data = await response.json();
    const text = data.content?.find((b: any) => b.type === "text")?.text || "";
    const parsed = JSON.parse(text.replace(/```json|```/g, "").trim());
    return { steps: parsed.steps || [], emailSubject: parsed.emailSubject || `Public records inquiry — ${name}`, emailBody: parsed.emailBody || "", questions: parsed.questions || [], isRecordsRequest, sourceLinks: relevantLinks };
  } catch {
    return {
      steps: ["Cross-reference all records against other categories", "Verify named parties match your subject", "Request primary documents from the originating agency", "Check for related entities sharing addresses or filing numbers", "Document all verification steps with source URLs"],
      emailSubject: `Public records inquiry — ${name}`,
      emailBody: `Dear [Name],\n\nI am a reporter investigating matters of public interest and have identified public records related to ${name}. I am reaching out to offer an opportunity to comment.\n\nIf available to speak, please contact me at [your contact info].\n\nA reporter\n[Publication]`,
      questions: ["Do named parties positively match your subject beyond just name?", "What is the full timeline and does it correlate with public decisions?", "Are there connected entities appearing across multiple record categories?", "What records would you expect to find that are conspicuously absent?", "Who else has direct knowledge of the activity in these records?"],
      isRecordsRequest, sourceLinks: relevantLinks,
    };
  }
}

function buildChecklistItems(name: string, state: string, results: RecordResult[]): ChecklistItem[] {
  const cats = new Set(results.map(r => r.category));
  const items: ChecklistItem[] = [];
  items.push({ id: "verify-identity", text: "Verify identity", category: "always", angle: "Confirm matches refer to your actual subject using addresses, dates, and corroborating identifiers" });
  if (cats.has("offshore")) items.push({ id: "icij-network", text: "Investigate offshore connections", category: "offshore", angle: "Map the full network of officers, intermediaries, and addresses linked to offshore entities found" });
  if (cats.has("donations")) items.push({ id: "campaign-finance", text: "Trace campaign finance activity", category: "donations", angle: "Follow the money — who received contributions, when, and what decisions or contracts followed" });
  if (cats.has("court")) items.push({ id: "court-records", text: "Pull full court case records", category: "court", angle: "Retrieve complete dockets via PACER — all filings, parties, judgments, and outcomes" });
  if (cats.has("business")) items.push({ id: "business-filings", text: "Map business entity relationships", category: "business", angle: "Identify all entities and officers, cross-reference shared addresses, registered agents, and names" });
  if (cats.has("contracts")) items.push({ id: "federal-contracts", text: "Examine federal contracts and grants", category: "contracts", angle: "Look for patterns — awarding agencies, sole-source awards, contract modifications, and connected recipients" });
  if (cats.has("lobbying")) items.push({ id: "lobbying", text: "Map lobbying relationships", category: "lobbying", angle: "Who lobbied for whom, on what issues, cross-referenced with donations and contracts" });
  items.push({ id: "foia-request", text: state === "Florida" || state === "FL" ? "File a Sunshine Law request" : "File a public records request (FOIA)", category: "foia", angle: state === "Florida" || state === "FL" ? "Florida Ch. 119 request for state/local records — broader and faster than federal FOIA" : "Request underlying agency records via FOIA — contracts, disclosures, or enforcement actions" });
  items.push({ id: "state-records", text: `Search ${state !== "All States / National" ? state : "state"} records`, category: "state", angle: "Supplement federal data with state-level sources — property, licenses, local courts, state agencies" });
  if (cats.has("sanctions") || cats.has("offshore")) items.push({ id: "editor-review", text: "Consult editor and legal counsel", category: "legal", angle: "Before publishing sanctions or offshore findings, verify identity and review with editor and legal team" });
  return items;
}

function buildExportText(checkedItems: Set<string>, expandedContents: Map<string, ExpandedContent>, name: string, state: string, results: RecordResult[]): string {
  const items = buildChecklistItems(name, state, results).filter(i => checkedItems.has(i.id));
  if (items.length === 0) return "";
  return [
    `INVESTIGATIVE ACTION PLAN`, `Subject: ${name} | ${state}`,
    `Generated: ${new Date().toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}`,
    `RecordsTracer — recordtracer.com`, ``, `═══════════════════════════════════════`, ``,
    ...items.flatMap((item, i) => {
      const content = expandedContents.get(item.id);
      const lines = [`${i + 1}. ${item.text.toUpperCase()}`, `   ${item.angle}`, ``];
      if (content) {
        lines.push(`   STEPS:`); content.steps.forEach((s, si) => lines.push(`   ${si + 1}. ${s}`)); lines.push(``);
        lines.push(`   QUESTIONS TO INVESTIGATE:`); content.questions.forEach((q, qi) => lines.push(`   ${qi + 1}. ${q}`)); lines.push(``);
        if (content.emailBody) { lines.push(`   DRAFT INQUIRY EMAIL:`, `   Subject: ${content.emailSubject}`, ``); content.emailBody.split("\n").forEach(l => lines.push(`   ${l}`)); }
        lines.push(``, `───────────────────────────────────────`, ``);
      }
      return lines;
    }),
    `This document was generated by RecordsTracer. All findings require independent verification prior to publication.`,
    `Record matches do not confirm identity or imply wrongdoing.`,
  ].join("\n");
}

const CATEGORY_COLORS: Record<string, string> = {
  offshore: "bg-warning-bg text-warning border-warning-border", donations: "bg-info-bg text-info border-info-border",
  court: "bg-destructive/10 text-destructive border-destructive/30", business: "bg-secondary text-secondary-foreground border-border",
  contracts: "bg-success-bg text-success border-success-border", lobbying: "bg-warning-bg text-warning border-warning-border",
  foia: "bg-info-bg text-info border-info-border", legal: "bg-destructive/10 text-destructive border-destructive/30",
  always: "bg-muted text-muted-foreground border-border", state: "bg-info-bg text-info border-info-border",
};
const CATEGORY_LABELS: Record<string, string> = {
  offshore: "Offshore", donations: "Campaign Finance", court: "Court Records", business: "Business",
  contracts: "Contracts", lobbying: "Lobbying", foia: "Records Request", legal: "Legal Review",
  always: "General", state: "State Records",
};

// ─── Main Component ───────────────────────────────────────────────────────────

const ReportersChecklist = ({ name, state, results }: Props) => {
  const [expanded, setExpanded] = useState(false);
  const [checkedItems, setCheckedItems] = useState<Set<string>>(new Set());
  const [openItems, setOpenItems] = useState<Set<string>>(new Set());
  const [expandedContents, setExpandedContents] = useState<Map<string, ExpandedContent>>(new Map());
  const [loadingItems, setLoadingItems] = useState<Set<string>>(new Set());
  const [copySuccess, setCopySuccess] = useState(false);
  const [activeTab, setActiveTab] = useState<Record<string, "steps" | "email" | "questions" | "request">>({});
  const [showRequestBuilder, setShowRequestBuilder] = useState<string | null>(null);

  const entities = extractEntities(results);
  const items = buildChecklistItems(name, state, results);
  const isFL = state === "Florida" || state === "FL";

  const handleCheck = useCallback(async (item: ChecklistItem) => {
    const isChecked = checkedItems.has(item.id);
    const newChecked = new Set(checkedItems);
    const newOpen = new Set(openItems);
    if (isChecked) { newChecked.delete(item.id); newOpen.delete(item.id); }
    else {
      newChecked.add(item.id); newOpen.add(item.id);
      if (!expandedContents.has(item.id)) {
        setLoadingItems(prev => new Set(prev).add(item.id));
        const content = await generateExpandedContent(item, name, state, results, entities);
        setExpandedContents(prev => new Map(prev).set(item.id, content));
        setLoadingItems(prev => { const n = new Set(prev); n.delete(item.id); return n; });
      }
    }
    setCheckedItems(newChecked); setOpenItems(newOpen);
  }, [checkedItems, openItems, expandedContents, name, state, results, entities]);

  const toggleOpen = useCallback((id: string) => {
    setOpenItems(prev => { const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n; });
  }, []);

  const handleCopyExport = useCallback(() => {
    const text = buildExportText(checkedItems, expandedContents, name, state, results);
    if (!text) return;
    navigator.clipboard.writeText(text).then(() => { setCopySuccess(true); setTimeout(() => setCopySuccess(false), 2000); });
  }, [checkedItems, expandedContents, name, state, results]);

  const handlePrint = useCallback(() => {
    const text = buildExportText(checkedItems, expandedContents, name, state, results);
    if (!text) return;
    const win = window.open("", "_blank");
    if (!win) return;
    win.document.write(`<html><head><title>Action Plan — ${name}</title><style>body{font-family:'Georgia',serif;max-width:800px;margin:40px auto;padding:0 20px;color:#1a1a1a;line-height:1.6}pre{white-space:pre-wrap;font-family:'Georgia',serif;font-size:13px}</style></head><body><pre>${text.replace(/</g, "&lt;")}</pre></body></html>`);
    win.document.close(); win.print();
  }, [checkedItems, expandedContents, name, state, results]);

  if (items.length === 0) return null;
  const checkedCount = checkedItems.size;

  return (
    <div className="border border-border rounded-lg bg-card overflow-hidden">
      <button onClick={() => setExpanded(!expanded)} className="w-full flex items-center justify-between px-5 py-4 hover:bg-muted/30 transition-colors">
        <div className="flex items-center gap-2.5">
          <ClipboardList className="h-5 w-5 text-accent" />
          <h2 className="font-heading text-sm font-semibold uppercase tracking-wider text-muted-foreground">Reporter's Checklist</h2>
          {checkedCount > 0 && <a href="/dashboard" className="text-[11px] bg-accent text-accent-foreground rounded-full px-2 py-0.5 font-semibold hover:bg-accent/90 transition-colors">{checkedCount} in progress →</a>}
        </div>
        <ChevronDown className={`h-4 w-4 text-muted-foreground transition-transform ${expanded ? "rotate-180" : ""}`} />
      </button>

      {expanded && (
        <div className="border-t border-border">
          <div className="px-5 pt-4 pb-3">
            <p className="text-xs text-muted-foreground">Check an item to get AI-generated guidance based on the actual records found — specific next steps, investigative questions, a draft inquiry email, and {isFL ? "a Florida Sunshine Law request builder" : "a FOIA request builder"}.</p>
          </div>

          <div className="divide-y divide-border">
            {items.map((item) => {
              const isChecked = checkedItems.has(item.id);
              const isOpen = openItems.has(item.id);
              const isLoading = loadingItems.has(item.id);
              const content = expandedContents.get(item.id);
              const tab = activeTab[item.id] || "steps";
              const isRequestItem = item.id === "foia-request";

              return (
                <div key={item.id} className={`transition-colors ${isChecked ? "bg-accent/5" : ""}`}>
                  <div className="flex items-start gap-3 px-5 py-3">
                    <input type="checkbox" checked={isChecked} onChange={() => handleCheck(item)} className="mt-1 rounded border-border accent-accent cursor-pointer flex-shrink-0 w-4 h-4" />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <p className="text-sm font-semibold leading-snug text-foreground">{item.text}</p>
                          <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">{item.angle}</p>
                        </div>
                        <div className="flex items-center gap-2 shrink-0 mt-0.5">
                          <span className={`text-[10px] font-semibold uppercase tracking-wide px-2 py-0.5 rounded border ${CATEGORY_COLORS[item.category] || CATEGORY_COLORS.always}`}>
                            {CATEGORY_LABELS[item.category] || item.category}
                          </span>
                          {isChecked && (
                            <button onClick={() => toggleOpen(item.id)} className="text-muted-foreground hover:text-foreground transition-colors">
                              <ChevronRight className={`h-4 w-4 transition-transform ${isOpen ? "rotate-90" : ""}`} />
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  {isChecked && isOpen && (
                    <div className="mx-5 mb-4 space-y-3">
                      {isLoading ? (
                        <div className="border border-border rounded-lg flex items-center gap-2 px-4 py-6 text-muted-foreground text-sm">
                          <Loader2 className="h-4 w-4 animate-spin text-accent" />
                          Analyzing records and generating specific guidance…
                        </div>
                      ) : content ? (
                        <div className="border border-border rounded-lg overflow-hidden bg-background">
                          <div className="flex border-b border-border overflow-x-auto">
                            {(isRequestItem ? ["steps", "questions"] as const : ["steps", "email", "questions"] as const).map((t) => (
                              <button key={t} onClick={() => setActiveTab(prev => ({ ...prev, [item.id]: t }))}
                                className={`px-4 py-2.5 text-xs font-semibold uppercase tracking-wide whitespace-nowrap transition-colors ${tab === t ? "border-b-2 border-accent text-accent" : "text-muted-foreground hover:text-foreground"}`}>
                                {t === "steps" ? "Next Steps" : t === "email" ? "Draft Email" : "Investigate"}
                              </button>
                            ))}
                          </div>
                          <div className="p-4">
                            {tab === "steps" && (
                              <div>
                                <ol className="space-y-3">
                                  {content.steps.map((step, i) => (
                                    <li key={i} className="flex gap-3 text-sm text-foreground leading-relaxed">
                                      <span className="text-accent font-bold shrink-0 w-5">{i + 1}.</span>{step}
                                    </li>
                                  ))}
                                </ol>
                                {content.sourceLinks.length > 0 && (
                                  <div className="mt-4 pt-3 border-t border-border">
                                    <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground mb-2 flex items-center gap-1"><Link2 className="h-3 w-3" /> Source Records</p>
                                    <div className="space-y-1">
                                      {content.sourceLinks.map((l, i) => (
                                        <a key={i} href={l.url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 text-xs text-accent hover:underline">
                                          <span className="truncate">{l.label}</span><span className="text-muted-foreground shrink-0">↗</span>
                                        </a>
                                      ))}
                                    </div>
                                  </div>
                                )}
                              </div>
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
                                <button onClick={() => navigator.clipboard.writeText(`Subject: ${content.emailSubject}\n\n${content.emailBody}`)} className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors">
                                  <Copy className="h-3 w-3" /> Copy email
                                </button>
                              </div>
                            )}
                            {tab === "questions" && (
                              <div>
                                <p className="text-[11px] text-muted-foreground mb-3 italic">Questions your reporting must answer — drawn from what the records actually show.</p>
                                <ol className="space-y-3">
                                  {content.questions.map((q, i) => (
                                    <li key={i} className="flex gap-3 text-sm text-foreground leading-relaxed">
                                      <span className="text-muted-foreground font-semibold shrink-0 w-5">{i + 1}.</span>{q}
                                    </li>
                                  ))}
                                </ol>
                              </div>
                            )}
                          </div>
                        </div>
                      ) : null}

                      {/* Records Request Builder trigger */}
                      {isRequestItem && (
                        <div>
                          {showRequestBuilder === item.id ? (
                            <RecordsRequestBuilder
                              state={state} results={results} subjectName={name}
                              onClose={() => setShowRequestBuilder(null)}
                            />
                          ) : (
                            <button onClick={() => setShowRequestBuilder(item.id)}
                              className="w-full flex items-center justify-center gap-2 py-3 border border-dashed border-accent/50 rounded-lg text-xs font-semibold text-accent hover:bg-accent/5 transition-colors">
                              <FileText className="h-4 w-4" />
                              {isFL ? "Build a Florida Sunshine Law Request →" : "Build a FOIA Request →"}
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {checkedCount > 0 && (
            <div className="px-5 py-4 border-t border-border bg-muted/20 flex items-center justify-between gap-3">
              <p className="text-xs text-muted-foreground"><span className="font-semibold text-foreground">{checkedCount} item{checkedCount !== 1 ? "s" : ""}</span> selected for export</p>
              <div className="flex items-center gap-2">
                <button onClick={handleCopyExport} className="flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded border border-border hover:bg-muted transition-colors">
                  {copySuccess ? <CheckSquare className="h-3.5 w-3.5 text-green-600" /> : <Copy className="h-3.5 w-3.5" />}
                  {copySuccess ? "Copied!" : "Copy Action Plan"}
                </button>
                <button onClick={handlePrint} className="flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded bg-accent text-accent-foreground hover:bg-accent/90 transition-colors">
                  <Printer className="h-3.5 w-3.5" /> Print / Save PDF
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
