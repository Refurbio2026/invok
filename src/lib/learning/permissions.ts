export type Learner = { school_id: string; class_id: string | null; grade: number | null };
export type Assignment = { scope: string; school_id: string | null; class_id: string | null; grade: number | null; module_id: string | null; status: string; starts_at: string | null; ends_at: string | null };
export type LearningTest = { id: string; status: string; grade_from: number | null; grade_to: number | null; module_id: string | null };

export function requireTeacher(roles: string[], schoolId: string | null) {
  if (!roles.includes("ucitel") || !schoolId) throw new Error("Prístup je dostupný iba učiteľovi priradenému ku škole.");
  return schoolId;
}
export function requireOwnedClass(classes: { id: string; teacher_id: string | null }[], classId: string, userId: string) {
  if (!classes.some((c) => c.id === classId && c.teacher_id === userId)) throw new Error("Nemáte oprávnenie k tejto triede.");
}
export function canAccessTest(student: Learner, test: LearningTest, assignments: Assignment[], now: number) {
  if (test.status !== "published") return false;
  if ((test.grade_from !== null || test.grade_to !== null) && student.grade === null) return false;
  if (student.grade !== null && ((test.grade_from !== null && student.grade < test.grade_from) || (test.grade_to !== null && student.grade > test.grade_to))) return false;
  if (!assignments.length) return true;
  return assignments.some((a) => {
    if (a.status !== "active" || (a.starts_at && Date.parse(a.starts_at) > now) || (a.ends_at && Date.parse(a.ends_at) < now)) return false;
    if (a.school_id && a.school_id !== student.school_id) return false;
    if (a.class_id && a.class_id !== student.class_id) return false;
    if (a.grade !== null && a.grade !== student.grade) return false;
    if (a.module_id && a.module_id !== test.module_id) return false;
    return a.scope === "all" || (a.scope === "school" && a.school_id === student.school_id) || (a.scope === "class" && a.class_id === student.class_id) || (a.scope === "grade" && a.grade === student.grade) || (a.scope === "module" && a.module_id === test.module_id);
  });
}
export function canRetake(allowRetake: boolean, attempts: { status: string }[]) {
  return allowRetake || !attempts.some((a) => a.status === "submitted");
}
export function visibleScore(show: boolean, attempt: { score: number; max_score: number }) {
  return { score: show ? attempt.score : null, max_score: show ? attempt.max_score : null };
}