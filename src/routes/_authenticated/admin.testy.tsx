import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { Loader2, Plus, Trash2, Pencil } from "lucide-react";
import { AdminLayout } from "@/components/invok/admin/AdminLayout";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
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
} from "@/lib/admin/tests.functions";

export const Route = createFileRoute("/_authenticated/admin/testy")({
  component: TestyPage,
});

const TYPE_LABELS: Record<string, string> = {
  vstupny: "Vstupný",
  vystupny: "Výstupný",
  diagnosticky: "Diagnostický",
  prakticky: "Praktický",
};

const STATUS_LABELS: Record<string, string> = {
  draft: "Koncept",
  published: "Publikovaný",
  archived: "Archivovaný",
};

function TestyPage() {
  const list = useServerFn(listTests);
  const create = useServerFn(createTest);
  const update = useServerFn(updateTest);
  const remove = useServerFn(deleteTest);
  const qc = useQueryClient();
  const [email, setEmail] = useState<string | null>(null);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setEmail(data.user?.email ?? null));
  }, []);

  const q = useQuery({ queryKey: ["tests"], queryFn: () => list() });

  const onCreate = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    try {
      await create({
        data: {
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
      toast.success("Test vytvorený");
      setOpen(false);
      qc.invalidateQueries({ queryKey: ["tests"] });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Nepodarilo sa vytvoriť.");
    }
  };

  const setStatus = async (id: string, status: "draft" | "published" | "archived") => {
    try {
      await update({ data: { id, status } });
      toast.success("Stav zmenený");
      qc.invalidateQueries({ queryKey: ["tests"] });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Nepodarilo sa zmeniť stav.");
    }
  };

  const onDelete = async (id: string) => {
    if (!confirm("Zmazať test? Zmažú sa aj jeho otázky.")) return;
    try {
      await remove({ data: { id } });
      toast.success("Test zmazaný");
      qc.invalidateQueries({ queryKey: ["tests"] });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Nepodarilo sa zmazať.");
    }
  };

  return (
    <AdminLayout title="Testy" userEmail={email}>
      <div className="flex items-center justify-between mb-4">
        <p className="text-sm text-muted-foreground">
          Vstupné, výstupné, diagnostické a praktické testy. Otázky upravíte v
          detaile.
        </p>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button size="sm" className="gap-1.5">
              <Plus className="h-4 w-4" /> Nový test
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Nový test</DialogTitle>
            </DialogHeader>
            <form onSubmit={onCreate} className="space-y-3">
              <div>
                <Label htmlFor="title">Názov</Label>
                <Input id="title" name="title" required className="mt-1.5" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label>Typ</Label>
                  <Select name="type" defaultValue="diagnosticky">
                    <SelectTrigger className="mt-1.5">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(TYPE_LABELS).map(([k, v]) => (
                        <SelectItem key={k} value={k}>
                          {v}
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
                    min={1}
                    max={240}
                    className="mt-1.5"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
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
              </div>
              <div>
                <Label htmlFor="description">Popis</Label>
                <Textarea
                  id="description"
                  name="description"
                  rows={3}
                  className="mt-1.5"
                />
              </div>
              <DialogFooter>
                <Button type="submit">Vytvoriť</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="bg-card border border-border rounded-xl overflow-hidden">
        {q.isLoading ? (
          <div className="p-6 text-muted-foreground flex items-center gap-2">
            <Loader2 className="h-4 w-4 animate-spin" /> Načítavam…
          </div>
        ) : !q.data || q.data.length === 0 ? (
          <div className="p-8 text-center text-muted-foreground">
            Žiadne testy. Vytvorte prvý test vyššie.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-muted/50 text-xs uppercase text-muted-foreground">
                <tr>
                  <th className="text-left px-4 py-3">Test</th>
                  <th className="text-left px-4 py-3">Typ</th>
                  <th className="text-left px-4 py-3">Ročník</th>
                  <th className="text-left px-4 py-3">Čas</th>
                  <th className="text-left px-4 py-3">Stav</th>
                  <th className="text-right px-4 py-3">Akcie</th>
                </tr>
              </thead>
              <tbody>
                {q.data.map((t: any) => (
                  <tr key={t.id} className="border-t border-border">
                    <td className="px-4 py-3">
                      <div className="font-medium">{t.title}</div>
                      <div className="text-xs text-muted-foreground font-mono">
                        {t.slug}
                      </div>
                    </td>
                    <td className="px-4 py-3">{TYPE_LABELS[t.type] ?? t.type}</td>
                    <td className="px-4 py-3">
                      {t.grade_from ?? "—"}
                      {t.grade_to ? `–${t.grade_to}` : ""}
                    </td>
                    <td className="px-4 py-3">{t.duration_min ?? "—"} min</td>
                    <td className="px-4 py-3">
                      <Select
                        value={t.status}
                        onValueChange={(v) => setStatus(t.id, v as any)}
                      >
                        <SelectTrigger className="w-36 h-8 text-xs">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {Object.entries(STATUS_LABELS).map(([k, v]) => (
                            <SelectItem key={k} value={k}>
                              {v}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="inline-flex gap-1">
                        <Link
                          to="/admin/testy/$id"
                          params={{ id: t.id }}
                          className="inline-flex items-center px-3 py-1 rounded-md text-xs bg-muted hover:bg-muted/70"
                        >
                          <Pencil className="h-3.5 w-3.5 mr-1" /> Upraviť
                        </Link>
                        <Button
                          variant="ghost"
                          size="icon"
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
