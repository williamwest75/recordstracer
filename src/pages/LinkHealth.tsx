import { useEffect, useState, useCallback } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Activity, AlertTriangle, CheckCircle2, RefreshCw, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import Header from "@/components/landing/Header";
import Footer from "@/components/landing/Footer";
import { Button } from "@/components/ui/button";
import { getAllStateRecords } from "@/data/state-records-registry";
import type { StateRecordSet } from "@/data/state-records-registry";

interface LinkHealthRow {
  id: string;
  source_id: string;
  state_code: string;
  category: string;
  url: string;
  source_name: string;
  status_code: number | null;
  is_healthy: boolean;
  error_message: string | null;
  response_time_ms: number | null;
  checked_at: string;
}

function buildSourceList(states: StateRecordSet[]) {
  const sources: Array<{ source_id: string; state_code: string; category: string; url: string; source_name: string }> = [];
  for (const st of states) {
    for (const s of st.statewide) sources.push({ source_id: s.id, state_code: st.stateCode, category: "statewide", url: s.searchUrl, source_name: s.name });
    for (const s of st.licenses) sources.push({ source_id: s.id, state_code: st.stateCode, category: "licenses", url: s.searchUrl, source_name: s.name });
    for (const s of st.campaignFinance) sources.push({ source_id: s.id, state_code: st.stateCode, category: "campaign_finance", url: s.searchUrl, source_name: s.name });
    for (const s of st.federal) sources.push({ source_id: s.id, state_code: st.stateCode, category: "federal", url: s.searchUrl, source_name: s.name });
    for (const s of st.propertyCounties) sources.push({ source_id: `property-${s.county}`, state_code: st.stateCode, category: "property", url: s.url, source_name: `${s.county} Property` });
    for (const s of st.clerkCounties) sources.push({ source_id: `clerk-${s.county}`, state_code: st.stateCode, category: "clerk", url: s.url, source_name: `${s.county} Clerk` });
  }
  // Deduplicate by URL (federal sources repeat across states)
  const seen = new Set<string>();
  return sources.filter(s => {
    const key = `${s.state_code}-${s.url}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

export default function LinkHealth() {
  const { isAdmin } = useAuth();
  const [results, setResults] = useState<LinkHealthRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [running, setRunning] = useState(false);
  const [filter, setFilter] = useState<"all" | "broken">("broken");

  const fetchResults = useCallback(async () => {
    setLoading(true);
    const { data } = await supabase
      .from("link_health")
      .select("*")
      .order("checked_at", { ascending: false })
      .limit(500) as { data: LinkHealthRow[] | null };
    setResults(data ?? []);
    setLoading(false);
  }, []);

  useEffect(() => { fetchResults(); }, [fetchResults]);

  const runCheck = async () => {
    setRunning(true);
    try {
      const states = getAllStateRecords();
      const sources = buildSourceList(states);
      await supabase.functions.invoke("check-link-health", { body: { sources } });
      await fetchResults();
    } catch (err) {
      console.error("Run check failed:", err);
    } finally {
      setRunning(false);
    }
  };

  if (!isAdmin) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <p className="text-muted-foreground">Admin access required.</p>
        </main>
        <Footer />
      </div>
    );
  }

  const latestCheck = results.length > 0 ? results[0].checked_at : null;
  const uniqueCheckedAt = latestCheck ? results.filter(r => r.checked_at === latestCheck) : [];
  const displayResults = filter === "broken" ? results.filter(r => !r.is_healthy) : results;
  const brokenCount = results.filter(r => !r.is_healthy).length;

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      <main className="flex-1 container mx-auto px-4 py-8 space-y-6">
        <Link to="/dashboard" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors">
          <ArrowLeft className="h-3.5 w-3.5" /> Back to Dashboard
        </Link>

        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-3">
            <Activity className="h-6 w-6 text-accent" />
            <h1 className="font-heading text-2xl font-bold text-foreground">Link Health Monitor</h1>
          </div>
          <Button onClick={runCheck} disabled={running} className="gap-2">
            {running ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
            {running ? "Checking..." : "Run Check Now"}
          </Button>
        </div>

        {latestCheck && (
          <p className="text-sm text-muted-foreground">
            Last check: {new Date(latestCheck).toLocaleString()} · {uniqueCheckedAt.length} URLs · {brokenCount} broken
          </p>
        )}

        <div className="flex gap-2">
          <Button variant={filter === "broken" ? "default" : "outline"} size="sm" onClick={() => setFilter("broken")} className="gap-1.5">
            <AlertTriangle className="h-3.5 w-3.5" /> Broken ({brokenCount})
          </Button>
          <Button variant={filter === "all" ? "default" : "outline"} size="sm" onClick={() => setFilter("all")} className="gap-1.5">
            <CheckCircle2 className="h-3.5 w-3.5" /> All ({results.length})
          </Button>
        </div>

        {loading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : displayResults.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            {filter === "broken" ? "No broken links found! 🎉" : "No results yet. Run a check to get started."}
          </div>
        ) : (
          <div className="border border-border rounded-lg overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-muted/50">
                <tr>
                  <th className="text-left px-3 py-2 font-medium text-muted-foreground">Status</th>
                  <th className="text-left px-3 py-2 font-medium text-muted-foreground">State</th>
                  <th className="text-left px-3 py-2 font-medium text-muted-foreground">Source</th>
                  <th className="text-left px-3 py-2 font-medium text-muted-foreground">Category</th>
                  <th className="text-left px-3 py-2 font-medium text-muted-foreground">Error</th>
                  <th className="text-right px-3 py-2 font-medium text-muted-foreground">Time</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {displayResults.slice(0, 200).map((r) => (
                  <tr key={r.id} className={r.is_healthy ? "" : "bg-destructive/5"}>
                    <td className="px-3 py-2">
                      {r.is_healthy ? (
                        <CheckCircle2 className="h-4 w-4 text-green-500" />
                      ) : (
                        <AlertTriangle className="h-4 w-4 text-destructive" />
                      )}
                    </td>
                    <td className="px-3 py-2 font-mono text-xs">{r.state_code}</td>
                    <td className="px-3 py-2">
                      <a href={r.url} target="_blank" rel="noopener noreferrer" className="text-accent hover:underline">
                        {r.source_name}
                      </a>
                    </td>
                    <td className="px-3 py-2 text-muted-foreground text-xs">{r.category}</td>
                    <td className="px-3 py-2 text-xs text-destructive">{r.error_message || "—"}</td>
                    <td className="px-3 py-2 text-right text-xs text-muted-foreground">{r.response_time_ms ? `${r.response_time_ms}ms` : "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}
