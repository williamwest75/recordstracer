import { useState, useEffect } from "react";
import { Bell, Calendar, Clock, CheckCircle, XCircle, AlertCircle, FileText, ChevronDown, ChevronUp, Trash2, Edit3, ExternalLink } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

interface RecordsRequest {
  id: string;
  subject_name: string;
  state: string;
  request_type: "sunshine" | "foia";
  agency_name: string;
  agency_email?: string;
  records_description: string;
  requester_email: string;
  requester_name?: string;
  requester_org?: string;
  filed_date: string;
  legal_deadline: string;
  custom_reminder_date?: string;
  status: string;
  notes?: string;
  letter_text?: string;
  reminder_day3_sent: boolean;
  reminder_day10_sent: boolean;
  reminder_day20_sent: boolean;
  reminder_day30_sent: boolean;
  created_at: string;
}

const STATUS_CONFIG: Record<string, { label: string; color: string; icon: typeof CheckCircle }> = {
  filed:        { label: "Filed",        color: "text-blue-600 bg-blue-50 border-blue-200",   icon: FileText },
  acknowledged: { label: "Acknowledged", color: "text-amber-600 bg-amber-50 border-amber-200", icon: Clock },
  received:     { label: "Records Received", color: "text-green-600 bg-green-50 border-green-200", icon: CheckCircle },
  denied:       { label: "Denied",       color: "text-red-600 bg-red-50 border-red-200",       icon: XCircle },
  appealed:     { label: "Appealed",     color: "text-purple-600 bg-purple-50 border-purple-200", icon: AlertCircle },
  closed:       { label: "Closed",       color: "text-gray-500 bg-gray-50 border-gray-200",    icon: CheckCircle },
};

const STATUS_OPTIONS = ["filed", "acknowledged", "received", "denied", "appealed", "closed"];

function daysSince(dateStr: string): number {
  const filed = new Date(dateStr + "T00:00:00");
  const today = new Date();
  return Math.floor((today.getTime() - filed.getTime()) / (1000 * 60 * 60 * 24));
}

