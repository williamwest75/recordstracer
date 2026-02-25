import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ExternalLink, Search, Newspaper, BarChart3, Users, Globe } from "lucide-react";
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

const GdeltNewsSearch = () => {
  const [keyword, setKeyword] = useState("");
  const [submitted, setSubmitted] = useState("");
  const [mode, setMode] = useState<QueryMode>("events");

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["gdelt-bq", submitted, mode],
    queryFn: async () => {
      const { data, error } = await supabase.functions.invoke("fetch-gdelt-news", {
        body: { query: submitted, days: 7, mode },
      });
      if (error) throw error;
      return data;
    },
    enabled: !!submitted,
  });

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (keyword.trim()) setSubmitted(keyword.trim());
  };

  const results = data?.events ?? data?.knowledge_graph ?? data?.mentions ?? [];

  const getTone = (row: any): number => {
    if (row.AvgTone) return Number(row.AvgTone);
    if (row.V2Tone) return Number(row.V2Tone.split(",")[0]);
    if (row.MentionDocTone) return Number(row.MentionDocTone);
    return 0;
  };

  const getDetails = (row: any): { primary: string; secondary: string } => {
    if (mode === "events") {
      return {
        primary: `${row.Actor1Name || "Unknown"} → ${row.Actor2Name || "Unknown"}`,
        secondary: row.SQLDATE ?? "",
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
          <div className="mt-2 overflow-hidden rounded-lg border border-border bg-card shadow">
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
        )}
      </div>
    </section>
  );
};

export default GdeltNewsSearch;
