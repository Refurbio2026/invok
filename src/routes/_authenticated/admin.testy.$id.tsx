import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import {
  ArrowLeft,
  GripVertical,
  Loader2,
  Plus,
  Trash2,
  Eye,
  Send,
  Archive,
  Copy,
  AlertTriangle,
} from "lucide-react";
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  arrayMove,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { AdminLayout } from "@/components/invok/admin/AdminLayout";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import {
  getTest,
  updateTest,
  saveQuestion,
  deleteQuestion,
  reorderQuestions,
  duplicateQuestion,
  duplicateTest,
  listModules,
  COMPETENCY_AREAS,
  QUESTION_TYPES,
  TEST_TYPES,
} from "@/lib/admin/tests.functions";
import {
  listScoringRules,
  saveScoringRule,
  deleteScoringRule,
  listAssignments,
  saveAssignment,
  deleteAssignment,
  listSchoolsLite,
  listClassesLite,
} from "@/lib/admin/test-config.functions";

export const Route = createFileRoute("/_authenticated/admin/testy/$id")({
  component: TestDetailPage,
});

type Option = { key: string; label: string; feedback?: string | null; points?: number };
type Question = {
  id: string;
  test_id: string;
  position: number;
  question_text: string;
  question_description?: string | null;
  question_type: string;
  competency: string | null;
  options: Option[];
  correct_keys: string[];
  points: number;
  is_required?: boolean;
  scale_min?: number | null;
  scale_max?: number | null;
};

const COMP_LABELS: Record<string, string> = {
  podnikavost: "Podnikavosť",
  "kriticke-myslenie": "Kritické myslenie",
  "timova-spolupraca": "Tímová spolupráca",
  "digitalne-zrucnosti": "Digitálne zručnosti",
  komunikacia: "Komunikácia",
  sebahodnotenie: "Sebahodnotenie",
};

const QTYPE_LABELS: Record<string, string> = {
  single: "Jedna odpoveď",
  multi: "Viac odpovedí",
  scale_1_5: "Škála 1–5",
  scale_0_10: "Škála 0–10",
  open: "Voľný text",
  yes_no: "Áno/Nie",
  matching: "Priraďovanie",
  ordering: "Zoraďovanie",
  scale: "Škála (vlastná)",
  text: "Text",
};

