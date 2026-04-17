# Test Framework Guide

This project uses Playwright for end-to-end browser automation.

## Setup

1. Install dependencies:
   - `npm install`
2. Install browser binaries:
   - `npx playwright install chromium firefox webkit`
3. Copy environment values as needed:
   - `.env.example` -> `.env.local` (optional)

## Running Tests

- Headless all browsers:
  - `npm run test:e2e`
- Headed mode:
  - `npm run test:e2e:headed`
- Interactive UI runner:
  - `npm run test:e2e:ui`
- Open last HTML report:
  - `npm run test:e2e:report`

## Test Architecture

- `tests/e2e/`
  - end-to-end specs (Given/When/Then naming style)
- `tests/support/fixtures/`
  - typed fixture composition and sample data factories
- `tests/support/helpers/`
  - reusable helpers for env and network behavior

## Best Practices

- Prefer `data-testid` selectors for stable targeting.
- Keep each test isolated and deterministic.
- Use fixture factories instead of hardcoded values.
- Fail fast on validation errors for input-driven flows.
- Keep core formula verification in unit tests and reserve E2E for user journeys.

## CI Notes

- `playwright.config.ts` is configured for:
  - trace on failure
  - screenshot/video on failure
  - HTML + JUnit reporting
  - web server bootstrapping via Vite
- Default PR strategy: run the full functional suite while runtime remains under ~15 minutes.

## Troubleshooting

- If browsers are missing, run `npx playwright install`.
- If tests fail to connect, verify `BASE_URL` matches the running dev server.
- If flaky failures appear, inspect traces with `npx playwright show-trace <trace.zip>`.
- If port conflicts happen, stop local dev servers and rerun tests.

## Notes

- `@seontechnologies/playwright-utils` could not be installed in this Windows environment due to a Unix-style post-install script in that package.
- Current scaffold uses native Playwright fixtures and helpers; utility package integration can be revisited later.

## References

- `resources/knowledge/risk-governance.md`
- `resources/knowledge/probability-impact.md`
- `resources/knowledge/test-levels-framework.md`
- `resources/knowledge/test-priorities-matrix.md`
- `resources/knowledge/playwright-cli.md`
