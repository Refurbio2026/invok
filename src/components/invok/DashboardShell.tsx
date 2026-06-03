import { ReactNode } from "react";
import { Header } from "@/components/invok/Header";
import { Footer } from "@/components/invok/Footer";

type Tile = { title: string; description?: string; href?: string };

type Props = {
  title: string;
  subtitle?: string;
  role: string;
  tiles: Tile[];
  children?: ReactNode;
};

export function DashboardShell({ title, subtitle, role, tiles, children }: Props) {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10">
        <div className="mb-8">
          <span className="inline-block text-xs font-medium uppercase tracking-wider text-primary bg-primary/10 rounded-full px-3 py-1">
            {role}
          </span>
          <h1 className="mt-3 text-3xl font-bold text-foreground">{title}</h1>
          {subtitle && (
            <p className="text-muted-foreground mt-2 max-w-2xl">{subtitle}</p>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {tiles.map((t) => (
            <div
              key={t.title}
              className="bg-card border border-border rounded-xl p-5 hover:shadow-soft transition-shadow"
            >
              <h3 className="font-semibold text-foreground">{t.title}</h3>
              {t.description && (
                <p className="text-sm text-muted-foreground mt-1">
                  {t.description}
                </p>
              )}
            </div>
          ))}
        </div>

        {children}

        <p className="text-xs text-muted-foreground mt-10">
          Placeholder dashboard. Po napojení na Supabase Auth a databázu sa tu
          zobrazia reálne dáta.
        </p>
      </main>
      <Footer />
    </div>
  );
}
