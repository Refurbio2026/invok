import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { ArrowLeft, Calendar, Share2, Link as LinkIcon } from "lucide-react";
import { Header } from "@/components/invok/Header";
import { Footer } from "@/components/invok/Footer";
import { Button } from "@/components/ui/button";
import {
  getArticle,
  relatedArticles,
  formatDate,
  type Article,
} from "@/data/articles";
import { toast } from "sonner";

export const Route = createFileRoute("/novinky/$slug")({
  head: ({ params }) => {
    const a = getArticle(params.slug);
    if (!a) return { meta: [{ title: "Článok nenájdený – INVOK" }] };
    return {
      meta: [
        { title: `${a.title} – INVOK` },
        { name: "description", content: a.excerpt },
        { property: "og:title", content: a.title },
        { property: "og:description", content: a.excerpt },
        { property: "og:image", content: a.image },
        { property: "og:type", content: "article" },
      ],
    };
  },
  loader: ({ params }) => {
    const article = getArticle(params.slug);
    if (!article) throw notFound();
    return { article };
  },
  notFoundComponent: () => (
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
  ),
  component: ArticleDetail,
});

function ArticleDetail() {
  const { article } = Route.useLoaderData();
  const related = relatedArticles(article.slug);

  const share = async () => {
    const url = typeof window !== "undefined" ? window.location.href : "";
    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        await navigator.share({ title: article.title, text: article.excerpt, url });
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
        <div className="aspect-[21/9] w-full overflow-hidden bg-muted">
          <img
            src={article.image}
            alt={article.title}
            className="w-full h-full object-cover"
          />
        </div>

        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 -mt-12 md:-mt-16 relative">
          <div className="rounded-2xl bg-card border border-border shadow-soft p-6 md:p-10">
            <Button asChild variant="ghost" size="sm" className="mb-6 -ml-2">
              <Link to="/novinky">
                <ArrowLeft className="h-4 w-4 mr-1" /> Späť na novinky
              </Link>
            </Button>

            <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground mb-4">
              <span className="px-2.5 py-1 rounded-full bg-primary/10 text-primary text-xs font-semibold">
                {article.category}
              </span>
              <span className="inline-flex items-center gap-1.5">
                <Calendar className="h-4 w-4" />
                {formatDate(article.date)}
              </span>
              <span>·</span>
              <span>{article.author}</span>
            </div>

            <h1 className="text-3xl md:text-4xl font-bold tracking-tight mb-6">
              {article.title}
            </h1>

            <p className="text-lg text-muted-foreground mb-8 leading-relaxed">
              {article.excerpt}
            </p>

            <div className="prose prose-neutral max-w-none space-y-5 text-foreground/90 leading-relaxed">
              {article.content.map((p, i) => (
                <p key={i}>{p}</p>
              ))}
            </div>

            <div className="mt-10 pt-6 border-t border-border flex items-center justify-between gap-4">
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
                <RelatedCard key={r.slug} article={r} />
              ))}
            </div>
          </section>
        )}
      </article>

      <Footer />
    </div>
  );
}

function RelatedCard({ article }: { article: Article }) {
  return (
    <Link
      to="/novinky/$slug"
      params={{ slug: article.slug }}
      className="group block rounded-2xl overflow-hidden border border-border bg-card shadow-soft hover:shadow-lg transition-shadow"
    >
      <div className="aspect-[16/10] overflow-hidden bg-muted">
        <img
          src={article.image}
          alt={article.title}
          loading="lazy"
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
      </div>
      <div className="p-5">
        <div className="text-xs text-primary font-semibold mb-2">
          {article.category}
        </div>
        <h3 className="font-semibold leading-snug group-hover:text-primary transition-colors">
          {article.title}
        </h3>
        <p className="text-xs text-muted-foreground mt-2">
          {formatDate(article.date)}
        </p>
      </div>
    </Link>
  );
}
