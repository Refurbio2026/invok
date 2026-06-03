import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const credSchema = z.object({
  code: z.string().trim().min(1).max(64),
  pin: z.string().trim().min(1).max(32),
});

async function verifyStudent(code: string, pin: string) {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const { data, error } = await supabaseAdmin
    .from("students")
    .select("id, code, pin, school_id, class_id, grade, first_name, last_name, status")
    .eq("code", code)
    .maybeSingle();
  if (error) throw new Error(error.message);
  if (!data || data.pin !== pin) throw new Error("Nesprávny kód alebo PIN.");
  if (data.status !== "aktivny") throw new Error("Účet žiaka je neaktívny.");
  return data;
}

export const studentLogin = createServerFn({ method: "POST" })
  .inputValidator((i) => credSchema.parse(i))
  .handler(async ({ data }) => {
    const s = await verifyStudent(data.code, data.pin);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: tests } = await supabaseAdmin
      .from("tests")
      .select("id, title, slug, type, duration_min, description, grade_from, grade_to")
      .eq("status", "published")
      .order("created_at", { ascending: false });
    const { data: attempts } = await supabaseAdmin
      .from("test_attempts")
      .select("id, test_id, status, score, max_score, submitted_at, started_at")
      .eq("student_id", s.id)
      .order("started_at", { ascending: false });
    return {
      student: {
        id: s.id, code: s.code, first_name: s.first_name, last_name: s.last_name,
        grade: s.grade, school_id: s.school_id, class_id: s.class_id,
      },
      tests: tests ?? [],
      attempts: attempts ?? [],
    };
  });

export const startAttempt = createServerFn({ method: "POST" })
  .inputValidator((i) =>
    credSchema.extend({ testId: z.string().uuid() }).parse(i),
  )
  .handler(async ({ data }) => {
    const s = await verifyStudent(data.code, data.pin);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: test, error: tErr } = await supabaseAdmin
      .from("tests").select("id, title, status, duration_min")
      .eq("id", data.testId).single();
    if (tErr) throw new Error(tErr.message);
    if (test.status !== "published") throw new Error("Test nie je dostupný.");

    // Resume in-progress attempt if exists
    const { data: existing } = await supabaseAdmin
      .from("test_attempts")
      .select("id")
      .eq("test_id", data.testId)
      .eq("student_id", s.id)
      .eq("status", "in_progress")
      .maybeSingle();

    let attemptId = existing?.id as string | undefined;
    if (!attemptId) {
      const { data: created, error: cErr } = await supabaseAdmin
        .from("test_attempts")
        .insert({
          test_id: data.testId,
          student_id: s.id,
          school_id: s.school_id,
          class_id: s.class_id,
        })
        .select("id").single();
      if (cErr) throw new Error(cErr.message);
      attemptId = created.id;
    }

    const { data: questions } = await supabaseAdmin
      .from("test_questions")
      .select("id, position, question_text, question_type, options, points, competency")
      .eq("test_id", data.testId)
      .order("position");

    const { data: savedAnswers } = await supabaseAdmin
      .from("test_answers")
      .select("question_id, answer_keys, answer_text")
      .eq("attempt_id", attemptId);

    return {
      attemptId,
      test: { id: test.id, title: test.title, duration_min: test.duration_min },
      questions: questions ?? [],
      answers: savedAnswers ?? [],
    };
  });

export const saveAnswer = createServerFn({ method: "POST" })
  .inputValidator((i) =>
    credSchema.extend({
      attemptId: z.string().uuid(),
      questionId: z.string().uuid(),
      answerKeys: z.array(z.string().max(200)).max(50).default([]),
      answerText: z.string().max(5000).optional().nullable(),
    }).parse(i),
  )
  .handler(async ({ data }) => {
    const s = await verifyStudent(data.code, data.pin);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: attempt, error } = await supabaseAdmin
      .from("test_attempts")
      .select("id, student_id, status")
      .eq("id", data.attemptId).single();
    if (error) throw new Error(error.message);
    if (attempt.student_id !== s.id) throw new Error("Forbidden");
    if (attempt.status !== "in_progress") throw new Error("Pokus už bol odovzdaný.");

    const { error: upErr } = await supabaseAdmin
      .from("test_answers")
      .upsert({
        attempt_id: data.attemptId,
        question_id: data.questionId,
        answer_keys: data.answerKeys,
        answer_text: data.answerText ?? null,
      }, { onConflict: "attempt_id,question_id" });
    if (upErr) throw new Error(upErr.message);
    return { ok: true };
  });

export const submitAttempt = createServerFn({ method: "POST" })
  .inputValidator((i) =>
    credSchema.extend({ attemptId: z.string().uuid() }).parse(i),
  )
  .handler(async ({ data }) => {
    const s = await verifyStudent(data.code, data.pin);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    const { data: attempt, error: aErr } = await supabaseAdmin
      .from("test_attempts")
      .select("id, student_id, test_id, status")
      .eq("id", data.attemptId).single();
    if (aErr) throw new Error(aErr.message);
    if (attempt.student_id !== s.id) throw new Error("Forbidden");
    if (attempt.status === "submitted") {
      return { ok: true, alreadySubmitted: true };
    }

    const { data: questions } = await supabaseAdmin
      .from("test_questions")
      .select("id, question_type, correct_keys, points")
      .eq("test_id", attempt.test_id);

    const { data: answers } = await supabaseAdmin
      .from("test_answers")
      .select("id, question_id, answer_keys, answer_text")
      .eq("attempt_id", data.attemptId);

    let score = 0;
    let maxScore = 0;
    const updates: { id: string; points: number; correct: boolean | null }[] = [];

    for (const q of questions ?? []) {
      const points = Number(q.points ?? 1);
      maxScore += points;
      const ans = answers?.find((a) => a.question_id === q.id);
      if (!ans) continue;

      if (q.question_type === "single" || q.question_type === "multi") {
        const correct = new Set((q.correct_keys ?? []) as string[]);
        const given = new Set(ans.answer_keys ?? []);
        const isCorrect =
          correct.size === given.size &&
          [...correct].every((k) => given.has(k));
        const awarded = isCorrect ? points : 0;
        score += awarded;
        updates.push({ id: ans.id, points: awarded, correct: isCorrect });
      } else {
        // scale / text → manual review; points 0, correct null
        updates.push({ id: ans.id, points: 0, correct: null });
      }
    }

    for (const u of updates) {
      await supabaseAdmin
        .from("test_answers")
        .update({ points_awarded: u.points, is_correct: u.correct })
        .eq("id", u.id);
    }

    const { error: upErr } = await supabaseAdmin
      .from("test_attempts")
      .update({
        status: "submitted",
        submitted_at: new Date().toISOString(),
        score,
        max_score: maxScore,
      })
      .eq("id", data.attemptId);
    if (upErr) throw new Error(upErr.message);

    return { ok: true, score, maxScore };
  });
