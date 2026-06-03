import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { Loader2, Plus, Trash2, Pencil } from "lucide-react";
import { AdminLayout } from "@/components/invok/admin/AdminLayout";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
  listClasses,
  listSchoolsLite,
  createClass,
  updateClass,
  deleteClass,
} from "@/lib/admin/classes.functions";

export const Route = createFileRoute("/_authenticated/admin/triedy")({
  component: TriedyPage,
});

type ClassRow = {
  id: string;
  school_id: string;
  name: string;
  grade: number | null;
  school_year: string | null;
  notes: string | null;
  created_at: string;
  school_name: string | null;
};

function TriedyPage() {
  const list = useServerFn(listClasses);
  const schoolsFn = useServerFn(listSchoolsLite);
  const create = useServerFn(createClass);
  const update = useServerFn(updateClass);
  const remove = useServerFn(deleteClass);
  const qc = useQueryClient();

  const [email, setEmail] = useState<string | null>(null);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<ClassRow | null>(null);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setEmail(data.user?.email ?? null));
  }, []);

  const q = useQuery({ queryKey: ["classes"], queryFn: () => list() });
  const schoolsQ = useQuery({ queryKey: ["schools-lite"], queryFn: () => schoolsFn() });

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const payload = {
      school_id: String(fd.get("school_id") ?? ""),
      name: String(fd.get("name") ?? "").trim(),
      grade: fd.get("grade") ? Number(fd.get("grade")) : null,
      school_year: String(fd.get("school_year") ?? "") || null,
      notes: String(fd.get("notes") ?? "") || null,
    };
    try {
      if (editing) {
        await update({ data: { id: editing.id, ...payload } });
        toast.success("Trieda upravená");
      } else {
        if (!payload.school_id) {
          toast.error("Vyberte školu.");
          return;
        }
        await create({ data: payload });
        toast.success("Trieda vytvorená");
      }
      setOpen(false);
      setEditing(null);
      qc.invalidateQueries({ queryKey: ["classes"] });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Nepodarilo sa uložiť.");
    }
  };

  const onDelete = async (id: string) => {
    if (!confirm("Naozaj zmazať triedu? Zmažú sa aj jej žiaci.")) return;
    try {
      await remove({ data: { id } });
      toast.success("Trieda zmazaná");
      qc.invalidateQueries({ queryKey: ["classes"] });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Nepodarilo sa zmazať.");
    }
  };

  return (
    <AdminLayout title="Triedy" userEmail={email}>
      <div className="flex items-center justify-between mb-4">
        <p className="text-sm text-muted-foreground">
          Triedy patriace školám. Žiakov pridáte v sekcii „Žiaci“.
        </p>
        <Dialog
          open={open}
          onOpenChange={(o) => {
            setOpen(o);
            if (!o) setEditing(null);
          }}
        >
          <DialogTrigger asChild>
            <Button size="sm" className="gap-1.5">
              <Plus className="h-4 w-4" /> Nová trieda
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {editing ? "Upraviť triedu" : "Nová trieda"}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={onSubmit} className="space-y-3">
              {!editing && (
                <div>
                  <Label>Škola</Label>
                  <Select name="school_id" defaultValue="">
                    <SelectTrigger className="mt-1.5">
                      <SelectValue placeholder="Vyberte školu" />
                    </SelectTrigger>
                    <SelectContent>
                      {(schoolsQ.data ?? []).map((s) => (
                        <SelectItem key={s.id} value={s.id}>
                          {s.name}
                          {s.city ? ` — ${s.city}` : ""}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label htmlFor="name">Názov triedy</Label>
                  <Input
                    id="name"
                    name="name"
                    placeholder="napr. 5.A"
                    required
                    defaultValue={editing?.name ?? ""}
                    className="mt-1.5"
                  />
                </div>
                <div>
                  <Label htmlFor="grade">Ročník</Label>
                  <Input
                    id="grade"
                    name="grade"
                    type="number"
                    min={1}
                    max={13}
                    defaultValue={editing?.grade ?? ""}
                    className="mt-1.5"
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="school_year">Školský rok</Label>
                <Input
                  id="school_year"
                  name="school_year"
                  placeholder="2025/2026"
                  defaultValue={editing?.school_year ?? ""}
                  className="mt-1.5"
                />
              </div>
              <div>
                <Label htmlFor="notes">Poznámka</Label>
                <Input
                  id="notes"
                  name="notes"
                  defaultValue={editing?.notes ?? ""}
                  className="mt-1.5"
                />
              </div>
              <DialogFooter>
                <Button type="submit">
                  {editing ? "Uložiť" : "Vytvoriť"}
                </Button>
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
            Žiadne triedy. Vytvorte prvú triedu vyššie.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-muted/50 text-xs uppercase text-muted-foreground">
                <tr>
                  <th className="text-left px-4 py-3">Trieda</th>
                  <th className="text-left px-4 py-3">Škola</th>
                  <th className="text-left px-4 py-3">Ročník</th>
                  <th className="text-left px-4 py-3">Šk. rok</th>
                  <th className="text-left px-4 py-3">Vytvorené</th>
                  <th className="text-right px-4 py-3">Akcie</th>
                </tr>
              </thead>
              <tbody>
                {(q.data as ClassRow[]).map((c) => (
                  <tr key={c.id} className="border-t border-border">
                    <td className="px-4 py-3 font-medium">{c.name}</td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {c.school_name ?? "—"}
                    </td>
                    <td className="px-4 py-3">{c.grade ?? "—"}</td>
                    <td className="px-4 py-3">{c.school_year ?? "—"}</td>
                    <td className="px-4 py-3 text-muted-foreground text-xs">
                      {new Date(c.created_at).toLocaleString("sk-SK")}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="inline-flex gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => {
                            setEditing(c);
                            setOpen(true);
                          }}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => onDelete(c.id)}
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
