import { useState } from "react";
import { Bell, CheckCircle, Loader2, Calendar, Mail, ChevronDown } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

interface Props {
  subjectName: string;
  state: string;
  requestType: "sunshine" | "foia";
  agencyName: string;
  recordsDescription: string;
  letterText: string;
  requesterName?: string;
  requesterOrg?: string;
  requesterEmail?: string;
  filedDate?: string; // ISO date string
  onClose?: () => void;
}

const SUNSHINE_DEADLINE_DAYS = 10; // Florida: reasonable time, we use 10 as prompt
const FOIA_DEADLINE_DAYS = 20;

const STATUS_OPTIONS = [
  { value: "filed", label: "Filed — awaiting acknowledgment" },
  { value: "acknowledged", label: "Acknowledged by agency" },
  { value: "received", label: "Records received" },
  { value: "denied", label: "Denied" },
  { value: "appealed", label: "Appealed" },
  { value: "closed", label: "Closed" },
];

const REMINDER_MILESTONES = [
  { day: 3, label: "Day 3 — Confirm receipt" },
  { day: 10, label: "Day 10 — Halfway check-in" },
  { day: 20, label: "Day 20 — Deadline approaching (FOIA)" },
  { day: 30, label: "Day 30 — Overdue follow-up" },
];

function addDays(dateStr: string, days: number): string {
  const d = new Date(dateStr);
  d.setDate(d.getDate() + days);
  return d.toISOString().split("T")[0];
}

function formatDate(dateStr: string): string {
  return new Date(dateStr + "T00:00:00").toLocaleDateString("en-US", {
    month: "short", day: "numeric", year: "numeric",
  });
}

