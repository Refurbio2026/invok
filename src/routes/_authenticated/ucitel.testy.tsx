import { createFileRoute } from "@tanstack/react-router";
import { TeacherWorkspace } from "@/components/invok/teacher/TeacherWorkspace";
import { teacherDashboardOptions } from "@/lib/teacher/queries";
export const Route = createFileRoute("/_authenticated/ucitel/testy")({
  loader: ({ context }) => context.queryClient.ensureQueryData(teacherDashboardOptions),
  head: () => ({ meta: [{ title: "Testy a zadania – INVOK" }, { name: "description", content: "Testy a zadania v učiteľskom rozhraní programu INVOK." }, { property: "og:title", content: "Testy a zadania – INVOK" }, { property: "og:description", content: "Testy a zadania v učiteľskom rozhraní programu INVOK." }, { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary" }, { name: "robots", content: "noindex, nofollow" }] }),
  component: () => <TeacherWorkspace view="tests" />,
});
