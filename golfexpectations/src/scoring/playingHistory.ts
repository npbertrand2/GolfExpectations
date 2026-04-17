/**
 * Optional summary from GHIN (or similar): last N rounds high / low / average.
 * Used to blend with modeled round total and show a personal planning band.
 */

export type PlayingHistorySummary = {
  scoreCount: number;
  high: number;
  low: number;
  average: number;
};

/** At this count, personal average reaches full configured blend weight toward history. */
export const GHIN_FULL_WEIGHT_ROUNDS = 20;

/** Max share of recent average in blended total (rest stays on model). */
const MAX_PERSONAL_WEIGHT = 0.45;

export function validatePlayingHistory(h: PlayingHistorySummary): string | null {
  if (!Number.isFinite(h.scoreCount) || !Number.isInteger(h.scoreCount) || h.scoreCount < 1) {
    return "Number of scores must be a positive whole number.";
  }
  if (![h.high, h.low, h.average].every((x) => Number.isFinite(x))) {
    return "High, low, and average must be valid numbers.";
  }
  if (h.high < h.low) {
    return "High must be greater than or equal to low.";
  }
  if (h.average < h.low || h.average > h.high) {
    return "Average should fall between low and high for those rounds.";
  }
  return null;
}

/**
 * Weight on recent average increases with score count, capped at MAX_PERSONAL_WEIGHT
 * when scoreCount >= GHIN_FULL_WEIGHT_ROUNDS.
 */
export function personalAverageWeight(scoreCount: number): number {
  if (scoreCount < 1) return 0;
  return Math.min(MAX_PERSONAL_WEIGHT, (scoreCount / GHIN_FULL_WEIGHT_ROUNDS) * MAX_PERSONAL_WEIGHT);
}

export function blendedRoundTotal(modelTotal: number, h: PlayingHistorySummary): number {
  const w = personalAverageWeight(h.scoreCount);
  return (1 - w) * modelTotal + w * h.average;
}

/**
 * Rough "typical day" band from recent avg and observed span (not a formal CI).
 * Uses avg ± ¼ of (high − low), clamped to sane gross bounds.
 */
export function typicalRoundBandFromHistory(h: PlayingHistorySummary): { low: number; high: number } {
  const span = h.high - h.low;
  const half = span / 4;
  return {
    low: Math.max(55, h.average - half),
    high: Math.min(140, h.average + half),
  };
}

export type PlayingHistoryInsight = {
  summary: PlayingHistorySummary;
  modelRoundTotal: number;
  blendedRoundTotal: number;
  personalWeight: number;
  typicalBand: { low: number; high: number };
  /** Positive if model is higher than your recent average. */
  modelMinusAverage: number;
};

export function buildPlayingHistoryInsight(
  modelRoundTotal: number,
  summary: PlayingHistorySummary,
): PlayingHistoryInsight {
  return {
    summary,
    modelRoundTotal,
    blendedRoundTotal: blendedRoundTotal(modelRoundTotal, summary),
    personalWeight: personalAverageWeight(summary.scoreCount),
    typicalBand: typicalRoundBandFromHistory(summary),
    modelMinusAverage: modelRoundTotal - summary.average,
  };
}
