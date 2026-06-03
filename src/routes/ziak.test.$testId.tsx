import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { Header } from "@/components/invok/Header";
import { Footer } from "@/components/invok/Footer";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  startAttempt,
  saveAnswer,
  submitAttempt,
} from "@/lib/public/student.functions";
import { getStudentSession } from "@/lib/public/student-session";
import { toast } from "sonner";

export const Route = createFileRoute("/ziak/test/$testId")({
  head: () => ({ meta: [{ title: "Test – INVOK" }] }),
  component: TestPage,
});

type StartResult = Awaited<ReturnType<typeof startAttempt>>;
type Question = StartResult["questions"][number];

type OptionItem = { key: string; label: string };

function parseOptions(raw: unknown): OptionItem[] {
  if (!Array.isArray(raw)) return [];
  return raw
    .map((o: any, i: number) => {
      if (typeof o === "string") return { key: String(i), label: o };
      return {
        key: String(o.key ?? o.value ?? i),
        label: String(o.label ?? o.text ?? o.value ?? ""),
      };
    })
    .filter((o) => o.label.length > 0);
}

function TestPage() {
  const { testId } = Route.useParams();
  const navigate = useNavigate();
  const start = useServerFn(startAttempt);
  const save = useServerFn(saveAnswer);
  const submit = useServerFn(submitAttempt);

  const [data, setData] = useState<StartResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [answers, setAnswers] = useState<
    Record<string, { keys: string[]; text: string }>
  >({});
  const [current, setCurrent] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<{ score: number; max: number } | null>(null);

  const session = useMemo(() => getStudentSession(), []);

  useEffect(() => {
    if (!session) {
      navigate({ to: "/ziak/prihlasenie" });
      return;
    }
    start({ data: { code: session.code, pin: session.pin, testId } })
      .then((res) => {
        setData(res);
        const init: Record<string, { keys: string[]; text: string }> = {};
        for (const q of res.questions) init[q.id] = { keys: [], text: "" };
        for (const a of res.answers) {
          init[a.question_id] = {
            keys: (a.answer_keys as string[]) ?? [],
            text: (a.answer_text as string) ?? "",
          };
        }
        setAnswers(init);
      })
      .catch((err) => {
        toast.error(err?.message ?? "Test sa nepodarilo načítať.");
        navigate({ to: "/ziak/dashboard" });
      })
      .finally(() => setLoading(false));
  }, [testId]);

  async function persist(q: Question, keys: string[], text: string) {
    if (!session || !data) return;
    try {
      await save({
        data: {
          code: session.code,
          pin: session.pin,
          attemptId: data.attemptId,
          questionId: q.id,
          answerKeys: keys,
          answerText: text || null,
        },
      });
    } catch (err: any) {
      toast.error(err?.message ?? "Nepodarilo sa uložiť odpoveď.");
    }
  }

  function setAnswer(q: Question, patch: Partial<{ keys: string[]; text: string }>) {
    setAnswers((prev) => {
      const next = { ...prev, [q.id]: { ...prev[q.id], ...patch } };
      persist(q, next[q.id].keys, next[q.id].text);
      return next;
    });
  }

  async function onSubmit() {
    if (!session || !data) return;
    setSubmitting(true);
    try {
      const res = await submit({
        data: {
          code: session.code,
          pin: session.pin,
          attemptId: data.attemptId,
        },
      });
      setResult({ score: Number(res.score ?? 0), max: Number(res.maxScore ?? 0) });
      toast.success("Test bol odovzdaný.");
    } catch (err: any) {
      toast.error(err?.message ?? "Odovzdanie zlyhalo.");
    } finally {
      setSubmitting(false);
    }
  }

  if (loading || !data) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <p className="text-muted-foreground">Načítavam test…</p>
        </main>
        <Footer />
      </div>
    );
  }

  if (result) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Header />
        <main className="flex-1 px-4 py-12 max-w-2xl mx-auto w-full text-center">
          <div className="border border-border rounded-2xl p-10 bg-card">
            <h1 className="text-3xl font-bold mb-2">Test odovzdaný</h1>
            <p className="text-muted-foreground mb-6">
              Tvoje výsledky boli zaznamenané.
            </p>
            <div className="text-5xl font-bold text-primary mb-1">
              {result.score} / {result.max}
            </div>
            <p className="text-sm text-muted-foreground mb-6">bodov</p>
            <Button onClick={() => navigate({ to: "/ziak/dashboard" })}>
              Späť na dashboard
            </Button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (data.questions.length === 0) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <p className="text-muted-foreground">Tento test zatiaľ nemá otázky.</p>
        </main>
        <Footer />
      </div>
    );
  }

  const q = data.questions[current];
  const a = answers[q.id] ?? { keys: [], text: "" };
  const opts = parseOptions(q.options);
  const total = data.questions.length;
  const isLast = current === total - 1;
  const answeredCount = data.questions.filter((qq) => {
    const an = answers[qq.id];
    return an && (an.keys.length > 0 || an.text.trim().length > 0);
  }).length;

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      <main className="flex-1 px-4 py-8 max-w-3xl mx-auto w-full">
        <div className="mb-6">
          <h1 className="text-2xl font-bold">{data.test.title}</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Otázka {current + 1} z {total} · zodpovedané: {answeredCount}/{total}
          </p>
          <div className="h-2 bg-muted rounded-full mt-3 overflow-hidden">
            <div
              className="h-full bg-primary transition-all"
              style={{ width: `${((current + 1) / total) * 100}%` }}
            />
          </div>
        </div>

        <div className="border border-border rounded-xl p-6 bg-card">
          <div className="text-xs text-muted-foreground mb-2">
            {q.question_type === "single" && "Vyber jednu odpoveď"}
            {q.question_type === "multi" && "Vyber všetky správne odpovede"}
            {q.question_type === "scale" && "Ohodnoť na škále"}
            {q.question_type === "text" && "Napíš odpoveď"}
          </div>
          <div className="font-medium text-lg mb-5">{q.question_text}</div>

          {q.question_type === "single" && (
            <RadioGroup
              value={a.keys[0] ?? ""}
              onValueChange={(v) => setAnswer(q, { keys: [v] })}
              className="space-y-2"
            >
              {opts.map((o) => (
                <Label
                  key={o.key}
                  className="flex items-center gap-3 border border-border rounded-lg p-3 cursor-pointer hover:bg-muted/50"
                >
                  <RadioGroupItem value={o.key} />
                  <span>{o.label}</span>
                </Label>
              ))}
            </RadioGroup>
          )}

          {q.question_type === "multi" && (
            <div className="space-y-2">
              {opts.map((o) => {
                const checked = a.keys.includes(o.key);
                return (
                  <Label
                    key={o.key}
                    className="flex items-center gap-3 border border-border rounded-lg p-3 cursor-pointer hover:bg-muted/50"
                  >
                    <Checkbox
                      checked={checked}
                      onCheckedChange={(c) => {
                        const keys = c
                          ? [...a.keys, o.key]
                          : a.keys.filter((k) => k !== o.key);
                        setAnswer(q, { keys });
                      }}
                    />
                    <span>{o.label}</span>
                  </Label>
                );
              })}
            </div>
          )}

          {q.question_type === "scale" && (
            <div className="flex flex-wrap gap-2">
              {(opts.length > 0
                ? opts
                : [1, 2, 3, 4, 5].map((n) => ({ key: String(n), label: String(n) }))
              ).map((o) => {
                const selected = a.keys[0] === o.key;
                return (
                  <button
                    key={o.key}
                    type="button"
                    onClick={() => setAnswer(q, { keys: [o.key] })}
                    className={`min-w-12 px-4 py-3 rounded-lg border transition-colors ${
                      selected
                        ? "bg-primary text-primary-foreground border-primary"
                        : "border-border hover:bg-muted/50"
                    }`}
                  >
                    {o.label}
                  </button>
                );
              })}
            </div>
          )}

          {q.question_type === "text" && (
            <Textarea
              value={a.text}
              onChange={(e) => setAnswer(q, { text: e.target.value })}
              rows={6}
              placeholder="Tvoja odpoveď…"
            />
          )}
        </div>

        <div className="flex justify-between items-center mt-6">
          <Button
            variant="outline"
            onClick={() => setCurrent((c) => Math.max(0, c - 1))}
            disabled={current === 0}
          >
            ← Predchádzajúca
          </Button>

          {isLast ? (
            <Button onClick={onSubmit} disabled={submitting}>
              {submitting ? "Odovzdávam…" : "Odovzdať test"}
            </Button>
          ) : (
            <Button onClick={() => setCurrent((c) => Math.min(total - 1, c + 1))}>
              Ďalšia →
            </Button>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}
