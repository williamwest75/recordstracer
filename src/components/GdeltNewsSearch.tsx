import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ExternalLink, Search, Newspaper, BarChart3, Users, Globe } from "lucide-react";
import { Badge } from "@/components/ui/badge";

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
              <Skeleton key={i} className="h-24 w-full rounded-lg" />
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

        {results.length > 0 && (
          <ScrollArea className="h-[600px] pr-3">
            <div className="space-y-3">
              {mode === "events" &&
                results.map((row: any, idx: number) => (
                  <Card key={idx} className="hover:shadow-md transition-shadow">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm leading-snug flex items-center gap-2">
                        <span className="font-semibold">{row.Actor1Name || "Unknown"}</span>
                        <span className="text-muted-foreground">→</span>
                        <span className="font-semibold">{row.Actor2Name || "Unknown"}</span>
                        <Badge variant="outline" className="ml-auto text-xs">
                          Event {row.EventCode}
                        </Badge>
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                        <span>Date: {row.SQLDATE}</span>
                        <span>Goldstein: {Number(row.GoldsteinScale).toFixed(1)}</span>
                        <span>Tone: {Number(row.AvgTone).toFixed(2)}</span>
                        <span>Mentions: {row.NumMentions}</span>
                        {row.SOURCEURL && (
                          <a
                            href={row.SOURCEURL}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="hover:underline inline-flex items-center gap-0.5 text-primary"
                          >
                            Source <ExternalLink className="h-3 w-3" />
                          </a>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}

              {mode === "gkg" &&
                results.map((row: any, idx: number) => (
                  <Card key={idx} className="hover:shadow-md transition-shadow">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm leading-snug">
                        <a
                          href={row.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="hover:underline inline-flex items-start gap-1"
                        >
                          {row.url}
                          <ExternalLink className="h-3 w-3 shrink-0 mt-0.5 text-muted-foreground" />
                        </a>
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="pt-0 space-y-1">
                      {row.V2Persons && (
                        <p className="text-xs text-muted-foreground truncate">
                          <span className="font-medium text-foreground/70">Persons:</span>{" "}
                          {row.V2Persons.split(";").slice(0, 5).join(", ")}
                        </p>
                      )}
                      {row.V2Organizations && (
                        <p className="text-xs text-muted-foreground truncate">
                          <span className="font-medium text-foreground/70">Orgs:</span>{" "}
                          {row.V2Organizations.split(";").slice(0, 5).join(", ")}
                        </p>
                      )}
                      {row.V2Tone && (
                        <p className="text-xs text-muted-foreground">
                          <span className="font-medium text-foreground/70">Tone:</span>{" "}
                          {Number(row.V2Tone.split(",")[0]).toFixed(2)}
                        </p>
                      )}
                    </CardContent>
                  </Card>
                ))}

              {mode === "mentions" &&
                results.map((row: any, idx: number) => (
                  <Card key={idx} className="hover:shadow-md transition-shadow">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm leading-snug flex items-center gap-2">
                        <span className="font-semibold">{row.MentionSourceName}</span>
                        <Badge variant="outline" className="ml-auto text-xs">
                          Confidence: {row.Confidence}%
                        </Badge>
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <div className="flex items-center gap-3 text-xs text-muted-foreground">
                        <span>Tone: {Number(row.MentionDocTone).toFixed(2)}</span>
                        <span>{row.MentionDateTime}</span>
                        {row.url && (
                          <a
                            href={row.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="hover:underline inline-flex items-center gap-0.5 text-primary"
                          >
                            Source <ExternalLink className="h-3 w-3" />
                          </a>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
            </div>
          </ScrollArea>
        )}
      </div>
    </section>
  );
};

export default GdeltNewsSearch;