const RequestTracker = ({
  subjectName, state, requestType, agencyName, recordsDescription,
  letterText, requesterName = "", requesterOrg = "", requesterEmail = "",
  filedDate, onClose,
}: Props) => {
  const { user } = useAuth();
  const today = new Date().toISOString().split("T")[0];
  const defaultFiled = filedDate || today;
  const deadlineDays = requestType === "foia" ? FOIA_DEADLINE_DAYS : SUNSHINE_DEADLINE_DAYS;

  const [form, setForm] = useState({
    requesterEmail: requesterEmail || user?.email || "",
    requesterName: requesterName,
    requesterOrg: requesterOrg,
    agencyEmail: "",
    filedDate: defaultFiled,
    customReminderDate: "",
    notes: "",
  });

  const legalDeadline = addDays(form.filedDate, deadlineDays);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");

  const set = (field: keyof typeof form, value: string) =>
    setForm(prev => ({ ...prev, [field]: value }));

  const handleSave = async () => {
    if (!user) { setError("You must be signed in to track requests."); return; }
    if (!form.requesterEmail) { setError("Please enter your email address to receive reminders."); return; }

    setSaving(true);
    setError("");

    try {
      const { error: dbError } = await (supabase as any)
        .from("records_requests")
        .insert({
          user_id: user.id,
          subject_name: subjectName,
          state,
          request_type: requestType,
          agency_name: agencyName,
          agency_email: form.agencyEmail || null,
          records_description: recordsDescription,
          requester_name: form.requesterName || null,
          requester_email: form.requesterEmail,
          requester_org: form.requesterOrg || null,
          filed_date: form.filedDate,
          legal_deadline: legalDeadline,
          custom_reminder_date: form.customReminderDate || null,
          status: "filed",
          notes: form.notes || null,
          letter_text: letterText || null,
        });

      if (dbError) throw dbError;
      setSaved(true);
    } catch (err: any) {
      setError(err.message || "Failed to save request. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const inputCls = "w-full text-sm border border-border rounded px-3 py-2 bg-background text-foreground focus:outline-none focus:border-accent";
  const labelCls = "block text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-1";

  if (saved) {
    return (
      <div className="border border-green-200 bg-green-50 rounded-lg p-5">
        <div className="flex items-start gap-3">
          <CheckCircle className="h-5 w-5 text-green-600 shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-semibold text-green-800">Request tracked successfully</p>
            <p className="text-xs text-green-700 mt-1">
              You'll receive email reminders at {form.requesterEmail} on days 3, 10, 20, and 30
              {form.customReminderDate && `, plus your custom reminder on ${formatDate(form.customReminderDate)}`}.
            </p>
            <div className="mt-3 grid grid-cols-2 gap-2 text-xs text-green-700">
              <div className="flex items-center gap-1.5"><Calendar className="h-3 w-3" /> Filed: {formatDate(form.filedDate)}</div>
              <div className="flex items-center gap-1.5"><Bell className="h-3 w-3" /> Deadline: {formatDate(legalDeadline)}</div>
            </div>
            <p className="text-xs text-green-600 mt-3">
              Track and update this request in your <strong>Dashboard → My Requests</strong>.
            </p>
            {onClose && (
              <button onClick={onClose} className="mt-3 text-xs text-green-700 underline hover:text-green-900">Close</button>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="border border-border rounded-lg bg-background overflow-hidden">
      <div className="flex items-center justify-between px-4 py-3 bg-muted/30 border-b border-border">
        <div className="flex items-center gap-2">
          <Bell className="h-4 w-4 text-accent" />
          <span className="text-xs font-semibold uppercase tracking-wide text-foreground">
            Track This Request + Set Reminders
          </span>
        </div>
        {onClose && (
          <button onClick={onClose} className="text-xs text-muted-foreground hover:text-foreground">✕</button>
        )}
      </div>

      <div className="p-4 space-y-4">
        <p className="text-xs text-muted-foreground">
          Save this request to your tracker and receive automatic email reminders so it never gets forgotten.
        </p>

        {/* Reminder preview */}
        <div className="bg-muted/30 rounded-lg p-3 space-y-2">
          <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground mb-2 flex items-center gap-1">
            <Bell className="h-3 w-3" /> Scheduled Reminders
          </p>
          <div className="grid grid-cols-2 gap-x-4 gap-y-1.5">
            {REMINDER_MILESTONES.map(m => (
              <div key={m.day} className="flex items-center gap-1.5 text-xs text-foreground">
                <div className="w-1.5 h-1.5 rounded-full bg-accent shrink-0" />
                <span>{m.label}</span>
                <span className="text-muted-foreground ml-auto">{formatDate(addDays(form.filedDate, m.day))}</span>
              </div>
            ))}
          </div>
          <div className="mt-2 pt-2 border-t border-border flex items-center justify-between text-xs">
            <span className="text-muted-foreground font-medium">
              {requestType === "foia" ? "FOIA" : "Sunshine Law"} deadline:
            </span>
            <span className="font-semibold text-foreground">{formatDate(legalDeadline)} ({deadlineDays} days)</span>
          </div>
        </div>

        {/* Filing date */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className={labelCls}>Date Filed *</label>
            <input type="date" className={inputCls} value={form.filedDate}
              onChange={e => set("filedDate", e.target.value)} />
          </div>
          <div>
            <label className={labelCls}>Custom Reminder Date</label>
            <input type="date" className={inputCls} value={form.customReminderDate}
              min={today}
              onChange={e => set("customReminderDate", e.target.value)} />
            <p className="text-[11px] text-muted-foreground mt-0.5">Optional extra reminder</p>
          </div>
        </div>

        {/* Reminder email */}
        <div>
          <label className={labelCls}>Send Reminders To *</label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
            <input type="email" className={`${inputCls} pl-8`}
              placeholder="your@email.com"
              value={form.requesterEmail}
              onChange={e => set("requesterEmail", e.target.value)} />
          </div>
          <p className="text-[11px] text-muted-foreground mt-0.5">Reminders sent from your account — replies go directly to you</p>
        </div>

        {/* Agency email (optional) */}
        <div>
          <label className={labelCls}>Agency Email (if you have it)</label>
          <input type="email" className={inputCls}
            placeholder="records@agency.gov (optional — for follow-up drafts)"
            value={form.agencyEmail}
            onChange={e => set("agencyEmail", e.target.value)} />
        </div>

        {/* Notes */}
        <div>
          <label className={labelCls}>Notes</label>
          <textarea className={`${inputCls} min-h-[60px] resize-y`}
            placeholder="Tracking number, contact name, any details about the request..."
            value={form.notes}
            onChange={e => set("notes", e.target.value)} />
        </div>

        {error && (
          <p className="text-xs text-destructive bg-destructive/5 border border-destructive/20 rounded px-3 py-2">{error}</p>
        )}

        <button onClick={handleSave} disabled={saving || !form.requesterEmail}
          className="w-full flex items-center justify-center gap-2 py-2.5 rounded bg-accent text-accent-foreground text-sm font-semibold hover:bg-accent/90 disabled:opacity-40 transition-colors">
          {saving ? <><Loader2 className="h-4 w-4 animate-spin" /> Saving…</> : <><Bell className="h-4 w-4" /> Track Request & Enable Reminders</>}
        </button>
      </div>
    </div>
  );
};

export default RequestTracker;
