import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

async function assertAdmin(supabase: any, userId: string) {
  const { data } = await supabase
    .from("user_roles")
    .select("role")
    .eq("user_id", userId)
    .eq("role", "admin")
    .maybeSingle();
  if (!data) throw new Error("Forbidden — admin only");
}

export const COMPETENCY_AREAS = [
  "Podnikavosť a iniciatíva",
  "Kritické a mediálne myslenie",
  "Tímová spolupráca",
  "Digitálne zručnosti",
  "Komunikácia a prezentácia",
  "Sebahodnotenie a budúcnosť",
] as const;

const FiltersSchema = z.object({
  schoolId: z.string().uuid().nullable().optional(),
  classId: z.string().uuid().nullable().optional(),
  grade: z.number().int().nullable().optional(),
  region: z.string().nullable().optional(),
  testId: z.string().uuid().nullable().optional(),
  testType: z.string().nullable().optional(),
  moduleId: z.string().uuid().nullable().optional(),
  dateFrom: z.string().nullable().optional(),
  dateTo: z.string().nullable().optional(),
  competency: z.string().nullable().optional(),
  status: z.enum(["in_progress", "submitted"]).nullable().optional(),
});

export const getReportsFilters = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await assertAdmin(context.supabase, context.userId);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const [{ data: schools }, { data: classes }, { data: tests }, { data: modules }, { data: questions }] =
      await Promise.all([
        supabaseAdmin.from("schools").select("id,name,city,region").order("name"),
        supabaseAdmin.from("classes").select("id,name,grade,school_id").order("name"),
        supabaseAdmin.from("tests").select("id,title,type,module_id").order("title"),
        supabaseAdmin.from("modules").select("id,name").order("sort_order"),
        supabaseAdmin.from("test_questions").select("competency"),
      ]);
    const regions = [...new Set((schools ?? []).map((s: any) => s.region).filter(Boolean))].sort();
    const grades = [...new Set((classes ?? []).map((c: any) => c.grade).filter((g: any) => g != null))].sort(
      (a: any, b: any) => a - b,
    );
    const dbCompetencies = [
      ...new Set((questions ?? []).map((q: any) => q.competency).filter(Boolean)),
    ].sort();
    const competencies = [
      ...new Set([...COMPETENCY_AREAS, ...dbCompetencies]),
    ];
    const testTypes = [...new Set((tests ?? []).map((t: any) => t.type).filter(Boolean))].sort();
    return {
      schools: schools ?? [],
      classes: classes ?? [],
      tests: tests ?? [],
      modules: modules ?? [],
      regions,
      grades,
      competencies,
      testTypes,
    };
  });

