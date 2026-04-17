---
stepsCompleted: [1, 2, 3, 4]
inputDocuments: []
session_topic: 'Build a React + Vite website to estimate expected golf score per hole.'
session_goals: 'Define MVP UI flow, MVP feature list, and clear next implementation steps.'
selected_approach: 'ai-recommended'
techniques_used: ['first-principles-thinking', 'constraint-mapping', 'decision-tree-mapping']
ideas_generated:
  - 'Use scorecard-native inputs (handicap, slope, hole rank, par, distance).'
  - 'Output expected strokes (decimal), integer score, and range per hole.'
  - 'Include front/back/total expected rollups in MVP.'
  - 'Use tee-only input (no direct gender prompt).'
  - 'Include bogey rating in model inputs.'
  - 'MVP data ingestion is manual entry/import only.'
  - 'Post-MVP phase for cached/preloaded courses.'
  - 'Post-MVP phase for GHIN/USGA integration (subject to terms/access).'
  - 'Future OCR/photo scorecard import with human review step.'
context_file: ''
session_active: false
workflow_completed: true
---

# Brainstorming Session Results

**Facilitator:** Npber  
**Date:** 2026-04-17

## Session Overview

**Topic:** Build a React + Vite app that estimates a golfer's expected score per hole.  
**Goals:** Produce a practical MVP UI flow, prioritized feature list, and a phased roadmap.

## Technique Selection

**Approach:** AI-Recommended Techniques  
**Analysis Context:** Golf scoring product with near-term MVP focus and future external-data integration goals.

**Recommended/Used Techniques:**

- **First Principles Thinking:** Define minimum required inputs and outputs independent of data source.
- **Constraint Mapping:** Separate MVP-safe choices from higher-risk external integration dependencies.
- **Decision Tree Mapping:** Sequence implementation from MVP to phased enhancements.

## Technique Execution Results

### Key Decisions Captured

**[Category #1]: Scorecard-Native Model**
_Concept_: The MVP model uses inputs commonly found on scorecards and rating sheets: golfer handicap index, slope rating, hole handicap rank (1-18), hole par, and hole distance. Course/tee metadata also includes course rating and bogey rating where available.  
_Novelty_: Keeps v1 data collection practical while preserving room for stronger calibration later.

**[Category #2]: Transparent Results Contract**
_Concept_: Per hole, return all three outputs: expected strokes (decimal), expected integer score (rounded), and expected range. Also provide front-9, back-9, and 18-hole totals.  
_Novelty_: Combines interpretability (range + decimal) with usability (integer target).

**[Category #3]: Tee-Only UX**
_Concept_: Do not ask user gender directly; ask which tee is being played and use the tee's ratings. For duplicate tee names in imported data, use internal unique labels while presenting clear options.  
_Novelty_: Reduces friction while preserving data fidelity.

**[Category #4]: MVP Data Boundary**
_Concept_: MVP starts with manual data entry/import from scorecard/rating table only. External data retrieval is deferred.  
_Novelty_: Avoids integration risk while delivering core value quickly.

**[Category #5]: Phased Data Expansion**
_Concept_: Phase 2 adds cached/preloaded courses. Phase 3 adds GHIN/USGA integration if access and terms allow.  
_Novelty_: Builds extensibility without coupling MVP to uncertain dependencies.

**[Category #6]: Photo Import Future Path**
_Concept_: Phase 4 adds scorecard photo upload and OCR extraction, followed by required user review/edit before save.  
_Novelty_: High-utility automation with quality safeguard.

## Idea Organization and Prioritization

### Theme 1: Core Product Experience

- Simple setup with handicap + tee/course fields
- 18-hole input table for par, distance, handicap rank
- Immediate per-hole and aggregate expected scoring results

### Theme 2: Calculation and Trust

- Include course rating, bogey rating, and slope in the model context
- Show decimal + integer + range outputs for transparency
- Add validation for rank uniqueness and sane value bounds

### Theme 3: Data Strategy and Scalability

- Manual-first ingestion for MVP
- Adapter-based architecture for future external data sources
- OCR import as later ingestion channel

## MVP UI Flow

1. **Setup:** Enter handicap index and select tee.  
2. **Course Inputs:** Enter tee metadata (par, course rating, bogey rating, slope).  
3. **Hole Data:** Enter 18-hole par, yards, and handicap rank.  
4. **Results:** Show per-hole expected decimal/integer/range and front/back/total rollups.  
5. **Scenario Adjust:** Change handicap or tee values and recalculate instantly.

## MVP Feature List (Prioritized)

### Must Have

- Handicapping and tee/course input forms
- 18-hole table input editor
- Pure scoring engine with deterministic outputs
- Per-hole triple-output display (decimal/integer/range)
- Front/back/total aggregate summaries
- Validation rules for required fields and rank integrity

### Should Have

- Save/load one local session via local storage
- Paste-friendly table input assistance

### Post-MVP

- Course cache/library
- GHIN/USGA data adapter (license/terms compliant)
- Photo scorecard OCR import + review workflow

## Action Plan

1. **Define TypeScript contracts** for golfer input, tee/course data, hole rows, and result rows.  
2. **Implement `calculateExpectedScores()`** as a pure function and add unit tests.  
3. **Build input screens** (setup + course + holes) with validation.  
4. **Build result screen** with per-hole outputs and totals.  
5. **Add local persistence** for one saved session.  
6. **Create data adapter interface** for future cached/API/OCR ingestion paths.

## Session Summary and Next Steps

This session produced a clear MVP boundary and a phased expansion plan. The strongest outcome is the manual-first, tee-focused product scope that is useful immediately and technically ready for future data integrations.

**Recommended next skill/agent:** move to product definition so implementation has stable requirements.
- Suggested: **Create PRD** (`bmad-create-prd`) if installed in your project.
- If that skill is not installed in this module set, proceed directly to implementation with:
  - a short local spec doc in your repo, then
  - development agent/task for React + Vite scaffolding and scoring engine.
