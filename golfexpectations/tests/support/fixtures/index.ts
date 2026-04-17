import { test as base, expect } from "@playwright/test";
import { createSampleRoundInput, type RoundInput } from "./test-data";

type TestFixtures = {
  roundInput: RoundInput;
};

export const test = base.extend<TestFixtures>({
  // Playwright fixture worker: no dependency fixtures; `use` is Playwright's API (not React).
  /* eslint-disable no-empty-pattern, react-hooks/rules-of-hooks */
  roundInput: async ({}, use) => {
    await use(createSampleRoundInput());
  },
  /* eslint-enable no-empty-pattern, react-hooks/rules-of-hooks */
});

export { expect };
