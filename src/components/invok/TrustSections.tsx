import {
  Accessibility,
  ArrowRight,
  BarChart3,
  BookOpen,
  ClipboardList,
  FileSearch,
  HeartHandshake,
  Laptop,
  MessagesSquare,
  Repeat,
  ShieldCheck,
  Target,
  Users,
} from "lucide-react";
import { Section } from "@/components/invok/Section";

export function ProjectLogicSection() {
  const flow = [
    { I: FileSearch, t: "Analýza potrieb", d: "Mapujeme, čo školy a žiaci skutočne potrebujú." },
    { I: BookOpen, t: "Tvorba obsahu", d: "Vznikajú moduly, metodiky a interaktívne materiály." },
    { I: Laptop, t: "LMS platforma", d: "Obsah žije v dostupnom online vzdelávacom systéme." },
    { I: Users, t: "Workshopy", d: "Praktická aplikácia priamo so žiakmi a učiteľmi." },
    { I: BarChart3, t: "Meranie dopadu", d: "Pre/post testy, analytika, spätná väzba." },
    { I: Repeat, t: "Zlepšovanie", d: "Dáta menia obsah — projekt sa neustále vyvíja." },
  ];

  return (
    <Section alt eyebrow="Logika projektu" title="INVOK nie je len online kurz" subtitle="Je to živý systém — obsah, dáta a spätná väzba sa vzájomne posilňujú a robia program udržateľným aj po skončení financovania.">
      <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-6">
        {flow.map((s, i) => (
          <div key={s.t} className="relative">
            <div className="rounded-2xl bg-card border border-border p-5 shadow-soft h-full">
              <div className="flex items-center gap-2 mb-3">
                <div className="h-9 w-9 rounded-xl bg-primary text-primary-foreground grid place-items-center font-bold text-sm">{i + 1}</div>
                <s.I className="h-5 w-5 text-teal" />
              </div>
              <div className="font-bold text-foreground text-sm">{s.t}</div>
              <p className="mt-1.5 text-xs text-muted-foreground leading-relaxed">{s.d}</p>
            </div>
            {i < flow.length - 1 && (
              <ArrowRight className="hidden lg:block absolute top-1/2 -right-3 -translate-y-1/2 h-4 w-4 text-primary/40 z-10" />
            )}
          </div>
        ))}
      </div>
      <div className="mt-8 rounded-2xl bg-primary/5 border border-primary/20 p-5 text-center">
        <p className="text-sm font-semibold text-foreground">
          obsah → používanie → dáta → zlepšovanie → <span className="text-primary">spoločenský dopad</span>
        </p>
      </div>
    </Section>
  );
}

export function ImpactMethodologySection() {
  const methods = [
    {
      I: ClipboardList,
      t: "Pre/post testy",
      d: "Pred kurzom zmeriame úroveň žiakov, po kurze zmeriame zmenu. Sledujeme kritické myslenie, argumentáciu, mediálnu gramotnosť a podnikavosť.",
    },
    {
      I: BarChart3,
      t: "LMS analytika",
      d: "Aktivita žiakov, dokončenosť kurzov, čas v module, úspešnosť testov a opakované pokusy — všetko transparentne v dátach.",
    },
    {
      I: MessagesSquare,
      t: "Spätná väzba",
      d: "Pravidelné dotazníky a rozhovory s učiteľmi, žiakmi a mentormi. Čo funguje, čo treba upraviť — a podľa toho upravujeme obsah.",
    },
  ];

  return (
    <Section eyebrow="Meranie dopadu" title="Vieme preukázať, že program funguje" subtitle="Najdôležitejšia časť projektu. Každý zásah evidujeme, vyhodnocujeme a transparentne reportujeme.">
      <div className="grid gap-6 md:grid-cols-3">
        {methods.map((m) => (
          <div key={m.t} className="rounded-3xl bg-card border border-border p-7 shadow-soft hover:shadow-card transition">
            <div className="h-12 w-12 rounded-2xl bg-gradient-badge grid place-items-center shadow-soft mb-5">
              <m.I className="h-6 w-6 text-white" />
            </div>
            <h3 className="text-xl font-bold text-foreground">{m.t}</h3>
            <p className="mt-2 text-sm text-muted-foreground leading-relaxed">{m.d}</p>
          </div>
        ))}
      </div>
    </Section>
  );
}

export function TrustBadgesSection() {
  const badges = [
    { I: Accessibility, t: "WCAG 2.1 AA", d: "Plne prístupná platforma s titulkami, textovými prepismi a podporou čítačiek obrazovky." },
    { I: HeartHandshake, t: "Inkluzívny prístup", d: "Obsah prispôsobený aj pre žiakov so špeciálnymi výchovno-vzdelávacími potrebami (ŠVVP)." },
    { I: ShieldCheck, t: "Overené metodiky", d: "Pod dohľadom odborného garanta s priebežnou kontrolou kvality všetkých výstupov." },
    { I: Target, t: "Udržateľnosť po projekte", d: "Metodiky, scenáre hodín a mikro-kurzy zostávajú školám aj po skončení financovania." },
  ];

  return (
    <Section alt eyebrow="Prečo nám môžete dôverovať" title="Štandardy, na ktorých staviame">
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {badges.map((b) => (
          <div key={b.t} className="rounded-3xl bg-card border-2 border-primary/15 p-6 shadow-soft hover:border-primary/40 transition">
            <div className="h-12 w-12 rounded-2xl bg-primary/10 grid place-items-center mb-4">
              <b.I className="h-6 w-6 text-primary" />
            </div>
            <h3 className="font-bold text-foreground">{b.t}</h3>
            <p className="mt-2 text-sm text-muted-foreground leading-relaxed">{b.d}</p>
          </div>
        ))}
      </div>
    </Section>
  );
}