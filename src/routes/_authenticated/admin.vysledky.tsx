import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { Loader2, Download, FileText } from "lucide-react";
import { AdminLayout } from "@/components/invok/admin/AdminLayout";
import { Button } from "@/components/ui/button";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { supabase } from "@/integrations/supabase/client";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import {
  listResults,
  listResultsFilters,
} from "@/lib/admin/results.functions";

export const Route = createFileRoute("/_authenticated/admin/vysledky")({
  component: VysledkyPage,
});

const ALL = "__all__";

function fmtDate(iso: string | null) {
  if (!iso) return "—";
  return new Date(iso).toLocaleString("sk-SK", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function VysledkyPage() {
  const filtersFn = useServerFn(listResultsFilters);
  const resultsFn = useServerFn(listResults);
  const [email, setEmail] = useState<string | null>(null);
  const [testId, setTestId] = useState<string>(ALL);
  const [schoolId, setSchoolId] = useState<string>(ALL);
  const [status, setStatus] = useState<string>(ALL);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setEmail(data.user?.email ?? null));
  }, []);

  const filters = useQuery({
    queryKey: ["results-filters"],
    queryFn: () => filtersFn(),
  });

  const q = useQuery({
    queryKey: ["results", testId, schoolId, status],
    queryFn: () =>
      resultsFn({
        data: {
          testId: testId === ALL ? null : testId,
          schoolId: schoolId === ALL ? null : schoolId,
          status: status === ALL ? null : (status as "in_progress" | "submitted"),
        },
      }),
  });

  const rows = q.data ?? [];

  const filterLabel = useMemo(() => {
    const t = testId === ALL ? "Všetky testy" : filters.data?.tests.find((x: any) => x.id === testId)?.title ?? "";
    const s = schoolId === ALL ? "Všetky školy" : filters.data?.schools.find((x: any) => x.id === schoolId)?.name ?? "";
    return { t, s };
  }, [testId, schoolId, filters.data]);

  const exportRows = () =>
    rows.map((r: any) => {
      const pct = Number(r.max_score) > 0 ? Math.round((Number(r.score) / Number(r.max_score)) * 100) : null;
      return {
        ziak: r.student ? `${r.student.first_name ?? ""} ${r.student.last_name ?? ""}`.trim() || r.student.code : "",
        kod: r.student?.code ?? "",
        skola: r.school?.name ?? "",
        trieda: r.class?.name ?? "",
        test: r.test?.title ?? "",
        zacate: fmtDate(r.started_at),
        odovzdane: fmtDate(r.submitted_at),
        score: r.status === "submitted" ? `${Number(r.score)} / ${Number(r.max_score)}` : "",
        percent: pct != null && r.status === "submitted" ? `${pct}%` : "",
        stav: r.status === "submitted" ? "Odovzdaný" : "Prebieha",
      };
    });

  const handleExportCSV = () => {
    const data = exportRows();
    const headers = ["Žiak", "Kód", "Škola", "Trieda", "Test", "Začaté", "Odovzdané", "Skóre", "Úspešnosť", "Stav"];
    const escape = (v: string) => `"${String(v ?? "").replace(/"/g, '""')}"`;
    const lines = [headers.map(escape).join(",")];
    for (const r of data) {
      lines.push([r.ziak, r.kod, r.skola, r.trieda, r.test, r.zacate, r.odovzdane, r.score, r.percent, r.stav].map(escape).join(","));
    }
    const blob = new Blob(["\uFEFF" + lines.join("\n")], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `vysledky-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleExportPDF = () => {
    const data = exportRows();
    const doc = new jsPDF({ orientation: "landscape" });
    doc.setFontSize(14);
    doc.text("Výsledky testov", 14, 14);
    doc.setFontSize(9);
    doc.text(`Test: ${filterLabel.t}   Škola: ${filterLabel.s}   Dátum: ${new Date().toLocaleString("sk-SK")}`, 14, 20);
    autoTable(doc, {
      startY: 26,
      head: [["Žiak", "Kód", "Škola", "Trieda", "Test", "Začaté", "Odovzdané", "Skóre", "%", "Stav"]],
      body: data.map((r) => [r.ziak, r.kod, r.skola, r.trieda, r.test, r.zacate, r.odovzdane, r.score, r.percent, r.stav]),
      styles: { fontSize: 8 },
      headStyles: { fillColor: [30, 41, 59] },
    });
    doc.save(`vysledky-${new Date().toISOString().slice(0, 10)}.pdf`);
  };

  const stats = useMemo(() => {
    const submitted = rows.filter((r: any) => r.status === "submitted");
    const inProgress = rows.length - submitted.length;
    const scored = submitted.filter((r: any) => Number(r.max_score) > 0);
    const avg =
      scored.length === 0
        ? null
        : scored.reduce(
            (acc: number, r: any) =>
              acc + (Number(r.score) / Number(r.max_score)) * 100,
            0,
          ) / scored.length;
    return { total: rows.length, submitted: submitted.length, inProgress, avg };
  }, [q.data]);

  return (
    <AdminLayout title="Výsledky" userEmail={email}>
      <div className="flex flex-wrap items-start justify-between gap-3 mb-4">
        <p className="text-sm text-muted-foreground">
          Prehľad pokusov žiakov pre konkrétny test alebo školu vrátane skóre a
          stavu odovzdania.
        </p>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={handleExportCSV} disabled={rows.length === 0}>
            <Download className="h-4 w-4 mr-1.5" /> Export CSV
          </Button>
          <Button variant="outline" size="sm" onClick={handleExportPDF} disabled={rows.length === 0}>
            <FileText className="h-4 w-4 mr-1.5" /> Export PDF
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4">
        <div>
          <label className="text-xs text-muted-foreground">Test</label>
          <Select value={testId} onValueChange={setTestId}>
            <SelectTrigger className="mt-1.5">
              <SelectValue placeholder="Všetky testy" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={ALL}>Všetky testy</SelectItem>
              {(filters.data?.tests ?? []).map((t: any) => (
                <SelectItem key={t.id} value={t.id}>
                  {t.title}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div>
          <label className="text-xs text-muted-foreground">Škola</label>
          <Select value={schoolId} onValueChange={setSchoolId}>
            <SelectTrigger className="mt-1.5">
              <SelectValue placeholder="Všetky školy" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={ALL}>Všetky školy</SelectItem>
              {(filters.data?.schools ?? []).map((s: any) => (
                <SelectItem key={s.id} value={s.id}>
                  {s.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div>
          <label className="text-xs text-muted-foreground">Stav</label>
          <Select value={status} onValueChange={setStatus}>
            <SelectTrigger className="mt-1.5">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={ALL}>Všetky</SelectItem>
              <SelectItem value="in_progress">Prebieha</SelectItem>
              <SelectItem value="submitted">Odovzdaný</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-4">
        <StatCard label="Pokusy spolu" value={String(stats.total)} />
        <StatCard label="Odovzdané" value={String(stats.submitted)} />
        <StatCard label="Prebiehajúce" value={String(stats.inProgress)} />
        <StatCard
          label="Priemerná úspešnosť"
          value={stats.avg == null ? "—" : `${Math.round(stats.avg)} %`}
        />
      </div>

      <div className="bg-card border border-border rounded-xl overflow-hidden">
        {q.isLoading ? (
          <div className="p-6 text-muted-foreground flex items-center gap-2">
            <Loader2 className="h-4 w-4 animate-spin" /> Načítavam…
          </div>
        ) : !q.data || q.data.length === 0 ? (
          <div className="p-8 text-center text-muted-foreground">
            Žiadne pokusy pre zvolený filter.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-muted/50 text-xs uppercase text-muted-foreground">
                <tr>
                  <th className="text-left px-4 py-3">Žiak</th>
                  <th className="text-left px-4 py-3">Škola / Trieda</th>
                  <th className="text-left px-4 py-3">Test</th>
                  <th className="text-left px-4 py-3">Začaté</th>
                  <th className="text-left px-4 py-3">Odovzdané</th>
                  <th className="text-left px-4 py-3">Skóre</th>
                  <th className="text-left px-4 py-3">Stav</th>
                </tr>
              </thead>
              <tbody>
                {q.data.map((r: any) => {
                  const pct =
                    Number(r.max_score) > 0
                      ? Math.round((Number(r.score) / Number(r.max_score)) * 100)
                      : null;
                  return (
                    <tr key={r.id} className="border-t border-border">
                      <td className="px-4 py-3">
                        <div className="font-medium">
                          {r.student
                            ? `${r.student.first_name ?? ""} ${r.student.last_name ?? ""}`.trim() ||
                              r.student.code
                            : "—"}
                        </div>
                        <div className="text-xs text-muted-foreground font-mono">
                          {r.student?.code ?? ""}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div>{r.school?.name ?? "—"}</div>
                        <div className="text-xs text-muted-foreground">
                          {r.class?.name ?? ""}
                        </div>
                      </td>
                      <td className="px-4 py-3">{r.test?.title ?? "—"}</td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        {fmtDate(r.started_at)}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        {fmtDate(r.submitted_at)}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        {r.status === "submitted"
                          ? `${Number(r.score)} / ${Number(r.max_score)}${pct != null ? ` · ${pct}%` : ""}`
                          : "—"}
                      </td>
                      <td className="px-4 py-3">
                        {r.status === "submitted" ? (
                          <Badge>Odovzdaný</Badge>
                        ) : (
                          <Badge variant="secondary">Prebieha</Badge>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-card border border-border rounded-xl p-4">
      <div className="text-xs text-muted-foreground">{label}</div>
      <div className="text-2xl font-semibold mt-1">{value}</div>
    </div>
  );
}
