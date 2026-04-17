import { faker } from "@faker-js/faker";

export type HoleInput = {
  hole: number;
  par: number;
  yards: number;
  handicapRank: number;
};

export type RoundInput = {
  handicapIndex: number;
  teeName: string;
  coursePar: number;
  courseRating: number;
  bogeyRating: number;
  slopeRating: number;
  holes: HoleInput[];
};

export function createSampleRoundInput(overrides: Partial<RoundInput> = {}): RoundInput {
  const holes = Array.from({ length: 18 }, (_, idx) => ({
    hole: idx + 1,
    par: idx % 3 === 0 ? 5 : idx % 4 === 0 ? 3 : 4,
    yards: faker.number.int({ min: 140, max: 580 }),
    handicapRank: idx + 1,
  }));

  return {
    handicapIndex: 15.2,
    teeName: "Green",
    coursePar: 72,
    courseRating: 70.7,
    bogeyRating: 95.8,
    slopeRating: 135,
    holes,
    ...overrides,
  };
}
