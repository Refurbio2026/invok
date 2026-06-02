import { useMemo, useState } from "react";
import { Link } from "@tanstack/react-router";
import { ArrowLeft, RotateCcw, CheckCircle2, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import { TESTS, type TestDef } from "@/data/tests";

type Letter = "A" | "B" | "C" | "D";

export function TestRunner({ slug }: { slug: string }) {
  const test = TESTS[slug];

  if (!test) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 px-6 text-center">
        <h1 className="text-2xl font-bold text-foreground">Test sa nenašiel</h1>
        <p className="text-muted-foreground">Tento test neexistuje alebo bol presunutý.</p>
        <Button asChild>
          <Link to="/" hash="testy">Späť na prehľad testov</Link>
        </Button>
      </div>
    );
  }

  return <Runner test={test} key={slug} />;
}

function Runner({ test }: { test: TestDef }) {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<(Letter | null)[]>(
    Array(test.questions.length).fill(null),
  );
  const [finished, setFinished] = useState(false);

  const total = test.questions.length;
  const progress = finished ? 100 : Math.round((step / total) * 100);
  const current = test.questions[step];
  const selected = answers[step];

  const choose = (key: Letter) => {
    const next = [...answers];
    next[step] = key;
    setAnswers(next);
  };

  const goNext = () => {
    if (step + 1 < total) setStep(step + 1);
    else setFinished(true);
  };

  const restart = () => {
    setStep(0);
    setAnswers(Array(total).fill(null));
    setFinished(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-surface via-background to-accent/20 py-12 sm:py-16">
      <div className="mx-auto max-w-3xl px-4 sm:px-6">
        <div className="flex items-center justify-between mb-8">
          <Button asChild variant="ghost" size="sm" className="gap-2">
            <Link to="/" hash="testy">
              <ArrowLeft className="size-4" />
              Späť na prehľad testov
            </Link>
          </Button>
          <span className="text-xs font-semibold uppercase tracking-wider text-primary">
            Ukážkový test
          </span>
        </div>

        <header className="mb-8">
          <h1 className="text-3xl sm:text-4xl font-extrabold text-foreground tracking-tight">
            {test.title}
          </h1>
          <p className="mt-2 text-muted-foreground">{test.description}</p>
        </header>

        <div className="mb-6 space-y-2">
          <div className="flex items-center justify-between text-xs font-medium text-muted-foreground">
            <span>
              {finished
                ? "Test dokončený"
                : `Otázka ${step + 1} z ${total}`}
            </span>
            <span>{progress}%</span>
          </div>
          <Progress value={progress} />
        </div>

        {!finished ? (
          <div className="rounded-3xl bg-card border border-border p-6 sm:p-10 shadow-card">
            <h2 className="text-lg sm:text-xl font-bold text-foreground leading-snug">
              {current.q}
            </h2>
            <div className="mt-6 grid gap-3">
              {current.options.map((opt) => {
                const active = selected === opt.key;
                return (
                  <button
                    key={opt.key}
                    type="button"
                    onClick={() => choose(opt.key)}
                    className={cn(
                      "text-left rounded-2xl border-2 p-4 sm:p-5 transition flex gap-4 items-start",
                      active
                        ? "border-primary bg-primary/5 shadow-soft"
                        : "border-border bg-background hover:border-primary/40",
                    )}
                  >
                    <span
                      className={cn(
                        "shrink-0 size-9 rounded-full grid place-items-center font-bold text-sm border-2 transition",
                        active
                          ? "bg-primary text-primary-foreground border-primary"
                          : "border-border text-muted-foreground",
                      )}
                    >
                      {opt.key}
                    </span>
                    <span className="text-sm sm:text-base text-foreground leading-relaxed pt-1.5">
                      {opt.text}
                    </span>
                  </button>
                );
              })}
            </div>

            <div className="mt-8 flex items-center justify-between gap-4">
              <Button
                variant="ghost"
                onClick={() => setStep((s) => Math.max(0, s - 1))}
                disabled={step === 0}
              >
                Predošlá
              </Button>
              <Button
                onClick={goNext}
                disabled={!selected}
                className="bg-primary hover:bg-primary/90"
              >
                {step + 1 === total ? "Vyhodnotiť test" : "Ďalšia otázka"}
              </Button>
            </div>
          </div>
        ) : (
          <ResultCard test={test} answers={answers as Letter[]} onRestart={restart} />
        )}
      </div>
    </div>
  );
}

function ResultCard({
  test,
  answers,
  onRestart,
}: {
  test: TestDef;
  answers: Letter[];
  onRestart: () => void;
}) {
  const content = useMemo(() => {
    if (test.kind === "scored") {
      const score = test.questions.reduce(
        (acc, q, i) => acc + (answers[i] === q.correct ? 1 : 0),
        0,
      );
      const bucket =
        test.evaluation.find(
          (e) => score >= e.range[0] && score <= e.range[1],
        ) ?? test.evaluation[0];
      return (
        <ScoredResult
          score={score}
          total={test.questions.length}
          level={bucket.level}
          text={bucket.text}
          questions={test.questions}
          answers={answers}
        />
      );
    }
    const counts: Record<Letter, number> = { A: 0, B: 0, C: 0, D: 0 };
    answers.forEach((a) => {
      if (a) counts[a] += 1;
    });
    const max = Math.max(...Object.values(counts));
    const winners = (Object.keys(counts) as Letter[]).filter(
      (k) => counts[k] === max,
    );
    const names = winners.map((k) => test.profiles[k].name).join(" – ");
    const strengths = winners
      .map((k) => test.profiles[k].strength)
      .join(" • ");
    return <PersonalityResult name={names} strengths={strengths} counts={counts} />;
  }, [test, answers]);

  return (
    <div className="rounded-3xl bg-card border border-border p-6 sm:p-10 shadow-card">
      <div className="flex items-center gap-3 mb-2">
        <span className="size-10 rounded-full bg-primary/10 text-primary grid place-items-center">
          <Sparkles className="size-5" />
        </span>
        <h2 className="text-2xl font-bold text-foreground">Tvoj výsledok</h2>
      </div>
      {content}
      <div className="mt-8 flex flex-col sm:flex-row gap-3">
        <Button onClick={onRestart} variant="outline" className="gap-2">
          <RotateCcw className="size-4" />
          Spustiť test znova
        </Button>
        <Button asChild className="gap-2 bg-primary hover:bg-primary/90">
          <Link to="/" hash="testy">
            <ArrowLeft className="size-4" />
            Späť na prehľad testov
          </Link>
        </Button>
      </div>
    </div>
  );
}

function ScoredResult({
  score,
  total,
  level,
  text,
  questions,
  answers,
}: {
  score: number;
  total: number;
  level: string;
  text: string;
  questions: { q: string; correct: Letter; options: { key: Letter; text: string }[] }[];
  answers: Letter[];
}) {
  return (
    <>
      <p className="text-muted-foreground">Získal/a si</p>
      <div className="mt-1 flex items-baseline gap-2">
        <span className="text-5xl font-extrabold text-primary">{score}</span>
        <span className="text-xl text-muted-foreground">/ {total} bodov</span>
      </div>
      <div className="mt-5 rounded-2xl bg-accent/40 border border-border p-5">
        <p className="text-sm font-semibold text-primary uppercase tracking-wider">
          {level}
        </p>
        <p className="mt-1 text-foreground">{text}</p>
      </div>

      <div className="mt-8">
        <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground mb-3">
          Prehľad odpovedí
        </h3>
        <ol className="space-y-2">
          {questions.map((q, i) => {
            const ok = answers[i] === q.correct;
            const correctText = q.options.find((o) => o.key === q.correct)?.text ?? "";
            return (
              <li
                key={i}
                className="rounded-xl border border-border p-4 flex gap-3 items-start"
              >
                <CheckCircle2
                  className={cn(
                    "size-5 shrink-0 mt-0.5",
                    ok ? "text-primary" : "text-muted-foreground/40",
                  )}
                />
                <div className="text-sm">
                  <p className="text-foreground font-medium">
                    {i + 1}. {q.q}
                  </p>
                  <p className="mt-1 text-muted-foreground">
                    Tvoja odpoveď: <span className="font-semibold">{answers[i]}</span>
                    {ok ? " ✓" : ` · správna: ${q.correct} — ${correctText}`}
                  </p>
                </div>
              </li>
            );
          })}
        </ol>
      </div>
    </>
  );
}

function PersonalityResult({
  name,
  strengths,
  counts,
}: {
  name: string;
  strengths: string;
  counts: Record<Letter, number>;
}) {
  return (
    <>
      <p className="text-muted-foreground">Tvoj profil je</p>
      <div className="mt-1 text-4xl font-extrabold text-primary">{name}</div>
      <div className="mt-5 rounded-2xl bg-accent/40 border border-border p-5">
        <p className="text-sm font-semibold text-primary uppercase tracking-wider">
          Silná stránka
        </p>
        <p className="mt-1 text-foreground">{strengths}</p>
      </div>
      <div className="mt-6 grid grid-cols-4 gap-3">
        {(["A", "B", "C", "D"] as Letter[]).map((k) => (
          <div
            key={k}
            className="rounded-xl border border-border p-3 text-center bg-background"
          >
            <div className="text-xs text-muted-foreground">Typ {k}</div>
            <div className="text-2xl font-bold text-foreground">{counts[k]}</div>
          </div>
        ))}
      </div>
    </>
  );
}
