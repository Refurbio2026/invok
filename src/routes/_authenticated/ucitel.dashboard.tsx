import { createFileRoute } from "@tanstack/react-router";
import { TeacherWorkspace } from "@/components/invok/teacher/TeacherWorkspace";
import { teacherDashboardOptions } from "@/lib/teacher/queries";
export const Route = createFileRoute("/_authenticated/ucitel/dashboard")({
  loader: ({ context }) => context.queryClient.ensureQueryData(teacherDashboardOptions),
  head: () => ({ meta: [{ title: "Moja výučba – INVOK" }, { name: "description", content: "Moja výučba v učiteľskom rozhraní programu INVOK." }, { property: "og:title", content: "Moja výučba – INVOK" }, { property: "og:description", content: "Moja výučba v učiteľskom rozhraní programu INVOK." }, { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary" }, { name: "robots", content: "noindex, nofollow" }] }),
  component: () => <TeacherWorkspace view="overview" />,
});
