import { createFileRoute } from "@tanstack/react-router";
import type {} from "@tanstack/react-start";
import { ARTICLES } from "@/data/articles";
import { TESTS } from "@/data/tests";

const BASE_URL = "https://invok.pscno.sk";

interface SitemapEntry {
  path: string;
  changefreq?: "always" | "hourly" | "daily" | "weekly" | "monthly" | "yearly" | "never";
  priority?: string;
}

export const Route = createFileRoute("/sitemap.xml")({
  server: {
    handlers: {
      GET: async () => {
        const entries: SitemapEntry[] = [
          { path: "/", changefreq: "weekly", priority: "1.0" },
          { path: "/kontakt", changefreq: "monthly", priority: "0.7" },
          { path: "/registracia-skoly", changefreq: "monthly", priority: "0.8" },
          { path: "/modul/ukazka", changefreq: "monthly", priority: "0.7" },
          { path: "/novinky", changefreq: "weekly", priority: "0.8" },
          { path: "/testy", changefreq: "monthly", priority: "0.8" },
          { path: "/testy/vstupny-test", changefreq: "monthly", priority: "0.6" },
          { path: "/testy/vystupny-test", changefreq: "monthly", priority: "0.6" },
          { path: "/prihlasenie", changefreq: "yearly", priority: "0.3" },
          { path: "/pristupnost", changefreq: "yearly", priority: "0.3" },
          { path: "/ochrana-osobnych-udajov", changefreq: "yearly", priority: "0.3" },
          { path: "/podmienky-pouzivania", changefreq: "yearly", priority: "0.3" },
        ];

        for (const a of ARTICLES) {
          entries.push({ path: `/novinky/${a.slug}`, changefreq: "monthly", priority: "0.6" });
        }
        for (const t of Object.values(TESTS)) {
          entries.push({ path: `/testy/${t.slug}`, changefreq: "monthly", priority: "0.6" });
        }

        const urls = entries.map((e) =>
          [
            `  <url>`,
            `    <loc>${BASE_URL}${e.path}</loc>`,
            e.changefreq ? `    <changefreq>${e.changefreq}</changefreq>` : null,
            e.priority ? `    <priority>${e.priority}</priority>` : null,
            `  </url>`,
          ]
            .filter(Boolean)
            .join("\n"),
        );

        const xml = [
          `<?xml version="1.0" encoding="UTF-8"?>`,
          `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">`,
          ...urls,
          `</urlset>`,
        ].join("\n");

        return new Response(xml, {
          headers: {
            "Content-Type": "application/xml",
            "Cache-Control": "public, max-age=3600",
          },
        });
      },
    },
  },
});
