import { createFileRoute } from "@tanstack/react-router";
import { Header } from "@/components/invok/Header";
import { Footer } from "@/components/invok/Footer";

export const Route = createFileRoute("/podmienky-pouzivania")({
  head: () => ({
    meta: [
      { title: "Podmienky používania – INVOK" },
      {
        name: "description",
        content:
          "Podmienky používania portálu INVOK prevádzkovaného PSC n.o.",
      },
      { property: "og:title", content: "Podmienky používania – INVOK" },
      {
        property: "og:description",
        content: "Pravidlá používania portálu INVOK pre školy a používateľov.",
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
              Podmienky používania
            </h1>
          </div>
        </section>

        <article className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 py-12 md:py-16">
          <p className="text-muted-foreground">
            Portál INVOK prevádzkuje PSC n.o. za účelom poskytovania
            vzdelávacích aktivít, informačných služieb a podpory rozvoja
            kompetencií žiakov základných škôl.
          </p>
          <p className="mt-4 text-muted-foreground">
            Používaním webového sídla používateľ vyjadruje súhlas s týmito
            podmienkami.
          </p>

          <H2>Používanie portálu</H2>
          <p className="text-muted-foreground">
            Používatelia sú povinní využívať portál v súlade s platnými právnymi
            predpismi a spôsobom, ktorý neohrozuje bezpečnosť, dostupnosť alebo
            funkčnosť systému.
          </p>

          <H2>Duševné vlastníctvo</H2>
          <p className="text-muted-foreground">
            Obsah portálu vrátane textov, grafiky, metodických materiálov, videí
            a ďalších vzdelávacích zdrojov je chránený príslušnými právnymi
            predpismi a bez súhlasu prevádzkovateľa ho nie je možné neoprávnene
            šíriť alebo komerčne využívať.
          </p>

          <H2>Zodpovednosť</H2>
          <p className="text-muted-foreground">
            PSC n.o. vynakladá primerané úsilie na zabezpečenie správnosti a
            aktuálnosti informácií zverejnených na portáli, avšak nezodpovedá za
            prípadné škody spôsobené používaním zverejneného obsahu.
          </p>

          <H2>Zmeny podmienok</H2>
          <p className="text-muted-foreground">
            Prevádzkovateľ si vyhradzuje právo tieto podmienky primerane
            aktualizovať. Aktuálna verzia je vždy dostupná na webovom sídle.
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
