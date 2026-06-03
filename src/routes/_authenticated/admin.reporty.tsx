import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import {
  Loader2,
  Download,
  FileText,
  Search,
  TrendingUp,
  TrendingDown,
  Users,
  School,
  GraduationCap,
  CheckCircle2,
  Clock,
  Layers,
} from "lucide-react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import {
  ResponsiveContainer,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
  LineChart,
  Line,
} from "recharts";

import { AdminLayout } from "@/components/invok/admin/AdminLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
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
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import {
  getReports,
  getReportsFilters,
  getStudentReport,
  COMPETENCY_AREAS,
} from "@/lib/admin/reports.functions";

export const Route = createFileRoute("/_authenticated/admin/reporty")({
  component: ReportyPage,
});

const ALL = "__all__";

type FilterState = {
  schoolId: string;
  classId: string;
  grade: string;
  region: string;
  testId: string;
  testType: string;
  moduleId: string;
  competency: string;
  status: string;
  dateFrom: string;
  dateTo: string;
};

const initialFilters: FilterState = {
  schoolId: ALL,
  classId: ALL,
  grade: ALL,
  region: ALL,
  testId: ALL,
  testType: ALL,
  moduleId: ALL,
  competency: ALL,
  status: ALL,
  dateFrom: "",
  dateTo: "",
};

function csvEscape(v: any) {
  return `"${String(v ?? "").replace(/"/g, '""')}"`;
}

function downloadFile(name: string, blob: Blob) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = name;
  a.click();
  URL.revokeObjectURL(url);
}

