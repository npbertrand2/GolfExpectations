import { test as base, expect } from "@playwright/test";
import { createSampleRoundInput, type RoundInput } from "./test-data";

type TestFixtures = {
  roundInput: RoundInput;
};

export const test = base.extend<TestFixtures>({
  roundInput: async ({}, use) => {
    await use(createSampleRoundInput());
  },
});

export { expect };
