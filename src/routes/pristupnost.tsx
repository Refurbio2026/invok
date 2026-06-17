import { createFileRoute } from "@tanstack/react-router";
import { Header } from "@/components/invok/Header";
import { Footer } from "@/components/invok/Footer";

export const Route = createFileRoute("/pristupnost")({
  head: () => ({
    meta: [
      { title: "Vyhlásenie o prístupnosti – INVOK" },
      {
        name: "description",
        content:
          "Vyhlásenie o prístupnosti webového sídla INVOK podľa odporúčaní WCAG 2.1 AA.",
      },
      { property: "og:title", content: "Vyhlásenie o prístupnosti – INVOK" },
      {
        property: "og:description",
        content:
          "Záväzok PSC n.o. zabezpečovať digitálnu prístupnosť portálu INVOK.",
      },
    ],
  }),
  component: Page,
});

function Page() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main>
        <section className="border-b border-border bg-gradient-to-b from-muted/40 to-background">
          <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 py-16 md:py-20">
            <span className="inline-block text-xs font-semibold uppercase tracking-wider text-primary mb-4">
              Právne informácie
            </span>
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-foreground">
              Vyhlásenie o prístupnosti
            </h1>
          </div>
        </section>

        <article className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 py-12 md:py-16">
          <p className="text-muted-foreground">
            PSC n.o. sa zaväzuje zabezpečovať prístupnosť webového sídla INVOK
            pre čo najširší okruh používateľov vrátane osôb so zdravotným
            znevýhodnením.
          </p>
          <p className="mt-4 text-muted-foreground">
            Pri vývoji a prevádzke portálu sa usilujeme dodržiavať zásady
            digitálnej prístupnosti a priebežne zlepšovať používateľský komfort
            na rôznych zariadeniach a platformách.
          </p>

          <H2>Stav súladu</H2>
          <p className="text-muted-foreground">
            Webové sídlo INVOK je navrhované s cieľom dosiahnuť čo najvyššiu
            úroveň prístupnosti v súlade s odporúčaniami WCAG 2.1 na úrovni AA.
          </p>

          <H2>Spätná väzba a kontakt</H2>
          <p className="text-muted-foreground">
            Ak narazíte na problém s prístupnosťou alebo máte návrh na
            zlepšenie, kontaktujte nás:
          </p>
          <p className="mt-3">
            <strong>PSC n.o.</strong>
            <br />
            E-mail:{" "}
            <a
              className="text-primary hover:underline"
              href="mailto:invok@pscno.sk"
            >
              invok@pscno.sk
            </a>
          </p>
          <p className="mt-4 text-muted-foreground">
            Na podnety týkajúce sa prístupnosti reagujeme priebežne a snažíme sa
            ich riešiť v primeranom čase.
          </p>

          <H2>Aktualizácia vyhlásenia</H2>
          <p className="text-muted-foreground">
            Toto vyhlásenie môže byť priebežne aktualizované v závislosti od
            vývoja portálu a legislatívnych požiadaviek.
          </p>
        </article>
      </main>
      <Footer />
    </div>
  );
}

function H2({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="mt-10 mb-4 text-2xl font-bold tracking-tight text-foreground">
      {children}
    </h2>
  );
}
