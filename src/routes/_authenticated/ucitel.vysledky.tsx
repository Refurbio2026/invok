import { createFileRoute } from "@tanstack/react-router";
import { TeacherWorkspace } from "@/components/invok/teacher/TeacherWorkspace";
import { teacherDashboardOptions } from "@/lib/teacher/queries";
export const Route = createFileRoute("/_authenticated/ucitel/vysledky")({
  loader: ({ context }) => context.queryClient.ensureQueryData(teacherDashboardOptions),
  head: () => ({ meta: [{ title: "Výsledky triedy – INVOK" }, { name: "description", content: "Výsledky triedy v učiteľskom rozhraní programu INVOK." }, { property: "og:title", content: "Výsledky triedy – INVOK" }, { property: "og:description", content: "Výsledky triedy v učiteľskom rozhraní programu INVOK." }, { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary" }, { name: "robots", content: "noindex, nofollow" }] }),
  component: () => <TeacherWorkspace view="results" />,
});
