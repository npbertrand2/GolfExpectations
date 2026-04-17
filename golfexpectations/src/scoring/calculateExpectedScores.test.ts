import { describe, expect, it } from "vitest";
import {
  BOGEY_REFERENCE_HANDICAP_INDEX,
  calculateExpectedScores,
  courseHandicapExact,
  expectedRoundTotalFromBogeyRating,
  strokesForHole,
  validateHandicapRanks,
  yardProportionWeights,
} from "./calculateExpectedScores";

describe("courseHandicapExact", () => {
  it("matches WHS-style slope and course-vs-par term", () => {
    const ch = courseHandicapExact({
      handicapIndex: 15.2,
      slopeRating: 135,
      courseRating: 70.7,
      coursePar: 72,
    });
    expect(ch).toBeCloseTo(16.859, 2);
  });
});

describe("strokesForHole", () => {
  it("allocates strokes to hardest holes first", () => {
    expect(strokesForHole(17, 1)).toBe(1);
    expect(strokesForHole(17, 17)).toBe(1);
    expect(strokesForHole(17, 18)).toBe(0);
  });

  it("handles multiples of 18", () => {
    expect(strokesForHole(18, 1)).toBe(1);
    expect(strokesForHole(36, 18)).toBe(2);
  });
});

describe("validateHandicapRanks", () => {
  it("accepts 1–18 in any order", () => {
    const ranks = Array.from({ length: 18 }, (_, i) => 18 - i);
    const holes = ranks.map((handicapRank, i) => ({
      handicapRank,
      hole: i + 1,
    }));
    expect(validateHandicapRanks(holes)).toBeNull();
  });

  it("rejects duplicates", () => {
    const holes = Array.from({ length: 18 }, (_, i) => ({
      hole: i + 1,
      handicapRank: i < 2 ? 1 : i + 1,
    }));
    expect(validateHandicapRanks(holes)).not.toBeNull();
  });
});

describe("yardProportionWeights", () => {
  it("sums to 1 and matches yard shares", () => {
    const w = yardProportionWeights([
      { yards: 100 },
      { yards: 300 },
      { yards: 600 },
    ]);
    expect(w.reduce((a, b) => a + b, 0)).toBeCloseTo(1, 10);
    expect(w[0]).toBeCloseTo(0.1, 10);
    expect(w[1]).toBeCloseTo(0.3, 10);
    expect(w[2]).toBeCloseTo(0.6, 10);
  });

  it("falls back to equal weights when total yards is invalid", () => {
    const w = yardProportionWeights([{ yards: 0 }, { yards: 100 }]);
    expect(w).toEqual([0.5, 0.5]);
  });
});

describe("expectedRoundTotalFromBogeyRating", () => {
  it("interpolates between course and bogey ratings by handicap index", () => {
    const total = expectedRoundTotalFromBogeyRating({
      handicapIndex: 15.2,
      courseRating: 70.7,
      bogeyRating: 95.8,
    });
    const spread = 95.8 - 70.7;
    expect(total).toBeCloseTo(70.7 + spread * (15.2 / BOGEY_REFERENCE_HANDICAP_INDEX), 5);
  });
});

describe("calculateExpectedScores (golden)", () => {
  it("matches ATDD P0 fixture totals (sum to expected round)", () => {
    const holes = Array.from({ length: 18 }, (_, i) => {
      const hole = i + 1;
      return {
        hole,
        par: (hole % 3) + 3,
        yards: 300 + hole * 10,
        handicapRank: hole,
      };
    });

    const result = calculateExpectedScores({
      handicapIndex: 15.2,
      tee: {
        teeName: "Green",
        coursePar: 72,
        courseRating: 70.7,
        bogeyRating: 95.8,
        slopeRating: 135,
      },
      holes,
    });

    expect(result.holes).toHaveLength(18);
    expect(result.expectedRoundTotal).toBeCloseTo(
      expectedRoundTotalFromBogeyRating({
        handicapIndex: 15.2,
        courseRating: 70.7,
        bogeyRating: 95.8,
      }),
      10,
    );
    expect(result.total18).toBeCloseTo(result.expectedRoundTotal, 10);
    expect(result.totalFront + result.totalBack).toBeCloseTo(result.total18, 10);

    const sumParts = result.holes.reduce((s, h) => s + h.expectedDecimal, 0);
    expect(sumParts).toBeCloseTo(result.expectedRoundTotal, 10);
  });

  it("allocates round delta by yard proportion (adjustment ratio matches weight ratio)", () => {
    const holes = Array.from({ length: 18 }, (_, i) => {
      const hole = i + 1;
      return {
        hole,
        par: 4,
        yards: hole === 1 ? 600 : hole === 2 ? 100 : 400,
        handicapRank: hole,
      };
    });

    const sorted = [...holes].sort((a, b) => a.hole - b.hole);
    const w = yardProportionWeights(sorted);
    const chInt = Math.round(
      courseHandicapExact({
        handicapIndex: 15.2,
        slopeRating: 135,
        courseRating: 70.7,
        coursePar: 72,
      }),
    );

    const result = calculateExpectedScores({
      handicapIndex: 15.2,
      tee: {
        teeName: "Green",
        coursePar: 72,
        courseRating: 70.7,
        bogeyRating: 95.8,
        slopeRating: 135,
      },
      holes,
    });

    const b1 = 4 + strokesForHole(chInt, 1);
    const b2 = 4 + strokesForHole(chInt, 2);
    const a1 = result.holes.find((h) => h.hole === 1)!.expectedDecimal - b1;
    const a2 = result.holes.find((h) => h.hole === 2)!.expectedDecimal - b2;
    expect(a2).not.toBe(0);
    expect(a1 / a2).toBeCloseTo(w[0] / w[1], 5);
  });
});
