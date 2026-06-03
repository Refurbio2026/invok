import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

async function assertAdminish(supabase: any, userId: string) {
  const { data } = await supabase
    .from("user_roles")
    .select("role")
    .eq("user_id", userId)
    .in("role", ["admin", "koordinator"])
    .maybeSingle();
  if (!data) throw new Error("Forbidden");
}

export const listResultsFilters = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await assertAdminish(context.supabase, context.userId);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const [{ data: tests }, { data: schools }] = await Promise.all([
      supabaseAdmin
        .from("tests")
        .select("id,title,status")
        .order("created_at", { ascending: false }),
      supabaseAdmin.from("schools").select("id,name").order("name"),
    ]);
    return { tests: tests ?? [], schools: schools ?? [] };
  });

export const listResults = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((i) =>
    z
      .object({
        testId: z.string().uuid().nullable().optional(),
        schoolId: z.string().uuid().nullable().optional(),
        status: z.enum(["in_progress", "submitted"]).nullable().optional(),
      })
      .parse(i),
  )
  .handler(async ({ data, context }) => {
    await assertAdminish(context.supabase, context.userId);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    let q = supabaseAdmin
      .from("test_attempts")
      .select("id,test_id,student_id,school_id,class_id,status,score,max_score,started_at,submitted_at")
      .order("started_at", { ascending: false })
      .limit(500);
    if (data.testId) q = q.eq("test_id", data.testId);
    if (data.schoolId) q = q.eq("school_id", data.schoolId);
    if (data.status) q = q.eq("status", data.status);

    const { data: attempts, error } = await q;
    if (error) throw new Error(error.message);

    const studentIds = [...new Set((attempts ?? []).map((a) => a.student_id))];
    const schoolIds = [...new Set((attempts ?? []).map((a) => a.school_id))];
    const classIds = [...new Set((attempts ?? []).map((a) => a.class_id).filter(Boolean) as string[])];
    const testIds = [...new Set((attempts ?? []).map((a) => a.test_id))];

    const [{ data: students }, { data: schools }, { data: classes }, { data: tests }] =
      await Promise.all([
        studentIds.length
          ? supabaseAdmin.from("students").select("id,code,first_name,last_name,grade").in("id", studentIds)
          : Promise.resolve({ data: [] as any[] }),
        schoolIds.length
          ? supabaseAdmin.from("schools").select("id,name").in("id", schoolIds)
          : Promise.resolve({ data: [] as any[] }),
        classIds.length
          ? supabaseAdmin.from("classes").select("id,name").in("id", classIds)
          : Promise.resolve({ data: [] as any[] }),
        testIds.length
          ? supabaseAdmin.from("tests").select("id,title").in("id", testIds)
          : Promise.resolve({ data: [] as any[] }),
      ]);

    const sMap = new Map((students ?? []).map((s: any) => [s.id, s]));
    const schMap = new Map((schools ?? []).map((s: any) => [s.id, s]));
    const cMap = new Map((classes ?? []).map((c: any) => [c.id, c]));
    const tMap = new Map((tests ?? []).map((t: any) => [t.id, t]));

    return (attempts ?? []).map((a) => ({
      ...a,
      student: sMap.get(a.student_id) ?? null,
      school: schMap.get(a.school_id) ?? null,
      class: a.class_id ? cMap.get(a.class_id) ?? null : null,
      test: tMap.get(a.test_id) ?? null,
    }));
  });
