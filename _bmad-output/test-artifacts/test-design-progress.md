---
workflowStatus: 'completed'
totalSteps: 5
stepsCompleted: ['step-01-detect-mode', 'step-02-load-context', 'step-03-risk-and-testability', 'step-04-coverage-plan', 'step-05-generate-output']
lastStep: 'step-05-generate-output'
nextStep: ''
lastSaved: '2026-04-17'
mode: 'epic-level'
inputDocuments:
  - '_bmad/tea/config.yaml'
  - 'golfexpectations/package.json'
  - '.cursor/skills/bmad-testarch-test-design/resources/tea-index.csv'
  - '.cursor/skills/bmad-testarch-test-design/resources/knowledge/risk-governance.md'
  - '.cursor/skills/bmad-testarch-test-design/resources/knowledge/probability-impact.md'
  - '.cursor/skills/bmad-testarch-test-design/resources/knowledge/test-levels-framework.md'
  - '.cursor/skills/bmad-testarch-test-design/resources/knowledge/test-priorities-matrix.md'
  - '.cursor/skills/bmad-testarch-test-design/resources/knowledge/playwright-cli.md'
---

## Step 1 - Detect Mode and Prerequisites

- Mode selected: **Epic-level test design**
- Reason: user requested MVP-targeted plan before code exists.
- Prerequisite status:
  - Epic/story docs: not yet formalized as files.
  - Acceptance criteria: available from user session decisions in chat.
  - Architecture context: minimal but sufficient (React + Vite app scaffold present).
- Proceeding assumption: use validated MVP scope from brainstorming as the epic requirement set.

## Step 2 - Load Context and Knowledge Base

### Configuration Loaded

- `test_artifacts`: `{project-root}/_bmad-output/test-artifacts`
- `tea_use_playwright_utils`: `true`
- `tea_use_pactjs_utils`: `false`
- `tea_pact_mcp`: `none`
- `tea_browser_automation`: `auto`
- `test_stack_type`: `auto`

### Stack Detection

- Detected project app at `golfexpectations/` with React + Vite + TypeScript dependencies.
- Inferred stack: **frontend**.

### Artifact Discovery (Epic-Level)

- Existing test suite in app source: **none found**.
- Existing Playwright/Cypress config: **none found**.
- Existing domain docs for epic/story: **none as files**; using session-defined MVP requirements.
- Existing prior system-level test-design outputs: **none found**.

### Knowledge Fragments Loaded (Required for Epic-Level)

- `risk-governance.md`
- `probability-impact.md`
- `test-levels-framework.md`
- `test-priorities-matrix.md`
- `playwright-cli.md` (loaded because browser automation mode is `auto`)

### Context Summary

- This is a pre-code MVP planning stage.
- Test design will emphasize:
  - unit-level validation for scoring logic,
  - integration-level validation for data mapping/validation boundaries,
  - lightweight E2E coverage definition for critical user journey once UI exists.

## Step 3 - Testability and Risk Assessment

### Testability Assessment (Epic-Level Pre-Code)

**Current evidence**
- React + Vite + TypeScript scaffold exists.
- No test framework configured yet (no unit/integration/E2E harness present).
- MVP requirements are defined from brainstorming outcomes, not yet codified in requirement files.

**Testability posture**
- **Controllability:** Medium (input-driven domain is controllable, but no fixture/factory patterns yet).
- **Observability:** Low-Medium (no telemetry/assertion helpers defined yet; UI assertions not yet instrumented).
- **Reliability:** Low-Medium (no baseline test isolation, deterministic test data, or CI strategy yet).

### Risk Matrix (P x I)

| ID | Category | Risk | P | I | Score | Priority | Mitigation | Owner | Timeline |
|---|---|---|---:|---:|---:|---|---|---|---|
| R1 | BUS | Scoring model produces misleading expected values due to incorrect formula composition (handicap/slope/rank/par/distance/bogey) | 3 | 3 | 9 | P0 | Define formula specification and golden examples; add unit tests with known expected outputs before UI integration | App developer | Before MVP build complete |
| R2 | DATA | Manual scorecard input mapping errors (hole rank mis-entry/duplication, swapped columns) cause invalid outputs | 3 | 2 | 6 | P1 | Strong schema validation; enforce rank uniqueness (1-18), value bounds, and row-level errors with corrective UX | App developer | Early MVP |
| R3 | TECH | Rounding/range rules are inconsistent across per-hole and totals views | 2 | 3 | 6 | P1 | Single shared formatting/rounding module; contract tests on output serialization | App developer | Early MVP |
| R4 | BUS | Tee-only UX becomes ambiguous when source data has duplicate tee labels (e.g., same tee name variants) | 2 | 2 | 4 | P2 | Internal canonical tee IDs with user-friendly display labels and disambiguation hinting | App developer | Early MVP |
| R5 | OPS | No baseline automated test pipeline leads to regressions as scoring logic evolves | 2 | 3 | 6 | P1 | Add minimal CI checks: lint + unit + smoke integration; block merge on failures | App developer | Before first feature expansion |
| R6 | SEC | Future external data ingestion (GHIN/USGA/OCR uploads) introduces abuse or parsing risks if not sandboxed | 2 | 2 | 4 | P2 | Establish adapter boundary now; require schema validation and safe parsing policies for post-MVP inputs | App developer | Design now, implement post-MVP |
| R7 | PERF | Bulk recalculation or repeated edits creates sluggish UI on hole-table interactions | 2 | 2 | 4 | P2 | Keep calculation pure and O(18); memoize derived summaries and profile before release | App developer | Mid MVP |

