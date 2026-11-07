import { createFileRoute } from "@tanstack/react-router";
import { TeacherWorkspace } from "@/components/invok/teacher/TeacherWorkspace";
import { teacherDashboardOptions } from "@/lib/teacher/queries";
export const Route = createFileRoute("/_authenticated/ucitel/ziaci")({
  loader: ({ context }) => context.queryClient.ensureQueryData(teacherDashboardOptions),
  head: () => ({ meta: [{ title: "Žiaci učiteľa – INVOK" }, { name: "description", content: "Žiaci učiteľa v učiteľskom rozhraní programu INVOK." }, { property: "og:title", content: "Žiaci učiteľa – INVOK" }, { property: "og:description", content: "Žiaci učiteľa v učiteľskom rozhraní programu INVOK." }, { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary" }, { name: "robots", content: "noindex, nofollow" }] }),
  component: () => <TeacherWorkspace view="students" />,
});
