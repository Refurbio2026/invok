import { createFileRoute } from "@tanstack/react-router";
import { DashboardShell } from "@/components/invok/DashboardShell";

export const Route = createFileRoute("/ziak/dashboard")({
  head: () => ({ meta: [{ title: "Žiacky dashboard – INVOK" }] }),
  component: ZiakDashboard,
});

function ZiakDashboard() {
  return (
    <DashboardShell
      role="Žiak"
      title="Moja cesta INVOK"
      subtitle="Tvoje moduly, testy, výsledky, odznaky a portfólio."
      tiles={[
        { title: "Moje moduly", description: "Aktívne a dokončené moduly." },
        { title: "Moje testy", description: "Vstupný a výstupný test." },
        { title: "Moje výsledky", description: "Tvoj pokrok a skóre." },
        { title: "Moje odznaky", description: "Získané ocenenia." },
        { title: "Moje portfólio", description: "Tvoje výstupy a projekty." },
      ]}
    />
  );
}
