import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Newspaper, ExternalLink, ChevronDown, ChevronUp } from "lucide-react";
import { getTone, getSentimentBadge, getLink } from "./gdelt/helpers";

interface NewsMentionsProps {
  searchQuery: string;
  defaultExpanded?: boolean;
}

const DEFAULT_VISIBLE = 5;

const NewsMentions = ({ searchQuery, defaultExpanded = false }: NewsMentionsProps) => {
  const [expanded, setExpanded] = useState(defaultExpanded);
  const [showAll, setShowAll] = useState(false);

  const { data, isLoading, isError } = useQuery({
    queryKey: ["news-mentions", searchQuery],
    queryFn: async () => {
      const { data, error } = await supabase.functions.invoke("fetch-gdelt-news", {
        body: { query: searchQuery, days: 7, mode: "events", usOnly: false },
      });
      if (error) throw error;
      return data;
    },
    enabled: !!searchQuery,
    staleTime: 1000 * 60 * 30,
  });

  const results = data?.events ?? data?.knowledge_graph ?? data?.mentions ?? [];
  const visibleResults = showAll ? results : results.slice(0, DEFAULT_VISIBLE);

  if (!searchQuery) return null;

  const formatDate = (row: any): string => {
    const raw = row.SQLDATE || row.DATE || row.MentionDateTime || "";
    if (!raw) return "";
    const str = String(raw);
    if (str.length >= 8) {
      const y = str.slice(0, 4);
      const m = str.slice(4, 6);
      const d = str.slice(6, 8);
      const date = new Date(`${y}-${m}-${d}`);
      if (!isNaN(date.getTime())) {
        return date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
      }
    }
    return str;
  };

  const getSourceName = (row: any): string =>
    row.MentionSourceName || row.Actor1Name || row.V2Organizations?.split(";")[0] || "News Source";

  const getTitle = (row: any): string => {
    if (row.Actor1Name && row.Actor2Name) {
      return `${row.Actor1Name} — ${row.Actor2Name}`;
    }
    return row.Actor1Name || row.V2Persons?.split(";")[0] || "News Mention";
  };

  return (
    <section>
      <button
        onClick={() => setExpanded(!expanded)}
        className="flex items-center gap-2 mb-3 w-full text-left group"
      >
        <Newspaper className="h-5 w-5 text-accent" />
        <h2 className="font-heading text-lg font-semibold text-foreground">News Mentions</h2>
        {!isLoading && results.length > 0 && (
          <Badge variant="secondary" className="text-xs ml-1">{results.length}</Badge>
        )}
        <span className="ml-auto text-muted-foreground">
          {expanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
        </span>
      </button>

      {expanded && (
        <>
          <p className="text-xs text-muted-foreground mb-4 pl-7">
            Recent media coverage for "<span className="font-medium text-foreground">{searchQuery}</span>" — last 7 days
          </p>

          {isLoading && (
            <div className="space-y-3 pl-7">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-20 w-full rounded-lg" />
              ))}
            </div>
          )}

          {isError && (
            <p className="text-sm text-destructive pl-7">Unable to load news mentions at this time.</p>
          )}

          {!isLoading && results.length === 0 && (
            <p className="text-sm text-muted-foreground italic pl-7">No recent news mentions found.</p>
          )}

          {!isLoading && results.length > 0 && (
            <div className="space-y-3 pl-7">
              {visibleResults.map((row: any, idx: number) => {
                const tone = getTone(row);
                const sentiment = getSentimentBadge(tone);
                const link = getLink(row);
                const date = formatDate(row);
                const source = getSourceName(row);
                const title = getTitle(row);

                return (
                  <div
                    key={idx}
                    className="border border-border rounded-lg p-4 bg-card hover:bg-muted/30 transition-colors"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-semibold text-foreground truncate">{title}</p>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {source}{date ? ` · ${date}` : ""}
                        </p>
                        <div className="mt-2">
                          <Badge variant={sentiment.variant} className="text-[11px]">
                            {sentiment.label}
                          </Badge>
                        </div>
                      </div>
                      {link && (
                        <a
                          href={link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="shrink-0 inline-flex items-center gap-1 text-xs font-medium text-primary hover:underline mt-0.5"
                        >
                          Open Article <ExternalLink className="h-3 w-3" />
                        </a>
                      )}
                    </div>
                  </div>
                );
              })}

              {results.length > DEFAULT_VISIBLE && !showAll && (
                <button
                  onClick={() => setShowAll(true)}
                  className="inline-flex items-center gap-1.5 text-sm text-accent hover:underline font-medium pt-1"
                >
                  <ChevronDown className="h-3.5 w-3.5" />
                  Show all {results.length} mentions
                </button>
              )}
            </div>
          )}
        </>
      )}
    </section>
  );
};

export default NewsMentions;
