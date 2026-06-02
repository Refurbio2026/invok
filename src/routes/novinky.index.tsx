import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Search, Calendar, ArrowRight } from "lucide-react";
import { Header } from "@/components/invok/Header";
import { Footer } from "@/components/invok/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ARTICLES, CATEGORIES, formatDate, type Article } from "@/data/articles";

export const Route = createFileRoute("/novinky/")({
  head: () => ({
    meta: [
      { title: "Novinky a aktuality programu INVOK" },
      {
        name: "description",
        content:
          "Sledujte novinky, prípadové štúdie a aktuality programu INVOK – príklady dobrej praxe, výsledky zapojených škôl a nové moduly.",
      },
      { property: "og:title", content: "Novinky a aktuality programu INVOK" },
      {
        property: "og:description",
        content:
          "Články, prípadové štúdie a novinky z programu rozvoja kompetencií INVOK.",
      },
    ],
  }),
  component: NovinkyPage,
});

function NovinkyPage() {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<string>("Všetky");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return ARTICLES.filter((a) => {
      const matchCat = category === "Všetky" || a.category === category;
      const matchQ =
        !q ||
        a.title.toLowerCase().includes(q) ||
        a.excerpt.toLowerCase().includes(q);
      return matchCat && matchQ;
    }).sort((a, b) => +new Date(b.date) - +new Date(a.date));
  }, [query, category]);

  return (
    <div className="min-h-screen bg-background">
      <Header />

      {/* Hero */}
      <section className="border-b border-border bg-gradient-to-b from-muted/40 to-background">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16 md:py-24">
          <div className="max-w-3xl">
            <span className="inline-block text-xs font-semibold uppercase tracking-wider text-primary mb-4">
              Blog INVOK
            </span>
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-foreground">
              Novinky a aktuality programu INVOK
            </h1>
            <p className="mt-6 text-lg text-muted-foreground">
              Sledujte novinky, príklady dobrej praxe, výsledky zapojených škôl,
              nové moduly a aktuálne informácie z programu INVOK.
            </p>
          </div>
        </div>
      </section>

      {/* Filters */}
      <section className="border-b border-border bg-background sticky top-20 z-30">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-4 flex flex-col md:flex-row gap-4 md:items-center justify-between">
          <div className="flex flex-wrap gap-2">
            {(["Všetky", ...CATEGORIES] as const).map((c) => (
              <button
                key={c}
                onClick={() => setCategory(c)}
                className={
                  "px-3 py-1.5 rounded-full text-sm font-medium border transition-colors " +
                  (category === c
                    ? "bg-primary text-primary-foreground border-primary"
                    : "bg-background text-foreground/80 border-border hover:bg-muted")
                }
              >
                {c}
              </button>
            ))}
          </div>
          <div className="relative md:w-80">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Hľadať článok…"
              className="pl-9"
            />
          </div>
        </div>
      </section>

      {/* Articles grid */}
      <section className="py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl md:text-3xl font-bold mb-8">
            Najnovšie články
          </h2>

          {filtered.length === 0 ? (
            <p className="text-muted-foreground">
              Žiadne články nezodpovedajú vášmu výberu.
            </p>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filtered.map((a) => (
                <ArticleCard key={a.slug} article={a} />
              ))}
            </div>
          )}
        </div>
      </section>

      <Footer />
    </div>
  );
}

function ArticleCard({ article }: { article: Article }) {
  return (
    <article className="group flex flex-col rounded-2xl overflow-hidden border border-border bg-card shadow-soft hover:shadow-lg transition-shadow">
      <Link
        to="/novinky/$slug"
        params={{ slug: article.slug }}
        className="block aspect-[16/10] overflow-hidden bg-muted"
      >
        <img
          src={article.image}
          alt={article.title}
          loading="lazy"
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
      </Link>
      <div className="p-6 flex-1 flex flex-col">
        <div className="flex items-center gap-3 text-xs text-muted-foreground mb-3">
          <span className="px-2 py-0.5 rounded-full bg-primary/10 text-primary font-semibold">
            {article.category}
          </span>
          <span className="inline-flex items-center gap-1">
            <Calendar className="h-3 w-3" />
            {formatDate(article.date)}
          </span>
        </div>
        <h3 className="text-lg font-semibold leading-snug mb-2">
          <Link
            to="/novinky/$slug"
            params={{ slug: article.slug }}
            className="hover:text-primary transition-colors"
          >
            {article.title}
          </Link>
        </h3>
        <p className="text-sm text-muted-foreground line-clamp-3 flex-1">
          {article.excerpt}
        </p>
        <Button asChild variant="link" className="mt-4 px-0 self-start">
          <Link to="/novinky/$slug" params={{ slug: article.slug }}>
            Čítať viac <ArrowRight className="ml-1 h-4 w-4" />
          </Link>
        </Button>
      </div>
    </article>
  );
}
