import { Link } from "@tanstack/react-router";
import {
  Award, BarChart3, BookOpen, Brain, CheckCircle2, ClipboardCheck,
  FileBarChart, FileText, GraduationCap, Layers, MessageSquare,
  Mic, PieChart, Rocket, Settings2, ShieldCheck, Sparkles,
  Timer, TrendingUp, Users, Wallet, XCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Section } from "@/components/invok/Section";

/* 1. Čo získava škola */
export function SchoolGainsSection() {
  const items = [
    { I: BarChart3, t: "Merateľné výsledky kompetencií", d: "Vstupné a výstupné merania ukazujú konkrétny progres žiakov v každej oblasti." },
    { I: FileBarChart, t: "Reporty pre vedenie školy a rodičov", d: "Pravidelné prehľady s dátami o aktivite žiakov, dokončenosti modulov a dopade." },
    { I: Award, t: "Certifikáty pre žiakov", d: "Oficiálne potvrdenie absolvovaných modulov a získaných kompetencií." },
    { I: ShieldCheck, t: "Certifikát partnerskej školy", d: "Verejne preukázateľný status školy zapojenej do národného programu INVOK." },
    { I: BookOpen, t: "Metodické materiály", d: "Scenáre hodín, pracovné listy a podklady, ktoré ostávajú škole natrvalo." },
    { I: Layers, t: "Interaktívne moduly a aktivity", d: "Hotové vzdelávacie celky pripravené na okamžité použitie vo vyučovaní." },
  ];
  return (
    <Section eyebrow="Pre školu" title="Čo získava škola zapojením do programu INVOK?">
      <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
        {items.map(({ I, t, d }) => (
          <div key={t} className="rounded-3xl bg-card border border-border p-7 shadow-soft hover:shadow-card transition">
            <div className="h-12 w-12 rounded-2xl bg-primary/10 grid place-items-center mb-5">
              <I className="h-6 w-6 text-primary" />
            </div>
            <h3 className="font-bold text-foreground">{t}</h3>
            <p className="mt-2 text-sm text-muted-foreground leading-relaxed">{d}</p>
          </div>
        ))}
      </div>
    </Section>
  );
}

/* 2. Čo získava žiak */
export function StudentGainsSection() {
  const items = [
    { I: Brain, t: "Kritické myslenie", d: "Analyzovať informácie, overovať fakty a robiť uvážené rozhodnutia." },
    { I: Mic, t: "Sebavedomé vystupovanie", d: "Prezentovať vlastné myšlienky pred triedou aj verejnosťou." },
    { I: Users, t: "Tímová spolupráca", d: "Pracovať v skupine, niesť zodpovednosť a dosahovať spoločné ciele." },
    { I: ShieldCheck, t: "Mediálna gramotnosť", d: "Orientovať sa v digitálnych obsahoch a rozpoznať manipuláciu." },
    { I: Rocket, t: "Podnikavosť a iniciatíva", d: "Premieňať nápady na konkrétne projekty s reálnym výstupom." },
    { I: Sparkles, t: "Príprava na budúcnosť", d: "Zručnosti, ktoré ostávajú dlho po skončení základnej školy." },
  ];
  return (
    <Section alt eyebrow="Pre žiaka" title="Čo si žiaci odnesú z programu INVOK?">
      <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
        {items.map(({ I, t, d }) => (
          <div key={t} className="rounded-3xl bg-card border border-border p-7 shadow-soft hover:shadow-card transition">
            <div className="h-12 w-12 rounded-2xl bg-gradient-badge grid place-items-center mb-5 shadow-soft">
              <I className="h-6 w-6 text-white" />
            </div>
            <h3 className="font-bold text-foreground">{t}</h3>
            <p className="mt-2 text-sm text-muted-foreground leading-relaxed">{d}</p>
          </div>
        ))}
      </div>
    </Section>
  );
}

