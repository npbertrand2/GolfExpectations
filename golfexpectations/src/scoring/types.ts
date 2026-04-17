export type HoleInput = {
  hole: number;
  par: number;
  yards: number;
  handicapRank: number;
};

export type TeeCourseInput = {
  teeName: string;
  coursePar: number;
  courseRating: number;
  bogeyRating: number;
  slopeRating: number;
};

export type ExpectedScoreInput = {
  handicapIndex: number;
  tee: TeeCourseInput;
  holes: HoleInput[];
};

export type HoleExpectedResult = {
  hole: number;
  expectedDecimal: number;
  expectedInteger: number;
  expectedRangeLabel: string;
};

export type ExpectedScoreResult = {
  holes: HoleExpectedResult[];
  totalFront: number;
  totalBack: number;
  total18: number;
  courseHandicapExact: number;
  expectedRoundTotal: number;
};
