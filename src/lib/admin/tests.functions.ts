import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

export const TEST_TYPES = [
  "vstupny",
  "vystupny",
  "modulovy",
  "reflexny",
  "sebahodnotenie",
  "diagnosticky",
  "prakticky",
] as const;

export const QUESTION_TYPES = [
  "single",
  "multi",
  "scale_1_5",
  "scale_0_10",
  "open",
  "yes_no",
  "matching",
  "ordering",
  "scale",
  "text",
] as const;

export const COMPETENCY_AREAS = [
  "podnikavost",
  "kriticke-myslenie",
  "timova-spolupraca",
  "digitalne-zrucnosti",
  "komunikacia",
  "sebahodnotenie",
] as const;

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

async function uniqueSlug(supabaseAdmin: any, base: string) {
  let slug = base || "test";
  let n = 1;
  while (true) {
    const { data: existing } = await supabaseAdmin
      .from("tests")
      .select("id")
      .eq("slug", slug)
      .maybeSingle();
    if (!existing) return slug;
    n += 1;
    slug = `${base}-${n}`;
  }
}

export const listTests = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await assertAdminish(context.supabase, context.userId);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data, error } = await supabaseAdmin
      .from("tests")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) throw new Error(error.message);
    const ids = (data ?? []).map((t: any) => t.id);
    if (ids.length === 0) return [];
    const [{ data: qCounts }, { data: aCounts }] = await Promise.all([
      supabaseAdmin.from("test_questions").select("test_id").in("test_id", ids),
      supabaseAdmin.from("test_assignments").select("test_id").in("test_id", ids),
    ]);
    const qMap = new Map<string, number>();
    (qCounts ?? []).forEach((r: any) =>
      qMap.set(r.test_id, (qMap.get(r.test_id) ?? 0) + 1),
    );
    const aMap = new Map<string, number>();
    (aCounts ?? []).forEach((r: any) =>
      aMap.set(r.test_id, (aMap.get(r.test_id) ?? 0) + 1),
    );
    return (data ?? []).map((t: any) => ({
      ...t,
      questions_count: qMap.get(t.id) ?? 0,
      assignments_count: aMap.get(t.id) ?? 0,
    }));
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

const baseTestFields = {
  title: z.string().min(1).max(160),
  type: z.enum(TEST_TYPES),
  grade_from: z.number().int().min(1).max(13).nullable().optional(),
  grade_to: z.number().int().min(1).max(13).nullable().optional(),
  duration_min: z.number().int().min(1).max(240).nullable().optional(),
  description: z.string().max(2000).nullable().optional(),
  instructions: z.string().max(4000).nullable().optional(),
  module_id: z.string().uuid().nullable().optional(),
  show_result_to_student: z.boolean().optional(),
  save_to_school_report: z.boolean().optional(),
  allow_retake: z.boolean().optional(),
  anonymous_allowed: z.boolean().optional(),
  evaluate_by_competency: z.boolean().optional(),
};