### High-Risk Findings (Score >= 6)

- **R1 (9, BLOCK):** formula correctness is the primary release blocker.
- **R2 (6, MITIGATE):** input integrity must be guarded to prevent garbage-in outputs.
- **R3 (6, MITIGATE):** output consistency rules must be centralized.
- **R5 (6, MITIGATE):** lack of automated regression gates increases defect risk.

### Mitigation Priority Summary

1. Lock formula contract + golden-test suite first (R1).
2. Add strict input validation and rank integrity checks (R2).
3. Implement shared result formatting/rounding contract (R3).
4. Stand up basic test automation gate before growth phases (R5).

## Step 4 - Coverage Plan and Execution Strategy

### Coverage Matrix

| Scenario ID | Requirement / Risk Link | Atomic Test Scenario | Test Level | Priority | Notes |
|---|---|---|---|---|---|
| GE-MVP-001 | R1 | `calculateExpectedScores()` computes expected decimal per hole for known golden dataset | Unit | P0 | Core formula correctness |
| GE-MVP-002 | R1 | Integer score rounding and displayed range follow single deterministic ruleset | Unit | P0 | Prevent output drift |
| GE-MVP-003 | R1, R3 | Front/back/total rollups equal sum of per-hole outputs | Unit | P0 | Financial-style aggregation integrity |
| GE-MVP-004 | R2 | Hole handicap ranks must be unique and complete (1-18) | Unit | P0 | Validation gate before calc |
| GE-MVP-005 | R2 | Field bounds validation (par, yards, slope, ratings, handicap index) with explicit error messages | Component | P1 | Form-level user feedback |
| GE-MVP-006 | R4 | Tee selection maps to canonical tee ID even with duplicate labels | Unit | P1 | Prevent ambiguous tee resolution |
| GE-MVP-007 | R3 | Results table renders decimal/int/range consistently per row | Component | P1 | UI presentation contract |
| GE-MVP-008 | R5 | End-to-end happy path: enter data -> calculate -> view per-hole + totals | E2E | P1 | One critical journey smoke |
| GE-MVP-009 | R2 | End-to-end invalid input path blocks calculation and highlights invalid cells/fields | E2E | P1 | Core negative flow |
| GE-MVP-010 | R5 | Local save/load restores latest session values accurately | Integration | P2 | MVP persistence reliability |
| GE-MVP-011 | R7 | Recalculate updates within acceptable UX threshold for 18-hole edits | Component | P2 | Basic responsiveness check |
| GE-MVP-012 | R6 | Adapter contract test: manual input payload converts to normalized calculation input | Integration | P2 | Future ingestion readiness |
| GE-MVP-013 | Roadmap | Placeholder tests for course-cache/GHIN/OCR adapters (contract stubs) | Unit | P3 | Deferred post-MVP |

### Execution Strategy

- **PR pipeline:** run all Unit + Component + Integration tests and a minimal E2E smoke subset (target under ~15 minutes).
- **Nightly:** run full E2E suite including expanded negative scenarios and performance checks.
- **Weekly:** run exploratory and roadmap-stub suites, scenario mutation checks, and regression trend reporting.

### Resource Estimates (Range)

- **P0:** ~12-18 hours
- **P1:** ~16-24 hours
- **P2:** ~8-14 hours
- **P3:** ~2-4 hours
- **Total:** ~38-60 hours of test design + initial implementation
- **Timeline:** ~1-2 weeks depending on parallel coding/testing cadence

### Quality Gates

- **P0 pass rate:** 100%
- **P1 pass rate:** >=95%
- **Risk gate:** all high-risk mitigations (R1/R2/R3/R5) complete before MVP release
- **Coverage target:** >=80% of identified P0/P1 scenarios automated before release

## Step 5 - Generate Output and Validation

### Output Generated

- `_bmad-output/test-artifacts/test-design-epic-1.md`

### Validation Summary

- Epic-level output path and template structure applied.
- Includes required sections:
  - risk assessment matrix,
  - coverage matrix with priorities,
  - execution strategy (PR/Nightly/Weekly),
  - interval-based resource estimates,
  - quality gate thresholds.
- Checklist-aligned constraints observed:
  - priority categories separated from execution timing,
  - risk IDs unique and scored with P x I,
  - high-risk mitigations, owners, and timelines included,
  - assumptions and out-of-scope items documented.

### Completion Notes

- Mode used: epic-level
- Epic number: 1
- Workflow status: completed