function daysUntil(dateStr: string): number {
  const deadline = new Date(dateStr + "T00:00:00");
  const today = new Date();
  return Math.ceil((deadline.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
}

function formatDate(dateStr: string): string {
  return new Date(dateStr + "T00:00:00").toLocaleDateString("en-US", {
    month: "short", day: "numeric", year: "numeric",
  });
}

function getUrgency(req: RecordsRequest): "overdue" | "urgent" | "normal" | "closed" {
  if (["received", "closed"].includes(req.status)) return "closed";
  const days = daysUntil(req.legal_deadline);
  if (days < 0) return "overdue";
  if (days <= 5) return "urgent";
  return "normal";
}

const URGENCY_STYLES = {
  overdue: "border-l-4 border-l-red-500",
  urgent:  "border-l-4 border-l-amber-400",
  normal:  "border-l-4 border-l-border",
  closed:  "border-l-4 border-l-green-400 opacity-70",
};

// ─── Single Request Card ──────────────────────────────────────────────────────

const RequestCard = ({ req, onStatusChange, onDelete }: {
  req: RecordsRequest;
  onStatusChange: (id: string, status: string) => void;
  onDelete: (id: string) => void;
}) => {
  const [expanded, setExpanded] = useState(false);
  const [editingStatus, setEditingStatus] = useState(false);
  const urgency = getUrgency(req);
  const StatusIcon = STATUS_CONFIG[req.status]?.icon || FileText;
  const daysFiled = daysSince(req.filed_date);
  const daysLeft = daysUntil(req.legal_deadline);

  const remindersHit = [
    req.reminder_day3_sent && "Day 3",
    req.reminder_day10_sent && "Day 10",
    req.reminder_day20_sent && "Day 20",
    req.reminder_day30_sent && "Day 30",
  ].filter(Boolean);

  return (
    <div className={`bg-card rounded-lg border border-border overflow-hidden ${URGENCY_STYLES[urgency]}`}>
      {/* Header row */}
      <div className="flex items-start justify-between gap-3 px-4 py-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap mb-1">
            <span className={`text-[10px] font-semibold uppercase tracking-wide px-2 py-0.5 rounded border ${req.request_type === "sunshine" ? "bg-cyan-50 text-cyan-700 border-cyan-200" : "bg-blue-50 text-blue-700 border-blue-200"}`}>
              {req.request_type === "sunshine" ? "Sunshine Law" : "FOIA"}
            </span>
            <span className={`text-[10px] font-semibold uppercase tracking-wide px-2 py-0.5 rounded border flex items-center gap-1 ${STATUS_CONFIG[req.status]?.color}`}>
              <StatusIcon className="h-2.5 w-2.5" />{STATUS_CONFIG[req.status]?.label || req.status}
            </span>
            {urgency === "overdue" && (
              <span className="text-[10px] font-bold uppercase tracking-wide px-2 py-0.5 rounded border bg-red-100 text-red-700 border-red-300 animate-pulse">
                OVERDUE
              </span>
            )}
            {urgency === "urgent" && (
              <span className="text-[10px] font-bold uppercase tracking-wide px-2 py-0.5 rounded border bg-amber-100 text-amber-700 border-amber-300">
                DUE SOON
              </span>
            )}
          </div>
          <p className="text-sm font-semibold text-foreground truncate">{req.subject_name} — {req.agency_name}</p>
          <p className="text-xs text-muted-foreground mt-0.5 truncate">{req.records_description}</p>
        </div>
        <button onClick={() => setExpanded(!expanded)} className="text-muted-foreground hover:text-foreground transition-colors shrink-0 mt-0.5">
          {expanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
        </button>
      </div>

      {/* Timeline bar */}
      <div className="px-4 pb-3 flex items-center gap-4 text-xs text-muted-foreground">
        <span className="flex items-center gap-1"><Calendar className="h-3 w-3" /> Filed {formatDate(req.filed_date)}</span>
        <span className="text-border">·</span>
        <span className="flex items-center gap-1">
          <Clock className="h-3 w-3" />
          {urgency === "closed" ? "Complete" :
           urgency === "overdue" ? <span className="text-red-600 font-semibold">{Math.abs(daysLeft)} days overdue</span> :
           <span className={daysLeft <= 5 ? "text-amber-600 font-semibold" : ""}>{daysLeft} days remaining</span>}
        </span>
        <span className="text-border">·</span>
        <span>{daysFiled} days since filing</span>
        {remindersHit.length > 0 && (
          <>
            <span className="text-border">·</span>
            <span className="flex items-center gap-1"><Bell className="h-3 w-3" /> Sent: {remindersHit.join(", ")}</span>
          </>
        )}
      </div>

      {/* Expanded detail */}
      {expanded && (
        <div className="border-t border-border px-4 py-4 space-y-4">
          {/* Status update */}
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground mb-2">Update Status</p>
            <div className="flex flex-wrap gap-2">
              {STATUS_OPTIONS.map(s => (
                <button key={s} onClick={() => onStatusChange(req.id, s)}
                  className={`text-xs px-3 py-1 rounded border transition-colors ${req.status === s ? STATUS_CONFIG[s]?.color + " font-semibold" : "border-border text-muted-foreground hover:border-foreground hover:text-foreground"}`}>
                  {STATUS_CONFIG[s]?.label || s}
                </button>
              ))}
            </div>
          </div>

          {/* Key dates */}
          <div className="grid grid-cols-3 gap-3">
            {[
              { label: "Filed", date: req.filed_date },
              { label: "Legal Deadline", date: req.legal_deadline },
              ...(req.custom_reminder_date ? [{ label: "Custom Reminder", date: req.custom_reminder_date }] : []),
            ].map(({ label, date }) => (
              <div key={label} className="bg-muted/30 rounded p-2">
                <p className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">{label}</p>
                <p className="text-xs font-medium text-foreground mt-0.5">{formatDate(date)}</p>
              </div>
            ))}
          </div>

          {/* Reminder timeline */}
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground mb-2 flex items-center gap-1">
              <Bell className="h-3 w-3" /> Reminder Schedule
            </p>
            <div className="space-y-1.5">
              {[
                { day: 3, sent: req.reminder_day3_sent, label: "Day 3 — Confirm receipt" },
                { day: 10, sent: req.reminder_day10_sent, label: "Day 10 — Halfway check-in" },
                { day: 20, sent: req.reminder_day20_sent, label: "Day 20 — Deadline approaching" },
                { day: 30, sent: req.reminder_day30_sent, label: "Day 30 — Overdue follow-up" },
              ].map(r => {
                const reminderDate = new Date(req.filed_date + "T00:00:00");
                reminderDate.setDate(reminderDate.getDate() + r.day);
                return (
                  <div key={r.day} className={`flex items-center gap-2 text-xs ${r.sent ? "text-green-600" : "text-muted-foreground"}`}>
                    {r.sent
                      ? <CheckCircle className="h-3 w-3 text-green-600 shrink-0" />
                      : <div className="w-3 h-3 rounded-full border border-border shrink-0" />}
                    <span>{r.label}</span>
                    <span className="ml-auto text-muted-foreground/60">{reminderDate.toLocaleDateString("en-US", { month: "short", day: "numeric" })}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Notes */}
          {req.notes && (
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground mb-1">Notes</p>
              <p className="text-xs text-foreground leading-relaxed bg-muted/30 rounded p-2">{req.notes}</p>
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center justify-between pt-2 border-t border-border">
            <div className="flex items-center gap-3">
              {req.agency_email && (
                <a href={`mailto:${req.agency_email}?subject=Follow-up: Public Records Request — ${req.subject_name}`}
                  className="flex items-center gap-1.5 text-xs text-accent hover:underline">
                  <ExternalLink className="h-3 w-3" /> Email Agency
                </a>
              )}
            </div>
            <button onClick={() => onDelete(req.id)}
              className="flex items-center gap-1 text-xs text-muted-foreground hover:text-destructive transition-colors">
              <Trash2 className="h-3 w-3" /> Delete
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

// ─── Main Dashboard Component ─────────────────────────────────────────────────

const TrackedRequests = () => {
  const { user } = useAuth();
  const [requests, setRequests] = useState<RecordsRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "active" | "overdue" | "closed">("active");

  useEffect(() => {
    if (!user) return;
    fetchRequests();
  }, [user]);

  const fetchRequests = async () => {
    setLoading(true);
    const { data, error } = await (supabase as any)
      .from("records_requests")
      .select("*")
      .order("filed_date", { ascending: false });
    if (!error && data) setRequests(data as RecordsRequest[]);
    setLoading(false);
  };

  const handleStatusChange = async (id: string, status: string) => {
    const { error } = await supabase
      .from("records_requests")
      .update({ status })
      .eq("id", id);
    if (!error) {
      setRequests(prev => prev.map(r => r.id === id ? { ...r, status } : r));
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Delete this tracked request? This cannot be undone.")) return;
    const { error } = await supabase
      .from("records_requests")
      .delete()
      .eq("id", id);
    if (!error) setRequests(prev => prev.filter(r => r.id !== id));
  };

  const filtered = requests.filter(r => {
    const urgency = getUrgency(r);
    if (filter === "active") return !["received", "closed"].includes(r.status);
    if (filter === "overdue") return urgency === "overdue";
    if (filter === "closed") return ["received", "closed"].includes(r.status);
    return true;
  });

  const overdue = requests.filter(r => getUrgency(r) === "overdue").length;
  const active = requests.filter(r => !["received", "closed"].includes(r.status)).length;

  if (!user) return (
    <div className="text-center py-12 text-muted-foreground text-sm">Sign in to view your tracked requests.</div>
  );

  return (
    <div className="space-y-4">
      {/* Stats bar */}
      <div className="grid grid-cols-4 gap-3">
        {[
          { label: "Total", value: requests.length, color: "text-foreground" },
          { label: "Active", value: active, color: "text-blue-600" },
          { label: "Overdue", value: overdue, color: overdue > 0 ? "text-red-600" : "text-muted-foreground" },
          { label: "Closed", value: requests.length - active, color: "text-green-600" },
        ].map(stat => (
          <div key={stat.label} className="bg-card border border-border rounded-lg p-3 text-center">
            <p className={`text-2xl font-bold ${stat.color}`}>{stat.value}</p>
            <p className="text-[11px] text-muted-foreground uppercase tracking-wide mt-0.5">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Filter tabs */}
      <div className="flex gap-1 border-b border-border">
        {(["active", "overdue", "all", "closed"] as const).map(f => (
          <button key={f} onClick={() => setFilter(f)}
            className={`px-4 py-2 text-xs font-semibold uppercase tracking-wide transition-colors ${filter === f ? "border-b-2 border-accent text-accent" : "text-muted-foreground hover:text-foreground"}`}>
            {f === "active" ? `Active (${active})` : f === "overdue" ? `Overdue (${overdue})` : f === "all" ? "All" : "Closed"}
          </button>
        ))}
      </div>

      {/* Request list */}
      {loading ? (
        <div className="flex items-center justify-center py-12 text-muted-foreground text-sm gap-2">
          <div className="h-4 w-4 border-2 border-accent border-t-transparent rounded-full animate-spin" />
          Loading requests…
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          <Bell className="h-8 w-8 mx-auto mb-3 opacity-30" />
          <p className="text-sm">{filter === "overdue" ? "No overdue requests." : filter === "closed" ? "No closed requests yet." : "No active requests. Track a request from any search result."}</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map(req => (
            <RequestCard key={req.id} req={req} onStatusChange={handleStatusChange} onDelete={handleDelete} />
          ))}
        </div>
      )}
    </div>
  );
};

export default TrackedRequests;
