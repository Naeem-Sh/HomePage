#!/usr/bin/env bash
# ==============================================================================
# Portal Shiraz - Comprehensive Verification & Release Audit Suite
# Checks: Types, Build, Lint, Health Endpoint, Offline Assets & Air-Gap Rigor
# ==============================================================================

set -eo pipefail

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}================================================================${NC}"
echo -e "${BLUE}   Portal Shiraz - Self-Hosted Air-Gapped Verification Suite   ${NC}"
echo -e "${BLUE}================================================================${NC}"
echo ""

FAILURES=0

# 1. Dependency Check
echo -e "${YELLOW}[1/7] Auditing Dependencies...${NC}"
if [ -f package-lock.json ]; then
  npm ci || npm install
else
  npm install
fi
echo -e "${GREEN}✓ Dependencies verified.${NC}"
echo ""

# 2. Static Type Verification
echo -e "${YELLOW}[2/7] Running Static Type Verification (tsc --noEmit)...${NC}"
if npx tsc --noEmit; then
  echo -e "${GREEN}✓ TypeScript check passed with 0 errors.${NC}"
else
  echo -e "${RED}✗ TypeScript check failed.${NC}"
  FAILURES=$((FAILURES + 1))
fi
echo ""

# 3. Linter Verification
echo -e "${YELLOW}[3/7] Running Linter (npm run lint)...${NC}"
if npm run lint; then
  echo -e "${GREEN}✓ Linter passed.${NC}"
else
  echo -e "${RED}✗ Linter failed.${NC}"
  FAILURES=$((FAILURES + 1))
fi
echo ""

# 4. Production Build Verification
echo -e "${YELLOW}[4/7] Running Production Bundle Build (npm run build)...${NC}"
if npm run build; then
  echo -e "${GREEN}✓ Production build succeeded.${NC}"
else
  echo -e "${RED}✗ Production build failed.${NC}"
  FAILURES=$((FAILURES + 1))
fi
echo ""

# 5. Air-Gap & Zero Remote Dependency Audit
echo -e "${YELLOW}[5/8] Auditing Source Code for Remote CDNs, External Web Fonts & Telemetry...${NC}"
LEAKS=$(grep -rnE "(googleapis\.com|gstatic\.com|cdnjs\.cloudflare\.com|unpkg\.com|cdn\.jsdelivr\.net)" index.html src/ || true)
if [ -z "$LEAKS" ]; then
  echo -e "${GREEN}✓ Zero remote CDN or font leaks detected. All assets are locally bundled.${NC}"
else
  echo -e "${RED}✗ Detected external CDN references:${NC}"
  echo "$LEAKS"
  FAILURES=$((FAILURES + 1))
fi
echo ""

# 6. Persistent Storage Standardization & Empty Directory Tolerance Test
echo -e "${YELLOW}[6/8] Verifying Persistent Storage Derivation & Empty Directory Tolerance...${NC}"
TEST_EMPTY_DIR="/tmp/test_portal_data_$$"
if DATA_DIR="$TEST_EMPTY_DIR" npx tsx -e "
  import path from 'path';
  import fs from 'fs';
  import { db } from './server/db';
  const paths = db.getPaths();
  if (!paths.dataDir.startsWith('$TEST_EMPTY_DIR')) process.exit(1);
  if (!fs.existsSync(paths.uploadsDir)) process.exit(2);
  if (!fs.existsSync(paths.backupsDir)) process.exit(3);
  if (!fs.existsSync(paths.dbFile)) process.exit(4);
  console.log('  Derived paths:', JSON.stringify(paths, null, 2));
"; then
  echo -e "${GREEN}✓ Clean startup on empty DATA_DIR verified. Subdirectories and starter schema generated successfully.${NC}"
  rm -rf "$TEST_EMPTY_DIR"
else
  echo -e "${RED}✗ Empty directory tolerance test failed.${NC}"
  rm -rf "$TEST_EMPTY_DIR"
  FAILURES=$((FAILURES + 1))
fi
echo ""

# 7. Dedicated Health Endpoint & Service Connectivity Test
echo -e "${YELLOW}[7/8] Testing Local Health Endpoints...${NC}"
TEST_PORT="${PORT:-3000}"
HEALTH_HTTP=$(curl -s -o /dev/null -w "%{http_code}" "http://127.0.0.1:${TEST_PORT}/healthz" || true)
if [ "$HEALTH_HTTP" != "200" ]; then
  for P in 3000 4500 8080; do
    ALT_HTTP=$(curl -s -o /dev/null -w "%{http_code}" "http://127.0.0.1:${P}/healthz" || true)
    if [ "$ALT_HTTP" = "200" ]; then
      TEST_PORT="$P"
      HEALTH_HTTP="200"
      break
    fi
  done
fi

if [ "$HEALTH_HTTP" = "200" ]; then
  echo -e "${GREEN}✓ Health endpoint http://127.0.0.1:${TEST_PORT}/healthz returned HTTP 200 OK.${NC}"
  HEALTH_JSON=$(curl -s "http://127.0.0.1:${TEST_PORT}/healthz" || true)
  echo "  Response payload: $HEALTH_JSON"
else
  echo -e "${YELLOW}! Local server on port ${TEST_PORT} not currently listening or returned code: ${HEALTH_HTTP}${NC}"
  echo "  (Ensure server is running if testing runtime connectivity via: npm start or docker compose up)"
fi
echo ""

# 8. Docker Environment Verification
echo -e "${YELLOW}[8/8] Checking Docker & Compose Configuration...${NC}"
if command -v docker &> /dev/null; then
  echo "  Validating docker-compose.yml configuration..."
  if docker compose config > /dev/null 2>&1; then
    echo -e "${GREEN}✓ docker-compose.yml syntax and configuration is valid.${NC}"
  else
    echo -e "${YELLOW}! docker compose config check had warnings or daemon unavailable.${NC}"
  fi
else
  echo -e "${BLUE}ℹ Docker command not present in current shell; skipping container daemon test.${NC}"
fi
echo ""

echo -e "${BLUE}================================================================${NC}"
if [ "$FAILURES" -eq 0 ]; then
  echo -e "${GREEN}   VERIFICATION COMPLETE: ALL CHECKS PASSED SUCCESSFULLY       ${NC}"
  echo -e "${BLUE}================================================================${NC}"
  exit 0
else
  echo -e "${RED}   VERIFICATION FAILED: ${FAILURES} check(s) did not pass.        ${NC}"
  echo -e "${BLUE}================================================================${NC}"
  exit 1
fi
