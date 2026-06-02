import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import heroImg from "@/assets/hero-students.jpg";
import { Header } from "@/components/invok/Header";
import { Footer } from "@/components/invok/Footer";
import { Section } from "@/components/invok/Section";
import { ImpactMethodologySection, ProjectLogicSection, TrustBadgesSection } from "@/components/invok/TrustSections";
import {
  SchoolGainsSection, StudentGainsSection, SchoolDashboardSection, ReportPreviewSection,
  TimeCommitmentSection, TeamSection, TestimonialsSection, SchoolsLocationMapSection,
  FundingSection, ComparisonSection, SampleModuleSection,
} from "@/components/invok/CredibilitySections";
import { RegistrationForm } from "@/components/invok/RegistrationForm";

import { ReadinessTest } from "@/components/invok/ReadinessTest";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Accordion, AccordionContent, AccordionItem, AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Brain, Eye, Rocket, Laptop, MessageSquare, Users, GraduationCap,
  Sparkles, BarChart3, HeartHandshake, BookOpen, Award, ArrowRight,
  CheckCircle2, XCircle, Mail, Phone, MapPin, Search, PlayCircle, MapPinned,
  Calendar, School, Trophy, ClipboardCheck,
} from "lucide-react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "INVOK – Pomáhame školám pripraviť žiakov na život po škole" },
      { name: "description", content: "Bezplatný trojročný program INVOK rozvíja kritické myslenie, finančnú gramotnosť, komunikáciu a tímovú spoluprácu u žiakov 8. a 9. ročníka základných škôl na Slovensku." },
      { property: "og:title", content: "INVOK – Kompetencie pre budúcnosť" },
      { property: "og:description", content: "Národný vzdelávací program pre základné školy na Slovensku." },
      { property: "og:type", content: "website" },
      { property: "og:url", content: "/" },
    ],
    links: [{ rel: "canonical", href: "/" }],
  }),
  component: Page,
});

function Page() {
  return (
    <div id="top" className="bg-background">
      <Header />
      <main>
        <Hero />
        <WhySchools />
        <ValueBoxesSection />
        <NumbersSection />
        <CompetenciesSection />
        <ComparisonSection />
        <ModulesSection />
        <SampleModuleSection />
        <WhatSchoolDoesntNeedSection />
        <ValueSection />
        <SchoolGainsSection />
        <StudentGainsSection />
        <ProjectLogicSection />
        <HowItWorksSection />
        <CompetencyMeasurementSection />
        <TimeCommitmentSection />
        <HarmonogramSection />
        <ImpactMethodologySection />
        <SchoolDashboardSection />
        <ReportPreviewSection />
        <TrustBadgesSection />
        <SampleTestsSection />
        <PlatformSection />
        <VideotekaSection />
        <SchoolsMapSection />
        <SchoolsLocationMapSection />
        <CaseStudiesSection />
        <TestimonialsSection />
        <ImpactSection />
        <TeamSection />
        <FundingSection />
        <NewsSection />
        <ReadinessSection />
        <RegistrationSection />
        <FaqSection />
        <PartnersSection />
        <ContactSection />
      </main>
      <Footer />
    </div>
  );
}

