/// <reference types="bun" />
import { describe, expect, test } from "bun:test";
import { requireSchoolRole, averageScore } from "./rules";

describe("School access", () => {
  test("school account receives only its assigned school", () => {
    expect(requireSchoolRole(["skola"], "own-school")).toBe("own-school");
  });
  test("teacher cannot enter school management", () => {
    expect(() => requireSchoolRole(["ucitel"], "own-school")).toThrow();
  });
  test("unassigned school account is rejected", () => {
    expect(() => requireSchoolRole(["skola"], null)).toThrow();
  });
});
test("average excludes unfinished and unscored tests", () => {
  expect(averageScore([{ status: "submitted", score: 8, max_score: 10 }, { status: "submitted", score: 6, max_score: 10 }, { status: "in_progress", score: 0, max_score: 10 }, { status: "submitted", score: 0, max_score: 0 }])).toBe(70);
  expect(averageScore([])).toBeNull();
});