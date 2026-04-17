---
storyId: "1"
storyKey: "epic-1-expected-score-mvp"
storyFile: "_bmad-output/test-artifacts/test-design-epic-1.md"
atddChecklistPath: "_bmad-output/test-artifacts/atdd-checklist-epic-1-expected-score-mvp.md"
generatedTestFiles:
  - "golfexpectations/tests/e2e/mvp-expected-score.atdd.spec.ts"
inputDocuments:
  - "_bmad-output/test-artifacts/test-design-epic-1.md"
  - "_bmad/tea/config.yaml"
  - "golfexpectations/playwright.config.ts"
stepsCompleted:
  - step-01-preflight-and-context
  - step-02-generation-mode
  - step-03-test-strategy
  - step-04-generate-tests
  - step-04c-aggregate
  - step-05-validate-and-complete
lastStep: step-05-validate-and-complete
lastSaved: "2026-04-17"
---

# ATDD Checklist — Epic 1 Expected Score MVP

## Step 1 — Preflight

- **Stack:** frontend (React + Vite + Playwright)
- **Framework:** `playwright.config.ts` present
- **Story source:** Test design Epic 1 (`test-design-epic-1.md`) as acceptance proxy
- **story_key:** `epic-1-expected-score-mvp`
- **Execution mode:** sequential (no subagent JSON temp files; scaffolds written directly)

## Step 2 — Generation mode

- **Mode:** AI generation (acceptance criteria clear; no recording required for scaffold phase)

## Step 3 — Test strategy

| Criterion | Level | Priority |
| --- | --- | --- |
| Full happy path: inputs → calculate → triple output + totals | E2E | P0 |
| Invalid duplicate HCP ranks blocks calculate | E2E | P1 |
| Pure scoring math + golden datasets | Unit (add Vitest in dev-story) | P0 |

**Red phase:** E2E scenarios use `test.skip()` until UI exists.

## Step 4 — Generated artifacts

- `golfexpectations/tests/e2e/mvp-expected-score.atdd.spec.ts` — skipped ATDD acceptance tests

**API red-phase:** N/A for current MVP (no HTTP API). Add when backend exists.

## Step 5 — Validation

- [x] New tests use `test.skip()` (TDD red phase)
- [x] Assertions describe expected behavior (no `expect(true).toBe(true)`)
- [x] Selector contract documented in spec file header
- [ ] Remove `test.skip` per slice when implementing (green phase)

## Next steps

1. **Implement** MVP screen + `calculateExpectedScores` (or dev-story workflow).
2. Remove `test.skip` on the scenario you are implementing; run `npm run test:e2e`.
3. Optional: add Vitest + `src/lib/scoring.test.ts` for golden unit tests per test design.

## Handoff

- **Next workflow:** implement feature (same chat or `dev-story` if using BMM).
- **After green:** `bmad-testarch-automate` to expand coverage.
