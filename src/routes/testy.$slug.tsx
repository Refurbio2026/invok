import { createFileRoute } from "@tanstack/react-router";
import { TestRunner } from "@/components/invok/TestRunner";
import { TESTS } from "@/data/tests";

export const Route = createFileRoute("/testy/$slug")({
  component: TestPage,
  head: ({ params }) => {
    const t = params?.slug ? TESTS[params.slug] : undefined;
    const title = t ? `${t.title} – INVOK test` : "INVOK – Ukážkový test";
    const description = t?.description ?? "Ukážkový test kompetencií programu INVOK.";
    return {
      meta: [
        { title },
        { name: "description", content: description },
        { property: "og:title", content: title },
        { property: "og:description", content: description },
      ],
    };
  },
});

function TestPage() {
  const { slug } = Route.useParams();
  return <TestRunner slug={slug} />;
}
