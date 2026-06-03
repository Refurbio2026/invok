import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { Header } from "@/components/invok/Header";
import { Footer } from "@/components/invok/Footer";
import { Button } from "@/components/ui/button";
import { studentLogin } from "@/lib/public/student.functions";
import {
  clearStudentSession,
  getStudentSession,
} from "@/lib/public/student-session";
import { toast } from "sonner";
import { CheckCircle2, Clock, PlayCircle } from "lucide-react";

export const Route = createFileRoute("/ziak/dashboard")({
  head: () => ({ meta: [{ title: "Žiacky dashboard – INVOK" }] }),
  component: ZiakDashboard,
});

type State = Awaited<ReturnType<typeof studentLogin>> | null;

function ZiakDashboard() {
  const navigate = useNavigate();
  const login = useServerFn(studentLogin);
  const [state, setState] = useState<State>(null);
  const [loading, setLoading] = useState(true);

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
      <Header />
      <main className="flex-1 px-4 py-10 max-w-5xl mx-auto w-full">
        <div className="flex items-start justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold">Vitaj, {studentName}</h1>
            <p className="text-muted-foreground text-sm mt-1">
              Kód: <span className="font-mono">{student.code}</span>
              {student.grade ? ` · ${student.grade}. ročník` : ""}
            </p>
          </div>
          <Button variant="outline" onClick={logout}>Odhlásiť sa</Button>
        </div>

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
                  className="border border-border rounded-xl p-5 bg-card flex items-center justify-between gap-4"
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
                      {done && (
                        <span className="inline-flex items-center gap-1 text-emerald-600">
                          <CheckCircle2 className="h-3 w-3" />
                          {Number(a!.score)} / {Number(a!.max_score)} b.
                        </span>
                      )}
                    </div>
                  </div>
                  <Button asChild disabled={done}>
                    <Link
                      to="/ziak/test/$testId"
                      params={{ testId: t.id }}
                    >
                      <PlayCircle className="h-4 w-4 mr-1" />
                      {done ? "Odovzdané" : a ? "Pokračovať" : "Spustiť test"}
                    </Link>
                  </Button>
                </div>
              );
            })}
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}
