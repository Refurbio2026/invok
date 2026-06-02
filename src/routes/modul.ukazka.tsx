import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, BarChart3, Briefcase, ClipboardCheck, GraduationCap, Lightbulb, Mic, PlayCircle } from "lucide-react";
import { Header } from "@/components/invok/Header";
import { Footer } from "@/components/invok/Footer";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/modul/ukazka")({
  head: () => ({
    meta: [
      { title: "Ukážkový modul – Inovátor školy | INVOK" },
      { name: "description", content: "Pozrite si ukážku vzdelávacieho modulu INVOK: video lekcia, zadanie, hlasovanie, projektová karta a prezentácia riešenia." },
      { property: "og:title", content: "Ukážkový modul INVOK – Inovátor školy" },
      { property: "og:description", content: "Štruktúra modulu programu INVOK pre žiakov 8. a 9. ročníka ZŠ." },
    ],
  }),
  component: SampleModulePage,
});

function SampleModulePage() {
  const steps = [
    { I: Mic, t: "Video lekcia", d: "10-minútová úvodná lekcia, v ktorej odborník z praxe vysvetlí, ako rozpoznať príležitosti na zlepšenie vo svojom okolí." },
    { I: ClipboardCheck, t: "Zadanie", d: "Žiaci v tímoch identifikujú jeden konkrétny problém vlastnej školy, ktorý chcú riešiť – od priestorov cez komunikáciu až po environment." },
    { I: BarChart3, t: "Hlasovanie", d: "Tímy si navzájom predstavia nápady. Trieda hlasuje, ktoré projekty majú najväčší potenciál a posúvajú sa do realizácie." },
    { I: Briefcase, t: "Projektová karta", d: "Vybrané tímy spracujú projektovú kartu – cieľ, harmonogram, role v tíme, potrebné zdroje a merateľné indikátory úspechu." },
    { I: GraduationCap, t: "Prezentácia riešenia", d: "Záverečná prezentácia pred porotou (vedenie školy, učiteľ, externý mentor). Spätná väzba a rozhodnutie o pilotnej realizácii." },
  ];
  return (
    <div className="bg-background">
      <Header />
      <main>
        <section className="bg-gradient-subtle">
          <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 py-16">
            <Button asChild variant="ghost" size="sm" className="mb-6">
              <Link to="/"><ArrowLeft className="h-4 w-4" /> Späť na hlavnú stránku</Link>
            </Button>
            <div className="flex items-center gap-3 mb-4">
              <div className="h-12 w-12 rounded-2xl bg-gradient-badge grid place-items-center shadow-soft">
                <Lightbulb className="h-6 w-6 text-white" />
              </div>
              <span className="text-xs font-bold uppercase tracking-wider text-teal bg-accent px-3 py-1 rounded-full">Modul 1 · Ukážka</span>
            </div>
            <h1 className="text-4xl sm:text-5xl font-extrabold text-foreground">Inovátor školy</h1>
            <p className="mt-4 text-lg text-muted-foreground max-w-3xl">
              Praktický modul, v ktorom žiaci 8. a 9. ročníka hľadajú konkrétne príležitosti na zlepšenie vlastnej školy a realizujú vlastný mini-projekt s merateľným výstupom.
            </p>
          </div>
        </section>

        <section className="py-16">
          <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
            <div className="rounded-3xl overflow-hidden border border-border shadow-card aspect-video bg-gradient-to-br from-primary via-primary/70 to-teal grid place-items-center text-white">
              <div className="text-center">
                <PlayCircle className="h-16 w-16 mx-auto mb-3 opacity-90" />
                <div className="font-bold">Video lekcia · Ako rozpoznať príležitosť</div>
                <div className="text-sm text-white/80 mt-1">Ukážka pripravovanej lekcie</div>
              </div>
            </div>

            <ol className="mt-12 space-y-6">
              {steps.map(({ I, t, d }, i) => (
                <li key={t} className="rounded-3xl bg-card border border-border p-7 shadow-soft flex gap-5">
                  <div className="shrink-0">
                    <div className="h-12 w-12 rounded-2xl bg-primary text-primary-foreground grid place-items-center font-bold shadow-soft">
                      {i + 1}
                    </div>
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <I className="h-5 w-5 text-teal" />
                      <h2 className="text-xl font-bold text-foreground">{t}</h2>
                    </div>
                    <p className="mt-2 text-sm text-muted-foreground leading-relaxed">{d}</p>
                  </div>
                </li>
              ))}
            </ol>

            <div className="mt-12 rounded-3xl bg-gradient-badge text-white p-8 shadow-glow flex flex-col sm:flex-row gap-4 sm:items-center sm:justify-between">
              <div>
                <h3 className="text-xl font-bold">Chcete tento modul vo vašej škole?</h3>
                <p className="text-white/85 text-sm mt-1">Zapojenie do programu INVOK je pre školy bezplatné.</p>
              </div>
              <Button asChild size="lg" className="bg-white text-primary hover:bg-white/90">
                <Link to="/" hash="registracia">Zapojiť školu</Link>
              </Button>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
