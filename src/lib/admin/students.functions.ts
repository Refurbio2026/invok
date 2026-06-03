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

function genCode() {
  // 8-znakový anonymný kód, ľahko čitateľný
  const a = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let out = "";
  for (let i = 0; i < 8; i++) out += a[Math.floor(Math.random() * a.length)];
  return out;
}

function genPin() {
  return String(Math.floor(1000 + Math.random() * 9000));
}

export const listStudents = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((i) =>
    z
      .object({
        schoolId: z.string().uuid().nullable().optional(),
        classId: z.string().uuid().nullable().optional(),
      })
      .parse(i),
  )
  .handler(async ({ data, context }) => {
    await assertAdminish(context.supabase, context.userId);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    let q = supabaseAdmin
      .from("students")
      .select(
        "id,school_id,class_id,code,first_name,last_name,grade,pin,status,created_at,classes(name),schools(name)",
      )
      .order("created_at", { ascending: false })
      .limit(500);
    if (data.schoolId) q = q.eq("school_id", data.schoolId);
    if (data.classId) q = q.eq("class_id", data.classId);
    const { data: rows, error } = await q;
    if (error) throw new Error(error.message);
    return (rows ?? []).map((r: any) => ({
      ...r,
      class_name: r.classes?.name ?? null,
      school_name: r.schools?.name ?? null,
    }));
  });

export const createStudent = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((i) =>
    z
      .object({
        school_id: z.string().uuid(),
        class_id: z.string().uuid(),
        first_name: z.string().max(80).nullable().optional(),
        last_name: z.string().max(80).nullable().optional(),
        grade: z.number().int().min(1).max(13).nullable().optional(),
      })
      .parse(i),
  )
  .handler(async ({ data, context }) => {
    await assertAdminish(context.supabase, context.userId);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: row, error } = await supabaseAdmin
      .from("students")
      .insert({ ...data, code: genCode(), pin: genPin() })
      .select("id,code,pin")
      .single();
    if (error) throw new Error(error.message);
    return row;
  });

export const bulkCreateStudents = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((i) =>
    z
      .object({
        school_id: z.string().uuid(),
        class_id: z.string().uuid(),
        count: z.number().int().min(1).max(60),
        grade: z.number().int().min(1).max(13).nullable().optional(),
      })
      .parse(i),
  )
  .handler(async ({ data, context }) => {
    await assertAdminish(context.supabase, context.userId);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const rows = Array.from({ length: data.count }).map(() => ({
      school_id: data.school_id,
      class_id: data.class_id,
      grade: data.grade ?? null,
      code: genCode(),
      pin: genPin(),
    }));
    const { data: inserted, error } = await supabaseAdmin
      .from("students")
      .insert(rows)
      .select("id,code,pin");
    if (error) throw new Error(error.message);
    return inserted ?? [];
  });

export const deleteStudent = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((i) => z.object({ id: z.string().uuid() }).parse(i))
  .handler(async ({ data, context }) => {
    await assertAdminish(context.supabase, context.userId);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { error } = await supabaseAdmin.from("students").delete().eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });
