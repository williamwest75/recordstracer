import { useState, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Upload, FileText, Search, X, Loader2, Download, AlertCircle } from "lucide-react";
import Header from "@/components/landing/Header";
import Footer from "@/components/landing/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { searchAll, type RecordResult, type SourceStatus } from "@/lib/recordsApi";
import { sanitizeInput, isValidName } from "@/utils/validation";
import { useTierGating } from "@/hooks/use-tier-gating";
import { Link } from "react-router-dom";
import { Lock } from "lucide-react";
import { sanitizeInput, isValidName } from "@/utils/validation";

interface BatchEntry {
  name: string;
  state: string;
  status: "pending" | "searching" | "done" | "error";
  resultCount: number;
  results: RecordResult[];
  error?: string;
}

const US_STATES = [
  "All States / National","Alabama","Alaska","Arizona","Arkansas","California","Colorado","Connecticut",
  "Delaware","Florida","Georgia","Hawaii","Idaho","Illinois","Indiana","Iowa","Kansas","Kentucky",
  "Louisiana","Maine","Maryland","Massachusetts","Michigan","Minnesota","Mississippi","Missouri",
  "Montana","Nebraska","Nevada","New Hampshire","New Jersey","New Mexico","New York","North Carolina",
  "North Dakota","Ohio","Oklahoma","Oregon","Pennsylvania","Rhode Island","South Carolina",
  "South Dakota","Tennessee","Texas","Utah","Vermont","Virginia","Washington","West Virginia","Wisconsin","Wyoming",
];

