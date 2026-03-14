import { useState } from "react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import Header from "@/components/landing/Header";
import Footer from "@/components/landing/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { Newspaper, ArrowRight } from "lucide-react";

const News = () => {
  const [email, setEmail] = useState("");
  const [subscribing, setSubscribing] = useState(false);

  const { data: posts, isLoading } = useQuery({
    queryKey: ["news-posts"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("news_posts")
        .select("slug, headline, excerpt, published_at")
        .order("published_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    setSubscribing(true);
    const { error } = await supabase.from("news_subscribers").insert({ email: email.trim() });
    setSubscribing(false);
    if (error) {
      if (error.code === "23505") {
        toast.info("You're already subscribed!");
      } else {
        toast.error("Could not subscribe. Please try again.");
      }
      return;
    }
    toast.success("Subscribed! You'll hear from us soon.");
    setEmail("");
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      <main className="flex-1">
        {/* Subscribe banner */}
        <section className="py-10 bg-primary">
          <div className="container mx-auto px-4 lg:px-8 max-w-2xl text-center">
            <h1 className="font-heading text-3xl md:text-4xl font-bold text-primary-foreground mb-2">News &amp; Updates</h1>
            <p className="mb-6 text-accent">Stay up to date with Record Tracer developments.</p>
            <form onSubmit={handleSubscribe} className="flex gap-2 max-w-md mx-auto">
              <Input
                type="email"
                placeholder="you@newsroom.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="bg-primary-foreground/10 border-primary-foreground/20 text-primary-foreground placeholder:text-primary-foreground/50"
              />
              <Button type="submit" disabled={subscribing} variant="accent" size="sm">
                {subscribing ? "…" : "Subscribe"}
              </Button>
            </form>
          </div>
        </section>

        {/* Posts */}
        <section className="py-12">
          <div className="container mx-auto px-4 lg:px-8 max-w-3xl space-y-8">
            {isLoading && <p className="text-muted-foreground">Loading posts…</p>}
            {posts?.map((post) => (
              <article key={post.slug} className="border-l-4 pl-6 py-2" style={{ borderColor: "hsl(43, 100%, 38%)" }}>
                <time className="text-sm text-muted-foreground">
                  {new Date(post.published_at).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}
                </time>
                <h2 className="font-heading text-2xl font-bold text-foreground mt-1 mb-2">{post.headline}</h2>
                <p className="text-muted-foreground mb-3">{post.excerpt}</p>
                <Link to={`/news/${post.slug}`} className="inline-flex items-center gap-1 text-sm font-medium hover:underline" style={{ color: "hsl(210, 36%, 23%)" }}>
                  Read More <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </article>
            ))}
            {!isLoading && posts?.length === 0 && (
              <div className="text-center py-12 text-muted-foreground">
                <Newspaper className="h-10 w-10 mx-auto mb-3 opacity-40" />
                <p>No posts yet. Check back soon!</p>
              </div>
            )}
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default News;
