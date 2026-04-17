---
workflowStatus: 'completed'
totalSteps: 5
stepsCompleted: ['step-01-detect-mode', 'step-02-load-context', 'step-03-risk-and-testability', 'step-04-coverage-plan', 'step-05-generate-output']
lastStep: 'step-05-generate-output'
nextStep: ''
lastSaved: '2026-04-17'
---

# Test Design: Epic 1 - Golf Expected Score MVP

**Date:** 2026-04-17  
**Author:** Npber  
**Status:** Draft

---

## Executive Summary

**Scope:** Epic-level test design for MVP golf expected-score workflow.

**Risk Summary:**

- Total risks identified: 7
- High-priority risks (>=6): 4
- Critical categories: BUS, DATA, TECH, OPS

**Coverage Summary:**

- P0 scenarios: 4 (~12-18 hours)
- P1 scenarios: 5 (~16-24 hours)
- P2/P3 scenarios: 4 (~10-18 hours)
- **Total effort**: ~38-60 hours (~1-2 weeks)

---

## Not in Scope

| Item | Reasoning | Mitigation |
| --- | --- | --- |
| GHIN/USGA live integration | Deferred post-MVP due to access/licensing/availability risk | Adapter contract tests now; integration tests in later epic |
| OCR scorecard import | Deferred to later phase to avoid model and parsing complexity in MVP | Define normalized input contract now |
| Multi-user auth/profile | Not required for MVP value delivery | Local single-session persistence only |

---

## Risk Assessment

### High-Priority Risks (Score >=6)

| Risk ID | Category | Description | Probability | Impact | Score | Mitigation | Owner | Timeline |
| --- | --- | --- | ---: | ---: | ---: | --- | --- | --- |
| R-001 | BUS | Formula composition is wrong and expected score output becomes misleading | 3 | 3 | 9 | Lock formula contract + golden datasets + mandatory unit suite before UI release | App developer | Before MVP release |
| R-002 | DATA | Manual input mapping errors (rank duplicates/swapped values) produce invalid output | 3 | 2 | 6 | Schema validation, unique rank 1-18 enforcement, field-level error feedback | App developer | Early MVP |
| R-003 | TECH | Inconsistent rounding/range logic across hole rows and totals | 2 | 3 | 6 | Centralize rounding/range in one shared module + contract tests | App developer | Early MVP |
| R-004 | OPS | No automated test gate allows regressions as scoring logic evolves | 2 | 3 | 6 | PR test gate: lint + unit + component + E2E smoke | App developer | Before release candidate |

### Medium-Priority Risks (Score 3-4)

| Risk ID | Category | Description | Probability | Impact | Score | Mitigation | Owner |
| --- | --- | --- | ---: | ---: | ---: | --- | --- |
| R-005 | BUS | Tee-only UX ambiguity when tee names overlap across source datasets | 2 | 2 | 4 | Use canonical tee IDs with user-friendly labels | App developer |
| R-006 | PERF | Table-edit recalculation feels slow during repeated edits | 2 | 2 | 4 | Keep algorithm O(18), memoize summaries, profile update path | App developer |

### Low-Priority Risks (Score 1-2)

| Risk ID | Category | Description | Probability | Impact | Score | Action |
| --- | --- | --- | ---: | ---: | ---: | --- |
| R-007 | SEC | Future adapter misuse for external/ocr ingestion if guardrails are skipped | 1 | 2 | 2 | Document security constraints now; enforce in future epic |

### Risk Category Legend

- **TECH**: Technical/architecture behavior
- **SEC**: Security and abuse vectors
- **PERF**: Performance and responsiveness
- **DATA**: Data correctness and integrity
- **BUS**: Business/domain accuracy and usability
- **OPS**: Delivery and operational reliability

---

## Entry Criteria

- [ ] MVP requirements and assumptions confirmed (inputs/outputs/scope)
- [ ] Test framework selected and scaffolded in app project
- [ ] Golden sample datasets documented for scoring expectations
- [ ] Validation rules agreed (rank uniqueness, bounds, required fields)
- [ ] Local test environment reproducible

## Exit Criteria

- [ ] All P0 tests passing
- [ ] All P1 tests passing or explicitly triaged with owner/date
- [ ] No unmitigated high-priority risk without approved waiver
- [ ] Coverage across P0/P1 scenarios >=80%
- [ ] MVP calculation behavior matches golden dataset outputs

---

## Test Coverage Plan

**Note:** P0/P1/P2/P3 indicate risk and business priority, not direct schedule tiers.

### P0 (Critical)

**Criteria:** Blocks core calculation value + high risk + no workaround

| Test ID | Requirement | Test Level | Risk Link | Notes |
| --- | --- | --- | --- | --- |
| E1-UNIT-001 | Expected decimal per hole is correct for golden dataset | Unit | R-001 | Core contract |
| E1-UNIT-002 | Integer score and range formatting are deterministic | Unit | R-001, R-003 | Shared rounding module |
| E1-UNIT-003 | Front/back/total rollups equal per-hole sums | Unit | R-001, R-003 | Prevent aggregate drift |
| E1-UNIT-004 | Hole handicap ranks validated as unique 1-18 | Unit | R-002 | Block invalid calc |

### P1 (High)

**Criteria:** Important user journeys + medium/high risk

