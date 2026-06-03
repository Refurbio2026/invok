import { createFileRoute } from "@tanstack/react-router";
import { DashboardShell } from "@/components/invok/DashboardShell";

export const Route = createFileRoute("/skola/dashboard")({
  head: () => ({ meta: [{ title: "Školský dashboard – INVOK" }] }),
  component: SkolaDashboard,
});

function SkolaDashboard() {
  return (
    <DashboardShell
      role="Škola"
      title="Prehľad školy"
      subtitle="Profil školy, triedy, učitelia, výsledky a reporty."
      tiles={[
        { title: "Profil školy", description: "Základné údaje a kontakty." },
        { title: "Triedy", description: "Triedy zapojené do programu." },
        { title: "Učitelia", description: "Učitelia a ich triedy." },
        { title: "Výsledky školy", description: "Súhrnné výsledky testov." },
        { title: "Reporty", description: "Reporty pre vedenie školy." },
        { title: "Export CSV/PDF", description: "Stiahnutie dát a reportov." },
      ]}
    />
  );
}
