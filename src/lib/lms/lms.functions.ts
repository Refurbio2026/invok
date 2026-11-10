import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { requireTeacher } from "@/lib/learning/permissions";

const studentSchema = z.object({
  code: z.string().trim().min(1).max(64),
  pin: z.string().trim().min(1).max(32),
});

async function schoolName(schoolId: string) {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const { data } = await supabaseAdmin.from("schools").select("name").eq("id", schoolId).maybeSingle();
  return data?.name ?? "Škola";
}

/** One-time Moodle login link for a pupil (code + PIN, same check as studentLogin). */
export const getStudentLmsLink = createServerFn({ method: "POST" })
  .inputValidator((i) => studentSchema.parse(i))
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { createLmsLoginUrl } = await import("@/lib/lms/lms-link.server");
    const { data: s, error } = await supabaseAdmin
      .from("students")
      .select("id, pin, school_id, first_name, last_name, status")
      .eq("code", data.code)
      .maybeSingle();
    if (error) throw new Error("Účet žiaka sa nepodarilo overiť.");
    if (!s || s.pin !== data.pin) throw new Error("Nesprávny kód alebo PIN.");
    if (s.status !== "aktivny") throw new Error("Účet žiaka je neaktívny.");
    const url = await createLmsLoginUrl({
      role: "student",
      uid: s.id,
      firstName: s.first_name,
      lastName: s.last_name,
      school: { id: s.school_id, name: await schoolName(s.school_id) },
    });
    return { url };
  });

/** One-time Moodle login link for a logged-in teacher (role "ucitel" with a school). */
export const getTeacherLmsLink = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const db = context.supabase;
    const [profile, roles] = await Promise.all([
      db.from("profiles").select("school_id,full_name").eq("id", context.userId).single(),
      db.from("user_roles").select("role").eq("user_id", context.userId),
    ]);
    if (profile.error || roles.error) throw new Error("Nepodarilo sa overiť učiteľský účet.");
    const schoolId = requireTeacher((roles.data ?? []).map((r) => r.role), profile.data.school_id);
    const { createLmsLoginUrl, splitFullName } = await import("@/lib/lms/lms-link.server");
    const email = typeof context.claims.email === "string" ? context.claims.email : null;
    const url = await createLmsLoginUrl({
      role: "teacher",
      uid: context.userId,
      ...splitFullName(profile.data.full_name),
      email,
      school: { id: schoolId, name: await schoolName(schoolId) },
    });
    return { url };
  });