/* 3. Ukážka výsledkov školy – dashboard */
export function SchoolDashboardSection() {
  const kpis = [
    { I: Users, n: "184", l: "zapojených žiakov" },
    { I: CheckCircle2, n: "76 %", l: "dokončené moduly" },
    { I: TrendingUp, n: "+34 %", l: "medziročný progres" },
    { I: PieChart, n: "8,2 / 10", l: "priemerné skóre" },
  ];
  const competencies = [
    { l: "Kritické myslenie", v: 78 },
    { l: "Komunikácia", v: 71 },
    { l: "Tímová spolupráca", v: 84 },
    { l: "Podnikavosť", v: 66 },
    { l: "Mediálna gramotnosť", v: 72 },
  ];
  const yearly = [42, 51, 58, 64, 69, 76];
  const max = Math.max(...yearly);
  return (
    <Section eyebrow="Dashboard školy" title="Takto vyzerajú výsledky školy v programe INVOK">
      <div className="rounded-3xl bg-card border border-border p-6 sm:p-8 shadow-card">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {kpis.map(({ I, n, l }) => (
            <div key={l} className="rounded-2xl border border-border bg-gradient-subtle p-5">
              <I className="h-5 w-5 text-primary mb-3" />
              <div className="text-3xl font-extrabold text-foreground">{n}</div>
              <div className="text-xs text-muted-foreground mt-1 uppercase tracking-wide">{l}</div>
            </div>
          ))}
        </div>

        <div className="mt-8 grid gap-8 lg:grid-cols-2">
          <div>
            <h3 className="font-bold text-foreground mb-5">Priemerné skóre kompetencií</h3>
            <div className="space-y-4">
              {competencies.map((c) => (
                <div key={c.l}>
                  <div className="flex justify-between text-sm mb-1.5">
                    <span className="font-medium text-foreground">{c.l}</span>
                    <span className="font-bold text-primary">{c.v}%</span>
                  </div>
                  <div className="h-2.5 rounded-full bg-muted overflow-hidden">
                    <div className="h-full rounded-full bg-gradient-badge" style={{ width: `${c.v}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div>
            <h3 className="font-bold text-foreground mb-5">Medziročný progres školy</h3>
            <div className="flex items-end gap-3 h-48 px-2">
              {yearly.map((v, i) => (
                <div key={i} className="flex-1 flex flex-col items-center gap-2">
                  <div className="w-full rounded-t-lg bg-gradient-badge shadow-soft" style={{ height: `${(v / max) * 100}%` }} />
                  <span className="text-[10px] text-muted-foreground font-semibold">P{i + 1}</span>
                </div>
              ))}
            </div>
            <p className="mt-4 text-xs text-muted-foreground">Hodnotenie po jednotlivých polrokoch (% kompetenčného skóre)</p>
          </div>
        </div>
      </div>
    </Section>
  );
}

/* 4. Ukážka reportu */
export function ReportPreviewSection() {
  const areas = [
    { l: "Kritické myslenie", pre: 54, post: 78 },
    { l: "Komunikácia", pre: 48, post: 71 },
    { l: "Tímová spolupráca", pre: 61, post: 84 },
    { l: "Podnikavosť", pre: 42, post: 66 },
  ];
  return (
    <Section alt eyebrow="Report" title="Výsledky, ktoré dávajú zmysel" subtitle="Porovnanie vstupného a výstupného merania v štyroch hlavných oblastiach kompetencií.">
      <div className="rounded-3xl bg-card border border-border p-6 sm:p-8 shadow-card">
        <div className="flex items-center justify-between mb-6 pb-4 border-b border-border">
          <div className="flex items-center gap-3">
            <FileText className="h-6 w-6 text-primary" />
            <div>
              <div className="font-bold text-foreground">Záverečný report · ZŠ Príklad</div>
              <div className="text-xs text-muted-foreground">Školský rok 2025/2026 · 8. ročník</div>
            </div>
          </div>
          <span className="text-xs font-semibold uppercase tracking-wider px-3 py-1 rounded-full bg-teal/15 text-teal">Ukážka</span>
        </div>

        <div className="space-y-5">
          {areas.map((a) => (
            <div key={a.l}>
              <div className="flex justify-between text-sm mb-2">
                <span className="font-semibold text-foreground">{a.l}</span>
                <span className="text-xs text-muted-foreground">
                  vstup <b className="text-foreground">{a.pre}%</b> → výstup <b className="text-primary">{a.post}%</b>
                  <span className="ml-2 text-teal font-bold">+{a.post - a.pre}</span>
                </span>
              </div>
              <div className="relative h-3 rounded-full bg-muted overflow-hidden">
                <div className="absolute inset-y-0 left-0 bg-muted-foreground/30" style={{ width: `${a.pre}%` }} />
                <div className="absolute inset-y-0 left-0 bg-gradient-badge" style={{ width: `${a.post}%`, clipPath: `polygon(${(a.pre / a.post) * 100}% 0, 100% 0, 100% 100%, ${(a.pre / a.post) * 100}% 100%)` }} />
              </div>
            </div>
          ))}
        </div>

        <div className="mt-8 flex flex-wrap gap-4 text-xs text-muted-foreground">
          <span className="inline-flex items-center gap-2"><span className="h-3 w-3 rounded-sm bg-muted-foreground/30" /> Vstupné meranie</span>
          <span className="inline-flex items-center gap-2"><span className="h-3 w-3 rounded-sm bg-gradient-badge" /> Výstupné meranie</span>
        </div>
      </div>
    </Section>
  );
}

/* 5. Časová náročnosť */
export function TimeCommitmentSection() {
  const items = [
    { I: Layers, t: "Počet modulov", d: "4 vzdelávacie moduly počas troch školských rokov." },
    { I: Timer, t: "Rozsah programu", d: "Približne 2–3 vyučovacie hodiny týždenne v rámci bežnej výučby." },
    { I: Settings2, t: "Forma realizácie", d: "Online platforma, prezenčné workshopy a tímové projekty." },
    { I: ClipboardCheck, t: "Nároky na školu", d: "Jeden koordinátor, základné digitálne vybavenie, ochota inovovať." },
  ];
  return (
    <Section eyebrow="Časová náročnosť" title="Koľko času program zaberie?">
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {items.map(({ I, t, d }) => (
          <div key={t} className="rounded-3xl bg-card border border-border p-6 shadow-soft">
            <div className="h-11 w-11 rounded-2xl bg-accent grid place-items-center mb-4">
              <I className="h-5 w-5 text-teal" />
            </div>
            <h3 className="font-bold text-foreground">{t}</h3>
            <p className="mt-2 text-sm text-muted-foreground leading-relaxed">{d}</p>
          </div>
        ))}
      </div>
    </Section>
  );
}

/* 6. Tím INVOK */
export function TeamSection() {
  const members = [
    { n: "Meno Priezvisko", r: "Riaditeľ projektu" },
    { n: "Meno Priezvisko", r: "Odborný garant" },
    { n: "Meno Priezvisko", r: "Vedúca metodiky" },
    { n: "Meno Priezvisko", r: "Koordinátor škôl" },
  ];
  const values = [
    { t: "Predstavenie projektu", d: "INVOK je národná vzdelávacia iniciatíva pre základné školy na Slovensku, ktorá systematicky rozvíja kompetencie žiakov pre 21. storočie." },
    { t: "Vízia", d: "Slovenské školy, v ktorých žiaci vychádzajú so sebavedomím, schopnosťou kriticky myslieť a tvoriť hodnoty pre svoje okolie." },
    { t: "Hodnoty", d: "Odbornosť, transparentnosť, partnerstvo so školami a dlhodobý dopad – nie jednorazové aktivity." },
  ];
  return (
    <Section alt eyebrow="Tím" title="Tím INVOK">
      <div className="grid gap-10 lg:grid-cols-2 items-start">
        <div className="grid grid-cols-2 gap-5">
          {members.map((m) => (
            <div key={m.n + m.r} className="rounded-3xl bg-card border border-border p-5 shadow-soft text-center">
              <div className="aspect-square rounded-2xl bg-gradient-to-br from-primary/15 via-teal/15 to-amber/15 grid place-items-center mb-4">
                <Users className="h-10 w-10 text-primary/40" />
              </div>
              <div className="font-bold text-foreground text-sm">{m.n}</div>
              <div className="text-xs text-muted-foreground mt-1">{m.r}</div>
            </div>
          ))}
        </div>
        <div className="space-y-5">
          {values.map((v) => (
            <div key={v.t} className="rounded-3xl bg-card border border-border p-6 shadow-soft">
              <h3 className="font-bold text-foreground">{v.t}</h3>
              <p className="mt-2 text-sm text-muted-foreground leading-relaxed">{v.d}</p>
            </div>
          ))}
        </div>
      </div>
    </Section>
  );
}

/* 7. Referencie škôl */


/* 8. Mapa škôl */
export function SchoolsLocationMapSection() {
  // Approx normalized coordinates on a simplified Slovakia bbox.
  const pins = [
    { x: 14, y: 78, c: "Bratislava" },
    { x: 22, y: 72, c: "Trnava" },
    { x: 30, y: 75, c: "Nitra" },
    { x: 32, y: 58, c: "Trenčín" },
    { x: 44, y: 50, c: "Žilina" },
    { x: 52, y: 64, c: "B. Bystrica" },
    { x: 50, y: 42, c: "Martin" },
    { x: 70, y: 48, c: "Poprad" },
    { x: 82, y: 60, c: "Prešov" },
    { x: 86, y: 70, c: "Košice" },
  ];
  return (
    <Section alt eyebrow="Mapa" title="Kde už INVOK pôsobí" subtitle="Partnerské školy zapojené do programu naprieč Slovenskom.">
      <div className="grid gap-8 lg:grid-cols-5 items-start">
        <div className="lg:col-span-3 rounded-3xl bg-card border border-border p-6 shadow-card">
          <div className="relative w-full" style={{ aspectRatio: "2/1" }}>
            <svg viewBox="0 0 200 100" className="absolute inset-0 w-full h-full">
              <defs>
                <linearGradient id="skfill" x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0%" stopColor="oklch(0.95 0.03 250)" />
                  <stop offset="100%" stopColor="oklch(0.88 0.04 250)" />
                </linearGradient>
              </defs>
              {/* Simplified Slovakia silhouette */}
              <path
                d="M10,72 C20,55 32,45 48,42 C62,38 78,30 96,32 C116,34 132,40 150,44 C166,48 180,52 188,60 C192,66 188,74 178,78 C162,84 142,86 122,84 C104,82 86,82 70,84 C54,86 38,86 24,82 C14,79 8,76 10,72 Z"
                fill="url(#skfill)"
                stroke="oklch(0.36 0.14 268)"
                strokeWidth="0.8"
                opacity="0.9"
              />
              {pins.map((p) => (
                <g key={p.c}>
                  <circle cx={p.x * 2} cy={p.y} r="2.2" fill="oklch(0.42 0.16 258)" />
                  <circle cx={p.x * 2} cy={p.y} r="4.5" fill="oklch(0.42 0.16 258)" opacity="0.25" />
                </g>
              ))}
            </svg>
          </div>
        </div>

        <ul className="lg:col-span-2 grid grid-cols-2 gap-2">
          {pins.map((p) => (
            <li key={p.c} className="rounded-xl bg-card border border-border px-3 py-2 text-sm font-medium text-foreground flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-primary" /> {p.c}
            </li>
          ))}
        </ul>
      </div>
    </Section>
  );
}

/* 9. Financovanie */
export function FundingSection() {
  return (
    <Section eyebrow="Financovanie">
      <div className="rounded-3xl bg-gradient-hero text-white p-8 sm:p-12 shadow-glow grid gap-8 lg:grid-cols-3 items-center">
        <div className="lg:col-span-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/15 text-xs font-bold uppercase tracking-wider">
            <Wallet className="h-3.5 w-3.5" /> Financovanie programu
          </div>
          <h2 className="mt-4 text-3xl sm:text-4xl font-extrabold">Zapojenie školy je bezplatné</h2>
          <p className="mt-3 text-white/85 leading-relaxed max-w-2xl">
            Program INVOK je financovaný z Ministerstva školstva. Školy neplatia žiadne poplatky za moduly, workshopy ani metodické materiály.
          </p>
        </div>
        <ul className="space-y-3 text-sm">
          {["bez poplatkov pre školu", "bez skrytých nákladov", "metodiky ostávajú škole", "transparentné vykazovanie"].map((t) => (
            <li key={t} className="flex items-start gap-2.5">
              <CheckCircle2 className="h-5 w-5 text-amber mt-0.5 shrink-0" /> {t}
            </li>
          ))}
        </ul>
      </div>
    </Section>
  );
}

/* 10. Porovnanie */
export function ComparisonSection() {
  const rows = [
    { trad: "teoretické poznatky", invok: "praktické projekty" },
    { trad: "jednorazové aktivity", invok: "dlhodobý rozvoj kompetencií" },
    { trad: "obmedzené meranie výsledkov", invok: "merateľné výsledky a reporting" },
    { trad: "pasívna účasť žiakov", invok: "aktívne zapojenie žiakov" },
  ];
  return (
    <Section alt eyebrow="Prečo INVOK" title="Prečo školy volia INVOK?">
      <div className="overflow-hidden rounded-3xl border border-border shadow-card bg-card">
        <div className="grid grid-cols-2 text-sm">
          <div className="bg-muted/60 p-5 font-bold text-muted-foreground uppercase tracking-wide text-xs flex items-center gap-2">
            <XCircle className="h-4 w-4" /> Tradičný prístup
          </div>
          <div className="bg-primary text-primary-foreground p-5 font-bold uppercase tracking-wide text-xs flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4" /> INVOK
          </div>
          {rows.map((r) => (
            <div key={r.trad} className="contents">
              <div className="p-5 border-t border-border text-foreground/80">{r.trad}</div>
              <div className="p-5 border-t border-border text-foreground font-semibold bg-primary/5">{r.invok}</div>
            </div>
          ))}
        </div>
      </div>
    </Section>
  );
}

