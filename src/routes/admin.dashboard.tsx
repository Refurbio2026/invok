import { createFileRoute } from "@tanstack/react-router";
import { DashboardShell } from "@/components/invok/DashboardShell";

export const Route = createFileRoute("/admin/dashboard")({
  head: () => ({ meta: [{ title: "Admin dashboard – INVOK" }] }),
  component: AdminDashboard,
});

function AdminDashboard() {
  return (
    <DashboardShell
      role="Administrátor"
      title="Prehľad systému INVOK"
      subtitle="Správa škôl, používateľov, testov, výsledkov a obsahu programu."
      tiles={[
        { title: "Školy", description: "Zoznam zapojených škôl a stav registrácií." },
        { title: "Triedy", description: "Triedy naprieč školami." },
        { title: "Používatelia", description: "Učitelia, žiaci a koordinátori." },
        { title: "Testy", description: "Vstupné a výstupné testy kompetencií." },
        { title: "Výsledky", description: "Agregované výsledky a štatistiky." },
        { title: "Články", description: "Správa noviniek a článkov." },
        { title: "Dokumenty", description: "Metodiky, manuály a materiály." },
      ]}
    />
  );
}