function ReportyPage() {
  const filtersFn = useServerFn(getReportsFilters);
  const reportsFn = useServerFn(getReports);
  const studentFn = useServerFn(getStudentReport);

  const [email, setEmail] = useState<string | null>(null);
  const [filters, setFilters] = useState<FilterState>(initialFilters);
  const [studentCode, setStudentCode] = useState("");
  const [studentOpen, setStudentOpen] = useState(false);
  const [studentData, setStudentData] = useState<any>(null);
  const [studentLoading, setStudentLoading] = useState(false);
  const [studentError, setStudentError] = useState<string | null>(null);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setEmail(data.user?.email ?? null));
  }, []);

  const filtersQ = useQuery({ queryKey: ["reports-filters"], queryFn: () => filtersFn() });

  const reportPayload = useMemo(
    () => ({
      schoolId: filters.schoolId === ALL ? null : filters.schoolId,
      classId: filters.classId === ALL ? null : filters.classId,
      grade: filters.grade === ALL ? null : Number(filters.grade),
      region: filters.region === ALL ? null : filters.region,
      testId: filters.testId === ALL ? null : filters.testId,
      testType: filters.testType === ALL ? null : filters.testType,
      moduleId: filters.moduleId === ALL ? null : filters.moduleId,
      competency: filters.competency === ALL ? null : filters.competency,
      status: filters.status === ALL ? null : (filters.status as "in_progress" | "submitted"),
      dateFrom: filters.dateFrom ? new Date(filters.dateFrom).toISOString() : null,
      dateTo: filters.dateTo ? new Date(filters.dateTo + "T23:59:59").toISOString() : null,
    }),
    [filters],
  );

  const reportQ = useQuery({
    queryKey: ["reports", reportPayload],
    queryFn: () => reportsFn({ data: reportPayload }),
  });

  const data = reportQ.data;

  // Filter dependent classes by school
  const filteredClasses = useMemo(() => {
    const all = filtersQ.data?.classes ?? [];
    if (filters.schoolId === ALL) return all;
    return all.filter((c: any) => c.school_id === filters.schoolId);
  }, [filtersQ.data, filters.schoolId]);

  const radarData = useMemo(() => {
    if (!data) return [];
    return COMPETENCY_AREAS.map((area) => {
      const c = data.competencies.find((x: any) => x.area === area);
      return { area, value: c?.avgPct ?? 0 };
    });
  }, [data]);

  const inOutData = useMemo(() => {
    if (!data) return [];
    return COMPETENCY_AREAS.map((area) => {
      const c = data.competencies.find((x: any) => x.area === area);
      return { area, vstupný: c?.inPct ?? 0, výstupný: c?.outPct ?? 0 };
    });
  }, [data]);

  const handleSearchStudent = async () => {
    if (!studentCode.trim()) return;
    setStudentLoading(true);
    setStudentError(null);
    setStudentData(null);
    setStudentOpen(true);
    try {
      const r = await studentFn({ data: { code: studentCode.trim() } });
      setStudentData(r);
    } catch (e: any) {
      setStudentError(e?.message ?? "Žiak sa nenašiel.");
    } finally {
      setStudentLoading(false);
    }
  };

  const exportSchoolsCSV = () => {
    if (!data) return;
    const headers = [
      "Škola",
      "Mesto",
      "Kraj",
      "Triedy",
      "Žiaci",
      "Pokusy",
      "Priemerné skóre %",
      "Najsilnejšia",
      "Najslabšia",
      "Progres %",
    ];
    const lines = [headers.map(csvEscape).join(",")];
    for (const s of data.schools) {
      lines.push(
        [s.name, s.city, s.region, s.classes, s.students, s.attempts, s.avgScore, s.topCompetency, s.weakCompetency, s.progress]
          .map(csvEscape)
          .join(","),
      );
    }
    downloadFile("reporty-skoly.csv", new Blob(["\ufeff" + lines.join("\n")], { type: "text/csv" }));
  };

  const exportClassesCSV = () => {
    if (!data) return;
    const headers = ["Škola", "Trieda", "Ročník", "Žiaci", "Dokončené", "Priemerné skóre %", "Progres %"];
    const lines = [headers.map(csvEscape).join(",")];
    for (const c of data.classes) {
      lines.push(
        [c.school, c.name, c.grade ?? "", c.students, c.submitted, c.avgScore, c.progress].map(csvEscape).join(","),
      );
    }
    downloadFile("reporty-triedy.csv", new Blob(["\ufeff" + lines.join("\n")], { type: "text/csv" }));
  };

  const exportAllCSV = () => {
    if (!data) return;
    const headers = ["Oblasť", "Priem. body", "Priem. %", "Žiaci", "Vstup %", "Výstup %", "Rozdiel %"];
    const lines = [headers.map(csvEscape).join(",")];
    for (const c of data.competencies) {
      lines.push(
        [c.area, c.avgPoints, c.avgPct, c.students, c.inPct, c.outPct, c.diff].map(csvEscape).join(","),
      );
    }
    downloadFile("reporty-kompetencie.csv", new Blob(["\ufeff" + lines.join("\n")], { type: "text/csv" }));
  };

  const exportCompetencyPDF = () => {
    if (!data) return;
    const doc = new jsPDF();
    doc.setFontSize(16);
    doc.text("INVOK — Kompetenčný report", 14, 18);
    doc.setFontSize(10);
    doc.text(`Vygenerované: ${new Date().toLocaleString("sk-SK")}`, 14, 26);
    const lines = doc.splitTextToSize(data.summary, 180);
    doc.text(lines, 14, 34);
    autoTable(doc, {
      startY: 34 + lines.length * 5 + 4,
      head: [["Oblasť", "Priem. %", "Žiaci", "Vstup %", "Výstup %", "Rozdiel %"]],
      body: data.competencies.map((c: any) => [c.area, c.avgPct, c.students, c.inPct, c.outPct, c.diff]),
      styles: { fontSize: 9 },
    });
    doc.save("reporty-kompetencie.pdf");
  };

  const exportGlobalPDF = () => {
    if (!data) return;
    const doc = new jsPDF();
    doc.setFontSize(16);
    doc.text("INVOK — Globálny report", 14, 18);
    doc.setFontSize(10);
    doc.text(`Vygenerované: ${new Date().toLocaleString("sk-SK")}`, 14, 26);
    const ov = data.overview;
    const overviewLines = [
      `Školy: ${ov.schools}  •  Triedy: ${ov.classes}  •  Žiaci: ${ov.students}`,
      `Dokončené testy: ${ov.submitted}  •  Rozpracované: ${ov.inProgress}  •  Moduly: ${ov.modules}`,
      `Priemerné skóre: ${ov.avgScorePct} %`,
      `Vstupný test: ${ov.inAvg} %  •  Výstupný test: ${ov.outAvg} %  •  Progres: ${ov.progressDiff} %`,
    ];
    doc.text(overviewLines, 14, 34);
    doc.text(doc.splitTextToSize(data.summary, 180), 14, 60);
    autoTable(doc, {
      startY: 90,
      head: [["Škola", "Mesto", "Žiaci", "Skóre %", "Progres %"]],
      body: data.schools.map((s: any) => [s.name, s.city, s.students, s.avgScore, s.progress]),
      styles: { fontSize: 9 },
    });
    doc.save("reporty-globalny.pdf");
  };

  const setF = <K extends keyof FilterState>(k: K, v: FilterState[K]) =>
    setFilters((p) => ({ ...p, [k]: v }));

  return (
    <AdminLayout title="Reporty" userEmail={email}>
      <div className="space-y-6">
        {/* Search bar */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Vyhľadanie žiaka podľa anonymného kódu</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              <Input
                placeholder="napr. ZIAK-12345"
                value={studentCode}
                onChange={(e) => setStudentCode(e.target.value)}
                className="max-w-xs"
                onKeyDown={(e) => e.key === "Enter" && handleSearchStudent()}
              />
              <Button onClick={handleSearchStudent}>
                <Search className="mr-2 h-4 w-4" /> Vyhľadať
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Filters */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Filtre</CardTitle>
            <CardDescription>Administrátorský pohľad – všetky školy a triedy.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
              <FilterSelect
                label="Škola"
                value={filters.schoolId}
                onChange={(v) => setF("schoolId", v)}
                options={(filtersQ.data?.schools ?? []).map((s: any) => ({ value: s.id, label: s.name }))}
              />
              <FilterSelect
                label="Trieda"
                value={filters.classId}
                onChange={(v) => setF("classId", v)}
                options={filteredClasses.map((c: any) => ({ value: c.id, label: c.name }))}
              />
              <FilterSelect
                label="Ročník"
                value={filters.grade}
                onChange={(v) => setF("grade", v)}
                options={(filtersQ.data?.grades ?? []).map((g: any) => ({ value: String(g), label: String(g) }))}
              />
              <FilterSelect
                label="Kraj / región"
                value={filters.region}
                onChange={(v) => setF("region", v)}
                options={(filtersQ.data?.regions ?? []).map((r: string) => ({ value: r, label: r }))}
              />
              <FilterSelect
                label="Test"
                value={filters.testId}
                onChange={(v) => setF("testId", v)}
                options={(filtersQ.data?.tests ?? []).map((t: any) => ({ value: t.id, label: t.title }))}
              />
              <FilterSelect
                label="Typ testu"
                value={filters.testType}
                onChange={(v) => setF("testType", v)}
                options={(filtersQ.data?.testTypes ?? []).map((t: string) => ({ value: t, label: t }))}
              />
              <FilterSelect
                label="Modul"
                value={filters.moduleId}
                onChange={(v) => setF("moduleId", v)}
                options={(filtersQ.data?.modules ?? []).map((m: any) => ({ value: m.id, label: m.name }))}
              />
              <FilterSelect
                label="Kompetenčná oblasť"
                value={filters.competency}
                onChange={(v) => setF("competency", v)}
                options={(filtersQ.data?.competencies ?? []).map((c: string) => ({ value: c, label: c }))}
              />
              <FilterSelect
                label="Stav"
                value={filters.status}
                onChange={(v) => setF("status", v)}
                options={[
                  { value: "submitted", label: "Odovzdaný" },
                  { value: "in_progress", label: "Prebieha" },
                ]}
              />
              <div>
                <Label className="text-xs">Dátum od</Label>
                <Input type="date" value={filters.dateFrom} onChange={(e) => setF("dateFrom", e.target.value)} />
              </div>
              <div>
                <Label className="text-xs">Dátum do</Label>
                <Input type="date" value={filters.dateTo} onChange={(e) => setF("dateTo", e.target.value)} />
              </div>
              <div className="flex items-end">
                <Button variant="outline" className="w-full" onClick={() => setFilters(initialFilters)}>
                  Reset filtrov
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Exports */}
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" onClick={exportAllCSV}>
            <Download className="mr-2 h-4 w-4" /> Kompetencie CSV
          </Button>
          <Button variant="outline" onClick={exportSchoolsCSV}>
            <Download className="mr-2 h-4 w-4" /> Školy CSV
          </Button>
          <Button variant="outline" onClick={exportClassesCSV}>
            <Download className="mr-2 h-4 w-4" /> Triedy CSV
          </Button>
          <Button variant="outline" onClick={exportCompetencyPDF}>
            <FileText className="mr-2 h-4 w-4" /> Kompetenčný PDF
          </Button>
          <Button variant="outline" onClick={exportGlobalPDF}>
            <FileText className="mr-2 h-4 w-4" /> Globálny PDF
          </Button>
        </div>

        {reportQ.isLoading && (
          <div className="flex items-center gap-2 text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" /> Načítavam reporty...
          </div>
        )}

        {data && (
          <>
            {/* Overview cards */}
            <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
              <Stat icon={School} label="Školy" value={data.overview.schools} />
              <Stat icon={Users} label="Triedy" value={data.overview.classes} />
              <Stat icon={GraduationCap} label="Žiaci" value={data.overview.students} />
              <Stat icon={Layers} label="Moduly" value={data.overview.modules} />
              <Stat icon={CheckCircle2} label="Dokončené testy" value={data.overview.submitted} />
              <Stat icon={Clock} label="Rozpracované" value={data.overview.inProgress} />
              <Stat icon={TrendingUp} label="Priemerné skóre" value={`${data.overview.avgScorePct} %`} />
              <Stat
                icon={data.overview.progressDiff >= 0 ? TrendingUp : TrendingDown}
                label="Progres (výstup − vstup)"
                value={`${data.overview.progressDiff > 0 ? "+" : ""}${data.overview.progressDiff} %`}
              />
            </div>

            {/* Summary */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Slovné zhrnutie</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm leading-relaxed">{data.summary}</p>
              </CardContent>
            </Card>

            {/* Empty state */}
            {data.overview.submitted === 0 && data.overview.inProgress === 0 && (
              <Card>
                <CardContent className="py-12 text-center text-muted-foreground">
                  Pre zvolené filtre nie sú dostupné žiadne pokusy o testy.
                </CardContent>
              </Card>
            )}

            {/* Charts */}
            {data.overview.submitted > 0 && (
              <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Radar – kompetenčný profil</CardTitle>
                  </CardHeader>
                  <CardContent className="h-80">
                    <ResponsiveContainer>
                      <RadarChart data={radarData}>
                        <PolarGrid />
                        <PolarAngleAxis dataKey="area" tick={{ fontSize: 11 }} />
                        <PolarRadiusAxis angle={30} domain={[0, 100]} />
                        <Radar name="Priemer %" dataKey="value" stroke="hsl(var(--primary))" fill="hsl(var(--primary))" fillOpacity={0.4} />
                        <Tooltip />
                      </RadarChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Vstupný vs. výstupný test</CardTitle>
                  </CardHeader>
                  <CardContent className="h-80">
                    <ResponsiveContainer>
                      <BarChart data={inOutData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="area" tick={{ fontSize: 10 }} interval={0} angle={-15} textAnchor="end" height={70} />
                        <YAxis domain={[0, 100]} />
                        <Tooltip />
                        <Legend />
                        <Bar dataKey="vstupný" fill="hsl(var(--muted-foreground))" />
                        <Bar dataKey="výstupný" fill="hsl(var(--primary))" />
                      </BarChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>

                <Card className="lg:col-span-2">
                  <CardHeader>
                    <CardTitle className="text-base">Trend priemerného skóre v čase</CardTitle>
                  </CardHeader>
                  <CardContent className="h-72">
                    {data.trend.length === 0 ? (
                      <p className="text-sm text-muted-foreground">Pre trend nie sú dostupné dáta.</p>
                    ) : (
                      <ResponsiveContainer>
                        <LineChart data={data.trend}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="month" />
                          <YAxis domain={[0, 100]} />
                          <Tooltip />
                          <Line type="monotone" dataKey="avgPct" stroke="hsl(var(--primary))" strokeWidth={2} />
                        </LineChart>
                      </ResponsiveContainer>
                    )}
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Competency table */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Kompetenčné výsledky</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Oblasť</TableHead>
                      <TableHead className="text-right">Priem. body</TableHead>
                      <TableHead className="text-right">Priem. %</TableHead>
                      <TableHead className="text-right">Žiaci</TableHead>
                      <TableHead className="text-right">Vstup %</TableHead>
                      <TableHead className="text-right">Výstup %</TableHead>
                      <TableHead className="text-right">Rozdiel</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {data.competencies.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center text-muted-foreground">
                          Žiadne kompetenčné dáta.
                        </TableCell>
                      </TableRow>
                    )}
                    {data.competencies.map((c: any) => (
                      <TableRow key={c.area}>
                        <TableCell>{c.area}</TableCell>
                        <TableCell className="text-right">{c.avgPoints}</TableCell>
                        <TableCell className="text-right font-medium">{c.avgPct} %</TableCell>
                        <TableCell className="text-right">{c.students}</TableCell>
                        <TableCell className="text-right">{c.inPct} %</TableCell>
                        <TableCell className="text-right">{c.outPct} %</TableCell>
                        <TableCell className="text-right">
                          <Badge variant={c.diff >= 0 ? "default" : "secondary"}>
                            {c.diff > 0 ? "+" : ""}
                            {c.diff} %
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>

            {/* Schools table */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Porovnanie škôl</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Škola</TableHead>
                      <TableHead>Mesto</TableHead>
                      <TableHead>Kraj</TableHead>
                      <TableHead className="text-right">Triedy</TableHead>
                      <TableHead className="text-right">Žiaci</TableHead>
                      <TableHead className="text-right">Pokusy</TableHead>
                      <TableHead className="text-right">Skóre %</TableHead>
                      <TableHead>Najsilnejšia</TableHead>
                      <TableHead>Najslabšia</TableHead>
                      <TableHead className="text-right">Progres</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {data.schools.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={10} className="text-center text-muted-foreground">
                          Žiadne školy v aktuálnom výbere.
                        </TableCell>
                      </TableRow>
                    )}
                    {data.schools.map((s: any) => (
                      <TableRow key={s.id}>
                        <TableCell className="font-medium">{s.name}</TableCell>
                        <TableCell>{s.city ?? "—"}</TableCell>
                        <TableCell>{s.region ?? "—"}</TableCell>
                        <TableCell className="text-right">{s.classes}</TableCell>
                        <TableCell className="text-right">{s.students}</TableCell>
                        <TableCell className="text-right">{s.attempts}</TableCell>
                        <TableCell className="text-right">{s.avgScore} %</TableCell>
                        <TableCell className="text-xs">{s.topCompetency}</TableCell>
                        <TableCell className="text-xs">{s.weakCompetency}</TableCell>
                        <TableCell className="text-right">{s.progress > 0 ? "+" : ""}{s.progress} %</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>

            {/* Classes table */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Porovnanie tried</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Škola</TableHead>
                      <TableHead>Trieda</TableHead>
                      <TableHead className="text-right">Ročník</TableHead>
                      <TableHead className="text-right">Žiaci</TableHead>
                      <TableHead className="text-right">Dokončené</TableHead>
                      <TableHead className="text-right">Skóre %</TableHead>
                      <TableHead className="text-right">Progres</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {data.classes.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center text-muted-foreground">
                          Žiadne triedy v aktuálnom výbere.
                        </TableCell>
                      </TableRow>
                    )}
                    {data.classes.map((c: any) => (
                      <TableRow key={c.id}>
                        <TableCell>{c.school}</TableCell>
                        <TableCell className="font-medium">{c.name}</TableCell>
                        <TableCell className="text-right">{c.grade ?? "—"}</TableCell>
                        <TableCell className="text-right">{c.students}</TableCell>
                        <TableCell className="text-right">{c.submitted}</TableCell>
                        <TableCell className="text-right">{c.avgScore} %</TableCell>
                        <TableCell className="text-right">{c.progress > 0 ? "+" : ""}{c.progress} %</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>

            {/* Heatmap */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Heatmapa kompetencií podľa škôl</CardTitle>
                <CardDescription>Priemerné % na kompetenciu pre každú školu (zobrazených max. 30).</CardDescription>
              </CardHeader>
              <CardContent className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Škola</TableHead>
                      {COMPETENCY_AREAS.map((c) => (
                        <TableHead key={c} className="text-center text-xs">
                          {c}
                        </TableHead>
                      ))}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {data.heatmap.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={COMPETENCY_AREAS.length + 1} className="text-center text-muted-foreground">
                          Žiadne dáta.
                        </TableCell>
                      </TableRow>
                    )}
                    {data.heatmap.map((row: any, i: number) => (
                      <TableRow key={i}>
                        <TableCell className="font-medium">{row.school}</TableCell>
                        {COMPETENCY_AREAS.map((c) => {
                          const v = row[c];
                          const bg =
                            v == null
                              ? "transparent"
                              : `color-mix(in oklab, hsl(var(--primary)) ${Math.min(100, Math.max(5, v))}%, transparent)`;
                          return (
                            <TableCell key={c} className="text-center text-xs" style={{ background: bg }}>
                              {v == null ? "—" : `${v} %`}
                            </TableCell>
                          );
                        })}
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </>
        )}
      </div>

      {/* Student detail dialog */}
      <Dialog open={studentOpen} onOpenChange={setStudentOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Detail žiaka</DialogTitle>
            <DialogDescription>Kompletný profil podľa anonymného kódu</DialogDescription>
          </DialogHeader>
          {studentLoading && (
            <div className="flex items-center gap-2 text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" /> Načítavam...
            </div>
          )}
          {studentError && <p className="text-sm text-destructive">{studentError}</p>}
          {studentData && (
            <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-2">
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div><span className="text-muted-foreground">Kód:</span> <b>{studentData.student.code}</b></div>
                <div><span className="text-muted-foreground">Škola:</span> {studentData.school?.name ?? "—"}</div>
                <div><span className="text-muted-foreground">Trieda:</span> {studentData.class?.name ?? "—"}</div>
                <div><span className="text-muted-foreground">Ročník:</span> {studentData.student.grade ?? "—"}</div>
                <div><span className="text-muted-foreground">Vstupné skóre:</span> {studentData.inPct ?? "—"} %</div>
                <div><span className="text-muted-foreground">Výstupné skóre:</span> {studentData.outPct ?? "—"} %</div>
                <div><span className="text-muted-foreground">Rozdiel:</span> {studentData.diff ?? "—"} %</div>
                <div><span className="text-muted-foreground">Absolvované moduly:</span> {studentData.modulesCompleted}</div>
              </div>

              <div>
                <h4 className="font-semibold text-sm mb-2">Absolvované testy</h4>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Test</TableHead>
                      <TableHead>Stav</TableHead>
                      <TableHead className="text-right">Skóre</TableHead>
                      <TableHead className="text-right">%</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {studentData.attempts.length === 0 && (
                      <TableRow><TableCell colSpan={4} className="text-center text-muted-foreground">Žiadne pokusy.</TableCell></TableRow>
                    )}
                    {studentData.attempts.map((a: any) => (
                      <TableRow key={a.id}>
                        <TableCell>{a.test?.title ?? "—"}</TableCell>
                        <TableCell>{a.status === "submitted" ? "Odovzdaný" : "Prebieha"}</TableCell>
                        <TableCell className="text-right">{Number(a.score)} / {Number(a.max_score)}</TableCell>
                        <TableCell className="text-right">{a.pct ?? "—"} %</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              <div>
                <h4 className="font-semibold text-sm mb-2">Výsledky podľa kompetencií</h4>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Oblasť</TableHead>
                      <TableHead className="text-right">Body</TableHead>
                      <TableHead className="text-right">Max</TableHead>
                      <TableHead className="text-right">%</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {studentData.competencies.length === 0 && (
                      <TableRow><TableCell colSpan={4} className="text-center text-muted-foreground">Žiadne dáta.</TableCell></TableRow>
                    )}
                    {studentData.competencies.map((c: any) => (
                      <TableRow key={c.area}>
                        <TableCell>{c.area}</TableCell>
                        <TableCell className="text-right">{c.points}</TableCell>
                        <TableCell className="text-right">{c.max}</TableCell>
                        <TableCell className="text-right">{c.pct} %</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              <p className="text-xs text-muted-foreground">Odznaky: systém odznakov zatiaľ nie je k dispozícii.</p>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
}

function FilterSelect({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: { value: string; label: string }[];
}) {
  return (
    <div>
      <Label className="text-xs">{label}</Label>
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger>
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value={ALL}>Všetky</SelectItem>
          {options.map((o) => (
            <SelectItem key={o.value} value={o.value}>
              {o.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}

function Stat({
  icon: Icon,
  label,
  value,
}: {
  icon: any;
  label: string;
  value: string | number;
}) {
  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-center gap-3">
          <div className="rounded-md bg-muted p-2">
            <Icon className="h-4 w-4 text-muted-foreground" />
          </div>
          <div>
            <p className="text-xs text-muted-foreground">{label}</p>
            <p className="text-xl font-semibold">{value}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
