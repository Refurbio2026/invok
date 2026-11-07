import { createFileRoute } from "@tanstack/react-router";
import { TeacherWorkspace } from "@/components/invok/teacher/TeacherWorkspace";
import { teacherDashboardOptions } from "@/lib/teacher/queries";
export const Route = createFileRoute("/_authenticated/ucitel/triedy")({
  loader: ({ context }) => context.queryClient.ensureQueryData(teacherDashboardOptions),
  head: () => ({ meta: [{ title: "Moje triedy – INVOK" }, { name: "description", content: "Moje triedy v učiteľskom rozhraní programu INVOK." }, { property: "og:title", content: "Moje triedy – INVOK" }, { property: "og:description", content: "Moje triedy v učiteľskom rozhraní programu INVOK." }, { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary" }, { name: "robots", content: "noindex, nofollow" }] }),
  component: () => <TeacherWorkspace view="classes" />,
});
