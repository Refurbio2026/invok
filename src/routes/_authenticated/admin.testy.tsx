import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import {
  Loader2,
  Plus,
  Trash2,
  Pencil,
  Copy,
  Eye,
  CheckCircle2,
  Archive,
} from "lucide-react";
import { AdminLayout } from "@/components/invok/admin/AdminLayout";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import {
  listTests,
  createTest,
  updateTest,
  deleteTest,
  duplicateTest,
  listModules,
  TEST_TYPES,
} from "@/lib/admin/tests.functions";

export const Route = createFileRoute("/_authenticated/admin/testy")({
  component: TestyPage,
});

const TYPE_LABELS: Record<string, string> = {
  vstupny: "Vstupný",
  vystupny: "Výstupný",
  modulovy: "Modulový",
  reflexny: "Reflexný dotazník",
  sebahodnotenie: "Sebahodnotenie",
  diagnosticky: "Diagnostický",
  prakticky: "Praktický",
};

const STATUS_LABELS: Record<string, string> = {
  draft: "Koncept",
  published: "Publikovaný",
  archived: "Archivovaný",
};

const STATUS_COLORS: Record<string, string> = {
  draft: "bg-muted text-muted-foreground",
  published: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300",
  archived: "bg-amber-500/15 text-amber-700 dark:text-amber-300",
};

