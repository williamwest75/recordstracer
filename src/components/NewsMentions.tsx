import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Newspaper, ExternalLink, ChevronDown, ChevronUp } from "lucide-react";

interface NewsMentionsProps {
  searchQuery: string;
  defaultExpanded?: boolean;
}

interface Article {
  title: string;
  url: string;
  domain: string;
  seendate: string;
}

const formatDate = (raw: string): string => {
  if (!raw) return "";
  try {
    const d = new Date(raw);
    if (!isNaN(d.getTime())) {
      return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
    }
  } catch {}
  return raw.slice(0, 10);
};

const NewsMentions = ({ searchQuery, defaultExpanded = false }: NewsMentionsProps) => {
  const [expanded, setExpanded] = useState(defaultExpanded);

  const { data, isLoading } = useQuery({
    queryKey: ["news-mentions", searchQuery],
    queryFn: async () => {
      const { data, error } = await supabase.functions.invoke("fetch-gdelt-news", {
        body: { query: searchQuery },
      });
      if (error) throw error;
      return (data?.articles ?? []) as Article[];
    },
    enabled: !!searchQuery,
    staleTime: 1000 * 60 * 30,
  });

  const articles = data ?? [];

  if (!searchQuery) return null;
  // If API failed (empty results from error), render nothing per spec
  // But we still show the section header so it can be expanded

  return (
    <section>
      <button
        onClick={() => setExpanded(!expanded)}
        className="flex items-center gap-2 mb-1 w-full text-left group"
      >
        <Newspaper className="h-4 w-4 text-muted-foreground" />
        <span className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
          News Coverage — Past 30 Days
        </span>
        <span className="ml-auto text-muted-foreground">
          {expanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
        </span>
      </button>

      {expanded && (
        <div className="pt-2">
          <p className="text-[10px] text-muted-foreground/60 mb-4">
            Sources: GDELT DOC API
          </p>

          {isLoading && (
            <p className="text-sm text-muted-foreground">Loading news coverage…</p>
          )}

          {!isLoading && articles.length === 0 && (
            <p className="text-sm text-muted-foreground italic">
              No news coverage found in the past 30 days.
            </p>
          )}

          {!isLoading && articles.length > 0 && (
            <ul className="space-y-2">
              {articles.map((article, idx) => (
                <li
                  key={idx}
                  className="flex items-baseline justify-between gap-3 py-2 border-b border-border last:border-0"
                >
                  <div className="min-w-0 flex-1">
                    <p className="text-sm text-foreground leading-snug truncate">
                      {article.title || "Untitled Article"}
                    </p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {article.domain}{article.seendate ? ` · ${formatDate(article.seendate)}` : ""}
                    </p>
                  </div>
                  {article.url && (
                    <a
                      href={article.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="shrink-0 text-xs text-muted-foreground hover:text-foreground underline underline-offset-2 whitespace-nowrap"
                    >
                      Read Article <ExternalLink className="inline h-3 w-3" />
                    </a>
                  )}
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </section>
  );
};

export default NewsMentions;
