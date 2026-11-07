import { z } from "zod";

export const schoolClassSchema = z.object({
  id: z.string().uuid().optional(),
  name: z.string().trim().min(1).max(60),
  grade: z.number().int().min(1).max(13).nullable(),
  school_year: z.string().trim().max(20).nullable(),
  teacher_id: z.string().uuid().nullable(),
});

export function requireSchoolRole(roles: string[], schoolId: string | null) {
  if (!roles.includes("skola") || !schoolId) throw new Error("Prístup je dostupný iba pre účet školy priradený ku škole.");
  return schoolId;
}

export function averageScore(attempts: { status: string; score: number; max_score: number }[]) {
  const completed = attempts.filter((a) => a.status === "submitted" && a.max_score > 0);
  return completed.length ? Math.round(completed.reduce((sum, a) => sum + a.score / a.max_score * 100, 0) / completed.length * 10) / 10 : null;
}