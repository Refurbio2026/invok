import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { Header } from "@/components/invok/Header";
import { Footer } from "@/components/invok/Footer";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { studentLogin } from "@/lib/public/student.functions";
import { getStudentLmsLink } from "@/lib/lms/lms.functions";
import {
  clearStudentSession,
  getStudentSession,
} from "@/lib/public/student-session";
import { toast, Toaster } from "sonner";
import { CheckCircle2, Clock, GraduationCap, PlayCircle } from "lucide-react";

export const Route = createFileRoute("/ziak/dashboard")({
  head: () => ({ meta: [{ title: "Moje učenie – INVOK" }, { name: "description", content: "Osobné testy, vzdelávacie moduly a výsledky žiaka v programe INVOK." }, { property: "og:title", content: "Moje učenie – INVOK" }, { property: "og:description", content: "Osobné testy, vzdelávacie moduly a výsledky žiaka v programe INVOK." }, { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary" }, { name: "robots", content: "noindex, nofollow" }] }),
  component: ZiakDashboard,
});

type State = Awaited<ReturnType<typeof studentLogin>> | null;

function ZiakDashboard() {
  const navigate = useNavigate();
  const login = useServerFn(studentLogin);
  const [state, setState] = useState<State>(null);
  const [loading, setLoading] = useState(true);
  const lmsLink = useServerFn(getStudentLmsLink);
  const [openingLms, setOpeningLms] = useState(false);

  useEffect(() => {
    const s = getStudentSession();
    if (!s) {
      navigate({ to: "/ziak/prihlasenie" });
      return;
    }
    login({ data: { code: s.code, pin: s.pin } })
      .then((res) => setState(res))
      .catch((err) => {
        toast.error(err?.message ?? "Relácia vypršala.");
        clearStudentSession();
        navigate({ to: "/ziak/prihlasenie" });
      })
      .finally(() => setLoading(false));
  }, []);

  async function openLms() {
    const s = getStudentSession();
    if (!s) return navigate({ to: "/ziak/prihlasenie" });
    setOpeningLms(true);
    try {
      const { url } = await lmsLink({ data: { code: s.code, pin: s.pin } });
      window.location.assign(url);
    } catch (err) {
      toast.error((err as Error)?.message ?? "Do LMS sa nepodarilo vstúpiť.");
      setOpeningLms(false);
    }
  }

  function logout() {
    clearStudentSession();
    navigate({ to: "/ziak/prihlasenie" });
  }

  if (loading || !state) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <p className="text-muted-foreground">Načítavam…</p>
        </main>
        <Footer />
      </div>
    );
  }

  const attemptsByTest = new Map<string, (typeof state.attempts)[number]>();
  for (const a of state.attempts) {
    const cur = attemptsByTest.get(a.test_id);
    if (!cur || new Date(a.started_at) > new Date(cur.started_at)) {
      attemptsByTest.set(a.test_id, a);
    }
  }

  const student = state.student;
  const studentName =
    [student.first_name, student.last_name].filter(Boolean).join(" ") ||
    student.code;

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header /><Toaster richColors />
      <main className="flex-1 px-4 py-10 max-w-5xl mx-auto w-full">
        <div className="flex flex-wrap gap-4 items-start justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold break-words">Vitaj, {studentName}</h1>
            <p className="text-muted-foreground text-sm mt-1">
              Kód: <span className="font-mono">{student.code}</span>
              {student.grade ? ` · ${student.grade}. ročník` : ""}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button onClick={openLms} disabled={openingLms}><GraduationCap />{openingLms ? "Otváram LMS…" : "Vstúpiť do LMS"}</Button>
            <Button variant="outline" onClick={logout}>Odhlásiť sa</Button>
          </div>
        </div>

        <div className="mb-8 grid grid-cols-3 gap-3">{[{ label: "Dostupné testy", count: state.tests.length }, { label: "Rozpracované", count: state.attempts.filter((a) => a.status === "in_progress").length }, { label: "Odovzdané", count: state.attempts.filter((a) => a.status === "submitted").length }].map((item) => <div key={item.label} className="rounded-lg border border-border p-4"><p className="text-xs text-muted-foreground">{item.label}</p><p className="mt-2 text-2xl font-semibold text-primary">{item.count}</p></div>)}</div>
        <Tabs defaultValue="tests"><TabsList className="mb-6"><TabsTrigger value="tests">Moje testy</TabsTrigger><TabsTrigger value="modules">Moduly</TabsTrigger><TabsTrigger value="results">Moje výsledky</TabsTrigger></TabsList><TabsContent value="tests">
        <h2 className="text-xl font-semibold mb-4">Dostupné testy</h2>
        {state.tests.length === 0 ? (
          <p className="text-muted-foreground">
            Momentálne nie sú dostupné žiadne publikované testy.
          </p>
        ) : (
          <div className="grid gap-4">
            {state.tests.map((t) => {
              const a = attemptsByTest.get(t.id);
              const done = a?.status === "submitted";
              return (
                <div
                  key={t.id}
                  className="border border-border rounded-lg p-5 bg-card flex flex-wrap items-center justify-between gap-4"
                >
                  <div>
                    <div className="font-semibold">{t.title}</div>
                    {t.description && (
                      <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                        {t.description}
                      </p>
                    )}
                    <div className="flex items-center gap-3 text-xs text-muted-foreground mt-2">
                      {t.duration_min ? (
                        <span className="inline-flex items-center gap-1">
                          <Clock className="h-3 w-3" /> {t.duration_min} min
                        </span>
                      ) : null}
                      {done && a && (
                        <span className="inline-flex items-center gap-1 text-teal">
                          <CheckCircle2 className="h-3 w-3" />
                          {a.score == null ? "Odovzdané" : `${a.score} / ${a.max_score} b.`}
                        </span>
                      )}
                    </div>
                  </div>
                  {done && !t.allow_retake ? <Button disabled><CheckCircle2 />Odovzdané</Button> : <Button asChild>
                    <Link
                      to="/ziak/test/$testId"
                      params={{ testId: t.id }}
                    >
                      <PlayCircle className="h-4 w-4 mr-1" />
                      {done ? "Zopakovať test" : a ? "Pokračovať" : "Spustiť test"}
                    </Link>
                  </Button>}
                </div>
              );
            })}
          </div>
        )}
        </TabsContent><TabsContent value="modules"><h2 className="mb-4 text-xl font-semibold">Vzdelávacie moduly</h2><div className="grid gap-4 sm:grid-cols-2">{state.modules.map((m) => <article key={m.id} className="rounded-lg border border-border p-5"><h3 className="font-semibold">{m.name}</h3><p className="mt-2 text-sm text-muted-foreground">{m.description}</p><p className="mt-4 text-sm">Dostupné testy: {state.tests.filter((t) => t.module_id === m.id).length}</p></article>)}</div></TabsContent><TabsContent value="results"><h2 className="mb-4 text-xl font-semibold">Moje výsledky</h2><div className="divide-y divide-border">{state.attempts.map((a) => <article key={a.id} className="flex flex-wrap items-center justify-between gap-4 py-4"><div><h3 className="font-medium">{a.title}</h3><p className="mt-1 text-sm text-muted-foreground">{a.status === "submitted" ? "Odovzdaný" : "Rozpracovaný"} · {new Date(a.submitted_at ?? a.started_at).toLocaleDateString("sk-SK")}</p></div><p className="font-semibold text-primary">{a.status !== "submitted" ? "—" : a.score == null ? "Výsledok nie je zverejnený" : `${a.score} / ${a.max_score} bodov`}</p></article>)}</div>{!state.attempts.length && <p className="text-muted-foreground">Zatiaľ nemáš výsledky testovania.</p>}</TabsContent></Tabs>
      </main>
      <Footer />
    </div>
  );
}
