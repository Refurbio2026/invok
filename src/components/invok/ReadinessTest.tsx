import { useState } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const questions = [
  "Rozvíjate u žiakov cielene kritické myslenie?",
  "Pracujete s projektovým vyučovaním aspoň raz mesačne?",
  "Využívate moderné digitálne nástroje vo výučbe?",
  "Majú žiaci priestor prezentovať vlastné nápady?",
  "Sledujete rozvoj mäkkých zručností žiakov?",
  "Máte zavedené metódy na rozvoj tímovej spolupráce?",
  "Učia sa žiaci pracovať s informáciami z rôznych zdrojov?",
  "Podporujete u žiakov mediálnu gramotnosť?",
  "Majú učitelia prístup k metodickým materiálom?",
  "Spolupracuje vaša škola s externými partnermi?",
  "Realizujete pravidelne workshopy mimo bežnej výučby?",
  "Vyhodnocujete spätnú väzbu žiakov?",
  "Majú žiaci možnosť riešiť reálne problémy svojho okolia?",
  "Vediete žiakov k podnikavosti a iniciatíve?",
  "Pracujete s témou inklúzie vo výučbe?",
];

export function ReadinessTest() {
  const [answers, setAnswers] = useState<(boolean | null)[]>(Array(15).fill(null));
  const [result, setResult] = useState<string | null>(null);

  const set = (i: number, v: boolean) => {
    const next = [...answers];
    next[i] = v;
    setAnswers(next);
  };

  const evaluate = () => {
    const score = answers.filter((a) => a === true).length;
    if (score >= 12) setResult(`Skvelé! Skóre ${score}/15 — vaša škola je výborne pripravená. INVOK vám pomôže posunúť kompetencie ešte ďalej.`);
    else if (score >= 7) setResult(`Dobré skóre ${score}/15 — máte solídny základ. Program INVOK doplní chýbajúce oblasti systematicky.`);
    else setResult(`Skóre ${score}/15 — je veľký priestor na rast. Program INVOK vás komplexne podporí v rozvoji kompetencií.`);
  };

  return (
    <div className="rounded-3xl bg-card border border-border p-6 sm:p-10 shadow-card">
      <div className="space-y-3">
        {questions.map((q, i) => (
          <div key={i} className="flex items-center justify-between gap-4 py-3 border-b border-border last:border-0">
            <span className="text-sm sm:text-base text-foreground"><span className="text-muted-foreground mr-2">{i + 1}.</span>{q}</span>
            <div className="flex gap-2 shrink-0">
              <Pill active={answers[i] === true} onClick={() => set(i, true)}>Áno</Pill>
              <Pill active={answers[i] === false} onClick={() => set(i, false)}>Nie</Pill>
            </div>
          </div>
        ))}
      </div>
      <div className="mt-8 flex flex-col sm:flex-row items-start sm:items-center gap-4 justify-between">
        <Button onClick={evaluate} className="bg-gradient-badge text-white hover:opacity-90">Vyhodnotiť test</Button>
        {result && <p className="text-sm font-medium text-foreground bg-accent/50 px-4 py-3 rounded-xl">{result}</p>}
      </div>
    </div>
  );
}

function Pill({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "px-4 py-1.5 rounded-full text-sm font-medium border transition",
        active ? "bg-primary text-primary-foreground border-primary" : "bg-background text-muted-foreground border-border hover:border-primary/50"
      )}
    >{children}</button>
  );
}