function parseCSV(text: string): { name: string; state: string }[] {
  const lines = text.trim().split(/\r?\n/);
  const results: { name: string; state: string }[] = [];

  for (const line of lines) {
    if (!line.trim()) continue;
    // Skip header rows
    if (/^name/i.test(line.trim())) continue;

    const parts = line.split(",").map(s => s.trim().replace(/^["']|["']$/g, ""));
    const name = parts[0] || "";
    const state = parts[1] || "All States / National";

    if (name && isValidName(name)) {
      results.push({ name: sanitizeInput(name), state });
    }
  }
  return results;
}

const BatchSearch = () => {
  const { user, subscribed } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const gating = useTierGating();
  const hasBatchAccess = gating.hasAccess("investigator");
  const [entries, setEntries] = useState<BatchEntry[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [defaultState, setDefaultState] = useState("Florida");
  const [manualName, setManualName] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const abortRef = useRef(false);

  const handleFileUpload = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 1024 * 1024) {
      toast({ title: "File too large", description: "CSV must be under 1MB." });
      return;
    }

    const reader = new FileReader();
    reader.onload = (evt) => {
      const text = evt.target?.result as string;
      const parsed = parseCSV(text);
      if (parsed.length === 0) {
        toast({ title: "No valid names found", description: "CSV should have one name per line, optionally with state." });
        return;
      }
      if (parsed.length > 50) {
        toast({ title: "Too many names", description: "Batch search supports up to 50 names at a time." });
        return;
      }
      setEntries(parsed.map(p => ({
        name: p.name,
        state: p.state || defaultState,
        status: "pending",
        resultCount: 0,
        results: [],
      })));
    };
    reader.readAsText(file);
    if (fileInputRef.current) fileInputRef.current.value = "";
  }, [defaultState, toast]);

  const addManualEntry = useCallback(() => {
    const cleaned = sanitizeInput(manualName.trim());
    if (!cleaned || !isValidName(cleaned)) {
      toast({ title: "Invalid name", description: "Please enter a valid name." });
      return;
    }
    setEntries(prev => [...prev, {
      name: cleaned,
      state: defaultState,
      status: "pending",
      resultCount: 0,
      results: [],
    }]);
    setManualName("");
  }, [manualName, defaultState, toast]);

  const removeEntry = useCallback((index: number) => {
    setEntries(prev => prev.filter((_, i) => i !== index));
  }, []);

  const runBatch = useCallback(async () => {
    if (!user || !subscribed) {
      toast({ title: "Subscription required", description: "Sign in with an active plan to run batch searches." });
      return;
    }
    setIsRunning(true);
    abortRef.current = false;

    for (let i = 0; i < entries.length; i++) {
      if (abortRef.current) break;
      const entry = entries[i];
      if (entry.status === "done") continue;

      setEntries(prev => prev.map((e, idx) => idx === i ? { ...e, status: "searching" } : e));

      try {
        const { results } = await searchAll(entry.name, entry.state, {});
        setEntries(prev => prev.map((e, idx) =>
          idx === i ? { ...e, status: "done", resultCount: results.length, results } : e
        ));
      } catch (err) {
        setEntries(prev => prev.map((e, idx) =>
          idx === i ? { ...e, status: "error", error: String(err) } : e
        ));
      }

      // Small delay between searches
      if (i < entries.length - 1 && !abortRef.current) {
        await new Promise(r => setTimeout(r, 1000));
      }
    }
    setIsRunning(false);
  }, [entries, user, subscribed, toast]);

  const stopBatch = useCallback(() => { abortRef.current = true; }, []);

  const exportResults = useCallback(() => {
    const rows = [["Name", "State", "Results Found", "Categories", "Top Sources"].join(",")];
    for (const e of entries) {
      if (e.status !== "done") continue;
      const categories = [...new Set(e.results.map(r => r.category))].join("; ");
      const sources = [...new Set(e.results.slice(0, 5).map(r => r.source))].join("; ");
      rows.push([
        `"${e.name}"`,
        `"${e.state}"`,
        String(e.resultCount),
        `"${categories}"`,
        `"${sources}"`,
      ].join(","));
    }
    const blob = new Blob([rows.join("\n")], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `batch-search-results-${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }, [entries]);

  const completedCount = entries.filter(e => e.status === "done").length;
  const totalResults = entries.reduce((sum, e) => sum + e.resultCount, 0);

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      <main className="flex-1 container mx-auto px-4 py-8 max-w-4xl">
        <div className="space-y-6">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Batch Search</h1>
            <p className="text-sm text-muted-foreground mt-1">
              Search multiple names at once. Upload a CSV or add names manually.
            </p>
          </div>

          {/* Controls */}
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="flex-1 flex gap-2">
              <Input
                placeholder="Add a name…"
                value={manualName}
                onChange={e => setManualName(e.target.value)}
                onKeyDown={e => e.key === "Enter" && addManualEntry()}
                className="flex-1"
              />
              <Button variant="outline" onClick={addManualEntry} disabled={!manualName.trim()}>
                Add
              </Button>
            </div>
            <Select value={defaultState} onValueChange={setDefaultState}>
              <SelectTrigger className="w-[200px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {US_STATES.map(s => (
                  <SelectItem key={s} value={s}>{s}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* CSV Upload */}
          <div className="border-2 border-dashed border-border rounded-xl p-6 text-center hover:border-accent/40 transition-colors">
            <input
              ref={fileInputRef}
              type="file"
              accept=".csv,.txt"
              className="hidden"
              onChange={handleFileUpload}
            />
            <Upload className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
            <p className="text-sm text-muted-foreground">
              <button onClick={() => fileInputRef.current?.click()} className="text-accent hover:underline font-medium">
                Upload CSV
              </button>{" "}
              with names (one per line, optionally with state column)
            </p>
            <p className="text-xs text-muted-foreground/60 mt-1">Format: name, state — max 50 names</p>
          </div>

          {/* Entry list */}
          {entries.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <p className="text-sm font-semibold text-foreground">
                  {entries.length} {entries.length === 1 ? "name" : "names"} queued
                  {completedCount > 0 && ` · ${completedCount} complete · ${totalResults} total records`}
                </p>
                <div className="flex gap-2">
                  {completedCount > 0 && (
                    <Button variant="outline" size="sm" onClick={exportResults} className="gap-1.5">
                      <Download className="h-3.5 w-3.5" /> Export CSV
                    </Button>
                  )}
                  {isRunning ? (
                    <Button variant="destructive" size="sm" onClick={stopBatch}>Stop</Button>
                  ) : (
                    <Button size="sm" onClick={runBatch} disabled={entries.length === 0} className="gap-1.5">
                      <Search className="h-3.5 w-3.5" /> Run Batch
                    </Button>
                  )}
                </div>
              </div>

              <div className="border border-border rounded-lg divide-y divide-border overflow-hidden">
                {entries.map((entry, i) => (
                  <div key={i} className="flex items-center gap-3 px-4 py-3 bg-card">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground truncate">{entry.name}</p>
                      <p className="text-xs text-muted-foreground">{entry.state}</p>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      {entry.status === "pending" && (
                        <span className="text-xs text-muted-foreground">Pending</span>
                      )}
                      {entry.status === "searching" && (
                        <span className="flex items-center gap-1 text-xs text-accent">
                          <Loader2 className="h-3 w-3 animate-spin" /> Searching…
                        </span>
                      )}
                      {entry.status === "done" && (
                        <button
                          onClick={() => navigate(`/search-results?name=${encodeURIComponent(entry.name)}&state=${encodeURIComponent(entry.state)}`)}
                          className="text-xs text-accent hover:underline font-medium"
                        >
                          {entry.resultCount} records →
                        </button>
                      )}
                      {entry.status === "error" && (
                        <span className="flex items-center gap-1 text-xs text-destructive">
                          <AlertCircle className="h-3 w-3" /> Error
                        </span>
                      )}
                      {!isRunning && (
                        <button onClick={() => removeEntry(i)} className="text-muted-foreground hover:text-destructive">
                          <X className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {entries.length === 0 && (
            <div className="text-center py-12">
              <FileText className="h-12 w-12 mx-auto text-muted-foreground/30 mb-3" />
              <p className="text-sm text-muted-foreground">Add names above or upload a CSV to get started</p>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default BatchSearch;
