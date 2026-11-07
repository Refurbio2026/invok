import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/integrations/supabase/types";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { requireTeacher } from "@/lib/learning/permissions";

async function teacherAccess(db: SupabaseClient<Database>, userId: string) {
  const [profile, roles] = await Promise.all([db.from("profiles").select("school_id,full_name").eq("id", userId).single(), db.from("user_roles").select("role").eq("user_id", userId)]);
  if (profile.error || roles.error) throw new Error("Nepodarilo sa overiť učiteľský účet.");
  const schoolId = requireTeacher((roles.data ?? []).map((r) => r.role), profile.data.school_id);
  return { schoolId, name: profile.data.full_name };
}
async function ownClass(db: SupabaseClient<Database>, userId: string, schoolId: string, classId: string) {
  const result = await db.from("classes").select("id,grade").eq("id", classId).eq("teacher_id", userId).eq("school_id", schoolId).single();
  if (result.error) throw new Error("Nemáte oprávnenie k tejto triede.");
  return result.data;
}
export const getTeacherDashboard = createServerFn({ method: "GET" }).middleware([requireSupabaseAuth]).handler(async ({ context }) => {
  const db = context.supabase; const access = await teacherAccess(db, context.userId);
  const classes = await db.from("classes").select("id,name,grade,school_year,teacher_id").eq("school_id", access.schoolId).eq("teacher_id", context.userId).order("name");
  if (classes.error) throw new Error(classes.error.message);
  const ids = (classes.data ?? []).map((c) => c.id);
  const [students, attempts, assignments, tests, modules] = await Promise.all([
    ids.length ? db.from("students").select("id,class_id,code,first_name,last_name,status").in("class_id", ids).eq("school_id", access.schoolId).order("code") : { data: [], error: null },
    ids.length ? db.from("test_attempts").select("id,class_id,student_id,test_id,status,score,max_score,submitted_at").in("class_id", ids).eq("school_id", access.schoolId).order("started_at", { ascending: false }) : { data: [], error: null },
    ids.length ? db.from("test_assignments").select("id,class_id,test_id,status,starts_at,ends_at,created_by").in("class_id", ids).eq("school_id", access.schoolId) : { data: [], error: null },
    db.from("tests").select("id,title,description,duration_min,module_id,grade_from,grade_to").eq("status", "published").order("title"),
    db.from("modules").select("id,name,description").order("sort_order"),
  ]);
  for (const response of [students, attempts, assignments, tests, modules]) if (response.error) throw new Error(response.error.message);
  return { ...access, userId: context.userId, classes: classes.data ?? [], students: students.data ?? [], attempts: attempts.data ?? [], assignments: assignments.data ?? [], tests: tests.data ?? [], modules: modules.data ?? [] };
});
export const assignTeacherTest = createServerFn({ method: "POST" }).middleware([requireSupabaseAuth]).inputValidator((input) => z.object({ classId: z.string().uuid(), testId: z.string().uuid() }).parse(input)).handler(async ({ data, context }) => {
  const db = context.supabase; const { schoolId } = await teacherAccess(db, context.userId); const klass = await ownClass(db, context.userId, schoolId, data.classId);
  const test = await db.from("tests").select("id,grade_from,grade_to").eq("id", data.testId).eq("status", "published").single();
  if (test.error || (klass.grade !== null && ((test.data.grade_from !== null && klass.grade < test.data.grade_from) || (test.data.grade_to !== null && klass.grade > test.data.grade_to)))) throw new Error("Test nie je dostupný pre túto triedu.");
  const existing = await db.from("test_assignments").select("id").eq("class_id", data.classId).eq("test_id", data.testId).eq("created_by", context.userId).eq("status", "active").limit(1);
  if (existing.error) throw new Error(existing.error.message);
  if (existing.data?.length) throw new Error("Tento test je už triede priradený.");
  const result = await db.from("test_assignments").insert({ scope: "class", school_id: schoolId, class_id: data.classId, test_id: data.testId, created_by: context.userId }).select("id").single();
  if (result.error) throw new Error(result.error.message); return result.data;
});
export const changeTeacherAssignment = createServerFn({ method: "POST" }).middleware([requireSupabaseAuth]).inputValidator((input) => z.object({ id: z.string().uuid(), status: z.enum(["active", "paused"]) }).parse(input)).handler(async ({ data, context }) => {
  const db = context.supabase; const { schoolId } = await teacherAccess(db, context.userId);
  const result = await db.from("test_assignments").update({ status: data.status }).eq("id", data.id).eq("school_id", schoolId).eq("created_by", context.userId).eq("scope", "class").select("id").single();
  if (result.error) throw new Error("Nemáte oprávnenie meniť toto zadanie."); return result.data;
});
export const createTeacherStudent = createServerFn({ method: "POST" }).middleware([requireSupabaseAuth]).inputValidator((input) => z.object({ classId: z.string().uuid(), first_name: z.string().trim().max(80), last_name: z.string().trim().max(80) }).parse(input)).handler(async ({ data, context }) => {
  const db = context.supabase; const { schoolId } = await teacherAccess(db, context.userId); const klass = await ownClass(db, context.userId, schoolId, data.classId);
  const code = "IN-" + crypto.randomUUID().replaceAll("-", "").slice(0, 12).toUpperCase();
  const random = crypto.getRandomValues(new Uint32Array(1)); const pin = String(100000 + random[0] % 900000);
  const result = await db.from("students").insert({ school_id: schoolId, class_id: data.classId, first_name: data.first_name || null, last_name: data.last_name || null, grade: klass.grade, code, pin }).select("id,code,pin").single();
  if (result.error) throw new Error(result.error.message); return result.data;
});