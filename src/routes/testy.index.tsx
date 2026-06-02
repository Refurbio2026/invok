import { createFileRoute, Link } from "@tanstack/react-router";
import {
  Accordion, AccordionContent, AccordionItem, AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { Header } from "@/components/invok/Header";
import { Footer } from "@/components/invok/Footer";
import { Section } from "@/components/invok/Section";
import { RadarChart } from "@/components/invok/RadarChart";
import { COMPETENCIES, MAX_PER_COMP } from "@/data/assessment";
import {
  ArrowRight, BookOpen, CheckCircle2, ClipboardList, FileBarChart,
  GraduationCap, Layers, Sparkles, Timer, TrendingUp,
} from "lucide-react";

export const Route = createFileRoute("/testy/")({
  head: () => ({
    meta: [
      { title: "Kompetenčné testy INVOK – meranie pokroku žiakov" },
      { name: "description", content: "Vstupné a výstupné kompetenčné testovanie programu INVOK pre žiakov 8. a 9. ročníka ZŠ. Automatické vyhodnotenie šiestich kľúčových kompetencií." },
      { property: "og:title", content: "Kompetenčné testy INVOK" },
      { property: "og:description", content: "Meranie kompetencií, ktoré ukazuje skutočný pokrok žiakov v programe INVOK." },
    ],
    links: [{ rel: "canonical", href: "/testy" }],
  }),
  component: TestyPage,
});

function TestyPage() {
  return (
    <div className="bg-background">
      <Header />
      <main>
        <HeroTesty />
        <HowItWorks />
        <Competencies />
        <ChooseTest />
        <WhatWeMeasure />
        <SampleResults />
        <FAQ />
      </main>
      <Footer />
    </div>
  );
}

function HeroTesty() {
  return (
    <section className="relative overflow-hidden bg-gradient-subtle">
      <div className="absolute -top-40 -right-40 h-[480px] w-[480px] rounded-full bg-gradient-badge opacity-15 blur-3xl" />
      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-16 pb-20 sm:pt-24 sm:pb-24">
        <div className="grid gap-12 lg:grid-cols-2 lg:gap-16 items-center">
          <div>
            <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-accent text-teal text-xs font-semibold uppercase tracking-wider">
              <Sparkles className="h-3.5 w-3.5" /> Kompetenčné testy INVOK
            </span>
            <h1 className="mt-6 text-4xl sm:text-5xl lg:text-6xl font-extrabold leading-tight text-foreground">
              Meranie kompetencií, ktoré ukazuje <span className="text-gradient">skutočný pokrok</span>
            </h1>
            <p className="mt-6 text-lg text-muted-foreground leading-relaxed">
              INVOK využíva vstupné a výstupné kompetenčné testovanie, vďaka ktorému dokážeme sledovať rozvoj žiakov počas programu. Výsledky pomáhajú školám, pedagógom aj samotným žiakom lepšie pochopiť ich silné stránky a oblasti na rozvoj.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Button asChild size="lg" className="bg-gradient-badge text-white hover:opacity-90 shadow-glow">
                <a href="#vyplnit-test">Spustiť testovanie <ArrowRight className="ml-1 h-4 w-4" /></a>
              </Button>
              <Button asChild size="lg" variant="outline">
                <a href="#ako-funguje">Ako funguje testovanie</a>
              </Button>
            </div>
            <div className="mt-8 grid gap-3 sm:grid-cols-3 text-sm">
              <Badge I={Timer} t="~15 minút" />
              <Badge I={ClipboardList} t="48 + 4 otázok" />
              <Badge I={FileBarChart} t="Automatické vyhodnotenie" />
            </div>
          </div>

          <div className="rounded-3xl bg-card border border-border p-6 shadow-card">
            <h3 className="font-bold text-foreground mb-4">Ukážka kompetenčného profilu</h3>
            <RadarChart
              data={[
                { label: "Podnikavosť", value: 33, max: 40 },
                { label: "Kritické m.", value: 31, max: 40 },
                { label: "Tímová sp.", value: 34, max: 40 },
                { label: "Digitálne", value: 35, max: 40 },
                { label: "Komunikácia", value: 30, max: 40 },
                { label: "Sebahodn.", value: 34, max: 40 },
              ]}
              compare={[
                { label: "Podnikavosť", value: 24, max: 40 },
                { label: "Kritické m.", value: 22, max: 40 },
                { label: "Tímová sp.", value: 27, max: 40 },
                { label: "Digitálne", value: 26, max: 40 },
                { label: "Komunikácia", value: 23, max: 40 },
                { label: "Sebahodn.", value: 25, max: 40 },
              ]}
            />
            <div className="mt-4 flex justify-center gap-5 text-xs text-muted-foreground">
              <span className="inline-flex items-center gap-2"><span className="h-3 w-3 rounded-sm bg-teal/40" /> Vstup</span>
              <span className="inline-flex items-center gap-2"><span className="h-3 w-3 rounded-sm bg-primary" /> Výstup</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function Badge({ I, t }: { I: typeof Timer; t: string }) {
  return (
    <div className="rounded-xl border border-border bg-card p-3 flex items-center gap-2">
      <I className="h-4 w-4 text-teal" />
      <span className="font-semibold text-foreground">{t}</span>
    </div>
  );
}

function HowItWorks() {
  const steps = [
    { I: ClipboardList, t: "Vstupné testovanie", d: "Žiak vyplní kompetenčný dotazník pred začiatkom programu INVOK." },
    { I: BookOpen, t: "Absolvovanie modulov", d: "Žiak postupne prechádza jednotlivými modulmi programu." },
    { I: ClipboardList, t: "Výstupné testovanie", d: "Po ukončení programu sa vykoná opätovné meranie tých istých oblastí." },
    { I: TrendingUp, t: "Vyhodnotenie progresu", d: "Systém automaticky porovná výsledky a vyhodnotí pokrok žiaka." },
    { I: FileBarChart, t: "Report pre školu", d: "Škola získa prehľadné výsledky, štatistiky a podklady pre vedenie." },
  ];
  return (
    <Section id="ako-funguje" alt eyebrow="Proces" title="Ako funguje testovanie">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
        {steps.map((s, i) => (
          <div key={s.t} className="relative rounded-3xl bg-card border border-border p-6 shadow-soft">
            <div className="absolute -top-3 left-6 h-9 px-3 rounded-full bg-primary text-primary-foreground grid place-items-center text-xs font-bold uppercase tracking-wider">
              Krok {i + 1}
            </div>
            <s.I className="h-6 w-6 text-teal mt-4 mb-3" />
            <h3 className="font-bold text-foreground">{s.t}</h3>
            <p className="mt-2 text-sm text-muted-foreground leading-relaxed">{s.d}</p>
          </div>
        ))}
      </div>
    </Section>
  );
}

function Competencies() {
  return (
    <Section eyebrow="Šesť oblastí" title="Oblasti kompetencií">
      <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
        {COMPETENCIES.map((c, i) => (
          <div key={c.key} className="rounded-3xl bg-card border border-border p-7 shadow-soft hover:shadow-card transition">
            <div className="flex items-center gap-3 mb-4">
              <div className="h-10 w-10 rounded-2xl bg-gradient-badge text-white grid place-items-center font-bold shadow-soft">
                {i + 1}
              </div>
              <h3 className="font-bold text-foreground">{c.label}</h3>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed">{c.desc}</p>
          </div>
        ))}
      </div>
    </Section>
  );
}

function ChooseTest() {
  const variants = [
    {
      slug: "vstupny-test" as const,
      tone: "from-primary to-primary/70",
      tag: "Pred programom",
      title: "Vstupný test",
      d: "Vstupné meranie kompetencií žiaka pred začatím programu INVOK.",
    },
    {
      slug: "vystupny-test" as const,
      tone: "from-teal to-primary",
      tag: "Po programe",
      title: "Výstupný test",
      d: "Záverečné meranie kompetencií po ukončení modulov a workshopov.",
    },
  ];
  return (
    <Section id="vyplnit-test" alt eyebrow="Vyplnenie testu" title="Vyplnenie kompetenčného testu" subtitle="Test si môžete vyplniť v dvoch variantoch. Oba prebiehajú v identickej štruktúre, aby boli výsledky porovnateľné.">
      <div className="grid gap-6 md:grid-cols-2">
        {variants.map((v) => (
          <div key={v.slug} className={`rounded-3xl text-white p-8 shadow-card bg-gradient-to-br ${v.tone}`}>
            <span className="inline-block text-xs font-bold uppercase tracking-wider bg-white/15 px-3 py-1 rounded-full">{v.tag}</span>
            <h3 className="mt-4 text-2xl font-extrabold">{v.title}</h3>
            <p className="mt-2 text-white/85">{v.d}</p>
            <ul className="mt-5 space-y-2 text-sm">
              {[
                "približne 15 minút",
                "48 hodnotiacich otázok",
                "4 otvorené otázky",
                "automatické vyhodnotenie",
              ].map((t) => (
                <li key={t} className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-amber" />{t}</li>
              ))}
            </ul>
            <Button asChild size="lg" className="mt-6 bg-white text-primary hover:bg-white/90">
              <Link to="/testy/$slug" params={{ slug: v.slug }}>Spustiť {v.title.toLowerCase()} <ArrowRight className="ml-1 h-4 w-4" /></Link>
            </Button>
          </div>
        ))}
      </div>
    </Section>
  );
}

function WhatWeMeasure() {
  return (
    <Section eyebrow="Štruktúra hodnotenia" title="Čo sa meria" subtitle="Pre každú kompetenciu meriame osem položiek na päťbodovej škále. Maximum je 40 bodov na oblasť, 240 bodov spolu.">
      <div className="grid gap-8 lg:grid-cols-5 items-start">
        <div className="lg:col-span-3">
          <div className="overflow-hidden rounded-3xl border border-border shadow-card bg-card">
            <div className="grid grid-cols-12 bg-muted/60 text-xs font-bold text-muted-foreground uppercase tracking-wide">
              <div className="col-span-6 p-4">Oblasť</div>
              <div className="col-span-2 p-4 text-center">Otázky</div>
              <div className="col-span-2 p-4 text-center">Max. bodov</div>
              <div className="col-span-2 p-4 text-center">Váha</div>
            </div>
            {COMPETENCIES.map((c) => (
              <div key={c.key} className="grid grid-cols-12 border-t border-border text-sm">
                <div className="col-span-6 p-4">
                  <div className="font-semibold text-foreground">{c.label}</div>
                  <div className="text-xs text-muted-foreground mt-1">{c.desc}</div>
                </div>
                <div className="col-span-2 p-4 text-center font-bold text-foreground">8</div>
                <div className="col-span-2 p-4 text-center font-bold text-primary">{MAX_PER_COMP}</div>
                <div className="col-span-2 p-4 text-center text-muted-foreground">1/6</div>
              </div>
            ))}
          </div>
        </div>
        <div className="lg:col-span-2 rounded-3xl bg-card border border-border p-6 shadow-card">
          <h3 className="font-bold text-foreground mb-3">Ukážka výsledku</h3>
          <RadarChart
            data={COMPETENCIES.map((c, i) => ({ label: c.short, value: [33, 31, 34, 35, 30, 34][i], max: 40 }))}
          />
          <p className="mt-3 text-xs text-muted-foreground">Radar graf zobrazuje rozloženie kompetencií žiaka po skončení programu.</p>
        </div>
      </div>
    </Section>
  );
}

function SampleResults() {
  const items = [
    { l: "Podnikavosť", pre: 24, post: 33 },
    { l: "Kritické myslenie", pre: 22, post: 31 },
    { l: "Tímová spolupráca", pre: 27, post: 34 },
    { l: "Komunikácia", pre: 23, post: 30 },
    { l: "Digitálne zručnosti", pre: 26, post: 35 },
    { l: "Sebahodnotenie", pre: 25, post: 34 },
  ];
  return (
    <Section alt eyebrow="Ukážka výsledkov" title="Ako vyzerá progres žiaka">
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {items.map((it) => (
          <div key={it.l} className="rounded-3xl bg-card border border-border p-6 shadow-soft">
            <h3 className="font-bold text-foreground">{it.l}</h3>
            <div className="mt-3 flex items-end gap-3">
              <span className="text-3xl font-extrabold text-foreground">{it.pre}</span>
              <ArrowRight className="h-5 w-5 text-muted-foreground mb-1.5" />
              <span className="text-3xl font-extrabold text-primary">{it.post}</span>
              <span className="ml-auto text-sm font-bold text-teal">+{it.post - it.pre}</span>
            </div>
            <div className="mt-4 h-2 rounded-full bg-muted overflow-hidden">
              <div className="h-full bg-gradient-badge" style={{ width: `${(it.post / 40) * 100}%` }} />
            </div>
            <div className="mt-2 flex justify-between text-[11px] text-muted-foreground">
              <span>0</span><span>max. 40</span>
            </div>
          </div>
        ))}
      </div>
      <p className="mt-8 text-sm text-muted-foreground italic max-w-3xl">
        „Výsledky slúžia na sledovanie progresu žiakov počas programu INVOK a umožňujú školám objektívne vyhodnotiť rozvoj kompetencií."
      </p>
    </Section>
  );
}

function FAQ() {
  const faqs = [
    { q: "Sú výsledky anonymné?", a: "Áno. Výsledky sa v rámci platformy spracovávajú anonymizovane a škola dostáva agregované dáta. Žiak vidí len svoj vlastný výsledok." },
    { q: "Ako dlho trvá vyplnenie?", a: "Test je navrhnutý tak, aby ho väčšina žiakov stihla do 15 minút. Žiadne otázky nemajú časový limit." },
    { q: "Kto vidí výsledky?", a: "Žiak vidí svoj výsledok. Pedagóg a vedenie školy vidia agregované výsledky triedy a ročníka. Tretie strany k údajom nemajú prístup." },
    { q: "Môže škola porovnávať jednotlivé ročníky?", a: "Áno. Reporty umožňujú porovnanie medzi ročníkmi, triedami a medzi vstupným a výstupným meraním v rámci programu." },
    { q: "Ako sa meria progres?", a: "Progres sa počíta ako rozdiel skóre medzi vstupným a výstupným testom v každej z 6 oblastí kompetencií, plus celkové skóre 0–240 bodov." },
  ];
  return (
    <Section eyebrow="FAQ" title="Často kladené otázky">
      <div className="max-w-3xl">
        <Accordion type="single" collapsible className="space-y-3">
          {faqs.map((f, i) => (
            <AccordionItem key={i} value={`f${i}`} className="border border-border rounded-2xl px-5 bg-card shadow-soft">
              <AccordionTrigger className="text-left font-semibold hover:no-underline"><GraduationCap className="h-4 w-4 text-teal mr-2 inline" />{f.q}</AccordionTrigger>
              <AccordionContent className="text-muted-foreground">{f.a}</AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
        <p className="mt-6 text-xs text-muted-foreground flex items-center gap-2">
          <Layers className="h-4 w-4" /> Modul je pripravený na napojenie na Lovable Cloud pre automatické ukladanie výsledkov.
        </p>
      </div>
    </Section>
  );
}
