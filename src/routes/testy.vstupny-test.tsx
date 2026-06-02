import { createFileRoute } from "@tanstack/react-router";
import { AssessmentTest } from "@/components/invok/AssessmentTest";

export const Route = createFileRoute("/testy/vstupny-test")({
  head: () => ({
    meta: [
      { title: "Vstupný kompetenčný test | INVOK" },
      { name: "description", content: "Vstupné meranie kompetencií žiaka pred začatím programu INVOK – 48 otázok + 4 otvorené, ~15 minút." },
    ],
  }),
  component: () => <AssessmentTest variant="vstupny" />,
});
