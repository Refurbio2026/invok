import { createFileRoute } from "@tanstack/react-router";
import { DashboardShell } from "@/components/invok/DashboardShell";

export const Route = createFileRoute("/ucitel/dashboard")({
  head: () => ({ meta: [{ title: "Učiteľský dashboard – INVOK" }] }),
  component: UcitelDashboard,
});

function UcitelDashboard() {
  return (
    <DashboardShell
      role="Učiteľ"
      title="Moja výučba"
      subtitle="Triedy, žiaci, moduly, testy a odovzdané výstupy."
      tiles={[
        { title: "Moje triedy", description: "Triedy, ktoré učím." },
        { title: "Žiaci", description: "Zoznam žiakov v triedach." },
        { title: "Moduly", description: "Priebeh modulov INVOK." },
        { title: "Testy", description: "Vstupné a výstupné testy." },
        { title: "Výsledky triedy", description: "Výsledky podľa tried." },
        { title: "Odovzdané výstupy", description: "Zadania a portfóliá žiakov." },
      ]}
    />
  );
}