function TestyPage() {
  const list = useServerFn(listTests);
  const create = useServerFn(createTest);
  const update = useServerFn(updateTest);
  const remove = useServerFn(deleteTest);
  const duplicate = useServerFn(duplicateTest);
  const modulesFn = useServerFn(listModules);
  const qc = useQueryClient();
  const [email, setEmail] = useState<string | null>(null);
  const [open, setOpen] = useState(false);
  const [filterType, setFilterType] = useState<string>("all");
  const [filterStatus, setFilterStatus] = useState<string>("all");

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setEmail(data.user?.email ?? null));
  }, []);

  const q = useQuery({ queryKey: ["tests"], queryFn: () => list() });
  const modulesQ = useQuery({ queryKey: ["modules"], queryFn: () => modulesFn() });

  const filtered = useMemo(() => {
    let rows = q.data ?? [];
    if (filterType !== "all") rows = rows.filter((t: any) => t.type === filterType);
    if (filterStatus !== "all") rows = rows.filter((t: any) => t.status === filterStatus);
    return rows;
  }, [q.data, filterType, filterStatus]);

  const onCreate = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    try {
      const moduleVal = String(fd.get("module_id") ?? "");
      await create({
        data: {
          title: String(fd.get("title") ?? "").trim(),
          type: String(fd.get("type") ?? "diagnosticky") as any,
          grade_from: fd.get("grade_from") ? Number(fd.get("grade_from")) : null,
          grade_to: fd.get("grade_to") ? Number(fd.get("grade_to")) : null,
          duration_min: fd.get("duration_min") ? Number(fd.get("duration_min")) : null,
          description: String(fd.get("description") ?? "") || null,
          instructions: String(fd.get("instructions") ?? "") || null,
          module_id: moduleVal && moduleVal !== "none" ? moduleVal : null,
          show_result_to_student: fd.get("show_result_to_student") === "on",
          save_to_school_report: fd.get("save_to_school_report") === "on",
          allow_retake: fd.get("allow_retake") === "on",
          anonymous_allowed: fd.get("anonymous_allowed") === "on",
          evaluate_by_competency: fd.get("evaluate_by_competency") === "on",
        },
      });
      toast.success("Test vytvorený");
      setOpen(false);
      qc.invalidateQueries({ queryKey: ["tests"] });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Nepodarilo sa vytvoriť.");
    }
  };

  const setStatus = async (
    id: string,
    status: "draft" | "published" | "archived",
    questionsCount: number,
  ) => {
    if (status === "published" && questionsCount === 0) {
      toast.error("Test nemá žiadne otázky — najskôr ich pridajte v detaile.");
      return;
    }
    try {
      await update({ data: { id, status } });
      toast.success(
        status === "published"
          ? "Test publikovaný"
          : status === "archived"
            ? "Test archivovaný"
            : "Test prevedený do konceptu",
      );
      qc.invalidateQueries({ queryKey: ["tests"] });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Nepodarilo sa zmeniť stav.");
    }
  };

  const onDelete = async (id: string) => {
    if (!confirm("Zmazať test? Zmažú sa aj jeho otázky a priradenia.")) return;
    try {
      await remove({ data: { id } });
      toast.success("Test zmazaný");
      qc.invalidateQueries({ queryKey: ["tests"] });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Nepodarilo sa zmazať.");
    }
  };

  const onDuplicate = async (id: string) => {
    try {
      await duplicate({ data: { id } });
      toast.success("Test zduplikovaný");
      qc.invalidateQueries({ queryKey: ["tests"] });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Nepodarilo sa duplikovať.");
    }
  };

  return (
    <AdminLayout title="Správa testov" userEmail={email}>
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
        <p className="text-sm text-muted-foreground">
          Vytvárajte a spravujte vstupné, výstupné, modulové aj reflexné testy.
          V detaile testu nastavíte otázky, vyhodnotenie a priradenie.
        </p>
        <div className="flex items-center gap-2">
          <Select value={filterType} onValueChange={setFilterType}>
            <SelectTrigger className="h-9 w-44">
              <SelectValue placeholder="Typ" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Všetky typy</SelectItem>
              {TEST_TYPES.map((t) => (
                <SelectItem key={t} value={t}>
                  {TYPE_LABELS[t] ?? t}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={filterStatus} onValueChange={setFilterStatus}>
            <SelectTrigger className="h-9 w-40">
              <SelectValue placeholder="Stav" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Všetky stavy</SelectItem>
              {Object.entries(STATUS_LABELS).map(([k, v]) => (
                <SelectItem key={k} value={k}>
                  {v}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button size="sm" className="gap-1.5">
                <Plus className="h-4 w-4" /> Vytvoriť nový test
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Nový test</DialogTitle>
              </DialogHeader>
              <form onSubmit={onCreate} className="space-y-4">
                <div>
                  <Label htmlFor="title">Názov testu *</Label>
                  <Input id="title" name="title" required className="mt-1.5" />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label>Typ testu *</Label>
                    <Select name="type" defaultValue="diagnosticky">
                      <SelectTrigger className="mt-1.5">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {TEST_TYPES.map((t) => (
                          <SelectItem key={t} value={t}>
                            {TYPE_LABELS[t] ?? t}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Modul</Label>
                    <Select name="module_id" defaultValue="none">
                      <SelectTrigger className="mt-1.5">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">— bez modulu —</SelectItem>
                        {(modulesQ.data ?? []).map((m: any) => (
                          <SelectItem key={m.id} value={m.id}>
                            {m.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <Label htmlFor="grade_from">Od ročníka</Label>
                    <Input
                      id="grade_from"
                      name="grade_from"
                      type="number"
                      min={1}
                      max={13}
                      className="mt-1.5"
                    />
                  </div>
                  <div>
                    <Label htmlFor="grade_to">Do ročníka</Label>
                    <Input
                      id="grade_to"
                      name="grade_to"
                      type="number"
                      min={1}
                      max={13}
                      className="mt-1.5"
                    />
                  </div>
                  <div>
                    <Label htmlFor="duration_min">Časový limit (min)</Label>
                    <Input
                      id="duration_min"
                      name="duration_min"
                      type="number"
                      min={1}
                      max={240}
                      className="mt-1.5"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="description">Krátky popis</Label>
                  <Textarea
                    id="description"
                    name="description"
                    rows={2}
                    className="mt-1.5"
                  />
                </div>

                <div>
                  <Label htmlFor="instructions">Inštrukcie pre žiaka</Label>
                  <Textarea
                    id="instructions"
                    name="instructions"
                    rows={3}
                    className="mt-1.5"
                    placeholder="Napríklad: Vyber jednu odpoveď. Máš 20 minút…"
                  />
                </div>

                <div className="space-y-3 border-t border-border pt-4">
                  <div className="text-sm font-medium">Nastavenia</div>
                  <div className="grid grid-cols-2 gap-x-6 gap-y-3">
                    {[
                      {
                        name: "show_result_to_student",
                        label: "Zobrazovať výsledok žiakovi",
                        def: true,
                      },
                      {
                        name: "save_to_school_report",
                        label: "Ukladať do reportu školy",
                        def: true,
                      },
                      {
                        name: "allow_retake",
                        label: "Povoliť opakované vyplnenie",
                        def: false,
                      },
                      {
                        name: "anonymous_allowed",
                        label: "Anonymné vyplnenie",
                        def: false,
                      },
                      {
                        name: "evaluate_by_competency",
                        label: "Vyhodnotiť po kompetenciách",
                        def: false,
                      },
                    ].map((s) => (
                      <label
                        key={s.name}
                        className="flex items-center justify-between gap-3 text-sm cursor-pointer"
                      >
                        <span>{s.label}</span>
                        <Switch name={s.name} defaultChecked={s.def} />
                      </label>
                    ))}
                  </div>
                </div>

                <DialogFooter>
                  <Button type="submit">Vytvoriť test</Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="bg-card border border-border rounded-xl overflow-hidden">
        {q.isLoading ? (
          <div className="p-6 text-muted-foreground flex items-center gap-2">
            <Loader2 className="h-4 w-4 animate-spin" /> Načítavam…
          </div>
        ) : filtered.length === 0 ? (
          <div className="p-8 text-center text-muted-foreground">
            {(q.data ?? []).length === 0
              ? "Žiadne testy. Vytvorte prvý test vyššie."
              : "Žiadne testy nezodpovedajú filtru."}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-muted/50 text-xs uppercase text-muted-foreground">
                <tr>
                  <th className="text-left px-4 py-3">Test</th>
                  <th className="text-left px-4 py-3">Typ</th>
                  <th className="text-center px-4 py-3">Otázky</th>
                  <th className="text-center px-4 py-3">Priradenia</th>
                  <th className="text-left px-4 py-3">Stav</th>
                  <th className="text-left px-4 py-3">Vytvorený</th>
                  <th className="text-right px-4 py-3">Akcie</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((t: any) => (
                  <tr key={t.id} className="border-t border-border hover:bg-muted/30">
                    <td className="px-4 py-3">
                      <div className="font-medium">{t.title}</div>
                      <div className="text-xs text-muted-foreground font-mono">
                        {t.slug}
                      </div>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      {TYPE_LABELS[t.type] ?? t.type}
                    </td>
                    <td className="px-4 py-3 text-center tabular-nums">
                      {t.questions_count}
                    </td>
                    <td className="px-4 py-3 text-center tabular-nums">
                      {t.assignments_count}
                    </td>
                    <td className="px-4 py-3">
                      <Badge
                        variant="outline"
                        className={`${STATUS_COLORS[t.status]} border-0`}
                      >
                        {STATUS_LABELS[t.status] ?? t.status}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 text-xs text-muted-foreground whitespace-nowrap">
                      {new Date(t.created_at).toLocaleDateString("sk-SK")}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="inline-flex gap-1">
                        <Link
                          to="/admin/testy/$id"
                          params={{ id: t.id }}
                          className="inline-flex items-center px-2.5 py-1 rounded-md text-xs bg-muted hover:bg-muted/70"
                          title="Upraviť"
                        >
                          <Pencil className="h-3.5 w-3.5" />
                        </Link>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7"
                          title="Náhľad"
                          onClick={() =>
                            window.open(`/admin/testy/${t.id}?tab=preview`, "_blank")
                          }
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7"
                          title="Duplikovať"
                          onClick={() => onDuplicate(t.id)}
                        >
                          <Copy className="h-4 w-4" />
                        </Button>
                        {t.status !== "published" ? (
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 text-emerald-600"
                            title="Publikovať"
                            onClick={() => setStatus(t.id, "published")}
                          >
                            <CheckCircle2 className="h-4 w-4" />
                          </Button>
                        ) : (
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 text-amber-600"
                            title="Archivovať"
                            onClick={() => setStatus(t.id, "archived")}
                          >
                            <Archive className="h-4 w-4" />
                          </Button>
                        )}
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7"
                          title="Vymazať"
                          onClick={() => onDelete(t.id)}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