function TestDetailPage() {
  const { id } = Route.useParams();
  const fetchTest = useServerFn(getTest);
  const update = useServerFn(updateTest);
  const dupTest = useServerFn(duplicateTest);
  const [email, setEmail] = useState<string | null>(null);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setEmail(data.user?.email ?? null));
  }, []);

  const q = useQuery({
    queryKey: ["test", id],
    queryFn: () => fetchTest({ data: { id } }),
  });

  const qc = useQueryClient();

  const onPublish = async () => {
    if (!q.data?.questions.length) {
      toast.error("Test nemá žiadne otázky — najskôr ich pridajte.");
      return;
    }
    try {
      await update({ data: { id, status: "published" } });
      toast.success("Test publikovaný");
      qc.invalidateQueries({ queryKey: ["test", id] });
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Chyba");
    }
  };

  const onArchive = async () => {
    try {
      await update({ data: { id, status: "archived" } });
      toast.success("Test archivovaný");
      qc.invalidateQueries({ queryKey: ["test", id] });
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Chyba");
    }
  };

  const onDuplicate = async () => {
    try {
      await dupTest({ data: { id } });
      toast.success("Test duplikovaný");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Chyba");
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
  const hasQuestions = q.data.questions.length > 0;

  return (
    <AdminLayout title={`Test: ${t.title}`} userEmail={email}>
      <div className="flex items-center justify-between mb-4">
        <Link
          to="/admin/testy"
          className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-primary"
        >
          <ArrowLeft className="h-4 w-4" /> Späť na zoznam
        </Link>
        <div className="flex items-center gap-2">
          <Badge variant={t.status === "published" ? "default" : "secondary"}>
            {t.status === "draft"
              ? "Koncept"
              : t.status === "published"
                ? "Publikovaný"
                : "Archivovaný"}
          </Badge>
          <Button variant="outline" size="sm" onClick={onDuplicate} className="gap-1.5">
            <Copy className="h-4 w-4" /> Duplikovať
          </Button>
          {t.status !== "published" ? (
            <Button size="sm" onClick={onPublish} className="gap-1.5">
              <Send className="h-4 w-4" /> Publikovať
            </Button>
          ) : (
            <Button size="sm" variant="outline" onClick={onArchive} className="gap-1.5">
              <Archive className="h-4 w-4" /> Archivovať
            </Button>
          )}
        </div>
      </div>

      {!hasQuestions && t.status !== "published" && (
        <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-3 mb-4 flex items-center gap-2 text-sm">
          <AlertTriangle className="h-4 w-4 text-amber-600" />
          Test ešte nemá otázky. Pred publikovaním pridajte aspoň jednu otázku.
        </div>
      )}

      <Tabs defaultValue="detail" className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="detail">Detail</TabsTrigger>
          <TabsTrigger value="questions">
            Otázky ({q.data.questions.length})
          </TabsTrigger>
          <TabsTrigger value="scoring">Vyhodnotenie</TabsTrigger>
          <TabsTrigger value="assignments">Priradenia</TabsTrigger>
          <TabsTrigger value="preview">Náhľad</TabsTrigger>
        </TabsList>

        <TabsContent value="detail">
          <DetailTab test={t} testId={id} />
        </TabsContent>
        <TabsContent value="questions">
          <QuestionsTab testId={id} questions={q.data.questions as any} />
        </TabsContent>
        <TabsContent value="scoring">
          <ScoringTab testId={id} />
        </TabsContent>
        <TabsContent value="assignments">
          <AssignmentsTab testId={id} />
        </TabsContent>
        <TabsContent value="preview">
          <PreviewTab test={t} questions={q.data.questions as any} />
        </TabsContent>
      </Tabs>
    </AdminLayout>
  );
}

/* ===================== DETAIL TAB ===================== */
function DetailTab({ test, testId }: { test: any; testId: string }) {
  const update = useServerFn(updateTest);
  const fetchModules = useServerFn(listModules);
  const qc = useQueryClient();
  const modules = useQuery({ queryKey: ["modules"], queryFn: () => fetchModules() });

  const [state, setState] = useState({
    title: test.title ?? "",
    type: test.type ?? "diagnosticky",
    module_id: test.module_id ?? "",
    grade_from: test.grade_from ?? "",
    grade_to: test.grade_to ?? "",
    duration_min: test.duration_min ?? "",
    description: test.description ?? "",
    instructions: test.instructions ?? "",
    completion_text: test.completion_text ?? "",
    start_button_text: test.start_button_text ?? "",
    show_result_to_student: !!test.show_result_to_student,
    save_to_school_report: !!test.save_to_school_report,
    allow_retake: !!test.allow_retake,
    anonymous_allowed: !!test.anonymous_allowed,
    evaluate_by_competency: !!test.evaluate_by_competency,
  });

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await update({
        data: {
          id: testId,
          title: state.title.trim(),
          type: state.type as any,
          module_id: state.module_id || null,
          grade_from: state.grade_from ? Number(state.grade_from) : null,
          grade_to: state.grade_to ? Number(state.grade_to) : null,
          duration_min: state.duration_min ? Number(state.duration_min) : null,
          description: state.description || null,
          instructions: state.instructions || null,
          completion_text: state.completion_text || null,
          start_button_text: state.start_button_text || null,
          show_result_to_student: state.show_result_to_student,
          save_to_school_report: state.save_to_school_report,
          allow_retake: state.allow_retake,
          anonymous_allowed: state.anonymous_allowed,
          evaluate_by_competency: state.evaluate_by_competency,
        },
      });
      toast.success("Uložené");
      qc.invalidateQueries({ queryKey: ["test", testId] });
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Chyba");
    }
  };

  return (
    <form
      onSubmit={onSubmit}
      className="bg-card border border-border rounded-xl p-5 space-y-4"
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label>Názov</Label>
          <Input
            value={state.title}
            onChange={(e) => setState({ ...state, title: e.target.value })}
            required
            className="mt-1.5"
          />
        </div>
        <div>
          <Label>Typ testu</Label>
          <Select
            value={state.type}
            onValueChange={(v) => setState({ ...state, type: v })}
          >
            <SelectTrigger className="mt-1.5">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {TEST_TYPES.map((k) => (
                <SelectItem key={k} value={k}>
                  {k}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label>Modul</Label>
          <Select
            value={state.module_id || "none"}
            onValueChange={(v) =>
              setState({ ...state, module_id: v === "none" ? "" : v })
            }
          >
            <SelectTrigger className="mt-1.5">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">— bez modulu —</SelectItem>
              {(modules.data ?? []).map((m: any) => (
                <SelectItem key={m.id} value={m.id}>
                  {m.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="grid grid-cols-3 gap-3">
          <div>
            <Label>Od roč.</Label>
            <Input
              type="number"
              value={state.grade_from}
              onChange={(e) => setState({ ...state, grade_from: e.target.value })}
              className="mt-1.5"
            />
          </div>
          <div>
            <Label>Do roč.</Label>
            <Input
              type="number"
              value={state.grade_to}
              onChange={(e) => setState({ ...state, grade_to: e.target.value })}
              className="mt-1.5"
            />
          </div>
          <div>
            <Label>Čas (min)</Label>
            <Input
              type="number"
              value={state.duration_min}
              onChange={(e) => setState({ ...state, duration_min: e.target.value })}
              className="mt-1.5"
            />
          </div>
        </div>
      </div>

      <div>
        <Label>Popis</Label>
        <Textarea
          rows={2}
          value={state.description}
          onChange={(e) => setState({ ...state, description: e.target.value })}
          className="mt-1.5"
        />
      </div>
      <div>
        <Label>Inštrukcie pre žiaka</Label>
        <Textarea
          rows={3}
          value={state.instructions}
          onChange={(e) => setState({ ...state, instructions: e.target.value })}
          className="mt-1.5"
          placeholder="Zobrazia sa žiakovi pred začatím testu"
        />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label>Text tlačidla „Začať"</Label>
          <Input
            value={state.start_button_text}
            onChange={(e) => setState({ ...state, start_button_text: e.target.value })}
            placeholder="Začať test"
            className="mt-1.5"
          />
        </div>
      </div>
      <div>
        <Label>Záverečný text (po dokončení testu)</Label>
        <Textarea
          rows={2}
          value={state.completion_text}
          onChange={(e) => setState({ ...state, completion_text: e.target.value })}
          className="mt-1.5"
          placeholder="Ďakujeme za vyplnenie testu!"
        />
      </div>


      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
        <ToggleRow
          label="Zobraziť výsledok žiakovi"
          value={state.show_result_to_student}
          onChange={(v) => setState({ ...state, show_result_to_student: v })}
        />
        <ToggleRow
          label="Uložiť do reportu školy"
          value={state.save_to_school_report}
          onChange={(v) => setState({ ...state, save_to_school_report: v })}
        />
        <ToggleRow
          label="Povoliť opakovanie"
          value={state.allow_retake}
          onChange={(v) => setState({ ...state, allow_retake: v })}
        />
        <ToggleRow
          label="Povoliť anonymné vyplnenie"
          value={state.anonymous_allowed}
          onChange={(v) => setState({ ...state, anonymous_allowed: v })}
        />
        <ToggleRow
          label="Hodnotiť podľa kompetencií"
          value={state.evaluate_by_competency}
          onChange={(v) => setState({ ...state, evaluate_by_competency: v })}
        />
      </div>

      <div className="flex justify-end pt-2">
        <Button type="submit">Uložiť zmeny</Button>
      </div>
    </form>
  );
}

function ToggleRow({
  label,
  value,
  onChange,
}: {
  label: string;
  value: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <div className="flex items-center justify-between border border-border rounded-lg px-3 py-2">
      <span className="text-sm">{label}</span>
      <Switch checked={value} onCheckedChange={onChange} />
    </div>
  );
}

/* ===================== QUESTIONS TAB ===================== */
function QuestionsTab({
  testId,
  questions,
}: {
  testId: string;
  questions: Question[];
}) {
  const saveQ = useServerFn(saveQuestion);
  const removeQ = useServerFn(deleteQuestion);
  const reorder = useServerFn(reorderQuestions);
  const dupQ = useServerFn(duplicateQuestion);
  const qc = useQueryClient();

  const [items, setItems] = useState<Question[]>(
    questions.map((q) => ({
      ...q,
      options: Array.isArray(q.options) ? q.options : [],
      correct_keys: q.correct_keys ?? [],
      competency: q.competency ?? null,
    })),
  );

  useEffect(() => {
    setItems(
      questions.map((q) => ({
        ...q,
        options: Array.isArray(q.options) ? q.options : [],
        correct_keys: q.correct_keys ?? [],
        competency: q.competency ?? null,
      })),
    );
  }, [questions]);

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }));

  const onDragEnd = async (e: DragEndEvent) => {
    const { active, over } = e;
    if (!over || active.id === over.id) return;
    const oldIdx = items.findIndex((i) => i.id === active.id);
    const newIdx = items.findIndex((i) => i.id === over.id);
    const next = arrayMove(items, oldIdx, newIdx).map((q, i) => ({
      ...q,
      position: i + 1,
    }));
    setItems(next);
    try {
      await reorder({
        data: {
          test_id: testId,
          order: next.map((q) => ({ id: q.id, position: q.position })),
        },
      });
      qc.invalidateQueries({ queryKey: ["test", testId] });
    } catch (e) {
      toast.error("Nepodarilo sa zmeniť poradie");
    }
  };

  const onAdd = async () => {
    try {
      await saveQ({
        data: {
          test_id: testId,
          position: items.length + 1,
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
      qc.invalidateQueries({ queryKey: ["test", testId] });
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Chyba");
    }
  };

  const onSave = async (qst: Question) => {
    try {
      await saveQ({
        data: {
          id: qst.id,
          test_id: testId,
          position: qst.position,
          question_text: qst.question_text,
          question_description: qst.question_description ?? null,
          question_type: qst.question_type as any,
          competency: qst.competency,
          options: qst.options,
          correct_keys: qst.correct_keys,
          points: qst.points,
          is_required: qst.is_required ?? true,
        },
      });
      toast.success("Otázka uložená");
      qc.invalidateQueries({ queryKey: ["test", testId] });
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Chyba");
    }
  };

  const onDuplicate = async (qid: string) => {
    try {
      await dupQ({ data: { id: qid } });
      toast.success("Otázka duplikovaná");
      qc.invalidateQueries({ queryKey: ["test", testId] });
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Chyba");
    }
  };


  const onDelete = async (qid: string) => {
    if (!confirm("Zmazať otázku?")) return;
    try {
      await removeQ({ data: { id: qid } });
      qc.invalidateQueries({ queryKey: ["test", testId] });
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Chyba");
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-lg font-semibold">Otázky ({items.length})</h2>
        <Button size="sm" onClick={onAdd} className="gap-1.5">
          <Plus className="h-4 w-4" /> Pridať otázku
        </Button>
      </div>

      {items.length === 0 ? (
        <div className="bg-card border border-border rounded-xl p-8 text-center text-muted-foreground">
          Zatiaľ žiadne otázky. Pridajte prvú vyššie.
        </div>
      ) : (
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={onDragEnd}>
          <SortableContext
            items={items.map((i) => i.id)}
            strategy={verticalListSortingStrategy}
          >
            <div className="space-y-3">
              {items.map((qst) => (
                <SortableQuestion
                  key={qst.id}
                  question={qst}
                  onSave={onSave}
                  onDelete={() => onDelete(qst.id)}
                  onDuplicate={() => onDuplicate(qst.id)}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      )}
    </div>
  );
}

function SortableQuestion({
  question,
  onSave,
  onDelete,
  onDuplicate,
}: {
  question: Question;
  onSave: (q: Question) => void;
  onDelete: () => void;
  onDuplicate: () => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: question.id });
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div ref={setNodeRef} style={style}>
      <QuestionCard
        question={question}
        onSave={onSave}
        onDelete={onDelete}
        onDuplicate={onDuplicate}
        dragHandle={
          <button
            type="button"
            {...attributes}
            {...listeners}
            className="cursor-grab active:cursor-grabbing text-muted-foreground hover:text-foreground p-1"
            aria-label="Presunúť"
          >
            <GripVertical className="h-4 w-4" />
          </button>
        }
      />
    </div>
  );
}

function QuestionCard({
  question,
  onSave,
  onDelete,
  dragHandle,
}: {
  question: Question;
  onSave: (q: Question) => void;
  onDelete: () => void;
  dragHandle?: React.ReactNode;
}) {
  const [draft, setDraft] = useState<Question>(question);
  useEffect(() => setDraft(question), [question]);

  const setOption = (i: number, patch: Partial<Option>) => {
    setDraft((d) => ({
      ...d,
      options: d.options.map((o, idx) => (idx === i ? { ...o, ...patch } : o)),
    }));
  };
  const addOption = () =>
    setDraft((d) => {
      const next = String.fromCharCode(97 + Math.min(d.options.length, 25));
      return { ...d, options: [...d.options, { key: next, label: "" }] };
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

  const hasOptions =
    draft.question_type === "single" ||
    draft.question_type === "multi" ||
    draft.question_type === "yes_no";

  return (
    <div className="bg-card border border-border rounded-xl p-4 space-y-3">
      <div className="flex items-start gap-2">
        {dragHandle}
        <span className="h-7 w-7 rounded-full bg-primary text-primary-foreground text-xs font-semibold flex items-center justify-center shrink-0 mt-1">
          {draft.position}
        </span>
        <div className="flex-1">
          <Textarea
            value={draft.question_text}
            onChange={(e) => setDraft({ ...draft, question_text: e.target.value })}
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
              {QUESTION_TYPES.map((k) => (
                <SelectItem key={k} value={k}>
                  {QTYPE_LABELS[k] ?? k}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label className="text-xs">Kompetencia</Label>
          <Select
            value={draft.competency || "none"}
            onValueChange={(v) =>
              setDraft({ ...draft, competency: v === "none" ? null : v })
            }
          >
            <SelectTrigger className="mt-1.5">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">— žiadna —</SelectItem>
              {COMPETENCY_AREAS.map((k) => (
                <SelectItem key={k} value={k}>
                  {COMP_LABELS[k] ?? k}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label className="text-xs">Body</Label>
          <Input
            type="number"
            value={draft.points}
            min={0}
            max={100}
            onChange={(e) => setDraft({ ...draft, points: Number(e.target.value) })}
            className="mt-1.5"
          />
        </div>
        <div className="flex items-end justify-between gap-2 border border-border rounded-md px-3 py-2">
          <span className="text-xs">Povinná</span>
          <Switch
            checked={draft.is_required ?? true}
            onCheckedChange={(v) => setDraft({ ...draft, is_required: v })}
          />
        </div>
      </div>

      {hasOptions && (
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
              <Button variant="ghost" size="icon" onClick={() => removeOption(i)}>
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

      {(draft.question_type === "scale_1_5" ||
        draft.question_type === "scale_0_10" ||
        draft.question_type === "scale") && (
        <p className="text-xs text-muted-foreground">
          Škálová otázka — žiak odpovedá na číselnej škále.
        </p>
      )}
      {draft.question_type === "open" && (
        <p className="text-xs text-muted-foreground">
          Otvorená otázka — odpoveď bude vyhodnotená manuálne.
        </p>
      )}

      <div className="flex justify-end">
        <Button onClick={() => onSave(draft)}>Uložiť otázku</Button>
      </div>
    </div>
  );
}

/* ===================== SCORING TAB ===================== */
function ScoringTab({ testId }: { testId: string }) {
  const fetchRules = useServerFn(listScoringRules);
  const saveRule = useServerFn(saveScoringRule);
  const removeRule = useServerFn(deleteScoringRule);
  const qc = useQueryClient();

  const rules = useQuery({
    queryKey: ["scoring-rules", testId],
    queryFn: () => fetchRules({ data: { test_id: testId } }),
  });

  const onAdd = async () => {
    await saveRule({
      data: {
        test_id: testId,
        min_percentage: 0,
        max_percentage: 100,
        label: "Nová úroveň",
        description: "",
      },
    });
    qc.invalidateQueries({ queryKey: ["scoring-rules", testId] });
  };

  const onSave = async (r: any) => {
    try {
      await saveRule({
        data: {
          id: r.id,
          test_id: testId,
          min_percentage: Number(r.min_percentage),
          max_percentage: Number(r.max_percentage),
          label: r.label,
          description: r.description ?? null,
          competency_area: r.competency_area ?? null,
        },
      });
      toast.success("Pravidlo uložené");
      qc.invalidateQueries({ queryKey: ["scoring-rules", testId] });
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Chyba");
    }
  };

  const onDelete = async (id: string) => {
    if (!confirm("Zmazať pravidlo?")) return;
    await removeRule({ data: { id } });
    qc.invalidateQueries({ queryKey: ["scoring-rules", testId] });
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <div>
          <h2 className="text-lg font-semibold">Pravidlá vyhodnotenia</h2>
          <p className="text-sm text-muted-foreground">
            Definujte slovné hodnotenie podľa percentuálneho výsledku.
          </p>
        </div>
        <Button size="sm" onClick={onAdd} className="gap-1.5">
          <Plus className="h-4 w-4" /> Pridať pravidlo
        </Button>
      </div>

      {rules.isLoading ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : (
        <div className="space-y-3">
          {(rules.data ?? []).map((r: any) => (
            <ScoringRuleRow
              key={r.id}
              rule={r}
              onSave={onSave}
              onDelete={() => onDelete(r.id)}
            />
          ))}
          {rules.data?.length === 0 && (
            <div className="bg-card border border-border rounded-xl p-8 text-center text-muted-foreground">
              Žiadne pravidlá. Pridajte prvé.
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function ScoringRuleRow({
  rule,
  onSave,
  onDelete,
}: {
  rule: any;
  onSave: (r: any) => void;
  onDelete: () => void;
}) {
  const [d, setD] = useState(rule);
  useEffect(() => setD(rule), [rule]);
  return (
    <div className="bg-card border border-border rounded-xl p-4 grid grid-cols-1 md:grid-cols-12 gap-3 items-start">
      <div className="md:col-span-2">
        <Label className="text-xs">Od %</Label>
        <Input
          type="number"
          value={d.min_percentage}
          onChange={(e) => setD({ ...d, min_percentage: e.target.value })}
          className="mt-1.5"
        />
      </div>
      <div className="md:col-span-2">
        <Label className="text-xs">Do %</Label>
        <Input
          type="number"
          value={d.max_percentage}
          onChange={(e) => setD({ ...d, max_percentage: e.target.value })}
          className="mt-1.5"
        />
      </div>
      <div className="md:col-span-3">
        <Label className="text-xs">Názov úrovne</Label>
        <Input
          value={d.label}
          onChange={(e) => setD({ ...d, label: e.target.value })}
          className="mt-1.5"
        />
      </div>
      <div className="md:col-span-4">
        <Label className="text-xs">Popis / odporúčanie</Label>
        <Textarea
          rows={2}
          value={d.description ?? ""}
          onChange={(e) => setD({ ...d, description: e.target.value })}
          className="mt-1.5"
        />
      </div>
      <div className="md:col-span-1 flex flex-col gap-2 pt-5">
        <Button size="sm" onClick={() => onSave(d)}>
          Uložiť
        </Button>
        <Button size="sm" variant="ghost" onClick={onDelete}>
          <Trash2 className="h-4 w-4 text-destructive" />
        </Button>
      </div>
    </div>
  );
}

/* ===================== ASSIGNMENTS TAB ===================== */
function AssignmentsTab({ testId }: { testId: string }) {
  const fetchAssignments = useServerFn(listAssignments);
  const fetchSchools = useServerFn(listSchoolsLite);
  const fetchClasses = useServerFn(listClassesLite);
  const fetchModules = useServerFn(listModules);
  const saveA = useServerFn(saveAssignment);
  const delA = useServerFn(deleteAssignment);
  const qc = useQueryClient();

  const assignments = useQuery({
    queryKey: ["assignments", testId],
    queryFn: () => fetchAssignments({ data: { test_id: testId } }),
  });
  const schools = useQuery({ queryKey: ["schools-lite"], queryFn: () => fetchSchools() });
  const modules = useQuery({ queryKey: ["modules"], queryFn: () => fetchModules() });

  const [open, setOpen] = useState(false);
  const [scope, setScope] = useState<"all" | "school" | "class" | "module" | "grade">("all");
  const [schoolId, setSchoolId] = useState<string>("");
  const [classId, setClassId] = useState<string>("");
  const [moduleId, setModuleId] = useState<string>("");
  const [grade, setGrade] = useState<string>("");

  const classes = useQuery({
    queryKey: ["classes-lite", schoolId],
    queryFn: () => fetchClasses({ data: { school_id: schoolId || null } }),
    enabled: scope === "class",
  });

  const reset = () => {
    setScope("all");
    setSchoolId("");
    setClassId("");
    setModuleId("");
    setGrade("");
  };

  const onSave = async () => {
    try {
      await saveA({
        data: {
          test_id: testId,
          scope,
          school_id: scope === "school" || scope === "class" ? schoolId || null : null,
          class_id: scope === "class" ? classId || null : null,
          module_id: scope === "module" ? moduleId || null : null,
          grade: scope === "grade" ? Number(grade) || null : null,
          status: "active",
        },
      });
      toast.success("Priradenie pridané");
      setOpen(false);
      reset();
      qc.invalidateQueries({ queryKey: ["assignments", testId] });
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Chyba");
    }
  };

  const onDelete = async (id: string) => {
    if (!confirm("Zmazať priradenie?")) return;
    await delA({ data: { id } });
    qc.invalidateQueries({ queryKey: ["assignments", testId] });
  };

  const describe = (a: any) => {
    if (a.scope === "all") return "Všetky školy";
    if (a.scope === "school") return `Škola: ${a.schools?.name ?? "?"}`;
    if (a.scope === "class")
      return `Trieda: ${a.classes?.name ?? "?"} (${a.schools?.name ?? "?"})`;
    if (a.scope === "module") return `Modul: ${a.modules?.name ?? "?"}`;
    if (a.scope === "grade") return `Ročník: ${a.grade}`;
    return a.scope;
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <div>
          <h2 className="text-lg font-semibold">Priradenia testu</h2>
          <p className="text-sm text-muted-foreground">
            Komu sa test zobrazí — všetkým, konkrétnej škole, triede, modulu alebo ročníku.
          </p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button size="sm" className="gap-1.5">
              <Plus className="h-4 w-4" /> Pridať priradenie
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Nové priradenie</DialogTitle>
            </DialogHeader>
            <div className="space-y-3">
              <div>
                <Label>Rozsah</Label>
                <Select value={scope} onValueChange={(v) => setScope(v as any)}>
                  <SelectTrigger className="mt-1.5">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Všetky školy</SelectItem>
                    <SelectItem value="school">Konkrétna škola</SelectItem>
                    <SelectItem value="class">Konkrétna trieda</SelectItem>
                    <SelectItem value="module">Modul</SelectItem>
                    <SelectItem value="grade">Ročník</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              {(scope === "school" || scope === "class") && (
                <div>
                  <Label>Škola</Label>
                  <Select value={schoolId} onValueChange={setSchoolId}>
                    <SelectTrigger className="mt-1.5">
                      <SelectValue placeholder="Vyberte školu" />
                    </SelectTrigger>
                    <SelectContent>
                      {(schools.data ?? []).map((s: any) => (
                        <SelectItem key={s.id} value={s.id}>
                          {s.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
              {scope === "class" && (
                <div>
                  <Label>Trieda</Label>
                  <Select value={classId} onValueChange={setClassId}>
                    <SelectTrigger className="mt-1.5">
                      <SelectValue placeholder="Vyberte triedu" />
                    </SelectTrigger>
                    <SelectContent>
                      {(classes.data ?? []).map((c: any) => (
                        <SelectItem key={c.id} value={c.id}>
                          {c.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
              {scope === "module" && (
                <div>
                  <Label>Modul</Label>
                  <Select value={moduleId} onValueChange={setModuleId}>
                    <SelectTrigger className="mt-1.5">
                      <SelectValue placeholder="Vyberte modul" />
                    </SelectTrigger>
                    <SelectContent>
                      {(modules.data ?? []).map((m: any) => (
                        <SelectItem key={m.id} value={m.id}>
                          {m.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
              {scope === "grade" && (
                <div>
                  <Label>Ročník</Label>
                  <Input
                    type="number"
                    value={grade}
                    onChange={(e) => setGrade(e.target.value)}
                    className="mt-1.5"
                  />
                </div>
              )}
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setOpen(false)}>
                Zrušiť
              </Button>
              <Button onClick={onSave}>Pridať</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="space-y-2">
        {(assignments.data ?? []).map((a: any) => (
          <div
            key={a.id}
            className="bg-card border border-border rounded-xl px-4 py-3 flex items-center justify-between"
          >
            <div>
              <p className="text-sm font-medium">{describe(a)}</p>
              <p className="text-xs text-muted-foreground">
                Stav: {a.status} • {new Date(a.created_at).toLocaleDateString("sk-SK")}
              </p>
            </div>
            <Button variant="ghost" size="icon" onClick={() => onDelete(a.id)}>
              <Trash2 className="h-4 w-4 text-destructive" />
            </Button>
          </div>
        ))}
        {assignments.data?.length === 0 && (
          <div className="bg-card border border-border rounded-xl p-8 text-center text-muted-foreground">
            Žiadne priradenia. Test zatiaľ nikto nevidí.
          </div>
        )}
      </div>
    </div>
  );
}

/* ===================== PREVIEW TAB ===================== */
function PreviewTab({ test, questions }: { test: any; questions: Question[] }) {
  const sorted = useMemo(
    () => [...questions].sort((a, b) => a.position - b.position),
    [questions],
  );
  return (
    <div className="bg-card border border-border rounded-xl p-6 max-w-3xl">
      <div className="flex items-center gap-2 text-xs text-muted-foreground mb-2">
        <Eye className="h-3.5 w-3.5" /> Náhľad žiaka (len na čítanie)
      </div>
      <h1 className="text-2xl font-bold mb-1">{test.title}</h1>
      {test.description && (
        <p className="text-muted-foreground mb-3">{test.description}</p>
      )}
      {test.instructions && (
        <div className="bg-muted/50 border border-border rounded-lg p-3 text-sm mb-5">
          {test.instructions}
        </div>
      )}
      {sorted.length === 0 ? (
        <p className="text-muted-foreground">Test zatiaľ neobsahuje otázky.</p>
      ) : (
        <ol className="space-y-5">
          {sorted.map((q) => (
            <li key={q.id} className="border-b border-border pb-4 last:border-0">
              <p className="font-medium mb-2">
                {q.position}. {q.question_text}
                {q.is_required === false && (
                  <span className="ml-2 text-xs text-muted-foreground">(nepovinná)</span>
                )}
              </p>
              {(q.question_type === "single" ||
                q.question_type === "multi" ||
                q.question_type === "yes_no") &&
                q.options?.length > 0 && (
                  <ul className="space-y-1.5 ml-4">
                    {q.options.map((o) => (
                      <li key={o.key} className="flex items-center gap-2 text-sm">
                        <input
                          type={q.question_type === "multi" ? "checkbox" : "radio"}
                          disabled
                        />
                        <span>{o.label}</span>
                      </li>
                    ))}
                  </ul>
                )}
              {(q.question_type === "scale_1_5" || q.question_type === "scale") && (
                <div className="flex gap-2 ml-4">
                  {[1, 2, 3, 4, 5].map((n) => (
                    <span
                      key={n}
                      className="h-8 w-8 rounded-full border border-border flex items-center justify-center text-sm"
                    >
                      {n}
                    </span>
                  ))}
                </div>
              )}
              {q.question_type === "scale_0_10" && (
                <div className="flex gap-1.5 ml-4 flex-wrap">
                  {Array.from({ length: 11 }, (_, n) => (
                    <span
                      key={n}
                      className="h-7 w-7 rounded-full border border-border flex items-center justify-center text-xs"
                    >
                      {n}
                    </span>
                  ))}
                </div>
              )}
              {q.question_type === "open" && (
                <Textarea disabled placeholder="Odpoveď žiaka…" rows={2} />
              )}
            </li>
          ))}
        </ol>
      )}
    </div>
  );
}
