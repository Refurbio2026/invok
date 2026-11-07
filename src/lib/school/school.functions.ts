import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/integrations/supabase/types";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { requireSchoolRole, schoolClassSchema } from "./rules";

async function schoolAccess(supabase: SupabaseClient<Database>, userId: string) {
  const [profile, roles] = await Promise.all([
    supabase.from("profiles").select("school_id").eq("id", userId).single(),
    supabase.from("user_roles").select("role").eq("user_id", userId),
  ]);
  if (profile.error || roles.error) throw new Error("Nepodarilo sa overiť prístup školy.");
  return requireSchoolRole((roles.data ?? []).map((r) => r.role), profile.data.school_id);
}

export const getSchoolDashboard = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const db = context.supabase;
    const schoolId = await schoolAccess(db, context.userId);
    const [school, classes, profiles, roles, students, attempts] = await Promise.all([
      db.from("schools").select("id,name,city,region,street,zip,ico,dic,website,contact_name,contact_email,contact_phone,contact_position,status").eq("id", schoolId).single(),
      db.from("classes").select("id,name,grade,school_year,teacher_id").eq("school_id", schoolId).order("name"),
      db.from("profiles").select("id,full_name,email,status").eq("school_id", schoolId),
      db.from("user_roles").select("user_id,role").eq("school_id", schoolId).eq("role", "ucitel"),
      db.from("students").select("id,class_id,code,first_name,last_name,status").eq("school_id", schoolId).order("code"),
      db.from("test_attempts").select("id,test_id,student_id,class_id,status,score,max_score,started_at,submitted_at").eq("school_id", schoolId).order("started_at", { ascending: false }),
    ]);
    for (const response of [school, classes, profiles, roles, students, attempts]) {
      if (response.error) throw new Error("Údaje školy sa nepodarilo načítať: " + response.error.message);
    }
    const teacherIds = new Set((roles.data ?? []).map((r) => r.user_id));
    const testIds = [...new Set((attempts.data ?? []).map((a) => a.test_id))];
    const tests = testIds.length ? await db.from("tests").select("id,title").in("id", testIds) : { data: [], error: null };
    if (tests.error) throw new Error(tests.error.message);
    return {
      school: school.data,
      classes: classes.data ?? [],
      teachers: (profiles.data ?? []).filter((p) => teacherIds.has(p.id)),
      students: students.data ?? [],
      attempts: attempts.data ?? [],
      tests: tests.data ?? [],
    };
  });

const profileSchema = z.object({
  name: z.string().trim().min(1).max(200),
  city: z.string().trim().max(120), region: z.string().trim().max(120),
  street: z.string().trim().max(200), zip: z.string().trim().max(20),
  ico: z.string().trim().max(20), dic: z.string().trim().max(20),
  website: z.union([z.literal(""), z.string().url().max(300)]),
  contact_name: z.string().trim().max(120),
  contact_email: z.union([z.literal(""), z.string().email().max(200)]),
  contact_phone: z.string().trim().max(40), contact_position: z.string().trim().max(120),
});
export type SchoolProfileInput = z.infer<typeof profileSchema>;
export const saveSchoolProfile = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) => profileSchema.parse(input))
  .handler(async ({ data, context }) => {
    const schoolId = await schoolAccess(context.supabase, context.userId);
    const { error } = await context.supabase.from("schools").update(data).eq("id", schoolId).select("id").single();
    if (error) throw new Error("Údaje sa nepodarilo uložiť.");
    return { ok: true };
  });

export const saveSchoolClass = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) => schoolClassSchema.parse(input))
  .handler(async ({ data, context }) => {
    const db = context.supabase;
    const schoolId = await schoolAccess(db, context.userId);
    if (data.teacher_id) {
      const [profile, role] = await Promise.all([
        db.from("profiles").select("id").eq("id", data.teacher_id).eq("school_id", schoolId).maybeSingle(),
        db.from("user_roles").select("user_id").eq("user_id", data.teacher_id).eq("school_id", schoolId).eq("role", "ucitel").maybeSingle(),
      ]);
      if (profile.error || role.error || !profile.data || !role.data) throw new Error("Učiteľ nepatrí k vašej škole.");
    }
    const { id, ...values } = data;
    const result = id
      ? await db.from("classes").update(values).eq("id", id).eq("school_id", schoolId).select("id").single()
      : await db.from("classes").insert({ ...values, school_id: schoolId }).select("id").single();
    if (result.error) throw new Error("Triedu sa nepodarilo uložiť.");
    return result.data;
  });

export const deleteSchoolClass = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) => z.object({ id: z.string().uuid() }).parse(input))
  .handler(async ({ data, context }) => {
    const db = context.supabase;
    const schoolId = await schoolAccess(db, context.userId);
    const [students, attempts] = await Promise.all([
      db.from("students").select("id", { count: "exact", head: true }).eq("class_id", data.id).eq("school_id", schoolId),
      db.from("test_attempts").select("id", { count: "exact", head: true }).eq("class_id", data.id).eq("school_id", schoolId),
    ]);
    if (students.error || attempts.error) throw new Error("Triedu sa nepodarilo overiť.");
    if (students.count || attempts.count) throw new Error("Triedu so žiakmi alebo výsledkami nie je možné vymazať.");
    const { error } = await db.from("classes").delete().eq("id", data.id).eq("school_id", schoolId).select("id").single();
    if (error) throw new Error("Triedu sa nepodarilo vymazať.");
    return { ok: true };
  });