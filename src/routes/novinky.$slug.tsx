import { useLang, localizePost } from "@/lib/i18n";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, Calendar, Share2, Link as LinkIcon, Loader2 } from "lucide-react";
import { Header } from "@/components/invok/Header";
import { Footer } from "@/components/invok/Footer";
import { Button } from "@/components/ui/button";
import {
  fetchPublicPostBySlug,
  fetchPublicPosts,
  type BlogPost,
} from "@/lib/admin/blog.functions";
import { toast } from "sonner";

export const Route = createFileRoute("/novinky/$slug")({
  component: ArticleDetail,
});

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("sk-SK", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function ArticleDetail() {
  const lang = useLang();
  const { slug } = Route.useParams();

  const post = useQuery({
    queryKey: ["public-blog", "post", slug],
    queryFn: () => fetchPublicPostBySlug(slug),
    select: (d) => (d ? localizePost(lang, d) : d),
  });
  const all = useQuery({
    queryKey: ["public-blog", "list"],
    queryFn: () => fetchPublicPosts(),
    select: (d) => d.map((x) => localizePost(lang, x)),
  });

  if (post.isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="mx-auto max-w-3xl px-4 py-24 text-center text-muted-foreground">
          <Loader2 className="h-5 w-5 animate-spin inline mr-2" /> Načítavam…
        </div>
        <Footer />
      </div>
    );
  }

  if (!post.data) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="mx-auto max-w-3xl px-4 py-24 text-center">
          <h1 className="text-3xl font-bold mb-4">Článok nenájdený</h1>
          <p className="text-muted-foreground mb-8">
            Tento článok neexistuje alebo bol presunutý.
          </p>
          <Button asChild>
            <Link to="/novinky">Späť na novinky</Link>
          </Button>
        </div>
        <Footer />
      </div>
    );
  }

  const article = post.data;
  const dateStr = article.published_at || article.created_at;
  const related = (all.data || [])
    .filter(
      (a) =>
        a.id !== article.id &&
        (a.category_id === article.category_id || !article.category_id),
    )
    .slice(0, 3);

  const share = async () => {
    const url = typeof window !== "undefined" ? window.location.href : "";
    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        await navigator.share({
          title: article.title,
          text: article.excerpt || "",
          url,
        });
        return;
      } catch {
        /* ignore */
      }
    }
    try {
      await navigator.clipboard.writeText(url);
      toast.success("Odkaz skopírovaný do schránky");
    } catch {
      toast.error("Nepodarilo sa skopírovať odkaz");
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <article className="pb-20">
        {article.cover_image_url && (
          <div className="w-full max-w-2xl mx-auto px-4 pt-8">
            <div className="overflow-hidden rounded-2xl bg-muted">
              <img
                src={article.cover_image_url}
                alt={article.title}
                className="w-full h-auto object-contain"
              />
            </div>
          </div>
        )}

        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 relative">
          <div className="rounded-2xl bg-card border border-border shadow-soft p-6 md:p-10">
            <Button asChild variant="ghost" size="sm" className="mb-6 -ml-2">
              <Link to="/novinky">
                <ArrowLeft className="h-4 w-4 mr-1" /> Späť na novinky
              </Link>
            </Button>

            <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground mb-4">
              {article.category?.name && (
                <span className="px-2.5 py-1 rounded-full bg-primary/10 text-primary text-xs font-semibold">
                  {article.category.name}
                </span>
              )}
              <span className="inline-flex items-center gap-1.5">
                <Calendar className="h-4 w-4" />
                {formatDate(dateStr)}
              </span>
              <span>·</span>
              <span>{article.author}</span>
            </div>

            <h1 className="text-3xl md:text-4xl font-bold tracking-tight mb-6 text-balance">
              {article.title}
            </h1>

            {article.excerpt && (
              <p className="text-lg text-muted-foreground mb-8 leading-relaxed">
                {article.excerpt}
              </p>
            )}

            <div
              className="prose prose-neutral max-w-none space-y-5 text-foreground/90 leading-relaxed"
              dangerouslySetInnerHTML={{ __html: article.content || "" }}
            />

            <div className="mt-10 pt-6 border-t border-border flex items-center justify-between gap-4 flex-wrap">
              <span className="text-sm text-muted-foreground">
                Páčil sa vám článok? Zdieľajte ho.
              </span>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={share}>
                  <Share2 className="h-4 w-4 mr-2" /> Zdieľať
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={async () => {
                    try {
                      await navigator.clipboard.writeText(window.location.href);
                      toast.success("Odkaz skopírovaný");
                    } catch {
                      toast.error("Chyba pri kopírovaní");
                    }
                  }}
                >
                  <LinkIcon className="h-4 w-4 mr-2" /> Kopírovať odkaz
                </Button>
              </div>
            </div>
          </div>
        </div>

        {related.length > 0 && (
          <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 mt-20">
            <h2 className="text-2xl font-bold mb-8">Súvisiace články</h2>
            <div className="grid md:grid-cols-3 gap-8">
              {related.map((r) => (
                <RelatedCard key={r.id} article={r} />
              ))}
            </div>
          </section>
        )}
      </article>

      <Footer />
    </div>
  );
}

function RelatedCard({ article }: { article: BlogPost }) {
  const dateStr = article.published_at || article.created_at;
  return (
    <Link
      to="/novinky/$slug"
      params={{ slug: article.slug }}
      className="group block rounded-2xl overflow-hidden border border-border bg-card shadow-soft hover:shadow-lg transition-shadow"
    >
      <div className="aspect-[16/10] overflow-hidden bg-muted">
        {article.cover_image_url ? (
          <img
            src={article.cover_image_url}
            alt={article.title}
            loading="lazy"
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-primary/10 to-accent" />
        )}
      </div>
      <div className="p-5">
        {article.category?.name && (
          <div className="text-xs text-primary font-semibold mb-2">
            {article.category.name}
          </div>
        )}
        <h3 className="font-semibold leading-snug group-hover:text-primary transition-colors text-balance">
          {article.title}
        </h3>
        <p className="text-xs text-muted-foreground mt-2">{formatDate(dateStr)}</p>
      </div>
    </Link>
  );
}
