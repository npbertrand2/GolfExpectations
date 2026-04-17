import { describe, expect, it } from "vitest";
import { estimateBogeyRating, parseCoursePaste } from "./coursePaste";

const SAMPLE = `White \t72
par

5887
yards

69.0
rating

128
slope

Tee	1	2	3	4	5	6	7	8	9	Out	10	11	12	13	14	15	16	17	18	In	Tot
yds	372	384	504	282	133	300	290	148	445	2858	332	360	188	478	310	147	563	301	350	3029	5887
Par	4	4	5	4	3	4	4	3	5	36	4	4	3	5	4	3	5	4	4	36	72
Hcp	7	1	3	13	5	15	17	11	9		14	10	6	8	16	12	2	18	4		`;

describe("parseCoursePaste", () => {
  it("parses tee sheet sample including Hcp with blank Out column", () => {
    const r = parseCoursePaste(SAMPLE);
    expect(r.ok).toBe(true);
    if (!r.ok) return;
    expect(r.teeName).toBe("White");
    expect(r.coursePar).toBe(72);
    expect(r.courseRating).toBe(69.0);
    expect(r.slopeRating).toBe(128);
    expect(r.bogeyRating).toBeCloseTo(estimateBogeyRating(69.0, 128), 3);
    expect(r.holes).toHaveLength(18);
    expect(r.holes[0]).toMatchObject({ hole: 1, yards: 372, par: 4, handicapRank: 7 });
    expect(r.holes[17]).toMatchObject({ hole: 18, yards: 350, par: 4, handicapRank: 4 });
    expect(r.totalYardsFromTable).toBe(5887);
  });

  it("fails without yds row", () => {
    const r = parseCoursePaste("Par\t4\t4");
    expect(r.ok).toBe(false);
  });
});
