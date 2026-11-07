import { Link, useNavigate } from "@tanstack/react-router";
import { useSuspenseQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { Building2, Users, GraduationCap, ChartColumn, FileDown, LogOut, Plus, Pencil, Trash2, Save, Loader2 } from "lucide-react";
import { toast, Toaster } from "sonner";
import { Header } from "@/components/invok/Header";
import { Footer } from "@/components/invok/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogTitle, DialogHeader, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { schoolDashboardOptions } from "@/lib/school/queries";
import { saveSchoolProfile, saveSchoolClass, deleteSchoolClass } from "@/lib/school/school.functions";
import type { SchoolProfileInput } from "@/lib/school/school.functions";
import { averageScore } from "@/lib/school/rules";
import { supabase } from "@/integrations/supabase/client";

export type SchoolView = "overview" | "profile" | "classes" | "teachers" | "results" | "reports";
const navigation = [
  { view: "overview", to: "/skola/dashboard", label: "Prehľad", icon: Building2 },
  { view: "profile", to: "/skola/profil", label: "Profil školy", icon: Building2 },
  { view: "classes", to: "/skola/triedy", label: "Triedy", icon: GraduationCap },
  { view: "teachers", to: "/skola/ucitelia", label: "Učitelia", icon: Users },
  { view: "results", to: "/skola/vysledky", label: "Výsledky školy", icon: ChartColumn },
  { view: "reports", to: "/skola/reporty", label: "Reporty", icon: FileDown },
] as const;

export function SchoolWorkspace({ view }: { view: SchoolView }) {
  const { data } = useSuspenseQuery(schoolDashboardOptions);
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const saveProfile = useServerFn(saveSchoolProfile);
  const saveClass = useServerFn(saveSchoolClass);
  const removeClass = useServerFn(deleteSchoolClass);
  const [busy, setBusy] = useState(false);
  const [classFilter, setClassFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [editing, setEditing] = useState<{ id?: string; name: string; grade: number | null; school_year: string | null; teacher_id: string | null } | null>(null);
  const [deleting, setDeleting] = useState<{ id: string; name: string } | null>(null);
  const [selectedClass, setSelectedClass] = useState<string | null>(null);
  const school = data.school;
  if (!school) return <p>Škola nebola nájdená.</p>;
  const classesById = new Map(data.classes.map((c) => [c.id, c]));
  const teachersById = new Map(data.teachers.map((t) => [t.id, t]));
  const studentsById = new Map(data.students.map((s) => [s.id, s]));
  const testsById = new Map(data.tests.map((t) => [t.id, t]));
  const completed = data.attempts.filter((a) => a.status === "submitted");
  const average = averageScore(data.attempts);
  const filteredAttempts = data.attempts.filter((a) => (classFilter === "all" || a.class_id === classFilter) && (statusFilter === "all" || a.status === statusFilter));
  const filteredClasses = data.classes.filter((c) => c.name.toLocaleLowerCase("sk").includes(search.toLocaleLowerCase("sk")));
  const mutate = async (action: () => Promise<unknown>, message: string) => {
    setBusy(true);
    try { await action(); await queryClient.invalidateQueries({ queryKey: schoolDashboardOptions.queryKey }); toast.success(message); return true; }
    catch (error) { toast.error(error instanceof Error ? error.message : "Operácia zlyhala."); return false; }
    finally { setBusy(false); }
  };
  const classSummary = data.classes.map((c) => ({
    ...c,
    students: data.students.filter((s) => s.class_id === c.id).length,
    completed: completed.filter((a) => a.class_id === c.id).length,
    average: averageScore(data.attempts.filter((a) => a.class_id === c.id)),
  }));
  const downloadCsv = () => {
    const rows = [["Trieda", "Kód žiaka", "Test", "Stav", "Body", "Maximum", "Úspešnosť (%)", "Dátum"], ...filteredAttempts.map((a) => [classesById.get(a.class_id ?? "")?.name ?? "", studentsById.get(a.student_id)?.code ?? "", testsById.get(a.test_id)?.title ?? "Test", a.status === "submitted" ? "Dokončený" : "Rozpracovaný", String(a.score), String(a.max_score), a.status === "submitted" && a.max_score > 0 ? String(Math.round(a.score / a.max_score * 1000) / 10) : "", a.submitted_at ?? a.started_at])];
    const csv = "\uFEFF" + rows.map((row) => row.map((value) => '"' + (/^[=+@-]/.test(value) ? "'" : "") + value.replaceAll('"', '""') + '"').join(";")).join("\r\n");
    const url = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8" }));
    const link = document.createElement("a"); link.href = url; link.download = "invok-vysledky-skoly.csv"; link.click(); URL.revokeObjectURL(url);
  };
  return <div className="min-h-screen bg-background">
    <Header /><Toaster richColors />
    <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
        <div className="min-w-0"><p className="text-sm font-medium text-primary">Školské rozhranie</p><h1 className="mt-2 break-words text-3xl font-bold text-foreground">{school.name}</h1><p className="mt-2 text-muted-foreground">{[school.city, school.region].filter(Boolean).join(" · ")}</p></div>
        <Button variant="outline" onClick={async () => { await supabase.auth.signOut(); queryClient.removeQueries({ queryKey: schoolDashboardOptions.queryKey }); await navigate({ to: "/skola/prihlasenie" }); }}><LogOut />Odhlásiť sa</Button>
      </div>
      <nav aria-label="Školské rozhranie" className="mb-8 flex flex-wrap gap-2 border-b border-border pb-4">
        {navigation.map((item) => <Button key={item.view} variant={view === item.view ? "default" : "ghost"} asChild><Link to={item.to} aria-current={view === item.view ? "page" : undefined}><item.icon className="size-4" />{item.label}</Link></Button>)}
      </nav>
      <h2 className="mb-6 text-2xl font-semibold">{view === "overview" ? "Prehľad školy" : navigation.find((n) => n.view === view)?.label}</h2>
      {view === "overview" && <>
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          {[{ label: "Triedy", value: data.classes.length, to: "/skola/triedy" }, { label: "Žiaci", value: data.students.length, to: "/skola/triedy" }, { label: "Učitelia", value: data.teachers.length, to: "/skola/ucitelia" }, { label: "Dokončené testy", value: completed.length, to: "/skola/vysledky" }].map((stat) => <Link key={stat.label} to={stat.to} className="rounded-lg border border-border bg-card p-5 transition-colors hover:bg-accent"><p className="text-sm text-muted-foreground">{stat.label}</p><p className="mt-2 text-3xl font-semibold text-primary">{stat.value}</p></Link>)}
        </div>
        <section className="mt-8"><div className="mb-4 flex items-center justify-between gap-4"><h3 className="text-lg font-semibold">Zapojené triedy</h3><Button variant="outline" asChild><Link to="/skola/triedy"><Plus />Pridať triedu</Link></Button></div><ClassSummary rows={classSummary} /></section>
        <p className="mt-6 text-muted-foreground">Priemerná úspešnosť dokončených testov: <strong className="text-foreground">{average == null ? "Zatiaľ bez výsledkov" : `${average} %`}</strong></p>
      </>}
      {view === "profile" && <form key={school.id} onSubmit={async (event) => {
        event.preventDefault(); const fd = new FormData(event.currentTarget);
        const values = Object.fromEntries(profileFields.map(([key]) => [key, String(fd.get(key) ?? "")]));
        await mutate(() => saveProfile({ data: values as SchoolProfileInput }), "Údaje školy boli uložené.");
      }} className="max-w-4xl">
        <div className="grid gap-5 sm:grid-cols-2">{profileFields.map(([key, label]) => <div key={key} className={key === "name" ? "sm:col-span-2" : ""}><Label htmlFor={key}>{label}</Label><Input id={key} name={key} className="mt-2" defaultValue={school[key] ?? ""} required={key === "name"} type={key === "contact_email" ? "email" : key === "website" ? "url" : "text"} /></div>)}</div>
        <Button className="mt-6" type="submit" disabled={busy}>{busy ? <Loader2 className="animate-spin" /> : <Save />}Uložiť údaje</Button>
      </form>}
      {view === "classes" && <>
        <div className="mb-5 flex flex-wrap items-center justify-between gap-3"><Input aria-label="Hľadať triedu" placeholder="Hľadať triedu…" value={search} onChange={(e) => setSearch(e.target.value)} className="max-w-xs" /><Button onClick={() => setEditing({ name: "", grade: null, school_year: null, teacher_id: null })}><Plus />Pridať triedu</Button></div>
        <div className="overflow-x-auto"><table className="w-full text-left text-sm"><thead className="bg-muted"><tr>{["Trieda", "Ročník", "Školský rok", "Učiteľ", "Žiaci", "Akcie"].map((h) => <th className="p-3" key={h}>{h}</th>)}</tr></thead><tbody>{filteredClasses.map((c) => <tr key={c.id} className="border-b border-border"><td className="p-3 font-medium"><Button variant="link" className="h-auto p-0" onClick={() => setSelectedClass(c.id)}>{c.name}</Button></td><td className="p-3">{c.grade ?? "—"}</td><td className="p-3">{c.school_year ?? "—"}</td><td className="p-3">{teachersById.get(c.teacher_id ?? "")?.full_name ?? "Nepriradený"}</td><td className="p-3">{data.students.filter((s) => s.class_id === c.id).length}</td><td className="p-3"><div className="flex gap-1"><Button size="icon" variant="ghost" aria-label={`Upraviť ${c.name}`} title="Upraviť triedu" onClick={() => setEditing(c)}><Pencil className="size-4" /></Button><Button size="icon" variant="ghost" aria-label={`Vymazať ${c.name}`} title="Vymazať prázdnu triedu" onClick={() => setDeleting(c)}><Trash2 className="size-4 text-destructive" /></Button></div></td></tr>)}</tbody></table></div>
        {!filteredClasses.length && <Empty text={search ? "Žiadna trieda nezodpovedá vyhľadávaniu." : "Škola zatiaľ nemá žiadne triedy."} />}
      </>}
      {view === "teachers" && <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{data.teachers.map((teacher) => <article key={teacher.id} className="rounded-lg border border-border p-5"><div className="mb-3 flex items-center gap-3"><Users className="size-5 text-teal" /><h3 className="break-words font-semibold">{teacher.full_name ?? "Učiteľ"}</h3></div>{teacher.email && <a href={`mailto:${teacher.email}`} className="break-all text-sm text-primary">{teacher.email}</a>}<p className="mt-3 text-sm text-muted-foreground">{data.classes.filter((c) => c.teacher_id === teacher.id).map((c) => c.name).join(", ") || "Bez priradenej triedy"}</p><Button variant="outline" className="mt-4" asChild><Link to="/skola/triedy"><Pencil className="size-4" />Priradiť triedy</Link></Button></article>)}{!data.teachers.length && <Empty text="Škola zatiaľ nemá priradené učiteľské účty." />}</div>}
      {(view === "results" || view === "reports") && <>
        <div className="mb-6 flex flex-wrap gap-3">
          <Select value={classFilter} onValueChange={setClassFilter}><SelectTrigger aria-label="Filter triedy" className="w-52"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="all">Všetky triedy</SelectItem>{data.classes.map((c) => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}</SelectContent></Select>
          <Select value={statusFilter} onValueChange={setStatusFilter}><SelectTrigger aria-label="Filter stavu" className="w-52"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="all">Všetky stavy</SelectItem><SelectItem value="submitted">Dokončené</SelectItem><SelectItem value="in_progress">Rozpracované</SelectItem></SelectContent></Select>
          <Button variant="outline" onClick={downloadCsv}><FileDown />Export CSV</Button>{view === "reports" && <Button variant="outline" onClick={() => window.print()}><FileDown />Tlač / PDF</Button>}
        </div>
        {view === "reports" && <section className="mb-8 print:break-inside-avoid"><h3 className="mb-3 text-lg font-semibold">Súhrnný report · {school.name}</h3><p className="mb-4 text-sm text-muted-foreground">Žiaci: {data.students.length} · Triedy: {data.classes.length} · Dokončené testy vo výbere: {filteredAttempts.filter((a) => a.status === "submitted").length} · Priemerná úspešnosť: {averageScore(filteredAttempts) == null ? "—" : `${averageScore(filteredAttempts)} %`}</p><ClassSummary rows={classSummary.filter((c) => classFilter === "all" || c.id === classFilter)} /></section>}
        <div className="overflow-x-auto"><table className="w-full text-left text-sm"><thead className="bg-muted"><tr>{["Kód žiaka", "Trieda", "Test", "Stav", "Body", "Úspešnosť", "Dátum"].map((h) => <th key={h} className="p-3 whitespace-nowrap">{h}</th>)}</tr></thead><tbody>{filteredAttempts.map((a) => <tr key={a.id} className="border-b border-border"><td className="p-3">{studentsById.get(a.student_id)?.code ?? "—"}</td><td className="p-3">{classesById.get(a.class_id ?? "")?.name ?? "—"}</td><td className="p-3">{testsById.get(a.test_id)?.title ?? "Test"}</td><td className="p-3"><span className={a.status === "submitted" ? "text-teal" : "text-muted-foreground"}>{a.status === "submitted" ? "Dokončený" : "Rozpracovaný"}</span></td><td className="p-3 whitespace-nowrap">{a.score} / {a.max_score}</td><td className="p-3">{a.status === "submitted" && a.max_score > 0 ? `${Math.round(a.score / a.max_score * 1000) / 10} %` : "—"}</td><td className="p-3 whitespace-nowrap">{new Date(a.submitted_at ?? a.started_at).toLocaleDateString("sk-SK")}</td></tr>)}</tbody></table></div>
        {!filteredAttempts.length && <Empty text="Pre tento výber zatiaľ nie sú žiadne výsledky testovania." />}
      </>}
      <Dialog open={editing !== null} onOpenChange={(open) => { if (!open && !busy) setEditing(null); }}><DialogContent><DialogHeader><DialogTitle>{editing?.id ? "Upraviť triedu" : "Nová trieda"}</DialogTitle></DialogHeader>{editing && <form onSubmit={async (event) => { event.preventDefault(); if (await mutate(() => saveClass({ data: editing }), "Trieda bola uložená.")) setEditing(null); }} className="space-y-4">
        <div><Label htmlFor="class-name">Názov triedy</Label><Input id="class-name" className="mt-2" value={editing.name} required maxLength={60} onChange={(e) => setEditing({ ...editing, name: e.target.value })} /></div>
        <div className="grid grid-cols-2 gap-4"><div><Label htmlFor="class-grade">Ročník</Label><Input id="class-grade" className="mt-2" type="number" min={1} max={13} value={editing.grade ?? ""} onChange={(e) => setEditing({ ...editing, grade: e.target.value ? Number(e.target.value) : null })} /></div><div><Label htmlFor="school-year">Školský rok</Label><Input id="school-year" className="mt-2" placeholder="2026/2027" maxLength={20} value={editing.school_year ?? ""} onChange={(e) => setEditing({ ...editing, school_year: e.target.value || null })} /></div></div>
        <div><Label>Učiteľ</Label><Select value={editing.teacher_id ?? "none"} onValueChange={(value) => setEditing({ ...editing, teacher_id: value === "none" ? null : value })}><SelectTrigger aria-label="Učiteľ triedy" className="mt-2"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="none">Nepriradený</SelectItem>{data.teachers.map((t) => <SelectItem key={t.id} value={t.id}>{t.full_name ?? t.email ?? "Učiteľ"}</SelectItem>)}</SelectContent></Select></div>
        <DialogFooter><Button variant="outline" type="button" disabled={busy} onClick={() => setEditing(null)}>Zrušiť</Button><Button disabled={busy} type="submit">{busy ? <Loader2 className="animate-spin" /> : <Save />}Uložiť triedu</Button></DialogFooter>
      </form>}</DialogContent></Dialog>
      <Dialog open={deleting !== null} onOpenChange={(open) => { if (!open && !busy) setDeleting(null); }}><DialogContent><DialogHeader><DialogTitle>Vymazať triedu {deleting?.name}?</DialogTitle></DialogHeader><p className="text-sm text-muted-foreground">Vymazať je možné len prázdnu triedu bez výsledkov testovania.</p><DialogFooter><Button variant="outline" disabled={busy} onClick={() => setDeleting(null)}>Zrušiť</Button><Button variant="destructive" disabled={busy} onClick={async () => { if (deleting && await mutate(() => removeClass({ data: { id: deleting.id } }), "Trieda bola vymazaná.")) setDeleting(null); }}><Trash2 />Vymazať triedu</Button></DialogFooter></DialogContent></Dialog>
      <Dialog open={selectedClass !== null} onOpenChange={(open) => { if (!open) setSelectedClass(null); }}><DialogContent><DialogHeader><DialogTitle>Žiaci · {classesById.get(selectedClass ?? "")?.name}</DialogTitle></DialogHeader><div className="max-h-96 overflow-auto">{data.students.filter((s) => s.class_id === selectedClass).map((s) => <div key={s.id} className="flex flex-wrap justify-between gap-2 border-b border-border py-3 text-sm"><span className="font-medium">{s.code}</span><span>{[s.first_name, s.last_name].filter(Boolean).join(" ") || "—"}</span></div>)}{!data.students.some((s) => s.class_id === selectedClass) && <Empty text="V triede zatiaľ nie sú žiadni žiaci." />}</div></DialogContent></Dialog>
    </main><Footer />
  </div>;
}

const profileFields = [["name", "Názov školy"], ["city", "Mesto"], ["region", "Kraj"], ["street", "Ulica"], ["zip", "PSČ"], ["ico", "IČO"], ["dic", "DIČ"], ["website", "Webová stránka"], ["contact_name", "Kontaktná osoba"], ["contact_position", "Funkcia"], ["contact_email", "Kontaktný e-mail"], ["contact_phone", "Telefón"]] as const;
function Empty({ text }: { text: string }) { return <p className="py-8 text-sm text-muted-foreground">{text}</p>; }
function ClassSummary({ rows }: { rows: { id: string; name: string; students: number; completed: number; average: number | null }[] }) {
  if (!rows.length) return <Empty text="Škola zatiaľ nemá žiadne triedy." />;
  return <div className="overflow-x-auto"><table className="w-full text-left text-sm"><thead className="bg-muted"><tr>{["Trieda", "Žiaci", "Dokončené testy", "Priemerná úspešnosť"].map((h) => <th key={h} className="p-3">{h}</th>)}</tr></thead><tbody>{rows.map((c) => <tr key={c.id} className="border-b border-border"><td className="p-3 font-medium">{c.name}</td><td className="p-3">{c.students}</td><td className="p-3">{c.completed}</td><td className="p-3">{c.average == null ? "—" : `${c.average} %`}</td></tr>)}</tbody></table></div>;
}