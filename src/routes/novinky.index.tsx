import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Search, Loader2 } from "lucide-react";
import { Header } from "@/components/invok/Header";
import { Footer } from "@/components/invok/Footer";
import { Input } from "@/components/ui/input";
import {
  fetchPublicPosts,
  fetchPublicCategories,
  type BlogPost,
} from "@/lib/admin/blog.functions";

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

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("sk-SK", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function NovinkyPage() {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<string>("Všetky");

  const posts = useQuery({
    queryKey: ["public-blog", "list"],
    queryFn: () => fetchPublicPosts(),
  });
  const categories = useQuery({
    queryKey: ["public-blog", "categories"],
    queryFn: () => fetchPublicCategories(),
  });

  const categoryNames = useMemo(
    () => (categories.data || []).map((c) => c.name),
    [categories.data],
  );

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return (posts.data || []).filter((a) => {
      const catName = a.category?.name || "";
      const matchCat = category === "Všetky" || catName === category;
      const matchQ =
        !q ||
        a.title.toLowerCase().includes(q) ||
        (a.excerpt || "").toLowerCase().includes(q);
      return matchCat && matchQ;
    });
  }, [posts.data, query, category]);

  return (
    <div className="min-h-screen bg-background">
      <Header />

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

      <section className="border-b border-border bg-background sticky top-20 z-30">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-4 flex flex-col md:flex-row gap-4 md:items-center justify-between">
          <div className="flex flex-wrap gap-2">
            {(["Všetky", ...categoryNames]).map((c) => (
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

      <section className="py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl md:text-3xl font-bold mb-8">
            Najnovšie články
          </h2>

          {posts.isLoading ? (
            <div className="flex items-center text-muted-foreground">
              <Loader2 className="h-5 w-5 animate-spin mr-2" /> Načítavam…
            </div>
          ) : filtered.length === 0 ? (
            <div className="rounded-xl border border-dashed border-border p-12 text-center">
              <p className="text-muted-foreground">
                Zatiaľ tu nie sú žiadne publikované články.
              </p>
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-8">
              {filtered.map((a) => (
                <ArticleCard key={a.id} article={a} />
              ))}
            </div>
          )}
        </div>
      </section>

      <Footer />
    </div>
  );
}

function ArticleCard({ article }: { article: BlogPost }) {
  return (
    <article className="group flex flex-col rounded-2xl overflow-hidden border border-border bg-card shadow-soft hover:shadow-lg transition-shadow">
      <Link
        to="/novinky/$slug"
        params={{ slug: article.slug }}
        className="block aspect-[16/10] overflow-hidden bg-muted"
      >
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
      </Link>
      <div className="p-6">
        <h3 className="text-lg font-semibold leading-snug text-center">
          <Link
            to="/novinky/$slug"
            params={{ slug: article.slug }}
            className="hover:text-primary transition-colors"
          >
            {article.title}
          </Link>
        </h3>
      </div>
    </article>
  );
}
