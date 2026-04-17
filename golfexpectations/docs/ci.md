# CI Pipeline Guide

## Platform

- GitHub Actions
- Pipeline file: `.github/workflows/test.yml`

## Pipeline Stages

- `lint`: ESLint checks
- `test`: Playwright E2E sharded across 4 parallel jobs
- `burn-in`: 10-iteration flaky test detection loop (PR/scheduled runs)
- `quality-gates`: blocks pipeline if test or burn-in fails
- `report`: writes run summary and downloads artifacts

## Local CI Mirror

- Run `scripts/ci-local.sh` to mirror core CI behavior locally.
- Run `scripts/burn-in.sh 10` to execute burn-in loop manually.
- Run `scripts/test-changed.sh origin/main` for selective execution.

## Artifacts

On failures, CI uploads:

- `test-results/`
- `playwright-report/`

Retention is set to 30 days.

## Quality Gates

- P0 intent: all critical tests must pass (`test` stage must succeed)
- Burn-in gate: no flaky failures during burn-in loop
- P1 intent: maintain >=95% success trend for important scenarios (tracked in reports)

## Troubleshooting

- If browsers fail in CI, ensure `npx playwright install --with-deps ...` is present.
- If shard failures are inconsistent, inspect burn-in artifacts for flaky selectors/timing.
- If pipeline is slow, reduce browser matrix or tune shard count.

## Next Steps

- Configure GitHub repository secrets listed in `docs/ci-secrets-checklist.md`.
- Push branch and open PR to trigger first run.
- Tune shard count and burn-in iterations after observing real timings.
