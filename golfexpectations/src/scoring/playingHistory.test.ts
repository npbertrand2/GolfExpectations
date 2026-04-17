import { describe, expect, it } from "vitest";
import {
  blendedRoundTotal,
  GHIN_FULL_WEIGHT_ROUNDS,
  buildPlayingHistoryInsight,
  personalAverageWeight,
  typicalRoundBandFromHistory,
  validatePlayingHistory,
} from "./playingHistory";

describe("validatePlayingHistory", () => {
  it("accepts valid GHIN-style summary", () => {
    expect(
      validatePlayingHistory({
        scoreCount: 20,
        high: 102,
        low: 83,
        average: 93.3,
      }),
    ).toBeNull();
  });

  it("rejects average outside low–high", () => {
    expect(
      validatePlayingHistory({
        scoreCount: 20,
        high: 90,
        low: 80,
        average: 95,
      }),
    ).not.toBeNull();
  });
});

describe("personalAverageWeight", () => {
  it("reaches max near full GHIN window", () => {
    const w20 = personalAverageWeight(GHIN_FULL_WEIGHT_ROUNDS);
    expect(w20).toBeCloseTo(0.45, 5);
    expect(personalAverageWeight(100)).toBe(0.45);
  });
});

describe("blendedRoundTotal", () => {
  it("mixes model and recent average", () => {
    const h = { scoreCount: 20, high: 102, low: 83, average: 93.3 };
    const blended = blendedRoundTotal(88, h);
    const w = personalAverageWeight(20);
    expect(blended).toBeCloseTo((1 - w) * 88 + w * 93.3, 5);
  });
});

describe("typicalRoundBandFromHistory", () => {
  it("centers on average with span from high–low", () => {
    const b = typicalRoundBandFromHistory({
      scoreCount: 20,
      high: 102,
      low: 83,
      average: 93.3,
    });
    const half = (102 - 83) / 4;
    expect(b.low).toBeCloseTo(93.3 - half, 5);
    expect(b.high).toBeCloseTo(93.3 + half, 5);
  });
});

describe("buildPlayingHistoryInsight", () => {
  it("returns insight bundle", () => {
    const insight = buildPlayingHistoryInsight(90, {
      scoreCount: 20,
      high: 102,
      low: 83,
      average: 93.3,
    });
    expect(insight.modelMinusAverage).toBeCloseTo(-3.3, 5);
    expect(insight.blendedRoundTotal).toBeGreaterThan(90);
    expect(insight.blendedRoundTotal).toBeLessThan(93.3);
  });
});
