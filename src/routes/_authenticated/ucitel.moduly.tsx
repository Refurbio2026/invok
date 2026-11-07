import { createFileRoute } from "@tanstack/react-router";
import { TeacherWorkspace } from "@/components/invok/teacher/TeacherWorkspace";
import { teacherDashboardOptions } from "@/lib/teacher/queries";
export const Route = createFileRoute("/_authenticated/ucitel/moduly")({
  loader: ({ context }) => context.queryClient.ensureQueryData(teacherDashboardOptions),
  head: () => ({ meta: [{ title: "Vzdelávacie moduly – INVOK" }, { name: "description", content: "Vzdelávacie moduly v učiteľskom rozhraní programu INVOK." }, { property: "og:title", content: "Vzdelávacie moduly – INVOK" }, { property: "og:description", content: "Vzdelávacie moduly v učiteľskom rozhraní programu INVOK." }, { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary" }, { name: "robots", content: "noindex, nofollow" }] }),
  component: () => <TeacherWorkspace view="modules" />,
});
