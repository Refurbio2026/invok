import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { ArrowLeft, Loader2, Plus, Trash2 } from "lucide-react";
import { AdminLayout } from "@/components/invok/admin/AdminLayout";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import {
  getTest,
  updateTest,
  saveQuestion,
  deleteQuestion,
} from "@/lib/admin/tests.functions";

export const Route = createFileRoute("/_authenticated/admin/testy/$id")({
  component: TestDetailPage,
});

type Question = {
  id: string;
  test_id: string;
  position: number;
  question_text: string;
  question_type: string;
  competency: string | null;
  options: { key: string; label: string }[];
  correct_keys: string[];
  points: number;
};

function TestDetailPage() {
  const { id } = Route.useParams();
  const fetchTest = useServerFn(getTest);
  const update = useServerFn(updateTest);
  const saveQ = useServerFn(saveQuestion);
  const removeQ = useServerFn(deleteQuestion);
  const qc = useQueryClient();
  const [email, setEmail] = useState<string | null>(null);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setEmail(data.user?.email ?? null));
  }, []);

  const q = useQuery({
    queryKey: ["test", id],
    queryFn: () => fetchTest({ data: { id } }),
  });

  const onSaveMeta = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    try {
      await update({
        data: {
          id,
          title: String(fd.get("title") ?? "").trim(),
          type: String(fd.get("type") ?? "diagnosticky") as any,
          grade_from: fd.get("grade_from") ? Number(fd.get("grade_from")) : null,
          grade_to: fd.get("grade_to") ? Number(fd.get("grade_to")) : null,
          duration_min: fd.get("duration_min")
            ? Number(fd.get("duration_min"))
            : null,
          description: String(fd.get("description") ?? "") || null,
        },
      });
      toast.success("Uložené");
      qc.invalidateQueries({ queryKey: ["test", id] });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Nepodarilo sa uložiť.");
    }
  };

  const onAddQuestion = async () => {
    try {
      const nextPos = (q.data?.questions.length ?? 0) + 1;
      await saveQ({
        data: {
          test_id: id,
          position: nextPos,
          question_text: "Nová otázka",
          question_type: "single",
          options: [
            { key: "a", label: "Možnosť A" },
            { key: "b", label: "Možnosť B" },
          ],
          correct_keys: ["a"],
          points: 1,
        },
      });
      qc.invalidateQueries({ queryKey: ["test", id] });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Nepodarilo sa pridať.");
    }
  };

  const onUpdateQuestion = async (qst: Question) => {
    try {
      await saveQ({
        data: {
          id: qst.id,
          test_id: id,
          position: qst.position,
          question_text: qst.question_text,
          question_type: qst.question_type as any,
          competency: qst.competency,
          options: qst.options,
          correct_keys: qst.correct_keys,
          points: qst.points,
        },
      });
      toast.success("Otázka uložená");
      qc.invalidateQueries({ queryKey: ["test", id] });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Nepodarilo sa uložiť.");
    }
  };

  const onDeleteQuestion = async (qid: string) => {
    if (!confirm("Zmazať otázku?")) return;
    try {
      await removeQ({ data: { id: qid } });
      qc.invalidateQueries({ queryKey: ["test", id] });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Nepodarilo sa zmazať.");
    }
  };

  if (q.isLoading || !q.data) {
    return (
      <AdminLayout title="Test" userEmail={email}>
        <div className="flex items-center gap-2 text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" /> Načítavam…
        </div>
      </AdminLayout>
    );
  }

  const t = q.data.test;
  return (
    <AdminLayout title={`Test: ${t.title}`} userEmail={email}>
      <Link
        to="/admin/testy"
        className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-primary mb-4"
      >
        <ArrowLeft className="h-4 w-4" /> Späť na zoznam
      </Link>

      <form
        onSubmit={onSaveMeta}
        className="bg-card border border-border rounded-xl p-5 space-y-3 mb-6"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div>
            <Label htmlFor="title">Názov</Label>
            <Input
              id="title"
              name="title"
              defaultValue={t.title}
              required
              className="mt-1.5"
            />
          </div>
          <div>
            <Label>Typ</Label>
            <Select name="type" defaultValue={t.type}>
              <SelectTrigger className="mt-1.5">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {["vstupny", "vystupny", "diagnosticky", "prakticky"].map((k) => (
                  <SelectItem key={k} value={k}>
                    {k}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="duration_min">Čas (min)</Label>
            <Input
              id="duration_min"
              name="duration_min"
              type="number"
              defaultValue={t.duration_min ?? ""}
              className="mt-1.5"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label htmlFor="grade_from">Od ročníka</Label>
              <Input
                id="grade_from"
                name="grade_from"
                type="number"
                defaultValue={t.grade_from ?? ""}
                className="mt-1.5"
              />
            </div>
            <div>
              <Label htmlFor="grade_to">Do ročníka</Label>
              <Input
                id="grade_to"
                name="grade_to"
                type="number"
                defaultValue={t.grade_to ?? ""}
                className="mt-1.5"
              />
            </div>
          </div>
        </div>
        <div>
          <Label htmlFor="description">Popis</Label>
          <Textarea
            id="description"
            name="description"
            rows={3}
            defaultValue={t.description ?? ""}
            className="mt-1.5"
          />
        </div>
        <div className="flex justify-end">
          <Button type="submit">Uložiť metadáta</Button>
        </div>
      </form>

      <div className="flex items-center justify-between mb-3">
        <h2 className="text-lg font-semibold">
          Otázky ({q.data.questions.length})
        </h2>
        <Button size="sm" onClick={onAddQuestion} className="gap-1.5">
          <Plus className="h-4 w-4" /> Pridať otázku
        </Button>
      </div>

      <div className="space-y-4">
        {q.data.questions.map((qst: Question) => (
          <QuestionCard
            key={qst.id}
            question={qst}
            onSave={onUpdateQuestion}
            onDelete={() => onDeleteQuestion(qst.id)}
          />
        ))}
        {q.data.questions.length === 0 && (
          <div className="bg-card border border-border rounded-xl p-8 text-center text-muted-foreground">
            Zatiaľ žiadne otázky. Pridajte prvú vyššie.
          </div>
        )}
      </div>
    </AdminLayout>
  );
}

function QuestionCard({
  question,
  onSave,
  onDelete,
}: {
  question: Question;
  onSave: (q: Question) => void;
  onDelete: () => void;
}) {
  const [draft, setDraft] = useState<Question>(question);

  useEffect(() => setDraft(question), [question]);

  const setOption = (i: number, patch: Partial<{ key: string; label: string }>) => {
    setDraft((d) => ({
      ...d,
      options: d.options.map((o, idx) => (idx === i ? { ...o, ...patch } : o)),
    }));
  };

  const addOption = () =>
    setDraft((d) => {
      const nextLetter = String.fromCharCode(
        97 + Math.min(d.options.length, 25),
      );
      return {
        ...d,
        options: [...d.options, { key: nextLetter, label: "" }],
      };
    });

  const removeOption = (i: number) =>
    setDraft((d) => ({
      ...d,
      options: d.options.filter((_, idx) => idx !== i),
      correct_keys: d.correct_keys.filter((k) => k !== d.options[i].key),
    }));

  const toggleCorrect = (key: string) =>
    setDraft((d) => ({
      ...d,
      correct_keys:
        d.question_type === "multi"
          ? d.correct_keys.includes(key)
            ? d.correct_keys.filter((k) => k !== key)
            : [...d.correct_keys, key]
          : [key],
    }));

  return (
    <div className="bg-card border border-border rounded-xl p-5 space-y-3">
      <div className="flex items-start gap-3">
        <span className="h-7 w-7 rounded-full bg-primary text-primary-foreground text-xs font-semibold flex items-center justify-center shrink-0 mt-1">
          {draft.position}
        </span>
        <div className="flex-1">
          <Textarea
            value={draft.question_text}
            onChange={(e) =>
              setDraft({ ...draft, question_text: e.target.value })
            }
            rows={2}
          />
        </div>
        <Button variant="ghost" size="icon" onClick={onDelete}>
          <Trash2 className="h-4 w-4 text-destructive" />
        </Button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div>
          <Label className="text-xs">Typ</Label>
          <Select
            value={draft.question_type}
            onValueChange={(v) => setDraft({ ...draft, question_type: v })}
          >
            <SelectTrigger className="mt-1.5">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="single">Jedna odpoveď</SelectItem>
              <SelectItem value="multi">Viac odpovedí</SelectItem>
              <SelectItem value="scale">Škála 1–5</SelectItem>
              <SelectItem value="text">Voľný text</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label className="text-xs">Kompetencia</Label>
          <Input
            value={draft.competency ?? ""}
            onChange={(e) => setDraft({ ...draft, competency: e.target.value })}
            placeholder="napr. komunikácia"
            className="mt-1.5"
          />
        </div>
        <div>
          <Label className="text-xs">Body</Label>
          <Input
            type="number"
            value={draft.points}
            min={0}
            max={100}
            onChange={(e) =>
              setDraft({ ...draft, points: Number(e.target.value) })
            }
            className="mt-1.5"
          />
        </div>
        <div>
          <Label className="text-xs">Poradie</Label>
          <Input
            type="number"
            value={draft.position}
            min={1}
            onChange={(e) =>
              setDraft({ ...draft, position: Number(e.target.value) })
            }
            className="mt-1.5"
          />
        </div>
      </div>

      {(draft.question_type === "single" ||
        draft.question_type === "multi") && (
        <div className="space-y-2">
          <Label className="text-xs">Možnosti (zaškrtnite správne)</Label>
          {draft.options.map((opt, i) => (
            <div key={i} className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={draft.correct_keys.includes(opt.key)}
                onChange={() => toggleCorrect(opt.key)}
                className="h-4 w-4"
              />
              <Input
                value={opt.key}
                onChange={(e) => setOption(i, { key: e.target.value })}
                className="w-16"
              />
              <Input
                value={opt.label}
                onChange={(e) => setOption(i, { label: e.target.value })}
                placeholder="Text možnosti"
              />
              <Button
                variant="ghost"
                size="icon"
                onClick={() => removeOption(i)}
              >
                <Trash2 className="h-4 w-4 text-destructive" />
              </Button>
            </div>
          ))}
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={addOption}
            className="gap-1.5"
          >
            <Plus className="h-3.5 w-3.5" /> Pridať možnosť
          </Button>
        </div>
      )}

      <div className="flex justify-end">
        <Button onClick={() => onSave(draft)}>Uložiť otázku</Button>
      </div>
    </div>
  );
}
