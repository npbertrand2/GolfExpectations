#!/bin/bash
set -euo pipefail

echo "[ci-local] Installing dependencies"
npm ci

echo "[ci-local] Linting"
npm run lint

echo "[ci-local] Installing Playwright browsers"
npx playwright install chromium firefox webkit

echo "[ci-local] Running full E2E suite"
npm run test:e2e
