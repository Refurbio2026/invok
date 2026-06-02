import { createFileRoute } from "@tanstack/react-router";
import { AssessmentTest } from "@/components/invok/AssessmentTest";

export const Route = createFileRoute("/testy/vystupny-test")({
  head: () => ({
    meta: [
      { title: "Výstupný kompetenčný test | INVOK" },
      { name: "description", content: "Výstupné meranie kompetencií žiaka po ukončení programu INVOK." },
    ],
  }),
  component: () => <AssessmentTest variant="vystupny" />,
});
