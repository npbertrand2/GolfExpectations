#!/bin/bash
set -euo pipefail

ITERATIONS="${1:-10}"

echo "[burn-in] Running ${ITERATIONS} iterations"
for i in $(seq 1 "${ITERATIONS}"); do
  echo "[burn-in] Iteration ${i}/${ITERATIONS}"
  npm run test:e2e || exit 1
done

echo "[burn-in] Completed with no failures"