| Test ID | Requirement | Test Level | Risk Link | Notes |
| --- | --- | --- | --- | --- |
| E1-COMP-001 | Form validation surfaces clear field-level errors | Component | R-002 | UX trust |
| E1-COMP-002 | Results table displays decimal/int/range consistently | Component | R-003 | Presentation contract |
| E1-UNIT-005 | Tee label disambiguation maps to canonical tee identity | Unit | R-005 | Tee-only UX safety |
| E1-E2E-001 | Happy path: input data -> calculate -> render per-hole + totals | E2E | R-001, R-004 | Core MVP flow |
| E1-E2E-002 | Invalid data path blocks calculate and highlights issues | E2E | R-002 | Negative path |

### P2 (Medium)

**Criteria:** Secondary reliability and maintainability scenarios

| Test ID | Requirement | Test Level | Risk Link | Notes |
| --- | --- | --- | --- | --- |
| E1-INT-001 | Local save/load restores session data accurately | Integration | R-004 | Persistence stability |
| E1-COMP-003 | Recalculate latency stays acceptable during 18-hole edits | Component | R-006 | Responsiveness check |
| E1-INT-002 | Manual input payload maps to normalized adapter contract | Integration | R-007 | Future-ready boundary |

### P3 (Low)

**Criteria:** Future or exploratory checks

| Test ID | Requirement | Test Level | Notes |
| --- | --- | --- | --- |
| E1-UNIT-006 | Placeholder contract stubs for GHIN/cache/OCR adapters | Unit | Post-MVP guardrails |

---

## Execution Strategy

- **PR:** Run all Unit + Component + Integration tests, plus minimal E2E smoke (`E1-E2E-001`) if total runtime remains under ~15 minutes.
- **Nightly:** Run full E2E suite including negative paths and broader data variation tests.
- **Weekly:** Run exploratory/performance trend checks and roadmap-adapter contract probes.

Philosophy: run everything practical on PRs; defer only long-running or expensive suites.

---

## Resource Estimates

- **P0:** ~12-18 hours
- **P1:** ~16-24 hours
- **P2:** ~8-14 hours
- **P3:** ~2-4 hours
- **Total:** ~38-60 hours
- **Timeline:** ~1-2 weeks

Prerequisites:
- unit/component/e2e harness configured,
- golden dataset fixtures for formula assertions,
- local storage/session fixture helpers.

---

## Quality Gate Criteria

### Pass/Fail Thresholds

- **P0 pass rate:** 100%
- **P1 pass rate:** >=95%
- **P2/P3 pass rate:** best-effort informational
- **High-risk mitigation completion:** required for all score >=6 risks before release

### Coverage Targets

- **P0/P1 scenario coverage:** >=80%
- **Core scoring contract coverage:** 100% for golden datasets
- **Validation-rule coverage:** >=90% of defined invalid input classes

### Non-Negotiable Requirements

- [ ] R-001 is mitigated with passing golden tests
- [ ] No open score=9 risk
- [ ] Core happy path and invalid-input path E2E tests pass

---

## Mitigation Plans

### R-001: Formula correctness risk (Score 9)

**Mitigation Strategy:** define formula spec; produce at least 3 reference datasets; implement deterministic unit tests for each output dimension (decimal/int/range/totals).  
**Owner:** App developer  
**Timeline:** Before release candidate  
**Status:** Planned  
**Verification:** all P0 formula tests pass in PR gate

### R-002: Input integrity risk (Score 6)

**Mitigation Strategy:** schema-first validation with clear UX errors and calculation blocking on invalid input.  
**Owner:** App developer  
**Timeline:** Early MVP  
**Status:** Planned  
**Verification:** P1 validation component/E2E tests pass

### R-003: Output consistency risk (Score 6)

**Mitigation Strategy:** single shared formatter for rounding and ranges; unit coverage for edge boundaries.  
**Owner:** App developer  
**Timeline:** Early MVP  
**Status:** Planned  
**Verification:** no discrepancy between row and aggregate format outputs

### R-004: Regression gate risk (Score 6)

**Mitigation Strategy:** establish CI test stage before feature expansion.  
**Owner:** App developer  
**Timeline:** Before MVP release  
**Status:** Planned  
**Verification:** PR checks enforce required suites

---

## Assumptions and Dependencies

### Assumptions

1. MVP uses manual entry/import only (no live external data fetch).
2. Tee selection is sufficient for UX; no direct gender prompt in MVP.
3. Scoring outputs are informational planning aids, not official handicap calculations.

### Dependencies

1. Finalized formula specification from product/design decisions.
2. Stable sample scorecard datasets for deterministic expected-value assertions.

### Risks to Plan

- **Risk:** formula updates after tests are written  
  - **Impact:** frequent test churn and delayed release  
  - **Contingency:** version formula spec; adjust tests in single contract layer

---

## Interworking and Regression

| Service/Component | Impact | Regression Scope |
| --- | --- | --- |
| Scoring engine | Core value logic | P0 unit suite + aggregate checks |
| Input validation UI | Data quality controls | P1 component + invalid-path E2E |
| Results rendering | User trust in outputs | P1 component assertions |
| Session persistence | UX continuity | P2 integration checks |

---

## Appendix

### Knowledge Base References

- `risk-governance.md`
- `probability-impact.md`
- `test-levels-framework.md`
- `test-priorities-matrix.md`
- `playwright-cli.md`

### Related Documents

- Brainstorming output: `_bmad-output/brainstorming/brainstorming-session-2026-04-17-1530.md`
- Workflow progress: `_bmad-output/test-artifacts/test-design-progress.md`

---

**Generated by:** BMad TEA Test Architect  
**Workflow:** `bmad-testarch-test-design`  
**Epic:** 1