export const getReports = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((i) => FiltersSchema.parse(i))
  .handler(async ({ data, context }) => {
    await assertAdmin(context.supabase, context.userId);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    // Resolve school filter (incl. region)
    let schoolIds: string[] | null = null;
    if (data.region) {
      const { data: regS } = await supabaseAdmin
        .from("schools")
        .select("id")
        .eq("region", data.region);
      schoolIds = (regS ?? []).map((s: any) => s.id);
    }
    if (data.schoolId) {
      schoolIds = schoolIds ? schoolIds.filter((id) => id === data.schoolId) : [data.schoolId];
    }

    // Resolve test filter (incl. type, module)
    let testIds: string[] | null = null;
    if (data.testType || data.moduleId) {
      let tq = supabaseAdmin.from("tests").select("id");
      if (data.testType) tq = tq.eq("type", data.testType);
      if (data.moduleId) tq = tq.eq("module_id", data.moduleId);
      const { data: ts } = await tq;
      testIds = (ts ?? []).map((t: any) => t.id);
    }
    if (data.testId) {
      testIds = testIds ? testIds.filter((id) => id === data.testId) : [data.testId];
    }

    // Class & grade
    let classIds: string[] | null = null;
    if (data.classId) classIds = [data.classId];

    // Build attempts query
    let aq = supabaseAdmin
      .from("test_attempts")
      .select("id,test_id,student_id,school_id,class_id,status,score,max_score,started_at,submitted_at");
    if (schoolIds) {
      if (schoolIds.length === 0) aq = aq.eq("school_id", "00000000-0000-0000-0000-000000000000");
      else aq = aq.in("school_id", schoolIds);
    }
    if (testIds) {
      if (testIds.length === 0) aq = aq.eq("test_id", "00000000-0000-0000-0000-000000000000");
      else aq = aq.in("test_id", testIds);
    }
    if (classIds) aq = aq.in("class_id", classIds);
    if (data.status) aq = aq.eq("status", data.status);
    if (data.dateFrom) aq = aq.gte("started_at", data.dateFrom);
    if (data.dateTo) aq = aq.lte("started_at", data.dateTo);

    const { data: attempts, error: aErr } = await aq.limit(10000);
    if (aErr) throw new Error(aErr.message);

    // Filter by grade via student lookup if needed
    const studentIds = [...new Set((attempts ?? []).map((a) => a.student_id))];
    const { data: studentsRaw } = studentIds.length
      ? await supabaseAdmin
          .from("students")
          .select("id,code,first_name,last_name,school_id,class_id,grade")
          .in("id", studentIds)
      : { data: [] as any[] };
    const studentsMap = new Map((studentsRaw ?? []).map((s: any) => [s.id, s]));

    let filteredAttempts = attempts ?? [];
    if (data.grade != null) {
      filteredAttempts = filteredAttempts.filter((a) => {
        const s = studentsMap.get(a.student_id);
        return s?.grade === data.grade;
      });
    }

    // Schools/classes/tests/modules
    const [schoolsRaw, classesRaw, testsRaw, modulesRaw] = await Promise.all([
      supabaseAdmin.from("schools").select("id,name,city,region").then((r) => r.data ?? []),
      supabaseAdmin.from("classes").select("id,school_id,name,grade").then((r) => r.data ?? []),
      supabaseAdmin.from("tests").select("id,title,type,module_id,slug").then((r) => r.data ?? []),
      supabaseAdmin.from("modules").select("id,name").then((r) => r.data ?? []),
    ]);
    const schoolsMap = new Map(schoolsRaw.map((s: any) => [s.id, s]));
    const classesMap = new Map(classesRaw.map((c: any) => [c.id, c]));
    const testsMap = new Map(testsRaw.map((t: any) => [t.id, t]));

    // Answers + questions for competency analysis
    const attemptIds = filteredAttempts.map((a) => a.id);
    const { data: answers } = attemptIds.length
      ? await supabaseAdmin
          .from("test_answers")
          .select("attempt_id,question_id,points_awarded,is_correct")
          .in("attempt_id", attemptIds)
      : { data: [] as any[] };
    const questionIds = [...new Set((answers ?? []).map((a: any) => a.question_id))];
    const { data: questions } = questionIds.length
      ? await supabaseAdmin
          .from("test_questions")
          .select("id,competency,points,test_id")
          .in("id", questionIds)
      : { data: [] as any[] };
    const qMap = new Map((questions ?? []).map((q: any) => [q.id, q]));

    // Counts
    const distinctSchools = new Set(filteredAttempts.map((a) => a.school_id));
    const distinctClasses = new Set(filteredAttempts.map((a) => a.class_id).filter(Boolean));
    const distinctStudents = new Set(filteredAttempts.map((a) => a.student_id));
    const submitted = filteredAttempts.filter((a) => a.status === "submitted");
    const inProgress = filteredAttempts.filter((a) => a.status === "in_progress");

    const submittedWithMax = submitted.filter((a) => Number(a.max_score) > 0);
    const avgScorePct =
      submittedWithMax.length > 0
        ? Math.round(
            (submittedWithMax.reduce(
              (acc, a) => acc + (Number(a.score) / Number(a.max_score)) * 100,
              0,
            ) /
              submittedWithMax.length) *
              10,
          ) / 10
        : 0;

    // Vstupný vs výstupný progress
    const inAttempts = submittedWithMax.filter((a) => testsMap.get(a.test_id)?.type === "vstupny");
    const outAttempts = submittedWithMax.filter((a) => testsMap.get(a.test_id)?.type === "vystupny");
    const pctAvg = (arr: any[]) =>
      arr.length
        ? arr.reduce((acc, a) => acc + (Number(a.score) / Number(a.max_score)) * 100, 0) / arr.length
        : 0;
    const inAvg = pctAvg(inAttempts);
    const outAvg = pctAvg(outAttempts);
    const progressDiff = Math.round((outAvg - inAvg) * 10) / 10;

    // Modules attended - assignments count distinct (test_id->module)
    const moduleCount = new Set(
      filteredAttempts
        .map((a) => testsMap.get(a.test_id)?.module_id)
        .filter(Boolean),
    ).size;

    // Competency aggregation
    const competencyMap: Record<
      string,
      { points: number; maxPoints: number; studentIds: Set<string>; inPct: number[]; outPct: number[] }
    > = {};
    const ensureComp = (c: string) => {
      if (!competencyMap[c])
        competencyMap[c] = { points: 0, maxPoints: 0, studentIds: new Set(), inPct: [], outPct: [] };
      return competencyMap[c];
    };

    // group answers by attempt
    const ansByAttempt: Record<string, any[]> = {};
    for (const a of answers ?? []) {
      (ansByAttempt[a.attempt_id] ||= []).push(a);
    }
    for (const att of filteredAttempts) {
      const ans = ansByAttempt[att.id] ?? [];
      const byComp: Record<string, { p: number; m: number }> = {};
      for (const a of ans) {
        const q = qMap.get(a.question_id);
        const comp = q?.competency || "Ostatné";
        if (data.competency && comp !== data.competency) continue;
        const bucket = (byComp[comp] ||= { p: 0, m: 0 });
        bucket.p += Number(a.points_awarded) || 0;
        bucket.m += Number(q?.points) || 0;
      }
      for (const [comp, v] of Object.entries(byComp)) {
        const c = ensureComp(comp);
        c.points += v.p;
        c.maxPoints += v.m;
        c.studentIds.add(att.student_id);
        if (v.m > 0) {
          const pct = (v.p / v.m) * 100;
          const tType = testsMap.get(att.test_id)?.type;
          if (tType === "vstupny") c.inPct.push(pct);
          else if (tType === "vystupny") c.outPct.push(pct);
        }
      }
    }
    const competencies = Object.entries(competencyMap).map(([area, v]) => {
      const avgPct = v.maxPoints > 0 ? (v.points / v.maxPoints) * 100 : 0;
      const inA = v.inPct.length ? v.inPct.reduce((a, b) => a + b, 0) / v.inPct.length : 0;
      const outA = v.outPct.length ? v.outPct.reduce((a, b) => a + b, 0) / v.outPct.length : 0;
      return {
        area,
        avgPoints: Math.round((v.points / Math.max(1, v.studentIds.size)) * 10) / 10,
        avgPct: Math.round(avgPct * 10) / 10,
        students: v.studentIds.size,
        inPct: Math.round(inA * 10) / 10,
        outPct: Math.round(outA * 10) / 10,
        diff: Math.round((outA - inA) * 10) / 10,
      };
    });
    competencies.sort((a, b) => b.avgPct - a.avgPct);

    // School comparison
    const schoolAgg: Record<
      string,
      { attempts: any[]; students: Set<string>; classes: Set<string>; compPct: Record<string, number[]> }
    > = {};
    for (const att of filteredAttempts) {
      const k = att.school_id;
      const s = (schoolAgg[k] ||= {
        attempts: [],
        students: new Set(),
        classes: new Set(),
        compPct: {},
      });
      s.attempts.push(att);
      s.students.add(att.student_id);
      if (att.class_id) s.classes.add(att.class_id);
      const ans = ansByAttempt[att.id] ?? [];
      const byComp: Record<string, { p: number; m: number }> = {};
      for (const a of ans) {
        const q = qMap.get(a.question_id);
        const comp = q?.competency || "Ostatné";
        const bucket = (byComp[comp] ||= { p: 0, m: 0 });
        bucket.p += Number(a.points_awarded) || 0;
        bucket.m += Number(q?.points) || 0;
      }
      for (const [comp, v] of Object.entries(byComp)) {
        if (v.m > 0) (s.compPct[comp] ||= []).push((v.p / v.m) * 100);
      }
    }
    const schools = Object.entries(schoolAgg).map(([sid, v]) => {
      const sch: any = schoolsMap.get(sid) ?? { name: "—", city: "—", region: "—" };
      const submittedAtt = v.attempts.filter((a) => a.status === "submitted" && Number(a.max_score) > 0);
      const avg =
        submittedAtt.length > 0
          ? submittedAtt.reduce((acc, a) => acc + (Number(a.score) / Number(a.max_score)) * 100, 0) /
            submittedAtt.length
          : 0;
      const compAvgs = Object.entries(v.compPct).map(([c, arr]) => ({
        comp: c,
        avg: arr.reduce((a, b) => a + b, 0) / arr.length,
      }));
      compAvgs.sort((a, b) => b.avg - a.avg);
      const inAtt = v.attempts.filter(
        (a) => testsMap.get(a.test_id)?.type === "vstupny" && Number(a.max_score) > 0,
      );
      const outAtt = v.attempts.filter(
        (a) => testsMap.get(a.test_id)?.type === "vystupny" && Number(a.max_score) > 0,
      );
      const inAvg2 = pctAvg(inAtt);
      const outAvg2 = pctAvg(outAtt);
      return {
        id: sid,
        name: sch.name,
        city: sch.city,
        region: sch.region,
        classes: v.classes.size,
        students: v.students.size,
        attempts: v.attempts.length,
        avgScore: Math.round(avg * 10) / 10,
        topCompetency: compAvgs[0]?.comp ?? "—",
        weakCompetency: compAvgs[compAvgs.length - 1]?.comp ?? "—",
        progress: Math.round((outAvg2 - inAvg2) * 10) / 10,
      };
    });
    schools.sort((a, b) => b.avgScore - a.avgScore);

    // Class comparison
    const classAgg: Record<string, { attempts: any[]; students: Set<string> }> = {};
    for (const att of filteredAttempts) {
      if (!att.class_id) continue;
      const c = (classAgg[att.class_id] ||= { attempts: [], students: new Set() });
      c.attempts.push(att);
      c.students.add(att.student_id);
    }
    const classes = Object.entries(classAgg).map(([cid, v]) => {
      const cl: any = classesMap.get(cid) ?? {};
      const sch: any = schoolsMap.get(cl.school_id) ?? {};
      const submittedAtt = v.attempts.filter((a) => a.status === "submitted" && Number(a.max_score) > 0);
      const avg =
        submittedAtt.length > 0
          ? submittedAtt.reduce((acc, a) => acc + (Number(a.score) / Number(a.max_score)) * 100, 0) /
            submittedAtt.length
          : 0;
      const inAtt = v.attempts.filter(
        (a) => testsMap.get(a.test_id)?.type === "vstupny" && Number(a.max_score) > 0,
      );
      const outAtt = v.attempts.filter(
        (a) => testsMap.get(a.test_id)?.type === "vystupny" && Number(a.max_score) > 0,
      );
      return {
        id: cid,
        school: sch.name ?? "—",
        name: cl.name ?? "—",
        grade: cl.grade ?? null,
        students: v.students.size,
        submitted: submittedAtt.length,
        avgScore: Math.round(avg * 10) / 10,
        progress: Math.round((pctAvg(outAtt) - pctAvg(inAtt)) * 10) / 10,
      };
    });
    classes.sort((a, b) => b.avgScore - a.avgScore);

    // Trend - by month
    const trendMap: Record<string, { sum: number; n: number }> = {};
    for (const a of submittedWithMax) {
      const d = new Date(a.submitted_at || a.started_at);
      const k = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
      const t = (trendMap[k] ||= { sum: 0, n: 0 });
      t.sum += (Number(a.score) / Number(a.max_score)) * 100;
      t.n += 1;
    }
    const trend = Object.entries(trendMap)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([month, v]) => ({ month, avgPct: Math.round((v.sum / v.n) * 10) / 10 }));

    // Heatmap: competency x school (avg pct)
    const heatmap = schools.slice(0, 30).map((s) => {
      const row: any = { school: s.name };
      for (const comp of COMPETENCY_AREAS) {
        const arr = schoolAgg[s.id]?.compPct[comp] ?? [];
        row[comp] = arr.length ? Math.round((arr.reduce((a, b) => a + b, 0) / arr.length) * 10) / 10 : null;
      }
      return row;
    });

    // Summary text
    const topComp = competencies[0];
    const weakComp = competencies[competencies.length - 1];
    const summary =
      filteredAttempts.length === 0
        ? "Pre zvolené filtre zatiaľ neexistujú žiadne dáta."
        : `V aktuálnom výbere je zapojených ${distinctSchools.size} škôl, ${distinctClasses.size} tried a ${distinctStudents.size} žiakov. Dokončených testov: ${submitted.length}, rozpracovaných: ${inProgress.length}. Priemerná úspešnosť je ${avgScorePct} %.` +
          (topComp ? ` Najvyššie priemerné skóre bolo dosiahnuté v oblasti „${topComp.area}" (${topComp.avgPct} %).` : "") +
          (weakComp && weakComp !== topComp
            ? ` Najväčší priestor na rozvoj je v oblasti „${weakComp.area}" (${weakComp.avgPct} %).`
            : "");

    return {
      overview: {
        schools: distinctSchools.size,
        classes: distinctClasses.size,
        students: distinctStudents.size,
        submitted: submitted.length,
        inProgress: inProgress.length,
        modules: moduleCount,
        avgScorePct,
        inAvg: Math.round(inAvg * 10) / 10,
        outAvg: Math.round(outAvg * 10) / 10,
        progressDiff,
      },
      competencies,
      schools,
      classes,
      trend,
      heatmap,
      summary,
    };
  });

