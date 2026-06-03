import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { Loader2, Plus, Trash2, Users } from "lucide-react";
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
import { listClasses, listSchoolsLite } from "@/lib/admin/classes.functions";
import {
  listStudents,
  createStudent,
  bulkCreateStudents,
  deleteStudent,
} from "@/lib/admin/students.functions";

export const Route = createFileRoute("/_authenticated/admin/ziaci")({
  component: ZiaciPage,
});

function ZiaciPage() {
  const listSt = useServerFn(listStudents);
  const listCl = useServerFn(listClasses);
  const schoolsFn = useServerFn(listSchoolsLite);
  const createSt = useServerFn(createStudent);
  const bulkSt = useServerFn(bulkCreateStudents);
  const removeSt = useServerFn(deleteStudent);
  const qc = useQueryClient();

  const [email, setEmail] = useState<string | null>(null);
  const [schoolId, setSchoolId] = useState<string>("");
  const [classId, setClassId] = useState<string>("");
  const [open, setOpen] = useState(false);
  const [bulkOpen, setBulkOpen] = useState(false);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setEmail(data.user?.email ?? null));
  }, []);

  const schoolsQ = useQuery({ queryKey: ["schools-lite"], queryFn: () => schoolsFn() });
  const classesQ = useQuery({ queryKey: ["classes"], queryFn: () => listCl() });
  const studentsQ = useQuery({
    queryKey: ["students", schoolId, classId],
    queryFn: () =>
      listSt({
        data: {
          schoolId: schoolId || null,
          classId: classId || null,
        },
      }),
  });

  const filteredClasses = useMemo(
    () =>
      (classesQ.data ?? []).filter(
        (c: any) => !schoolId || c.school_id === schoolId,
      ),
    [classesQ.data, schoolId],
  );

  const onCreate = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const cls = (classesQ.data ?? []).find(
      (c: any) => c.id === String(fd.get("class_id") ?? ""),
    );
    if (!cls) {
      toast.error("Vyberte triedu.");
      return;
    }
    try {
      const res = await createSt({
        data: {
          school_id: cls.school_id,
          class_id: cls.id,
          first_name: String(fd.get("first_name") ?? "") || null,
          last_name: String(fd.get("last_name") ?? "") || null,
          grade: fd.get("grade") ? Number(fd.get("grade")) : null,
        },
      });
      toast.success(`Žiak pridaný (kód ${res.code}, PIN ${res.pin})`);
      setOpen(false);
      qc.invalidateQueries({ queryKey: ["students"] });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Nepodarilo sa pridať.");
    }
  };

  const onBulk = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const cls = (classesQ.data ?? []).find(
      (c: any) => c.id === String(fd.get("class_id") ?? ""),
    );
    if (!cls) {
      toast.error("Vyberte triedu.");
      return;
    }
    const count = Number(fd.get("count") ?? 0);
    try {
      const rows = await bulkSt({
        data: {
          school_id: cls.school_id,
          class_id: cls.id,
          count,
          grade: fd.get("grade") ? Number(fd.get("grade")) : null,
        },
      });
      toast.success(`Vygenerovaných ${rows.length} žiakov`);
      setBulkOpen(false);
      qc.invalidateQueries({ queryKey: ["students"] });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Nepodarilo sa pridať.");
    }
  };

  const onDelete = async (id: string) => {
    if (!confirm("Zmazať žiaka?")) return;
    try {
      await removeSt({ data: { id } });
      toast.success("Žiak zmazaný");
      qc.invalidateQueries({ queryKey: ["students"] });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Nepodarilo sa zmazať.");
    }
  };

  return (
    <AdminLayout title="Žiaci" userEmail={email}>
      <div className="flex flex-wrap items-end gap-3 mb-4">
        <div className="min-w-[220px]">
          <Label className="text-xs">Filter podľa školy</Label>
          <Select
            value={schoolId}
            onValueChange={(v) => {
              setSchoolId(v === "__all" ? "" : v);
              setClassId("");
            }}
          >
            <SelectTrigger className="mt-1.5">
              <SelectValue placeholder="Všetky školy" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="__all">Všetky školy</SelectItem>
              {(schoolsQ.data ?? []).map((s) => (
                <SelectItem key={s.id} value={s.id}>
                  {s.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="min-w-[220px]">
          <Label className="text-xs">Filter podľa triedy</Label>
          <Select
            value={classId}
            onValueChange={(v) => setClassId(v === "__all" ? "" : v)}
          >
            <SelectTrigger className="mt-1.5">
              <SelectValue placeholder="Všetky triedy" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="__all">Všetky triedy</SelectItem>
              {filteredClasses.map((c: any) => (
                <SelectItem key={c.id} value={c.id}>
                  {c.name} {c.school_name ? `(${c.school_name})` : ""}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="ml-auto flex gap-2">
          <Dialog open={bulkOpen} onOpenChange={setBulkOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm" className="gap-1.5">
                <Users className="h-4 w-4" /> Hromadne vygenerovať
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Hromadne vygenerovať žiakov</DialogTitle>
              </DialogHeader>
              <form onSubmit={onBulk} className="space-y-3">
                <div>
                  <Label>Trieda</Label>
                  <Select name="class_id" defaultValue="">
                    <SelectTrigger className="mt-1.5">
                      <SelectValue placeholder="Vyberte triedu" />
                    </SelectTrigger>
                    <SelectContent>
                      {(classesQ.data ?? []).map((c: any) => (
                        <SelectItem key={c.id} value={c.id}>
                          {c.name}{" "}
                          {c.school_name ? `(${c.school_name})` : ""}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label htmlFor="count">Počet</Label>
                    <Input
                      id="count"
                      name="count"
                      type="number"
                      min={1}
                      max={60}
                      defaultValue={20}
                      className="mt-1.5"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="grade">Ročník (voliteľné)</Label>
                    <Input
                      id="grade"
                      name="grade"
                      type="number"
                      min={1}
                      max={13}
                      className="mt-1.5"
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button type="submit">Vygenerovať</Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button size="sm" className="gap-1.5">
                <Plus className="h-4 w-4" /> Pridať žiaka
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Nový žiak</DialogTitle>
              </DialogHeader>
              <form onSubmit={onCreate} className="space-y-3">
                <div>
                  <Label>Trieda</Label>
                  <Select name="class_id" defaultValue="">
                    <SelectTrigger className="mt-1.5">
                      <SelectValue placeholder="Vyberte triedu" />
                    </SelectTrigger>
                    <SelectContent>
                      {(classesQ.data ?? []).map((c: any) => (
                        <SelectItem key={c.id} value={c.id}>
                          {c.name}{" "}
                          {c.school_name ? `(${c.school_name})` : ""}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label htmlFor="first_name">Meno (voliteľné)</Label>
                    <Input id="first_name" name="first_name" className="mt-1.5" />
                  </div>
                  <div>
                    <Label htmlFor="last_name">Priezvisko</Label>
                    <Input id="last_name" name="last_name" className="mt-1.5" />
                  </div>
                </div>
                <div>
                  <Label htmlFor="grade">Ročník</Label>
                  <Input
                    id="grade"
                    name="grade"
                    type="number"
                    min={1}
                    max={13}
                    className="mt-1.5"
                  />
                </div>
                <DialogFooter>
                  <Button type="submit">Pridať</Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="bg-card border border-border rounded-xl overflow-hidden">
        {studentsQ.isLoading ? (
          <div className="p-6 text-muted-foreground flex items-center gap-2">
            <Loader2 className="h-4 w-4 animate-spin" /> Načítavam…
          </div>
        ) : !studentsQ.data || studentsQ.data.length === 0 ? (
          <div className="p-8 text-center text-muted-foreground">
            Žiadni žiaci. Pridajte alebo hromadne vygenerujte žiakov.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-muted/50 text-xs uppercase text-muted-foreground">
                <tr>
                  <th className="text-left px-4 py-3">Kód</th>
                  <th className="text-left px-4 py-3">PIN</th>
                  <th className="text-left px-4 py-3">Meno</th>
                  <th className="text-left px-4 py-3">Trieda</th>
                  <th className="text-left px-4 py-3">Škola</th>
                  <th className="text-left px-4 py-3">Ročník</th>
                  <th className="text-right px-4 py-3">Akcie</th>
                </tr>
              </thead>
              <tbody>
                {studentsQ.data.map((s: any) => (
                  <tr key={s.id} className="border-t border-border">
                    <td className="px-4 py-3 font-mono text-xs">{s.code}</td>
                    <td className="px-4 py-3 font-mono text-xs">{s.pin}</td>
                    <td className="px-4 py-3">
                      {[s.first_name, s.last_name].filter(Boolean).join(" ") || (
                        <span className="text-muted-foreground italic">
                          anonymný
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3">{s.class_name ?? "—"}</td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {s.school_name ?? "—"}
                    </td>
                    <td className="px-4 py-3">{s.grade ?? "—"}</td>
                    <td className="px-4 py-3 text-right">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => onDelete(s.id)}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
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
