import { createFileRoute, Link } from "@tanstack/react-router";
import { AuthShell } from "@/components/invok/AuthShell";

export const Route = createFileRoute("/ziak/prihlasenie")({
  head: () => ({ meta: [{ title: "Prihlásenie žiaka – INVOK" }] }),
  component: () => (
    <AuthShell
      title="Prihlásenie žiaka"
      subtitle="Vyplnenie testov cez anonymný kód pripravujeme."
    >
      <p className="text-sm text-muted-foreground">
        Modul pre žiakov a vyplnenie testov cez anonymný kód spustíme po dokončení
        testovacieho modulu (ďalšia fáza).
      </p>
      <div className="mt-4">
        <Link to="/prihlasenie" className="text-primary hover:underline text-sm">
          ← Späť na výber prihlásenia
        </Link>
      </div>
    </AuthShell>
  ),
});
