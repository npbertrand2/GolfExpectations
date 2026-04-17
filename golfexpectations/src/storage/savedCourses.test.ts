import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  addSavedCourse,
  loadSavedCourses,
  persistSavedCourses,
  removeSavedCourse,
} from "./savedCourses";

describe("savedCourses storage", () => {
  let mem: Record<string, string>;

  beforeEach(() => {
    mem = {};
    vi.stubGlobal("window", {
      localStorage: {
        getItem: (k: string) => mem[k] ?? null,
        setItem: (k: string, v: string) => {
          mem[k] = v;
        },
      },
    });
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("round-trips courses", () => {
    const a = addSavedCourse({
      teeName: "Green",
      coursePar: 72,
      courseRating: 70.7,
      bogeyRating: 95.8,
      slopeRating: 135,
      holes: Array.from({ length: 18 }, (_, i) => ({
        par: 4,
        yards: 400,
        handicapRank: i + 1,
      })),
    });

    const list = loadSavedCourses();
    expect(list).toHaveLength(1);
    expect(list[0].id).toBe(a.id);
    expect(list[0].bogeyRating).toBe(95.8);

    removeSavedCourse(a.id);
    expect(loadSavedCourses()).toHaveLength(0);
  });

  it("persistSavedCourses replaces list", () => {
    persistSavedCourses([]);
    expect(loadSavedCourses()).toHaveLength(0);
  });
});
