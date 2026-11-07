/// <reference types="bun" />
import { expect, test } from "bun:test";
import { canAccessTest, canRetake, requireTeacher, requireOwnedClass, visibleScore } from "./permissions";
const student = { school_id: "school-a", class_id: "class-a", grade: 8 };
const exam = { id: "test", status: "published", grade_from: 8, grade_to: 9, module_id: null };
const assignment = { scope: "class", school_id: "school-a", class_id: "class-a", grade: null, module_id: null, status: "active", starts_at: null, ends_at: null };
test("only teacher role may open teacher workspace", () => { expect(requireTeacher(["ucitel"], "school-a")).toBe("school-a"); expect(() => requireTeacher(["skola"], "school-a")).toThrow(); });
test("teacher cannot manage another teacher's class", () => { expect(() => requireOwnedClass([{ id: "class-a", teacher_id: "other" }], "class-a", "teacher")).toThrow(); });
test("student receives only assignments for own class and school", () => { expect(canAccessTest(student, exam, [assignment], 100)).toBe(true); expect(canAccessTest(student, exam, [{ ...assignment, class_id: "other" }], 100)).toBe(false); expect(canAccessTest(student, exam, [{ ...assignment, school_id: "other" }], 100)).toBe(false); });
test("paused and future assignments cannot be started", () => { expect(canAccessTest(student, exam, [{ ...assignment, status: "paused" }], 100)).toBe(false); expect(canAccessTest(student, exam, [{ ...assignment, starts_at: "2030-01-01" }], 100)).toBe(false); });
test("grade and publication are enforced", () => { expect(canAccessTest({ ...student, grade: 7 }, exam, [], 100)).toBe(false); expect(canAccessTest(student, { ...exam, status: "draft" }, [], 100)).toBe(false); });
test("submitted test cannot be retaken without permission", () => { expect(canRetake(false, [{ status: "submitted" }])).toBe(false); expect(canRetake(true, [{ status: "submitted" }])).toBe(true); });
test("hidden student scores never leave server", () => { expect(visibleScore(false, { score: 9, max_score: 10 })).toEqual({ score: null, max_score: null }); });