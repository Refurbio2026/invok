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

export const listClasses = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase, userId } = context;
    await assertAdminish(supabase, userId);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data, error } = await supabaseAdmin
      .from("classes")
      .select("id,school_id,name,grade,school_year,teacher_id,notes,created_at")
      .order("created_at", { ascending: false });
    if (error) throw new Error(error.message);
    const schoolIds = Array.from(new Set((data ?? []).map((c: any) => c.school_id).filter(Boolean)));
    let schoolMap: Record<string, string> = {};
    if (schoolIds.length) {
      const { data: schools } = await supabaseAdmin
        .from("schools")
        .select("id,name")
        .in("id", schoolIds);
      schoolMap = Object.fromEntries((schools ?? []).map((s: any) => [s.id, s.name]));
    }
    return (data ?? []).map((c: any) => ({
      ...c,
      school_name: schoolMap[c.school_id] ?? null,
    }));
  });

export const createClass = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((i) =>
    z
      .object({
        school_id: z.string().uuid(),
        name: z.string().min(1).max(60),
        grade: z.number().int().min(1).max(13).nullable().optional(),
        school_year: z.string().max(20).nullable().optional(),
        teacher_id: z.string().uuid().nullable().optional(),
        notes: z.string().max(500).nullable().optional(),
      })
      .parse(i),
  )
  .handler(async ({ data, context }) => {
    await assertAdminish(context.supabase, context.userId);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: row, error } = await supabaseAdmin
      .from("classes")
      .insert(data)
      .select("id")
      .single();
    if (error) throw new Error(error.message);
    await supabaseAdmin.from("activity_log").insert({
      user_id: context.userId,
      action: "create_class",
      module: "classes",
      description: `Vytvorená trieda ${data.name}`,
      metadata: { school_id: data.school_id, class_id: row.id },
    });
    return { id: row.id };
  });

export const updateClass = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((i) =>
    z
      .object({
        id: z.string().uuid(),
        name: z.string().min(1).max(60).optional(),
        grade: z.number().int().min(1).max(13).nullable().optional(),
        school_year: z.string().max(20).nullable().optional(),
        teacher_id: z.string().uuid().nullable().optional(),
        notes: z.string().max(500).nullable().optional(),
      })
      .parse(i),
  )
  .handler(async ({ data, context }) => {
    await assertAdminish(context.supabase, context.userId);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { id, ...patch } = data;
    const { error } = await supabaseAdmin.from("classes").update(patch).eq("id", id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const deleteClass = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((i) => z.object({ id: z.string().uuid() }).parse(i))
  .handler(async ({ data, context }) => {
    await assertAdminish(context.supabase, context.userId);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { error } = await supabaseAdmin.from("classes").delete().eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const listSchoolsLite = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await assertAdminish(context.supabase, context.userId);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data, error } = await supabaseAdmin
      .from("schools")
      .select("id,name,city")
      .order("name");
    if (error) throw new Error(error.message);
    return data ?? [];
  });
