import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ExternalLink, Search, Newspaper, BarChart3, Users, Globe, Copy, Download } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";

type QueryMode = "events" | "gkg" | "mentions";

const GDELT_MAPPINGS = {
  quadClass: {
    1: "Verbal Cooperation",
    2: "Material Cooperation",
    3: "Verbal Conflict",
    4: "Material Conflict",
  } as Record<number, string>,
  eventCodes: {
    "01": "Public Statement",
    "02": "Appeal/Request",
    "03": "Intent to Cooperate",
    "04": "Consult/Visit",
    "05": "Praise/Endorse",
    "06": "Negotiate",
    "07": "Provide Aid",
    "08": "Yield/Concede",
    "09": "Investigate",
    "10": "Demand",
    "14": "Protest",
    "18": "Assault/Violence",
    "19": "Military Action",
  } as Record<string, string>,
};

const GdeltNewsSearch = () => {
  const [keyword, setKeyword] = useState("");
  const [submitted, setSubmitted] = useState("");
  const [mode, setMode] = useState<QueryMode>("events");

  const getNextUpdateTime = () => {
    const now = new Date();
    const morning = new Date(now);
    morning.setHours(7, 0, 0, 0);
    const evening = new Date(now);
    evening.setHours(19, 0, 0, 0);

    if (now < morning) return morning.getTime() - now.getTime();
    if (now < evening) return evening.getTime() - now.getTime();
    const tomorrow = new Date(morning);
    tomorrow.setDate(morning.getDate() + 1);
    return tomorrow.getTime() - now.getTime();
  };

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["gdelt-bq", submitted, mode],
    queryFn: async () => {
      const { data, error } = await supabase.functions.invoke("fetch-gdelt-news", {
        body: { query: submitted, days: 7, mode },
      });
      if (error) throw error;
      return data;
    },
    staleTime: getNextUpdateTime(),
    gcTime: 1000 * 60 * 60 * 24,
    enabled: !!submitted,
  });

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (keyword.trim()) setSubmitted(keyword.trim());
  };

  const results = data?.events ?? data?.knowledge_graph ?? data?.mentions ?? [];

  const copyToClipboard = (rows: any[]) => {
    const text = rows
      .map(
        (row) =>
          `${row.SQLDATE || row.DATE || row.MentionDateTime}: ${row.Actor1Name || "Event"} - ${row.SOURCEURL || row.url}`
      )
      .join("\n");
    navigator.clipboard.writeText(text);
    alert("Intelligence summary copied to clipboard!");
  };

  const exportToCSV = (rows: any[]) => {
    if (rows.length === 0) return;
    const readableData = rows.map((row) => ({
      Date: row.SQLDATE || row.DATE || row.MentionDateTime || "",
      Source: row.Actor1Name || row.MentionSourceName || "N/A",
      Target: row.Actor2Name || "N/A",
      Category: GDELT_MAPPINGS.quadClass[row.QuadClass] || "Unknown",
      Action:
        GDELT_MAPPINGS.eventCodes[row.EventCode?.toString().slice(0, 2)] ||
        "Other Action",
      Sentiment: parseFloat(row.AvgTone || row.MentionDocTone || "0") > 0 ? "Positive" : "Negative",
      URL: row.SOURCEURL || row.url || "",
    }));
    const headers = Object.keys(readableData[0]).join(",");
    const csvRows = readableData.map((row) =>
      Object.values(row)
        .map((val) => `"${String(val ?? "").replace(/"/g, '""')}"`)
        .join(",")
    );
    const blob = new Blob([[headers, ...csvRows].join("\n")], {
      type: "text/csv;charset=utf-8;",
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `Intelligence_Report_${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const getTone = (row: any): number => {
    if (row.AvgTone) return Number(row.AvgTone);
    if (row.V2Tone) return Number(row.V2Tone.split(",")[0]);
    if (row.MentionDocTone) return Number(row.MentionDocTone);
    return 0;
  };

  const getDetails = (row: any): { primary: string; secondary: string } => {
    if (mode === "events") {
      const rootCode = row.EventCode?.toString().slice(0, 2);
      const eventLabel = GDELT_MAPPINGS.eventCodes[rootCode] || `Event ${row.EventCode}`;
      return {
        primary: `${row.Actor1Name || "Unknown"} → ${row.Actor2Name || "Unknown"}`,
        secondary: `${row.SQLDATE ?? ""} · ${eventLabel}`,
      };
    }
    if (mode === "gkg") {
      return {
        primary: row.V2Organizations?.split(";")[0] || row.V2Persons?.split(";")[0] || "Global Event",
        secondary: row.DATE ?? "",
      };
    }
    return {
      primary: row.MentionSourceName || "Unknown",
      secondary: row.MentionDateTime ?? "",
    };
  };

  const getLink = (row: any): string | null => row.SOURCEURL || row.url || null;

  return (
    <section className="py-12">
      <div className="container mx-auto px-4 lg:px-8 max-w-4xl">
        <h2 className="font-heading text-2xl md:text-3xl font-bold text-foreground mb-1">
          GDELT BigQuery Analytics
        </h2>
        <p className="text-muted-foreground text-sm mb-6">
          Query GDELT's global event database via Google BigQuery for deep intelligence analytics.
        </p>

        <Tabs value={mode} onValueChange={(v) => setMode(v as QueryMode)} className="mb-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="events" className="gap-1.5">
              <Globe className="h-3.5 w-3.5" /> Events
            </TabsTrigger>
            <TabsTrigger value="gkg" className="gap-1.5">
              <Users className="h-3.5 w-3.5" /> Knowledge Graph
            </TabsTrigger>
            <TabsTrigger value="mentions" className="gap-1.5">
              <BarChart3 className="h-3.5 w-3.5" /> Mentions
            </TabsTrigger>
          </TabsList>
        </Tabs>

        <form onSubmit={handleSearch} className="flex gap-2 mb-8">
          <Input
            placeholder={
              mode === "events"
                ? "Search by actor name…"
                : mode === "gkg"
                ? "Search by URL keyword…"
                : "Search by source name…"
            }
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            className="flex-1"
          />
          <Button type="submit" disabled={!keyword.trim() || isLoading}>
            <Search className="h-4 w-4 mr-1" /> Search
          </Button>
        </form>

        {isLoading && (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-16 w-full rounded-lg" />
            ))}
          </div>
        )}

        {isError && (
          <p className="text-destructive text-sm">
            Error: {error instanceof Error ? error.message : "Something went wrong."}
          </p>
        )}

        {!isLoading && results.length === 0 && submitted && (
          <div className="text-center py-12 text-muted-foreground">
            <Newspaper className="h-10 w-10 mx-auto mb-3 opacity-40" />
            <p>No results found for "{submitted}".</p>
          </div>
        )}

        {!isLoading && results.length > 0 && (
          <div className="mt-2">
            <div className="flex justify-end gap-2 mb-2">
              <Button variant="outline" size="sm" onClick={() => copyToClipboard(results)}>
                <Copy className="h-3.5 w-3.5 mr-1" /> Copy
              </Button>
              <Button variant="outline" size="sm" onClick={() => exportToCSV(results)}>
                <Download className="h-3.5 w-3.5 mr-1" /> Export CSV
              </Button>
            </div>
            <div className="overflow-hidden rounded-lg border border-border bg-card shadow">
            <ScrollArea className="h-[600px]">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/50">
                      <TableHead className="text-xs font-medium uppercase tracking-wider">
                        Details
                      </TableHead>
                      <TableHead className="text-xs font-medium uppercase tracking-wider">
                        Sentiment / Tone
                      </TableHead>
                      <TableHead className="text-right text-xs font-medium uppercase tracking-wider">
                        Link
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {results.map((row: any, idx: number) => {
                      const tone = getTone(row);
                      const details = getDetails(row);
                      const link = getLink(row);

                      return (
                        <TableRow key={idx} className="hover:bg-muted/30">
                          <TableCell className="py-4">
                            <div className="text-sm font-medium text-foreground">
                              {details.primary}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              {details.secondary}
                            </div>
                          </TableCell>
                          <TableCell className="py-4">
                            <Badge
                              variant={tone > 0 ? "default" : "destructive"}
                              className="text-xs"
                            >
                              {tone.toFixed(2)}
                            </Badge>
                          </TableCell>
                          <TableCell className="py-4 text-right">
                            {link ? (
                              <a
                                href={link}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-sm font-medium text-primary hover:underline inline-flex items-center gap-1"
                              >
                                View Source
                                <ExternalLink className="h-3 w-3" />
                              </a>
                            ) : (
                              <span className="text-xs text-muted-foreground">—</span>
                            )}
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            </ScrollArea>
            </div>
          </div>
        )}
      </div>
    </section>
  );
};

export default GdeltNewsSearch;
