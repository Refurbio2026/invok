import { createFileRoute, Link } from "@tanstack/react-router";
import { AuthShell } from "@/components/invok/AuthShell";

export const Route = createFileRoute("/ucitel/prihlasenie")({
  head: () => ({ meta: [{ title: "Prihlásenie učiteľa – INVOK" }] }),
  component: () => (
    <AuthShell title="Prihlásenie učiteľa" subtitle="Bude dostupné v ďalšej fáze.">
      <p className="text-sm text-muted-foreground">
        Účty pre učiteľov spravuje koordinátor školy. Modul „Učitelia“ pripravujeme
        v ďalšej fáze projektu.
      </p>
      <div className="mt-4">
        <Link to="/prihlasenie" className="text-primary hover:underline text-sm">
          ← Späť na výber prihlásenia
        </Link>
      </div>
    </AuthShell>
  ),
});
