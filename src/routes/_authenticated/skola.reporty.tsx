import { createFileRoute } from "@tanstack/react-router";
import { SchoolWorkspace } from "@/components/invok/school/SchoolWorkspace";
import { schoolDashboardOptions } from "@/lib/school/queries";

export const Route = createFileRoute("/_authenticated/skola/reporty")({
  loader: ({ context }) => context.queryClient.ensureQueryData(schoolDashboardOptions),
  head: () => ({ meta: [
    { title: "Reporty školy – INVOK" },
    { name: "description", content: "Reporty školy v školskom rozhraní vzdelávacieho programu INVOK." },
    { property: "og:title", content: "Reporty školy – INVOK" },
    { property: "og:description", content: "Reporty školy v školskom rozhraní vzdelávacieho programu INVOK." },
    { property: "og:type", content: "website" },
    { name: "twitter:card", content: "summary" },
    { name: "robots", content: "noindex, nofollow" },
  ] }),
  component: () => <SchoolWorkspace view="reports" />,
});
