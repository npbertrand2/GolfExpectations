import type { ExpectedScoreInput, ExpectedScoreResult, HoleExpectedResult } from "./types";

/**
 * USGA slope narrative ties scratch vs bogey ratings to a reference index gap (~20.7).
 * Used to blend expected gross score between course rating and bogey rating by handicap index.
 */
export const BOGEY_REFERENCE_HANDICAP_INDEX = 20.7;

/**
 * Expected 18-hole gross score from course vs bogey ratings and handicap index.
 * At index 0 → course rating; at ~20.7 → bogey rating (linear).
 */
export function expectedRoundTotalFromBogeyRating(input: {
  handicapIndex: number;
  courseRating: number;
  bogeyRating: number;
}): number {
  const spread = input.bogeyRating - input.courseRating;
  return input.courseRating + spread * (input.handicapIndex / BOGEY_REFERENCE_HANDICAP_INDEX);
}

/**
 * WHS-style course handicap (exact, before rounding) using slope and course vs par.
 */
export function courseHandicapExact(input: {
  handicapIndex: number;
  slopeRating: number;
  courseRating: number;
  coursePar: number;
}): number {
  return (
    input.handicapIndex * (input.slopeRating / 113) +
    (input.courseRating - input.coursePar)
  );
}

/** Strokes received on a hole given integer course handicap and stroke index rank (1 = hardest). */
export function strokesForHole(courseHandicapInt: number, strokeIndexRank: number): number {
  if (courseHandicapInt <= 0) return 0;
  const base = Math.floor(courseHandicapInt / 18);
  const remainder = courseHandicapInt % 18;
  return base + (strokeIndexRank <= remainder ? 1 : 0);
}

export function validateHandicapRanks(holes: { handicapRank: number }[]): string | null {
  if (holes.length !== 18) {
    return "Enter all 18 holes.";
  }
  const ranks = holes.map((h) => h.handicapRank);
  if (ranks.some((r) => !Number.isFinite(r) || !Number.isInteger(r))) {
    return "Each hole needs a whole-number handicap rank (1–18).";
  }
  const sorted = [...ranks].sort((a, b) => a - b);
  const expected = Array.from({ length: 18 }, (_, i) => i + 1);
  if (sorted.some((v, i) => v !== expected[i])) {
    return "Handicap ranks must use 1–18 exactly once each.";
  }
  return null;
}

function formatRangeLabel(value: number): string {
  const low = value - 0.25;
  const high = value + 0.25;
  return `${low.toFixed(1)} – ${high.toFixed(1)}`;
}

/**
 * Per-hole weights proportional to yardage: wᵢ = yardsᵢ / Σⱼ yardsⱼ.
 * Falls back to equal 1/18 weights if any yardage is invalid or total is non-positive.
 */
export function yardProportionWeights(holes: { yards: number }[]): number[] {
  const n = holes.length;
  if (n === 0) return [];
  const total = holes.reduce((s, h) => s + h.yards, 0);
  const ok =
    n > 0 &&
    total > 0 &&
    holes.every((h) => Number.isFinite(h.yards) && h.yards > 0);
  if (!ok) {
    return holes.map(() => 1 / n);
  }
  return holes.map((h) => h.yards / total);
}

/**
 * Gross expectation: **bogey rating blend** for the round total (see `expectedRoundTotalFromBogeyRating`).
 * Stroke allocation still uses WHS course handicap and stroke index. The gap δ between that round
 * total and the sum of base hole scores (par + handicap strokes) is allocated **by yard share**:
 * each hole gets δ × (yardsᵢ / total yards), so longer holes absorb more of the adjustment.
 */
export function calculateExpectedScores(input: ExpectedScoreInput): ExpectedScoreResult {
  const chExact = courseHandicapExact({
    handicapIndex: input.handicapIndex,
    slopeRating: input.tee.slopeRating,
    courseRating: input.tee.courseRating,
    coursePar: input.tee.coursePar,
  });

  const expectedRoundTotal = expectedRoundTotalFromBogeyRating({
    handicapIndex: input.handicapIndex,
    courseRating: input.tee.courseRating,
    bogeyRating: input.tee.bogeyRating,
  });
  const chInt = Math.round(chExact);

  const sortedHoles = [...input.holes].sort((a, b) => a.hole - b.hole);

  const baseScores = sortedHoles.map((h) => {
    const strokes =
      chInt > 0 ? strokesForHole(chInt, h.handicapRank) : 0;
    return h.par + strokes;
  });

  const baseSum = baseScores.reduce((a, b) => a + b, 0);
  const delta = expectedRoundTotal - baseSum;
  const weights = yardProportionWeights(sortedHoles);

  const holes: HoleExpectedResult[] = sortedHoles.map((h, idx) => {
    const expectedDecimal = baseScores[idx] + delta * weights[idx];
    const expectedInteger = Math.round(expectedDecimal);
    return {
      hole: h.hole,
      expectedDecimal,
      expectedInteger,
      expectedRangeLabel: formatRangeLabel(expectedDecimal),
    };
  });

  const totalFront = holes
    .filter((h) => h.hole >= 1 && h.hole <= 9)
    .reduce((s, h) => s + h.expectedDecimal, 0);
  const totalBack = holes
    .filter((h) => h.hole >= 10 && h.hole <= 18)
    .reduce((s, h) => s + h.expectedDecimal, 0);
  const total18 = holes.reduce((s, h) => s + h.expectedDecimal, 0);

  return {
    holes,
    totalFront,
    totalBack,
    total18,
    courseHandicapExact: chExact,
    expectedRoundTotal,
  };
}