/* ---------------- HERO ---------------- */
function Hero() {
  return (
    <section className="relative overflow-hidden bg-gradient-subtle">
      <div className="absolute -top-40 -right-40 h-[480px] w-[480px] rounded-full bg-gradient-badge opacity-20 blur-3xl" />
      <div className="absolute -bottom-40 -left-40 h-[480px] w-[480px] rounded-full bg-amber/30 opacity-30 blur-3xl" />
      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-16 pb-20 sm:pt-24 sm:pb-28">
        <div className="grid gap-12 lg:grid-cols-2 lg:gap-16 items-center">
          <div className="animate-fade-up">
            <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-accent text-teal text-xs font-semibold uppercase tracking-wider">
              <Sparkles className="h-3.5 w-3.5" /> INVOK – program pre základné školy
            </span>
            <h1 className="mt-6 text-4xl sm:text-5xl lg:text-6xl font-extrabold leading-tight text-foreground">
              Pomáhame školám pripraviť žiakov na <span className="text-gradient">život po škole</span>
            </h1>
            <p className="mt-6 text-lg text-muted-foreground leading-relaxed">
              Trojročný program pre žiakov 8. a 9. ročníka rozvíja kritické myslenie, finančnú gramotnosť, komunikáciu, tímovú spoluprácu a ďalšie kompetencie potrebné pre 21. storočie.
            </p>
            <p className="mt-4 text-base font-bold text-primary tracking-tight">
              Praktické. Zmysluplné. Spolu.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Button asChild size="lg" className="bg-gradient-badge text-white hover:opacity-90 shadow-glow">
                <a href="#registracia">Stať sa partnerskou školou <ArrowRight className="ml-1.5 h-4 w-4" /></a>
              </Button>
              <Button asChild size="lg" variant="outline">
                <a href="#ako-to-funguje">Ako program funguje</a>
              </Button>
            </div>
            <div className="mt-8 flex flex-wrap gap-2">
              {["Kritické myslenie", "Finančná gramotnosť", "Komunikačné zručnosti", "Tímová spolupráca"].map((t) => (
                <span key={t} className="px-3 py-1 rounded-full bg-background border border-border text-xs font-medium text-muted-foreground">{t}</span>
              ))}
            </div>
          </div>

          <div className="relative animate-fade-up">
            <div className="relative rounded-3xl overflow-hidden shadow-glow border border-border">
              <img src={heroImg} alt="Žiaci základnej školy spolupracujú na projekte" width={1280} height={1024} className="w-full h-auto object-cover aspect-[5/4]" />
            </div>
            <div className="absolute -bottom-6 -left-4 bg-card border border-border rounded-2xl p-4 shadow-card flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-teal/15 grid place-items-center"><Award className="h-5 w-5 text-teal" /></div>
              <div>
                <div className="text-xs text-muted-foreground">Bezplatný program</div>
                <div className="text-sm font-bold">100 % pre školy</div>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-16 grid gap-4 sm:grid-cols-3">
          {[
            { t: "3 roky programu", d: "Systematický rozvoj kompetencií", I: BookOpen },
            { t: "Žiaci 8. a 9. ročníka", d: "ZŠ na celom Slovensku", I: GraduationCap },
            { t: "Kompetencie pre 21. storočie", d: "Praktické zručnosti do života", I: Sparkles },
          ].map(({ t, d, I }) => (
            <div key={t} className="rounded-2xl bg-card border border-border p-5 shadow-soft flex items-start gap-4">
              <div className="h-11 w-11 rounded-xl bg-gradient-badge grid place-items-center shrink-0"><I className="h-5 w-5 text-white" /></div>
              <div>
                <div className="font-bold text-foreground">{t}</div>
                <div className="text-sm text-muted-foreground">{d}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ---------------- WHY ---------------- */
function WhySchools() {
  const items = [
    { i: Sparkles, t: "Praktický rozvoj kompetencií žiakov" },
    { i: BookOpen, t: "Moderné vzdelávacie aktivity" },
    { i: HeartHandshake, t: "Podpora vedenia školy a pedagógov" },
    { i: BarChart3, t: "Merateľné výsledky a spätná väzba" },
    { i: GraduationCap, t: "Príprava žiakov na ďalšie štúdium a budúce povolanie" },
  ];
  return (
    <Section id="o-programe" eyebrow="O programe" title="Prečo sa školy zapájajú do programu INVOK?">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {items.map(({ i: I, t }) => (
          <div key={t} className="rounded-2xl bg-card border border-border p-6 shadow-soft hover:shadow-card transition">
            <div className="h-12 w-12 rounded-xl bg-accent grid place-items-center mb-4">
              <I className="h-6 w-6 text-teal" />
            </div>
            <p className="font-semibold text-foreground">{t}</p>
          </div>
        ))}
      </div>
    </Section>
  );
}

/* ---------------- NUMBERS ---------------- */
function NumbersSection() {
  const stats = [
    { n: "3", l: "roky podpory" },
    { n: "10", l: "partnerských škôl" },
    { n: "10", l: "workshopov" },
    { n: "6", l: "projektových výziev" },
    { n: "4", l: "vzdelávacie moduly" },
    { n: "100 %", l: "bezplatný program" },
  ];
  return (
    <Section
      alt
      eyebrow="Čísla projektu"
      title="INVOK v číslach"
      subtitle="Komplexná podpora pre školy na celom Slovensku počas troch školských rokov."
    >
      <div className="grid gap-4 grid-cols-2 md:grid-cols-3 lg:grid-cols-6">
        {stats.map((s) => (
          <div key={s.l} className="rounded-2xl bg-card border border-border p-6 text-center shadow-soft">
            <div className="text-4xl sm:text-5xl font-extrabold text-gradient">{s.n}</div>
            <div className="mt-2 text-xs sm:text-sm text-muted-foreground font-medium">{s.l}</div>
          </div>
        ))}
      </div>
    </Section>
  );
}

/* ---------------- COMPETENCIES ---------------- */
function CompetenciesSection() {
  const list = [
    { I: Brain, t: "Kritické myslenie", d: "Žiaci sa učia analyzovať informácie, rozlišovať fakty od názorov a robiť uvážené rozhodnutia." },
    { I: Eye, t: "Mediálna gramotnosť", d: "Orientácia v digitálnom svete, rozpoznávanie dezinformácií a bezpečné používanie médií." },
    { I: Rocket, t: "Podnikavosť", d: "Schopnosť prichádzať s nápadmi, plánovať ich realizáciu a niesť za ne zodpovednosť." },
    { I: Laptop, t: "Digitálne zručnosti", d: "Praktické používanie moderných digitálnych nástrojov vo výučbe aj v každodennom živote." },
    { I: MessageSquare, t: "Komunikácia", d: "Schopnosť jasne vyjadriť myšlienku, viesť diskusiu a prezentovať vlastné riešenia." },
    { I: Users, t: "Tímová spolupráca", d: "Práca v tíme, rozdelenie rolí a spoločné dosahovanie cieľov v projektoch." },
  ];
  return (
    <Section eyebrow="Prečo INVOK" title="Pripravujeme žiakov na výzvy 21. storočia" subtitle="Šesť kľúčových kompetencií, ktoré program rozvíja systematicky a v praxi.">
      <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
        {list.map(({ I, t, d }) => (
          <div key={t} className="group rounded-3xl bg-card border border-border p-7 shadow-soft hover:shadow-card hover:-translate-y-1 transition">
            <div className="h-12 w-12 rounded-2xl bg-gradient-badge grid place-items-center mb-5 shadow-soft">
              <I className="h-6 w-6 text-white" />
            </div>
            <h3 className="text-xl font-bold text-foreground">{t}</h3>
            <p className="mt-2 text-sm text-muted-foreground leading-relaxed">{d}</p>
          </div>
        ))}
      </div>
    </Section>
  );
}

/* ---------------- MODULES ---------------- */
function ModulesSection() {
  const mods = [
    {
      n: "Modul 1", t: "Podnikavosť a inovácie",
      d: "Žiaci sa učia identifikovať príležitosti, generovať nápady a premeniť ich na realizovateľné projekty.",
      pr: ["Rozvoj iniciatívy", "Plánovanie a realizácia", "Zodpovednosť za výsledok"],
      ak: ["Návrh vlastného mini-projektu", "Pitch nápadu pred porotou", "Tvorba podnikateľského plánu"],
      v: "Žiak vie premeniť nápad na konkrétny projekt s merateľnými cieľmi.",
    },
    {
      n: "Modul 2", t: "Kritické a mediálne myslenie",
      d: "Žiaci sa učia overovať zdroje, rozpoznávať manipuláciu a formovať si vlastný informovaný názor.",
      pr: ["Overovanie informácií", "Rozpoznávanie dezinformácií", "Logická argumentácia"],
      ak: ["Analýza spravodajských článkov", "Diskusné debaty", "Mediálne hry"],
      v: "Žiak vie kriticky pracovať s informáciami z rôznych zdrojov.",
    },
    {
      n: "Modul 3", t: "Tímová spolupráca a digitálne nástroje",
      d: "Praktická práca v tímoch s využitím moderných online nástrojov pre spoluprácu a tvorbu.",
      pr: ["Spolupráca v skupine", "Riešenie konfliktov", "Digitálna efektivita"],
      ak: ["Spoločný online projekt", "Práca v zdieľaných dokumentoch", "Tímové výzvy"],
      v: "Žiak vie efektívne pracovať v tíme s podporou digitálnych nástrojov.",
    },
    {
      n: "Modul 4", t: "Komunikácia a prezentácia",
      d: "Žiaci si rozvíjajú schopnosť zrozumiteľne hovoriť, počúvať a profesionálne prezentovať výsledky práce.",
      pr: ["Verejné vystupovanie", "Aktívne počúvanie", "Vizuálna prezentácia"],
      ak: ["Verejná prezentácia projektu", "Storytelling cvičenia", "Spätná väzba spolužiakov"],
      v: "Žiak dokáže zrozumiteľne prezentovať svoj nápad pred publikom.",
    },
  ];
  return (
    <Section id="moduly" alt eyebrow="Štyri vzdelávacie moduly" title="Štruktúrovaný obsah pre celý program">
      <div className="grid gap-6 lg:grid-cols-2">
        {mods.map((m) => (
          <div key={m.n} className="rounded-3xl bg-card border border-border p-7 shadow-soft hover:shadow-card transition">
            <span className="inline-block text-xs font-bold uppercase tracking-wider text-teal bg-accent px-3 py-1 rounded-full">{m.n}</span>
            <h3 className="mt-4 text-2xl font-bold text-foreground">{m.t}</h3>
            <p className="mt-2 text-sm text-muted-foreground leading-relaxed">{m.d}</p>
            <div className="mt-6 grid gap-5 sm:grid-cols-2">
              <ListBlock title="Prínosy" items={m.pr} />
              <ListBlock title="Aktivity" items={m.ak} />
            </div>
            <div className="mt-6 pt-5 border-t border-border">
              <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1">Očakávaný výsledok</div>
              <p className="text-sm font-medium text-foreground">{m.v}</p>
            </div>
          </div>
        ))}
      </div>
    </Section>
  );
}

function ListBlock({ title, items }: { title: string; items: string[] }) {
  return (
    <div>
      <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">{title}</div>
      <ul className="space-y-1.5">
        {items.map((i) => (
          <li key={i} className="flex items-start gap-2 text-sm text-foreground">
            <CheckCircle2 className="h-4 w-4 text-teal mt-0.5 shrink-0" /> {i}
          </li>
        ))}
      </ul>
    </div>
  );
}

/* ---------------- VALUE ---------------- */
function ValueSection() {
  const cols = [
    { t: "Pre školu", items: ["Trojročný komplexný program", "Online vzdelávacie moduly", "Metodická podpora", "Workshopy priamo v škole", "Projektové výzvy pre žiakov", "Meranie dopadu programu", "Podpora inklúzie", "Digitálna platforma", "Rozvoj moderných kompetencií", "Bez dodatočnej administratívnej záťaže"] },
    { t: "Pre učiteľov", items: ["Metodické príručky", "Scenáre vyučovacích hodín", "Pracovné listy pre žiakov", "Digitálne výučbové materiály", "Hodnotiace nástroje", "Odborná podpora konzultantov", "Hotové aktivity pre triedu"] },
    { t: "Pre žiakov", items: ["Kritické myslenie", "Mediálna gramotnosť", "Digitálne zručnosti", "Podnikavosť", "Tímová spolupráca", "Prezentačné zručnosti", "Schopnosť riešiť problémy", "Schopnosť vytvárať vlastné projekty"] },
  ];
  return (
    <Section id="pre-skoly" eyebrow="Čo program prináša" title="Hodnota pre školy, učiteľov a žiakov">
      <div className="grid gap-6 lg:grid-cols-3">
        {cols.map((c) => (
          <div key={c.t} className="rounded-3xl bg-card border border-border p-7 shadow-soft">
            <h3 className="text-xl font-bold mb-5 text-foreground">{c.t}</h3>
            <ul className="space-y-2.5">
              {c.items.map((i) => (
                <li key={i} className="flex items-start gap-2.5 text-sm text-foreground">
                  <CheckCircle2 className="h-4 w-4 text-teal mt-0.5 shrink-0" /> {i}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </Section>
  );
}

/* ---------------- HOW IT WORKS ---------------- */
function HowItWorksSection() {
  const steps = [
    { t: "Analýza potrieb školy", d: "Vstupný rozhovor s vedením a mapovanie aktuálneho stavu kompetencií žiakov." },
    { t: "Online vzdelávacie moduly", d: "Spustenie štyroch modulov v digitálnej platforme pre žiakov aj učiteľov." },
    { t: "Workshopy v škole", d: "Praktické workshopy vedené odbornými lektormi priamo vo vašej škole." },
    { t: "Projektové výzvy", d: "Žiaci pracujú v tímoch na reálnych projektoch s konkrétnym výstupom." },
    { t: "Meranie pokroku", d: "Priebežné vyhodnocovanie rozvoja kompetencií prostredníctvom platformy." },
    { t: "Vyhodnotenie dopadu", d: "Záverečné hodnotenie, certifikáty pre žiakov a reporting pre vedenie školy." },
  ];
  return (
    <Section id="ako-to-funguje" alt eyebrow="Ako program funguje" title="Šesť krokov k modernej škole">
      <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
        {steps.map((s, i) => (
          <div key={s.t} className="relative rounded-3xl bg-card border border-border p-7 shadow-soft hover:shadow-card transition">
            <div className="absolute -top-4 -left-2 h-12 w-12 rounded-2xl bg-gradient-badge text-white grid place-items-center font-bold text-lg shadow-soft">
              {i + 1}
            </div>
            <h3 className="mt-4 text-lg font-bold text-foreground">{s.t}</h3>
            <p className="mt-2 text-sm text-muted-foreground leading-relaxed">{s.d}</p>
          </div>
        ))}
      </div>
    </Section>
  );
}

/* ---------------- COMPETENCY MEASUREMENT ---------------- */
function CompetencyMeasurementSection() {
  const steps = [
    { n: "1", t: "Vstupné testovanie", d: "Žiak absolvuje kompetenčný dotazník pred začiatkom programu.", I: ClipboardCheck },
    { n: "2", t: "Program INVOK", d: "Žiak prechádza jednotlivými modulmi a aktivitami.", I: BookOpen },
    { n: "3", t: "Výstupné vyhodnotenie", d: "Systém porovná výsledky a vyhodnotí pokrok.", I: BarChart3 },
  ];
  return (
    <Section eyebrow="Meranie kompetencií" title="Ako meriame rozvoj kompetencií žiakov">
      <div className="grid gap-6 md:grid-cols-3">
        {steps.map((s) => (
          <div key={s.n} className="rounded-3xl bg-card border border-border p-7 shadow-soft hover:shadow-card transition">
            <div className="h-12 w-12 rounded-2xl bg-gradient-badge grid place-items-center mb-5 shadow-soft">
              <s.I className="h-6 w-6 text-white" />
            </div>
            <div className="text-xs font-bold uppercase tracking-wider text-teal mb-2">Krok {s.n}</div>
            <h3 className="text-xl font-bold text-foreground">{s.t}</h3>
            <p className="mt-2 text-sm text-muted-foreground leading-relaxed">{s.d}</p>
          </div>
        ))}
      </div>
      <div className="mt-10 text-center">
        <Button asChild size="lg" className="rounded-full bg-primary text-primary-foreground hover:bg-primary/90 shadow-soft">
          <Link to="/testy" className="inline-flex items-center gap-2">
            Preskúmať systém testovania <ArrowRight className="h-4 w-4" />
          </Link>
        </Button>
      </div>
    </Section>
  );
}

/* ---------------- SAMPLE TESTS ---------------- */
import { Link } from "@tanstack/react-router";
import { TEST_LIST } from "@/data/tests";

function SampleTestsSection() {
  return (
    <Section eyebrow="Ukážkové testy" title="Otestujte si kompetencie v praxi">
      <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
        {TEST_LIST.map((t) => (
          <div key={t.slug} className="rounded-3xl bg-card border border-border p-7 shadow-soft flex flex-col">
            <h3 className="text-lg font-bold text-foreground">{t.title}</h3>
            <p className="mt-2 text-sm text-muted-foreground flex-1">{t.description}</p>
            <Button asChild variant="outline" className="mt-5 self-start">
              <Link to="/testy/$slug" params={{ slug: t.slug }}>Vyskúšať test</Link>
            </Button>
          </div>
        ))}
      </div>
      <p className="mt-8 text-xs text-muted-foreground italic">
        Ukážkové testy slúžia len ako náhľad. Kompletné hodnotenie a rozvoj kompetencií prebieha v rámci programu INVOK.
      </p>
    </Section>
  );
}

/* ---------------- PLATFORM ---------------- */
function PlatformSection() {
  const progress = [
    { l: "Modul 1 · Podnikavosť", v: 78 },
    { l: "Modul 2 · Kritické myslenie", v: 62 },
    { l: "Modul 3 · Tímová spolupráca", v: 45 },
    { l: "Modul 4 · Komunikácia", v: 24 },
  ];
  const feats = ["Videolekcie", "Testovanie", "Interaktívne úlohy", "Projektové zadania", "Certifikáty", "Sledovanie pokroku", "Spätná väzba"];
  return (
    <Section alt eyebrow="Online platforma" title="Moderný LMS systém pripravený pre vašu školu">
      <div className="grid gap-10 lg:grid-cols-2 items-center">
        <div className="rounded-3xl bg-card border border-border p-7 shadow-card">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <div className="h-2.5 w-2.5 rounded-full bg-destructive/70" />
              <div className="h-2.5 w-2.5 rounded-full bg-amber" />
              <div className="h-2.5 w-2.5 rounded-full bg-teal" />
            </div>
            <span className="text-xs text-muted-foreground font-medium">INVOK LMS · Dashboard</span>
          </div>
          <div className="space-y-5">
            {progress.map((p) => (
              <div key={p.l}>
                <div className="flex justify-between text-sm mb-2">
                  <span className="font-medium text-foreground">{p.l}</span>
                  <span className="font-bold text-primary">{p.v}%</span>
                </div>
                <div className="h-2.5 rounded-full bg-muted overflow-hidden">
                  <div className="h-full rounded-full bg-gradient-badge" style={{ width: `${p.v}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          {feats.map((f) => (
            <div key={f} className="rounded-2xl bg-card border border-border p-4 flex items-center gap-3 shadow-soft">
              <div className="h-9 w-9 rounded-xl bg-accent grid place-items-center"><CheckCircle2 className="h-4 w-4 text-teal" /></div>
              <span className="font-medium text-foreground text-sm">{f}</span>
            </div>
          ))}
        </div>
      </div>
    </Section>
  );
}

/* ---------------- VIDEOTEKA ---------------- */
function VideotekaSection() {
  const items = ["Návštevy škôl", "Workshopy", "Rozhovory", "Projektové výzvy", "Skúsenosti učiteľov", "Skúsenosti žiakov"];
  return (
    <Section eyebrow="Videotéka" title="Pozrite si program v praxi">
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((t) => (
          <div key={t} className="group relative rounded-3xl overflow-hidden border border-border aspect-video bg-gradient-to-br from-primary/90 via-primary/60 to-teal/60 shadow-soft">
            <div className="absolute inset-0 grid place-items-center">
              <PlayCircle className="h-14 w-14 text-white/90 group-hover:scale-110 transition" />
            </div>
            <div className="absolute top-4 left-4 px-2.5 py-1 rounded-full bg-amber text-amber-foreground text-xs font-bold">Pripravujeme</div>
            <div className="absolute bottom-4 left-4 right-4 text-white font-semibold">{t}</div>
          </div>
        ))}
      </div>
    </Section>
  );
}

/* ---------------- SCHOOLS MAP ---------------- */
function SchoolsMapSection() {
  const schools = [
    ["ZŠ Mlynská", "Bratislava"], ["ZŠ Komenského", "Trnava"], ["ZŠ Hlavná", "Nitra"],
    ["ZŠ M. R. Štefánika", "Trenčín"], ["ZŠ Lúčna", "Žilina"], ["ZŠ J. A. Komenského", "Banská Bystrica"],
    ["ZŠ Pavla Dobšinského", "Martin"], ["ZŠ Š. Moysesa", "Košice"], ["ZŠ Hviezdoslavova", "Prešov"],
    ["ZŠ Mierová", "Poprad"],
  ];
  return (
    <Section alt eyebrow="Partnerské školy" title="Mapa škôl zapojených do programu">
      <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5">
        {schools.map(([name, city]) => (
          <div key={name + city} className="rounded-2xl bg-card border border-border p-5 shadow-soft hover:shadow-card transition">
            <MapPinned className="h-5 w-5 text-teal mb-3" />
            <div className="font-semibold text-foreground text-sm">{name}</div>
            <div className="text-xs text-muted-foreground mt-1">{city}</div>
          </div>
        ))}
      </div>
    </Section>
  );
}

/* ---------------- CASE STUDIES ---------------- */
function CaseStudiesSection() {
  const cases = [
    { s: "ZŠ Komenského, Trnava", p: "Žiaci mali ťažkosti s tímovou spoluprácou a prezentovaním vlastných nápadov.", z: "Všetky štyri moduly, sprievodné workshopy a projektová výzva.", v: "75 % žiakov si po roku zlepšilo prezentačné a komunikačné zručnosti." },
    { s: "ZŠ Lúčna, Žilina", p: "Učitelia hľadali nové metódy rozvoja kritického myslenia v rámci ŠkVP.", z: "Implementácia modulu Kritické a mediálne myslenie do bežnej výučby.", v: "24 hotových scenárov hodín a metodická podpora počas celého roka." },
    { s: "ZŠ Mierová, Poprad", p: "Vedenie chcelo posilniť podnikavosť a iniciatívu žiakov 9. ročníka.", z: "Projektová výzva – žiaci vytvárali mini-projekty pre svoje mesto.", v: "Tri projekty získali finančnú podporu mesta a sú v reálnej realizácii." },
  ];
  return (
    <Section eyebrow="Príbehy škôl" title="Reálne výsledky z partnerských škôl">
      <div className="grid gap-6 lg:grid-cols-3">
        {cases.map((c) => (
          <div key={c.s} className="rounded-3xl bg-card border border-border p-7 shadow-soft hover:shadow-card transition">
            <h3 className="text-lg font-bold text-foreground">{c.s}</h3>
            <CaseBlock label="Problém" text={c.p} />
            <CaseBlock label="Zapojenie do programu" text={c.z} />
            <CaseBlock label="Dosiahnuté výsledky" text={c.v} highlight />
          </div>
        ))}
      </div>
    </Section>
  );
}

function CaseBlock({ label, text, highlight }: { label: string; text: string; highlight?: boolean }) {
  return (
    <div className="mt-5">
      <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1.5">{label}</div>
      <p className={highlight ? "text-sm font-semibold text-teal" : "text-sm text-foreground"}>{text}</p>
    </div>
  );
}

/* ---------------- IMPACT ---------------- */
function ImpactSection() {
  const stats = [
    { n: "10", l: "zapojených škôl" },
    { n: "1 200+", l: "žiakov v programe" },
    { n: "30", l: "workshopov ročne" },
    { n: "60+", l: "tímových projektov" },
    { n: "85 %", l: "dokončených modulov" },
    { n: "+38 %", l: "rast kompetencií" },
  ];
  return (
    <section className="py-20 sm:py-24 bg-gradient-hero text-white relative overflow-hidden">
      <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_30%_30%,white,transparent_50%)]" />
      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mb-12">
          <span className="inline-block text-xs font-semibold uppercase tracking-wider mb-3 px-3 py-1 rounded-full bg-white/15 text-white">Výsledky projektu</span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold">Merateľný dopad na slovenské školy</h2>
        </div>
        <div className="grid gap-4 grid-cols-2 md:grid-cols-3 lg:grid-cols-6">
          {stats.map((s) => (
            <div key={s.l} className="rounded-2xl bg-white/10 backdrop-blur border border-white/15 p-6 text-center">
              <div className="text-3xl sm:text-4xl font-extrabold">{s.n}</div>
              <div className="mt-1.5 text-xs text-white/80 font-medium">{s.l}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ---------------- NEWS ---------------- */
const ALL_CATS = ["Všetky", "Kritické myslenie", "Mediálna gramotnosť", "Podnikavosť", "Digitálne vzdelávanie", "Moderná škola", "Príklady dobrej praxe"];
function NewsSection() {
  const [cat, setCat] = useState("Všetky");
  const [q, setQ] = useState("");
  const articles = [
    { c: "Kritické myslenie", t: "Päť cvičení, ktoré rozvíjajú kritické myslenie už na druhom stupni", p: "Praktické tipy a hotové cvičenia, ktoré môžete použiť na nasledujúcej hodine.", d: "12. mája 2025" },
    { c: "Príklady dobrej praxe", t: "Ako ZŠ Lúčna začlenila projektové vyučovanie do bežných hodín", p: "Príbeh školy, ktorá zmenila prístup k výučbe a žiaci na to reagujú nadšením.", d: "28. apríla 2025" },
    { c: "Digitálne vzdelávanie", t: "Digitálne nástroje pre tímovú spoluprácu žiakov ZŠ", p: "Prehľad bezplatných nástrojov pre triedne projekty a tímovú spoluprácu.", d: "15. apríla 2025" },
  ];
  const filtered = articles.filter((a) =>
    (cat === "Všetky" || a.c === cat) && (q === "" || (a.t + a.p).toLowerCase().includes(q.toLowerCase()))
  );
  return (
    <Section id="novinky" alt eyebrow="Novinky a články" title="Inšpirácia pre modernú školu">
      <div className="flex flex-col gap-4 mb-8">
        <div className="flex flex-wrap gap-2">
          {ALL_CATS.map((c) => (
            <button key={c} onClick={() => setCat(c)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-medium border transition ${
                cat === c ? "bg-primary text-primary-foreground border-primary" : "bg-card border-border text-muted-foreground hover:border-primary/50"
              }`}>{c}</button>
          ))}
        </div>
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Vyhľadať článok..." className="pl-9" maxLength={100} />
        </div>
      </div>
      <div className="grid gap-6 md:grid-cols-3">
        {filtered.map((a) => (
          <article key={a.t} className="rounded-3xl bg-card border border-border overflow-hidden shadow-soft hover:shadow-card transition">
            <div className="aspect-[16/10] bg-gradient-to-br from-primary/20 via-teal/20 to-amber/20 grid place-items-center">
              <BookOpen className="h-10 w-10 text-primary/40" />
            </div>
            <div className="p-6">
              <span className="text-xs font-semibold text-teal uppercase tracking-wider">{a.c}</span>
              <h3 className="mt-2 font-bold text-foreground leading-snug">{a.t}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{a.p}</p>
              <div className="mt-5 flex items-center justify-between">
                <span className="text-xs text-muted-foreground">{a.d}</span>
                <a href="#" className="text-sm font-semibold text-primary hover:underline inline-flex items-center gap-1">Čítať článok <ArrowRight className="h-3.5 w-3.5" /></a>
              </div>
            </div>
          </article>
        ))}
        {filtered.length === 0 && <p className="text-muted-foreground">Žiadne články nezodpovedajú filtru.</p>}
      </div>

      <div className="mt-12 rounded-3xl bg-gradient-badge p-8 sm:p-10 text-white grid gap-6 md:grid-cols-2 items-center shadow-glow">
        <div>
          <h3 className="text-2xl font-bold">Odoberajte novinky</h3>
          <p className="mt-2 text-white/85">Raz mesačne pošleme najlepšie články, pozvánky na podujatia a metodické tipy.</p>
        </div>
        <form className="flex gap-2" onSubmit={(e) => e.preventDefault()}>
          <Input type="email" placeholder="Váš e-mail" maxLength={150} className="bg-white/15 border-white/30 text-white placeholder:text-white/60" />
          <Button type="submit" className="bg-white text-primary hover:bg-white/90 font-semibold">Odoberať</Button>
        </form>
      </div>
    </Section>
  );
}

/* ---------------- READINESS ---------------- */
function ReadinessSection() {
  return (
    <Section eyebrow="Test pre školy" title="Je vaša škola pripravená na kompetencie 21. storočia?" subtitle="Krátky test s 15 otázkami vám pomôže zorientovať sa, kde sa vaša škola aktuálne nachádza.">
      <ReadinessTest />
    </Section>
  );
}

/* ---------------- REGISTRATION ---------------- */
function RegistrationSection() {
  return (
    <Section id="registracia" alt eyebrow="Registrácia partnerskej školy" title="Zapojte vašu školu do programu INVOK" subtitle="Vyplnenie formulára trvá 3 minúty. Po odoslaní vás kontaktuje koordinátor programu.">
      <div className="max-w-3xl">
        <RegistrationForm />
      </div>
    </Section>
  );
}

/* ---------------- FAQ ---------------- */
function FaqSection() {
  const faqs = [
    { q: "Je program INVOK bezplatný?", a: "Áno, program je pre zapojené školy úplne bezplatný. Financovanie je zabezpečené z verejných zdrojov a v rámci projektov Programu Slovensko a Európskej únie." },
    { q: "Koľko času program zaberie?", a: "Program je rozvrhnutý na tri školské roky. Týždenne ide o pár hodín v rámci bežnej výučby, plus workshopy podľa harmonogramu." },
    { q: "Kto sa môže do programu zapojiť?", a: "Akákoľvek základná škola na Slovensku, ktorá má záujem rozvíjať kompetencie žiakov 8. a 9. ročníka." },
    { q: "Ako sa meria dopad programu?", a: "Prostredníctvom vstupnej a výstupnej diagnostiky, priebežných výsledkov v platforme a spätnej väzby od učiteľov a žiakov." },
    { q: "Čo musí škola zabezpečiť?", a: "Záujem vedenia, jedného koordinátora programu na škole a základné digitálne vybavenie pre žiakov." },
  ];
  return (
    <Section eyebrow="Časté otázky" title="Odpovede na to najdôležitejšie">
      <div className="max-w-3xl">
        <Accordion type="single" collapsible className="space-y-3">
          {faqs.map((f, i) => (
            <AccordionItem key={i} value={`i${i}`} className="border border-border rounded-2xl px-5 bg-card shadow-soft">
              <AccordionTrigger className="text-left font-semibold hover:no-underline">{f.q}</AccordionTrigger>
              <AccordionContent className="text-muted-foreground">{f.a}</AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </Section>
  );
}

/* ---------------- PARTNERS ---------------- */
function PartnersSection() {
  const partners = ["Program Slovensko", "Európska únia", "Ministerstvo školstva", "Odborní garanti", "Partnerské školy", "Mestá a obce"];
  return (
    <Section alt eyebrow="Partneri projektu" title="Spolupracujeme so silnými partnermi">
      <div className="grid gap-4 grid-cols-2 md:grid-cols-3 lg:grid-cols-6">
        {partners.map((p) => (
          <div key={p} className="rounded-2xl bg-card border border-border p-5 text-center shadow-soft font-semibold text-sm text-foreground">
            {p}
          </div>
        ))}
      </div>
    </Section>
  );
}

/* ---------------- CONTACT (CTA only — full page at /kontakt) ---------------- */
function ContactSection() {
  return (
    <Section id="kontakt" eyebrow="Kontakt" title="Spojte sa s tímom INVOK" subtitle="Plnú kontaktnú stránku s formulárom, partnerstvami a FAQ nájdete na samostatnej stránke.">
      <div className="rounded-3xl bg-gradient-hero text-white p-8 md:p-12 shadow-card flex flex-col md:flex-row md:items-center md:justify-between gap-6">
        <div>
          <h3 className="text-2xl md:text-3xl font-bold">Máte záujem o predstavenie programu?</h3>
          <p className="mt-2 text-white/85 max-w-xl">Napíšte nám, zavolajte, alebo vyplňte krátky formulár pre školy na kontaktnej stránke.</p>
          <div className="mt-4 flex flex-wrap gap-x-6 gap-y-2 text-sm text-white/90">
            <a href="mailto:info@invok.sk" className="inline-flex items-center gap-2 hover:underline"><Mail className="h-4 w-4" />info@invok.sk</a>
            <a href="tel:+421900000000" className="inline-flex items-center gap-2 hover:underline"><Phone className="h-4 w-4" />+421 900 000 000</a>
            <span className="inline-flex items-center gap-2"><MapPin className="h-4 w-4" />Hlavná 1, Bratislava</span>
          </div>
        </div>
        <Button asChild size="lg" className="rounded-full bg-white text-foreground hover:bg-white/90 shrink-0">
          <a href="/kontakt">Prejsť na kontakt</a>
        </Button>
      </div>
    </Section>
  );
}


/* ---------------- VALUE BOXES (inspired by infographic) ---------------- */
function ValueBoxesSection() {
  const cols = [
    {
      t: "Čo získa škola?",
      tone: "bg-teal/10 border-teal/30",
      head: "text-teal",
      items: [
        "moderné online moduly a materiály",
        "metodickú podporu pre učiteľov",
        "workshopy a projektové výzvy pre žiakov",
        "digitálnu vzdelávaciu platformu",
        "podporu inkluzívneho vzdelávania",
        "meranie pokroku a dopadu",
      ],
    },
    {
      t: "Ako to funguje?",
      tone: "bg-amber/10 border-amber/40",
      head: "text-amber-foreground",
      items: [
        "Analýza potrieb školy",
        "Online vzdelávacie moduly",
        "Workshopy a projekty",
        "Meranie dopadu",
        "Zlepšovanie podľa spätnej väzby",
      ],
    },
    {
      t: "Pre žiakov to znamená:",
      tone: "bg-primary/10 border-primary/30",
      head: "text-primary",
      items: [
        "zaujímavé témy a aktivity",
        "práca v tímoch",
        "riešenie reálnych problémov",
        "rozvoj zručností pre budúcnosť",
        "sebarealizáciu a nové príležitosti",
      ],
    },
  ];
  const stats = [
    { I: Calendar, n: "3 roky", l: "podpory" },
    { I: School, n: "min. 10 škôl", l: "po celom Slovensku" },
    { I: Users, n: "10 workshopov", l: "v každom ročníku" },
    { I: Trophy, n: "6 projektových", l: "výziev" },
  ];
  return (
    <Section eyebrow="Prehľad programu" title="Spoločne tvoríme školy budúcnosti">
      <div className="grid gap-6 lg:grid-cols-4">
        {cols.map((c) => (
          <div key={c.t} className={`rounded-3xl border-2 p-6 ${c.tone}`}>
            <h3 className={`text-lg font-extrabold uppercase tracking-wide mb-4 ${c.head}`}>{c.t}</h3>
            <ul className="space-y-2.5">
              {c.items.map((i) => (
                <li key={i} className="flex items-start gap-2.5 text-sm text-foreground">
                  <CheckCircle2 className="h-4 w-4 text-teal mt-0.5 shrink-0" /> {i}
                </li>
              ))}
            </ul>
          </div>
        ))}
        <div className="rounded-3xl bg-primary text-primary-foreground p-6 shadow-glow">
          <h3 className="text-xs font-bold uppercase tracking-wider text-white/70 mb-5">INVOK v číslach</h3>
          <div className="space-y-5">
            {stats.map((s) => (
              <div key={s.n} className="flex items-start gap-3">
                <div className="h-10 w-10 rounded-xl bg-white/10 grid place-items-center shrink-0">
                  <s.I className="h-5 w-5" />
                </div>
                <div>
                  <div className="font-extrabold text-lg leading-tight">{s.n}</div>
                  <div className="text-xs text-white/75 uppercase tracking-wide">{s.l}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </Section>
  );
}

/* ---------------- WHAT SCHOOL DOESN'T NEED ---------------- */
function WhatSchoolDoesntNeedSection() {
  const items = [
    "tvoriť obsah",
    "pripravovať metodiky",
    "organizovať program",
    "financovať projekt",
    "zvyšovať administratívnu záťaž",
  ];
  return (
    <Section alt eyebrow="Bez záťaže pre školu" title="Čo škola NEMUSÍ?" subtitle="O všetko podstatné sa postaráme my. Vy sa môžete sústrediť na žiakov.">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        {items.map((t) => (
          <div key={t} className="rounded-2xl bg-card border-2 border-destructive/20 p-5 shadow-soft flex items-start gap-3">
            <XCircle className="h-5 w-5 text-destructive mt-0.5 shrink-0" />
            <span className="font-semibold text-foreground text-sm">{t}</span>
          </div>
        ))}
      </div>
    </Section>
  );
}

/* ---------------- HARMONOGRAM ---------------- */
function HarmonogramSection() {
  const years = [
    { y: "ROK 1", t: "Pilot programu", d: "10 partnerských škôl, testovanie modulov, prvé workshopy a zber spätnej väzby." },
    { y: "ROK 2", t: "Rozšírenie", d: "Vylepšenie programu na základe pilotu, zapojenie ďalších 10 škôl a nových projektových výziev." },
    { y: "ROK 3", t: "Škálovanie a udržateľnosť", d: "Konsolidácia programu, certifikácia, metodické príručky a príprava na dlhodobé fungovanie." },
  ];
  return (
    <Section eyebrow="Harmonogram" title="Tri roky systematickej zmeny">
      <div className="grid gap-6 md:grid-cols-3">
        {years.map((y, i) => (
          <div key={y.y} className="relative rounded-3xl bg-gradient-to-br from-primary to-primary/70 text-primary-foreground p-8 shadow-card overflow-hidden">
            <div className="absolute -top-6 -right-6 text-[120px] font-extrabold text-white/10 leading-none">{i + 1}</div>
            <span className="inline-block text-xs font-bold uppercase tracking-wider bg-white/15 px-3 py-1.5 rounded-full">{y.y}</span>
            <h3 className="mt-4 text-2xl font-extrabold">{y.t}</h3>
            <p className="mt-3 text-sm text-white/85 leading-relaxed">{y.d}</p>
          </div>
        ))}
      </div>
    </Section>
  );
}

