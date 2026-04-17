import type { HoleInput } from "../scoring/types";

const STORAGE_KEY = "golfexpectations:saved-courses-v1";

export type SavedCourse = {
  id: string;
  teeName: string;
  coursePar: number;
  courseRating: number;
  bogeyRating: number;
  slopeRating: number;
  holes: Array<Pick<HoleInput, "par" | "yards" | "handicapRank">>;
  savedAt: string;
};

export function loadSavedCourses(): SavedCourse[] {
  if (typeof window === "undefined" || !window.localStorage) {
    return [];
  }
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(isSavedCourse);
  } catch {
    return [];
  }
}

function isSavedCourse(value: unknown): value is SavedCourse {
  if (!value || typeof value !== "object") return false;
  const o = value as Record<string, unknown>;
  if (typeof o.id !== "string" || typeof o.teeName !== "string") return false;
  if (typeof o.coursePar !== "number" || typeof o.courseRating !== "number") return false;
  if (typeof o.bogeyRating !== "number" || typeof o.slopeRating !== "number") return false;
  if (typeof o.savedAt !== "string") return false;
  if (!Array.isArray(o.holes) || o.holes.length !== 18) return false;
  return o.holes.every(
    (h) =>
      h &&
      typeof h === "object" &&
      typeof (h as HoleInput).par === "number" &&
      typeof (h as HoleInput).yards === "number" &&
      typeof (h as HoleInput).handicapRank === "number",
  );
}

export function persistSavedCourses(courses: SavedCourse[]): void {
  if (typeof window === "undefined" || !window.localStorage) {
    return;
  }
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(courses));
  } catch {
    // quota or private mode — ignore
  }
}

export function addSavedCourse(course: Omit<SavedCourse, "id" | "savedAt">): SavedCourse {
  const entry: SavedCourse = {
    ...course,
    id: crypto.randomUUID(),
    savedAt: new Date().toISOString(),
  };
  const next = [entry, ...loadSavedCourses()];
  persistSavedCourses(next);
  return entry;
}

export function removeSavedCourse(id: string): void {
  const next = loadSavedCourses().filter((c) => c.id !== id);
  persistSavedCourses(next);
}

export function formatSavedCourseLabel(c: SavedCourse): string {
  const d = new Date(c.savedAt);
  const dateStr = Number.isNaN(d.getTime())
    ? ""
    : d.toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });
  return `${c.teeName} · BR ${c.bogeyRating.toFixed(1)}${dateStr ? ` · ${dateStr}` : ""}`;
}
