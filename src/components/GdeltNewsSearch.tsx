import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Skeleton } from "@/components/ui/skeleton";
import { Newspaper } from "lucide-react";
import type { QueryMode, TopActor } from "./gdelt/types";
import SearchForm from "./gdelt/SearchForm";
import TopEntities from "./gdelt/TopEntities";
import ResultsTable from "./gdelt/ResultsTable";

const GdeltNewsSearch = () => {
  const [keyword, setKeyword] = useState("");
  const [submitted, setSubmitted] = useState("");
  const [mode, setMode] = useState<QueryMode>("events");
  const [usOnly, setUsOnly] = useState(false);

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
    queryKey: ["gdelt-bq", submitted, mode, usOnly],
    queryFn: async () => {
      const { data, error } = await supabase.functions.invoke("fetch-gdelt-news", {
        body: { query: submitted, days: 7, mode, usOnly },
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
  const dataSource = data?.source as string | undefined;

  const topActors: TopActor[] = useMemo(() => {
    if (!results.length || mode !== "events") return [];
    const actorStats: Record<string, { count: number; totalTone: number }> = {};
    results.forEach((row: any) => {
      const name = row.Actor1Name;
      if (name && name.toUpperCase() !== "UNITED STATES") {
        if (!actorStats[name]) actorStats[name] = { count: 0, totalTone: 0 };
        actorStats[name].count += 1;
        actorStats[name].totalTone += parseFloat(row.AvgTone || 0);
      }
    });
    return Object.entries(actorStats)
      .map(([name, stats]) => ({
        name,
        count: stats.count,
        avgTone: stats.totalTone / stats.count,
        trend: (stats.totalTone / stats.count > 0 ? "up" : "down") as "up" | "down",
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);
  }, [results, mode]);

  return (
    <section className="py-12">
      <div className="container mx-auto px-4 lg:px-8 max-w-4xl">
        <h2 className="font-heading text-2xl md:text-3xl font-bold text-foreground mb-1">
          GDELT BigQuery Analytics
        </h2>
        <p className="text-muted-foreground text-sm mb-6">
          Query GDELT's global event database via Google BigQuery for deep intelligence analytics.
        </p>

        <SearchForm
          keyword={keyword}
          setKeyword={setKeyword}
          mode={mode}
          setMode={setMode}
          usOnly={usOnly}
          setUsOnly={setUsOnly}
          isLoading={isLoading}
          onSubmit={handleSearch}
        />

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
          <>
            <TopEntities actors={topActors} />
            <ResultsTable results={results} mode={mode} dataSource={dataSource} />
          </>
        )}
      </div>
    </section>
  );
};

export default GdeltNewsSearch;