export const getStudentReport = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((i) => z.object({ code: z.string().min(1).max(64) }).parse(i))
  .handler(async ({ data, context }) => {
    await assertAdmin(context.supabase, context.userId);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: student } = await supabaseAdmin
      .from("students")
      .select("id,code,first_name,last_name,school_id,class_id,grade")
      .eq("code", data.code)
      .maybeSingle();
    if (!student) throw new Error("Žiak s týmto kódom neexistuje.");

    const [{ data: school }, { data: klass }, { data: attempts }] = await Promise.all([
      supabaseAdmin.from("schools").select("id,name,city,region").eq("id", student.school_id).maybeSingle(),
      student.class_id
        ? supabaseAdmin.from("classes").select("id,name,grade").eq("id", student.class_id).maybeSingle()
        : Promise.resolve({ data: null }),
      supabaseAdmin
        .from("test_attempts")
        .select("id,test_id,status,score,max_score,started_at,submitted_at")
        .eq("student_id", student.id)
        .order("started_at", { ascending: false }),
    ]);

    const testIds = [...new Set((attempts ?? []).map((a) => a.test_id))];
    const { data: tests } = testIds.length
      ? await supabaseAdmin.from("tests").select("id,title,type,module_id").in("id", testIds)
      : { data: [] as any[] };
    const tMap = new Map((tests ?? []).map((t: any) => [t.id, t]));

    const attemptIds = (attempts ?? []).map((a) => a.id);
    const { data: answers } = attemptIds.length
      ? await supabaseAdmin
          .from("test_answers")
          .select("attempt_id,question_id,points_awarded")
          .in("attempt_id", attemptIds)
      : { data: [] as any[] };
    const qIds = [...new Set((answers ?? []).map((a: any) => a.question_id))];
    const { data: questions } = qIds.length
      ? await supabaseAdmin.from("test_questions").select("id,competency,points").in("id", qIds)
      : { data: [] as any[] };
    const qMap = new Map((questions ?? []).map((q: any) => [q.id, q]));

    const compAgg: Record<string, { p: number; m: number }> = {};
    for (const a of answers ?? []) {
      const q = qMap.get(a.question_id);
      const comp = q?.competency || "Ostatné";
      const b = (compAgg[comp] ||= { p: 0, m: 0 });
      b.p += Number(a.points_awarded) || 0;
      b.m += Number(q?.points) || 0;
    }
    const competencies = Object.entries(compAgg).map(([area, v]) => ({
      area,
      points: v.p,
      max: v.m,
      pct: v.m > 0 ? Math.round((v.p / v.m) * 1000) / 10 : 0,
    }));

    const submittedAtt = (attempts ?? []).filter((a) => a.status === "submitted" && Number(a.max_score) > 0);
    const inA = submittedAtt.find((a) => tMap.get(a.test_id)?.type === "vstupny");
    const outA = submittedAtt.find((a) => tMap.get(a.test_id)?.type === "vystupny");
    const inPct = inA ? Math.round((Number(inA.score) / Number(inA.max_score)) * 1000) / 10 : null;
    const outPct = outA ? Math.round((Number(outA.score) / Number(outA.max_score)) * 1000) / 10 : null;

    const modules = [
      ...new Set(
        (attempts ?? []).map((a) => tMap.get(a.test_id)?.module_id).filter(Boolean),
      ),
    ];

    return {
      student,
      school: school ?? null,
      class: klass ?? null,
      attempts: (attempts ?? []).map((a) => ({
        ...a,
        test: tMap.get(a.test_id) ?? null,
        pct:
          Number(a.max_score) > 0
            ? Math.round((Number(a.score) / Number(a.max_score)) * 1000) / 10
            : null,
      })),
      competencies,
      inPct,
      outPct,
      diff: inPct != null && outPct != null ? Math.round((outPct - inPct) * 10) / 10 : null,
      modulesCompleted: modules.length,
      badges: [], // placeholder until badge system exists
    };
  });
