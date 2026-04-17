#!/bin/bash
set -euo pipefail

BASE_REF="${1:-origin/main}"

echo "[test-changed] Comparing against ${BASE_REF}"
CHANGED_FILES="$(git diff --name-only "${BASE_REF}"...HEAD)"

if echo "${CHANGED_FILES}" | grep -E '^(src/|tests/|playwright\.config\.ts|package\.json)' >/dev/null 2>&1; then
  echo "[test-changed] Relevant files changed; running E2E tests"
  npm run test:e2e
else
  echo "[test-changed] No relevant app/test changes; skipping E2E run"
fi