export const createTest = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((i) => z.object(baseTestFields).parse(i))
  .handler(async ({ data, context }) => {
    await assertAdminish(context.supabase, context.userId);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const slug = await uniqueSlug(supabaseAdmin, slugify(data.title));
    const { data: row, error } = await supabaseAdmin
      .from("tests")
      .insert({ ...data, slug, status: "draft", created_by: context.userId })
      .select("id,slug")
      .single();
    if (error) throw new Error(error.message);
    // Predvyplnené pravidlá vyhodnotenia (4 úrovne)
    await supabaseAdmin.from("test_scoring_rules").insert([
      { test_id: row.id, min_percentage: 0, max_percentage: 40, label: "Základná úroveň", description: "Žiak je na začiatku rozvoja v tejto oblasti." },
      { test_id: row.id, min_percentage: 41, max_percentage: 70, label: "Rozvíjajúca sa úroveň", description: "Žiak má základy a postupne sa zlepšuje." },
      { test_id: row.id, min_percentage: 71, max_percentage: 90, label: "Dobrá úroveň", description: "Žiak preukazuje dobré zvládnutie oblasti." },
      { test_id: row.id, min_percentage: 91, max_percentage: 100, label: "Výborná úroveň", description: "Žiak preukazuje výborné zvládnutie." },
    ]);
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
        ...Object.fromEntries(
          Object.entries(baseTestFields).map(([k, v]) => [k, (v as z.ZodTypeAny).optional()]),
        ),
        status: z.enum(["draft", "published", "archived"]).optional(),
      })
      .parse(i),
  )
  .handler(async ({ data, context }) => {
    await assertAdminish(context.supabase, context.userId);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { id, ...patch } = data as any;

    // Pri publikovaní validuj že test má aspoň jednu otázku
    if (patch.status === "published") {
      const { count } = await supabaseAdmin
        .from("test_questions")
        .select("id", { count: "exact", head: true })
        .eq("test_id", id);
      if (!count || count === 0) {
        throw new Error("Test nemá žiadne otázky — najskôr ich pridajte.");
      }
    }
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

export const duplicateTest = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((i) => z.object({ id: z.string().uuid() }).parse(i))
  .handler(async ({ data, context }) => {
    await assertAdminish(context.supabase, context.userId);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: src, error } = await supabaseAdmin
      .from("tests")
      .select("*")
      .eq("id", data.id)
      .single();
    if (error) throw new Error(error.message);
    const { id: _i, slug: _s, created_at: _c, updated_at: _u, ...rest } = src as any;
    const newTitle = `${src.title} (kópia)`;
    const slug = await uniqueSlug(supabaseAdmin, slugify(newTitle));
    const { data: row, error: insErr } = await supabaseAdmin
      .from("tests")
      .insert({ ...rest, title: newTitle, slug, status: "draft", created_by: context.userId })
      .select("id")
      .single();
    if (insErr) throw new Error(insErr.message);

    const [{ data: qs }, { data: rules }] = await Promise.all([
      supabaseAdmin.from("test_questions").select("*").eq("test_id", data.id),
      supabaseAdmin.from("test_scoring_rules").select("*").eq("test_id", data.id),
    ]);
    if (qs && qs.length) {
      await supabaseAdmin.from("test_questions").insert(
        qs.map(({ id: _, created_at: __, updated_at: ___, ...q }: any) => ({
          ...q,
          test_id: row.id,
        })),
      );
    }
    if (rules && rules.length) {
      await supabaseAdmin.from("test_scoring_rules").insert(
        rules.map(({ id: _, created_at: __, updated_at: ___, ...r }: any) => ({
          ...r,
          test_id: row.id,
        })),
      );
    }
    return row;
  });

const optionSchema = z.object({
  key: z.string().min(1).max(8),
  label: z.string().min(1).max(300),
  feedback: z.string().max(500).optional().nullable(),
  points: z.number().min(-100).max(100).optional(),
});

export const saveQuestion = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((i) =>
    z
      .object({
        id: z.string().uuid().nullable().optional(),
        test_id: z.string().uuid(),
        position: z.number().int().min(1).max(500),
        question_text: z.string().min(1).max(2000),
        question_type: z.enum(QUESTION_TYPES).default("single"),
        competency: z.string().max(120).nullable().optional(),
        options: z.array(optionSchema).max(20).default([]),
        correct_keys: z.array(z.string().min(1).max(8)).max(20).default([]),
        points: z.number().min(0).max(100).default(1),
        is_required: z.boolean().optional(),
        scale_min: z.number().int().nullable().optional(),
        scale_max: z.number().int().nullable().optional(),
        scale_labels: z.record(z.string(), z.string()).optional(),
        scoring_mode: z.enum(["none", "manual", "auto"]).nullable().optional(),
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

export const reorderQuestions = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((i) =>
    z
      .object({
        test_id: z.string().uuid(),
        order: z.array(z.object({ id: z.string().uuid(), position: z.number().int().min(1) })),
      })
      .parse(i),
  )
  .handler(async ({ data, context }) => {
    await assertAdminish(context.supabase, context.userId);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    for (const o of data.order) {
      await supabaseAdmin
        .from("test_questions")
        .update({ position: o.position })
        .eq("id", o.id)
        .eq("test_id", data.test_id);
    }
    return { ok: true };
  });

export const listModules = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async () => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data, error } = await supabaseAdmin
      .from("modules")
      .select("id,name,slug,sort_order")
      .order("sort_order");
    if (error) throw new Error(error.message);
    return data ?? [];
  });
