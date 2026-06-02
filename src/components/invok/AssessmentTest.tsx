import { useMemo, useState } from "react";
import { Link } from "@tanstack/react-router";
import { ArrowLeft, CheckCircle2, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Header } from "@/components/invok/Header";
import { Footer } from "@/components/invok/Footer";
import { RadarChart } from "@/components/invok/RadarChart";
import {
  COMPETENCIES, CompetencyKey, MAX_PER_COMP, OPEN_QUESTIONS, SCORED_ITEMS,
} from "@/data/assessment";

const LIKERT = [
  { v: 1, l: "Vôbec" },
  { v: 2, l: "Skôr nie" },
  { v: 3, l: "Niekedy" },
  { v: 4, l: "Skôr áno" },
  { v: 5, l: "Úplne" },
];

export function AssessmentTest({ variant }: { variant: "vstupny" | "vystupny" }) {
  const variantLabel = variant === "vstupny" ? "Vstupný test" : "Výstupný test";
  const totalSteps = SCORED_ITEMS.length + OPEN_QUESTIONS.length;
  const [step, setStep] = useState(0);
  const [scored, setScored] = useState<Record<string, number>>({});
  const [open, setOpen] = useState<Record<number, string>>({});
  const [done, setDone] = useState(false);

  const isScoredStep = step < SCORED_ITEMS.length;
  const currentItem = isScoredStep ? SCORED_ITEMS[step] : null;
  const currentOpenIndex = isScoredStep ? -1 : step - SCORED_ITEMS.length;
  const progress = Math.round(((step + (done ? 1 : 0)) / totalSteps) * 100);

  const canNext = isScoredStep
    ? scored[currentItem!.id] !== undefined
    : (open[currentOpenIndex] ?? "").trim().length >= 3;

  const results = useMemo(() => {
    return COMPETENCIES.map((c) => {
      const items = SCORED_ITEMS.filter((i) => i.competency === c.key);
      const sum = items.reduce((acc, it) => acc + (scored[it.id] ?? 0), 0);
      return { key: c.key as CompetencyKey, label: c.short, value: sum, max: MAX_PER_COMP };
    });
  }, [scored]);

  const totalScore = results.reduce((a, r) => a + r.value, 0);
  const maxTotal = results.reduce((a, r) => a + r.max, 0);

  const reset = () => {
    setStep(0); setScored({}); setOpen({}); setDone(false);
  };

  if (done) {
    return (
      <div className="bg-background">
        <Header />
        <main className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 py-12">
          <Button asChild variant="ghost" size="sm" className="mb-4">
            <Link to="/testy"><ArrowLeft className="h-4 w-4" /> Späť na prehľad testov</Link>
          </Button>
          <span className="inline-block text-xs font-bold uppercase tracking-wider text-teal bg-accent px-3 py-1 rounded-full">{variantLabel} · Vyhodnotenie</span>
          <h1 className="mt-3 text-3xl sm:text-4xl font-extrabold text-foreground">Výsledky kompetenčného testu</h1>
          <p className="mt-2 text-muted-foreground">
            Celkové skóre <b className="text-foreground">{totalScore} / {maxTotal}</b> bodov. Otvorené odpovede vyhodnotí pedagóg.
          </p>

          <div className="mt-8 grid gap-8 lg:grid-cols-5">
            <div className="lg:col-span-2 rounded-3xl bg-card border border-border p-6 shadow-card">
              <RadarChart data={results} />
            </div>
            <div className="lg:col-span-3 rounded-3xl bg-card border border-border p-6 shadow-soft">
              <h2 className="font-bold text-foreground mb-4">Skóre podľa kompetencií</h2>
              <div className="space-y-4">
                {results.map((r) => {
                  const pct = Math.round((r.value / r.max) * 100);
                  return (
                    <div key={r.key}>
                      <div className="flex justify-between text-sm mb-1.5">
                        <span className="font-medium text-foreground">{r.label}</span>
                        <span className="font-bold text-primary">{r.value} / {r.max} <span className="text-muted-foreground font-normal">({pct}%)</span></span>
                      </div>
                      <div className="h-2.5 rounded-full bg-muted overflow-hidden">
                        <div className="h-full rounded-full bg-gradient-badge" style={{ width: `${pct}%` }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="mt-8 rounded-2xl bg-accent/50 p-5 text-sm text-foreground">
            <CheckCircle2 className="h-5 w-5 text-teal inline mr-2" />
            Výsledky sú orientačné. V plnej verzii programu INVOK sa ukladajú anonymne a slúžia ako podklad pre vstupné a výstupné porovnanie.
          </div>

          <div className="mt-6 flex flex-wrap gap-3">
            <Button onClick={reset} variant="outline"><RotateCcw className="h-4 w-4" /> Spustiť test znova</Button>
            <Button asChild className="bg-gradient-badge text-white hover:opacity-90">
              <Link to="/testy">Späť na prehľad testov</Link>
            </Button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="bg-background">
      <Header />
      <main className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 py-12">
        <Button asChild variant="ghost" size="sm" className="mb-4">
          <Link to="/testy"><ArrowLeft className="h-4 w-4" /> Späť na prehľad testov</Link>
        </Button>

        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-bold uppercase tracking-wider text-teal bg-accent px-3 py-1 rounded-full">{variantLabel}</span>
          <span className="text-xs text-muted-foreground">Otázka {step + 1} z {totalSteps}</span>
        </div>
        <div className="h-2 rounded-full bg-muted overflow-hidden mb-8">
          <div className="h-full bg-gradient-badge transition-all" style={{ width: `${progress}%` }} />
        </div>

        <div className="rounded-3xl bg-card border border-border p-7 sm:p-9 shadow-card">
          {isScoredStep ? (
            <>
              <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">
                {COMPETENCIES.find((c) => c.key === currentItem!.competency)?.label}
              </div>
              <h2 className="text-xl sm:text-2xl font-bold text-foreground">{currentItem!.text}</h2>
              <div className="mt-6 grid gap-2 sm:grid-cols-5">
                {LIKERT.map((opt) => {
                  const active = scored[currentItem!.id] === opt.v;
                  return (
                    <button
                      key={opt.v}
                      type="button"
                      onClick={() => setScored((s) => ({ ...s, [currentItem!.id]: opt.v }))}
                      className={
                        "rounded-2xl border-2 px-3 py-3 text-center transition " +
                        (active
                          ? "bg-primary text-primary-foreground border-primary shadow-soft"
                          : "bg-card border-border text-foreground hover:border-primary/50")
                      }
                    >
                      <div className="text-lg font-extrabold">{opt.v}</div>
                      <div className="text-[11px] uppercase tracking-wide opacity-80">{opt.l}</div>
                    </button>
                  );
                })}
              </div>
            </>
          ) : (
            <>
              <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">Otvorená otázka</div>
              <h2 className="text-xl sm:text-2xl font-bold text-foreground">{OPEN_QUESTIONS[currentOpenIndex]}</h2>
              <textarea
                value={open[currentOpenIndex] ?? ""}
                onChange={(e) => setOpen((o) => ({ ...o, [currentOpenIndex]: e.target.value }))}
                rows={6}
                maxLength={1500}
                placeholder="Tvoja odpoveď…"
                className="mt-5 w-full rounded-2xl border border-border bg-background p-4 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </>
          )}
        </div>

        <div className="mt-6 flex items-center justify-between">
          <Button variant="outline" disabled={step === 0} onClick={() => setStep((s) => Math.max(0, s - 1))}>Späť</Button>
          {step < totalSteps - 1 ? (
            <Button disabled={!canNext} onClick={() => setStep((s) => s + 1)} className="bg-gradient-badge text-white hover:opacity-90">Ďalšia otázka</Button>
          ) : (
            <Button disabled={!canNext} onClick={() => setDone(true)} className="bg-gradient-badge text-white hover:opacity-90">Vyhodnotiť test</Button>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}
