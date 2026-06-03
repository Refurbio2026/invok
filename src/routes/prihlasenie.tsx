import { createFileRoute, Link } from "@tanstack/react-router";
import { Shield, Building2, GraduationCap, User, ArrowRight } from "lucide-react";
import { Header } from "@/components/invok/Header";
import { Footer } from "@/components/invok/Footer";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/prihlasenie")({
  head: () => ({
    meta: [
      { title: "Prihlásenie – INVOK" },
      {
        name: "description",
        content:
          "Prihlásenie do systému INVOK pre administrátorov, školy, učiteľov a žiakov.",
      },
      { property: "og:title", content: "Prihlásenie – INVOK" },
    ],
  }),
  component: PrihlasenieRozcestnik,
});

const roles = [
  {
    title: "Administrátor",
    description: "Správa škôl, používateľov, testov, výsledkov a obsahu.",
    href: "/admin/prihlasenie",
    icon: Shield,
  },
  {
    title: "Škola",
    description: "Profil školy, triedy, učitelia, výsledky a reporty.",
    href: "/skola/prihlasenie",
    icon: Building2,
  },
  {
    title: "Učiteľ",
    description: "Triedy, žiaci, priebeh modulov a výsledky testov.",
    href: "/ucitel/prihlasenie",
    icon: GraduationCap,
  },
  {
    title: "Žiak",
    description: "Moduly, testy, výsledky, odznaky a portfólio.",
    href: "/ziak/prihlasenie",
    icon: User,
  },
];

function PrihlasenieRozcestnik() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <h1 className="text-3xl sm:text-4xl font-bold text-foreground">
            Prihlásenie do systému INVOK
          </h1>
          <p className="text-muted-foreground mt-3">
            Vyberte typ účtu, s ktorým sa chcete prihlásiť.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {roles.map((r) => {
            const Icon = r.icon;
            return (
              <div
                key={r.href}
                className="bg-card border border-border rounded-2xl p-6 flex flex-col shadow-soft hover:shadow-lg transition-shadow"
              >
                <div className="h-12 w-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center mb-4">
                  <Icon className="h-6 w-6" />
                </div>
                <h2 className="text-lg font-semibold text-foreground">
                  {r.title}
                </h2>
                <p className="text-sm text-muted-foreground mt-1 flex-1">
                  {r.description}
                </p>
                <Button
                  asChild
                  className="mt-5 rounded-full bg-primary text-primary-foreground"
                >
                  <Link to={r.href}>
                    Prihlásiť sa <ArrowRight className="h-4 w-4 ml-1" />
                  </Link>
                </Button>
              </div>
            );
          })}
        </div>

        <p className="text-center text-sm text-muted-foreground mt-10">
          Ešte nie ste v programe?{" "}
          <Link
            to="/registracia-skoly"
            className="text-primary font-medium hover:underline"
          >
            Registrovať školu
          </Link>
        </p>
      </main>
      <Footer />
    </div>
  );
}
