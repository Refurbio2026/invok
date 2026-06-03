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

function slugify(s: string) {
  return s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
    .slice(0, 60);
}

export const listTests = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await assertAdminish(context.supabase, context.userId);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data, error } = await supabaseAdmin
      .from("tests")
      .select("id,title,slug,type,grade_from,grade_to,status,duration_min,created_at")
      .order("created_at", { ascending: false });
    if (error) throw new Error(error.message);
    return data ?? [];
  });

export const getTest = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((i) => z.object({ id: z.string().uuid() }).parse(i))
  .handler(async ({ data, context }) => {
    await assertAdminish(context.supabase, context.userId);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const [{ data: test, error: tErr }, { data: questions, error: qErr }] =
      await Promise.all([
        supabaseAdmin.from("tests").select("*").eq("id", data.id).single(),
        supabaseAdmin
          .from("test_questions")
          .select("*")
          .eq("test_id", data.id)
          .order("position"),
      ]);
    if (tErr) throw new Error(tErr.message);
    if (qErr) throw new Error(qErr.message);
    return { test, questions: questions ?? [] };
  });

export const createTest = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((i) =>
    z
      .object({
        title: z.string().min(1).max(160),
        type: z.enum(["vstupny", "vystupny", "diagnosticky", "prakticky"]),
        grade_from: z.number().int().min(1).max(13).nullable().optional(),
        grade_to: z.number().int().min(1).max(13).nullable().optional(),
        duration_min: z.number().int().min(1).max(240).nullable().optional(),
        description: z.string().max(2000).nullable().optional(),
      })
      .parse(i),
  )
  .handler(async ({ data, context }) => {
    await assertAdminish(context.supabase, context.userId);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const baseSlug = slugify(data.title) || "test";
    let slug = baseSlug;
    let n = 1;
    while (true) {
      const { data: existing } = await supabaseAdmin
        .from("tests")
        .select("id")
        .eq("slug", slug)
        .maybeSingle();
      if (!existing) break;
      n += 1;
      slug = `${baseSlug}-${n}`;
    }
    const { data: row, error } = await supabaseAdmin
      .from("tests")
      .insert({ ...data, slug, status: "draft", created_by: context.userId })
      .select("id,slug")
      .single();
    if (error) throw new Error(error.message);
    await supabaseAdmin.from("activity_log").insert({
      user_id: context.userId,
      action: "create_test",
      module: "tests",
      description: `Vytvorený test ${data.title}`,
      metadata: { test_id: row.id },
    });
    return row;
  });

export const updateTest = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((i) =>
    z
      .object({
        id: z.string().uuid(),
        title: z.string().min(1).max(160).optional(),
        type: z.enum(["vstupny", "vystupny", "diagnosticky", "prakticky"]).optional(),
        grade_from: z.number().int().min(1).max(13).nullable().optional(),
        grade_to: z.number().int().min(1).max(13).nullable().optional(),
        duration_min: z.number().int().min(1).max(240).nullable().optional(),
        description: z.string().max(2000).nullable().optional(),
        status: z.enum(["draft", "published", "archived"]).optional(),
      })
      .parse(i),
  )
  .handler(async ({ data, context }) => {
    await assertAdminish(context.supabase, context.userId);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { id, ...patch } = data;
    const { error } = await supabaseAdmin.from("tests").update(patch).eq("id", id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const deleteTest = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((i) => z.object({ id: z.string().uuid() }).parse(i))
  .handler(async ({ data, context }) => {
    await assertAdminish(context.supabase, context.userId);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { error } = await supabaseAdmin.from("tests").delete().eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

const optionSchema = z.object({ key: z.string().min(1).max(8), label: z.string().min(1).max(300) });

export const saveQuestion = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((i) =>
    z
      .object({
        id: z.string().uuid().nullable().optional(),
        test_id: z.string().uuid(),
        position: z.number().int().min(1).max(500),
        question_text: z.string().min(1).max(2000),
        question_type: z.enum(["single", "multi", "scale", "text"]).default("single"),
        competency: z.string().max(120).nullable().optional(),
        options: z.array(optionSchema).max(20).default([]),
        correct_keys: z.array(z.string().min(1).max(8)).max(20).default([]),
        points: z.number().min(0).max(100).default(1),
      })
      .parse(i),
  )
  .handler(async ({ data, context }) => {
    await assertAdminish(context.supabase, context.userId);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { id, ...payload } = data;
    if (id) {
      const { error } = await supabaseAdmin
        .from("test_questions")
        .update(payload)
        .eq("id", id);
      if (error) throw new Error(error.message);
      return { id };
    }
    const { data: row, error } = await supabaseAdmin
      .from("test_questions")
      .insert(payload)
      .select("id")
      .single();
    if (error) throw new Error(error.message);
    return { id: row.id };
  });

export const deleteQuestion = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((i) => z.object({ id: z.string().uuid() }).parse(i))
  .handler(async ({ data, context }) => {
    await assertAdminish(context.supabase, context.userId);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { error } = await supabaseAdmin
      .from("test_questions")
      .delete()
      .eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });
