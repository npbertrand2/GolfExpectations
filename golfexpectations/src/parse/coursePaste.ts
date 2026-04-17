/**
 * Parse tabular course / tee data pasted from scorecards or rating sheets.
 * Supports a preamble (tee name, par, total yards, rating, slope) plus yds / Par / Hcp rows.
 */

export type ParsedHoleFromPaste = {
  hole: number;
  yards: number;
  par: number;
  handicapRank: number;
};

export type ParseCoursePasteResult =
  | {
      ok: true;
      teeName: string;
      coursePar: number;
      courseRating: number;
      slopeRating: number;
      bogeyRating: number;
      bogeyRatingEstimated: boolean;
      holes: ParsedHoleFromPaste[];
      totalYardsFromTable: number;
      warnings: string[];
    }
  | { ok: false; error: string };

/** USGA-style estimate when bogey rating is not in the paste. */
export function estimateBogeyRating(courseRating: number, slopeRating: number): number {
  return courseRating + (slopeRating / 113) * 23.3;
}

function splitLine(line: string): string[] {
  if (line.includes("\t")) {
    return line.split("\t").map((c) => c.trim());
  }
  return line
    .trim()
    .split(/\s{2,}|\s+(?=\d)/)
    .map((c) => c.trim())
    .filter((c) => c.length > 0);
}

function findTableRowIndex(lines: string[]): number {
  const lower = lines.map((l) => l.toLowerCase().trim());
  return lower.findIndex(
    (l) => l.startsWith("yds\t") || l.startsWith("yds ") || l === "yds" || l.startsWith("yards\t"),
  );
}

/** Pull 18 hole values when row has Out/In/Tot columns (indices 1–9 and 11–19). */
function extractEighteenHoleValues(cells: string[]): number[] | null {
  if (cells.length < 19) return null;

  const label = cells[0].toLowerCase();
  if (label === "yds" || label === "par" || label === "hcp" || label === "si" || label === "hdcp") {
    // Standard scorecard: label, 9 front, Out, 9 back, (In, Tot optional)
    const takeFrontBack = (): number[] | null => {
      if (cells.length < 20) return null;
      const front = cells.slice(1, 10).map((c) => c.trim());
      const back = cells.slice(11, 20).map((c) => c.trim());
      if (front.length !== 9 || back.length !== 9) return null;
      const nums = [...front, ...back];
      if (!nums.every((c) => c.length > 0 && Number.isFinite(Number(c)))) return null;
      return nums.map((c) => Number(c));
    };

    const fb = takeFrontBack();
    if (fb) return fb;

    // Fallback: 18 consecutive values after label (no Out column)
    const seq = cells.slice(1, 19).map((c) => c.trim());
    if (seq.length === 18 && seq.every((c) => c.length > 0 && Number.isFinite(Number(c)))) {
      return seq.map((c) => Number(c));
    }
  }
  return null;
}

function parsePreamble(lines: string[], tableStart: number): {
  teeName: string;
  coursePar: number;
  courseRating?: number;
  slopeRating?: number;
  totalYards?: number;
} {
  const preambleLines = lines.slice(0, Math.max(0, tableStart)).map((l) => l.trim()).filter(Boolean);

  let teeName = "Tee";
  let coursePar = 72;

  const first = preambleLines[0];
  if (first) {
    const m = first.match(/^(.+?)[\t\s]+(\d{2})\s*$/);
    if (m) {
      teeName = m[1].trim();
      const p = Number(m[2]);
      if (p >= 27 && p <= 75) coursePar = p;
    }
  }

  let courseRating: number | undefined;
  let slopeRating: number | undefined;
  let totalYards: number | undefined;

  for (const line of preambleLines) {
    const t = line.trim();
    if (!t || /^(par|yards|yds|rating|slope)$/i.test(t)) continue;
    if (/^\d+\.\d+$/.test(t)) {
      const v = Number.parseFloat(t);
      if (v >= 55 && v <= 90) courseRating = v;
      continue;
    }
    if (/^\d+$/.test(t)) {
      const n = Number.parseInt(t, 10);
      if (n >= 5000 && n <= 9000) totalYards = n;
      else if (n >= 55 && n <= 155 && n !== coursePar) slopeRating = n;
    }
  }

  return { teeName, coursePar, courseRating, slopeRating, totalYards };
}

export function parseCoursePaste(raw: string): ParseCoursePasteResult {
  const text = raw.replace(/\r\n/g, "\n").replace(/\r/g, "\n");
  const lines = text.split("\n").map((l) => l.replace(/\s+$/, ""));

  const tableStart = findTableRowIndex(lines);
  if (tableStart < 0) {
    return {
      ok: false,
      error:
        'Could not find a yardage row starting with "yds" (or "yards"). Paste the full table including the yds row.',
    };
  }

  const ydsLine = lines[tableStart];
  const parLine = lines.slice(tableStart + 1).find((l) => /^par(\t|\s)/i.test(l.trim()));
  const hcpLine = lines
    .slice(tableStart + 1)
    .find((l) => /^(hcp|si|hdcp)(\t|\s)/i.test(l.trim()));

  if (!parLine || !hcpLine) {
    return {
      ok: false,
      error: 'Found yds row but need both "Par" and "Hcp" (or SI) rows after it.',
    };
  }

  const ydsCells = splitLine(ydsLine);
  const parCells = splitLine(parLine);
  const hcpCells = splitLine(hcpLine);

  const ydsVals = extractEighteenHoleValues(ydsCells);
  const parVals = extractEighteenHoleValues(parCells);
  const hcpVals = extractEighteenHoleValues(hcpCells);

  if (!ydsVals || !parVals || !hcpVals) {
    return {
      ok: false,
      error:
        "Could not read 18 hole values. Use tabs between columns; include Out/In columns or 18 values in a row.",
    };
  }

  const holes: ParsedHoleFromPaste[] = [];
  for (let i = 0; i < 18; i++) {
    holes.push({
      hole: i + 1,
      yards: ydsVals[i],
      par: parVals[i],
      handicapRank: Math.round(hcpVals[i]),
    });
  }

  const preamble = parsePreamble(lines, tableStart);
  const warnings: string[] = [];

  if (preamble.courseRating === undefined || preamble.slopeRating === undefined) {
    return {
      ok: false,
      error:
        "Could not find course rating (e.g. 69.0) and slope (e.g. 128) in the lines above the table. Add them or enter manually after paste.",
    };
  }

  const bogeyRatingEstimated = true;
  const bogeyRating = estimateBogeyRating(preamble.courseRating, preamble.slopeRating);
  warnings.push(
    "Bogey rating was estimated from course rating and slope (USGA-style). Adjust if your sheet lists bogey rating explicitly.",
  );

  const totalYardsFromTable = ydsVals.reduce((a, b) => a + b, 0);
  if (preamble.totalYards !== undefined && Math.abs(preamble.totalYards - totalYardsFromTable) > 3) {
    warnings.push(
      `Total yards in preamble (${preamble.totalYards}) differs from sum of hole yards (${totalYardsFromTable}). Using hole-by-hole yards.`,
    );
  }

  const ranks = holes.map((h) => h.handicapRank);
  const sorted = [...ranks].sort((a, b) => a - b);
  const expectedRanks = Array.from({ length: 18 }, (_, i) => i + 1);
  if (sorted.some((v, i) => v !== expectedRanks[i])) {
    warnings.push(
      "Handicap ranks are not 1–18 exactly once. Fix the Hcp row or edit holes before calculating.",
    );
  }

  return {
    ok: true,
    teeName: preamble.teeName,
    coursePar: preamble.coursePar,
    courseRating: preamble.courseRating,
    slopeRating: preamble.slopeRating,
    bogeyRating,
    bogeyRatingEstimated,
    holes,
    totalYardsFromTable,
    warnings,
  };
}
