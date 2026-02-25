import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { ExternalLink, Search, Newspaper } from "lucide-react";

interface GdeltArticle {
  title: string;
  url: string;
  source: string;
  date: string;
  image: string | null;
}

const GdeltNewsSearch = () => {
  const [keyword, setKeyword] = useState("");
  const [submitted, setSubmitted] = useState("");

  const { data, isLoading, isError } = useQuery({
    queryKey: ["gdelt-news", submitted],
    queryFn: async () => {
      const { data, error } = await supabase.functions.invoke("fetch-gdelt-news", {
        body: { query: submitted, days: 7 },
      });
      if (error) throw error;
      return data.articles as GdeltArticle[];
    },
    enabled: !!submitted,
  });

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (keyword.trim()) setSubmitted(keyword.trim());
  };

  return (
    <section className="py-12">
      <div className="container mx-auto px-4 lg:px-8 max-w-3xl">
        <h2 className="font-heading text-2xl md:text-3xl font-bold text-foreground mb-1">
          Global News Search
        </h2>
        <p className="text-muted-foreground text-sm mb-6">
          Search recent global news articles via GDELT.
        </p>

        <form onSubmit={handleSearch} className="flex gap-2 mb-8">
          <Input
            placeholder="Enter keywords…"
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
            Something went wrong fetching news. Please try again.
          </p>
        )}

        {data && data.length === 0 && (
          <div className="text-center py-12 text-muted-foreground">
            <Newspaper className="h-10 w-10 mx-auto mb-3 opacity-40" />
            <p>No articles found for "{submitted}".</p>
          </div>
        )}

        {data && data.length > 0 && (
          <ScrollArea className="h-[600px] pr-3">
            <div className="space-y-4">
              {data.map((article, idx) => (
                <Card key={idx} className="hover:shadow-md transition-shadow">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base leading-snug">
                      <a
                        href={article.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="hover:underline inline-flex items-start gap-1"
                      >
                        {article.title}
                        <ExternalLink className="h-3.5 w-3.5 shrink-0 mt-0.5 text-muted-foreground" />
                      </a>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="flex items-center gap-3 text-xs text-muted-foreground">
                      <span className="font-medium text-foreground/70">{article.source}</span>
                      {article.date && (
                        <span>
                          {new Date(
                            article.date.replace(
                              /^(\d{4})(\d{2})(\d{2})T(\d{2})(\d{2})(\d{2})Z$/,
                              "$1-$2-$3T$4:$5:$6Z"
                            )
                          ).toLocaleDateString("en-US", {
                            year: "numeric",
                            month: "short",
                            day: "numeric",
                          })}
                        </span>
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
