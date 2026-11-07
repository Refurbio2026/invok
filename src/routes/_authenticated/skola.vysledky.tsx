import { createFileRoute } from "@tanstack/react-router";
import { SchoolWorkspace } from "@/components/invok/school/SchoolWorkspace";
import { schoolDashboardOptions } from "@/lib/school/queries";

export const Route = createFileRoute("/_authenticated/skola/vysledky")({
  loader: ({ context }) => context.queryClient.ensureQueryData(schoolDashboardOptions),
  head: () => ({ meta: [
    { title: "Výsledky školy – INVOK" },
    { name: "description", content: "Výsledky školy v školskom rozhraní vzdelávacieho programu INVOK." },
    { property: "og:title", content: "Výsledky školy – INVOK" },
    { property: "og:description", content: "Výsledky školy v školskom rozhraní vzdelávacieho programu INVOK." },
    { property: "og:type", content: "website" },
    { name: "twitter:card", content: "summary" },
    { name: "robots", content: "noindex, nofollow" },
  ] }),
  component: () => <SchoolWorkspace view="results" />,
});
