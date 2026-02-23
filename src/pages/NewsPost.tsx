import { useParams, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import Header from "@/components/landing/Header";
import Footer from "@/components/landing/Footer";
import { ArrowLeft } from "lucide-react";

const NewsPost = () => {
  const { slug } = useParams<{ slug: string }>();

  const { data: post, isLoading, error } = useQuery({
    queryKey: ["news-post", slug],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("news_posts")
        .select("*")
        .eq("slug", slug!)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
    enabled: !!slug,
  });

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      <main className="flex-1 py-12">
        <div className="container mx-auto px-4 lg:px-8 max-w-3xl">
          <Link to="/news" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-8">
            <ArrowLeft className="h-3.5 w-3.5" /> Back to News
          </Link>

          {isLoading && <p className="text-muted-foreground">Loading…</p>}
          {error && <p className="text-destructive">Could not load this post.</p>}
          {!isLoading && !post && <p className="text-muted-foreground">Post not found.</p>}

          {post && (
            <article>
              <time className="text-sm text-muted-foreground">
                {new Date(post.published_at).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}
              </time>
              <h1 className="font-heading text-3xl md:text-4xl font-bold text-foreground mt-2 mb-6">{post.headline}</h1>
              <div className="border-l-4 pl-6 space-y-4" style={{ borderColor: "hsl(43, 100%, 38%)" }}>
                {post.content.split("\n\n").map((para, i) => (
                  <p key={i} className="text-foreground/90 leading-relaxed">{para}</p>
                ))}
              </div>
            </article>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default NewsPost;
