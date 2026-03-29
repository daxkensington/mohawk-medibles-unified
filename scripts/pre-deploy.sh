#!/usr/bin/env bash
# ═══════════════════════════════════════════════════════════════
# OMMAE Production Deployment Gate
# Spec → Build → Lint → Security → Eval → Deploy
# Nothing reaches production without passing ALL gates.
# ═══════════════════════════════════════════════════════════════
set -euo pipefail

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
NC='\033[0m'
BOLD='\033[1m'

PASS="✅"
FAIL="❌"
WARN="⚠️"
GATE_FAILURES=0
RESULTS_FILE="deploy-gate-results.tsv"

log() { echo -e "${CYAN}[GATE]${NC} $1"; }
pass() { echo -e "  ${GREEN}${PASS} $1${NC}"; }
fail() { echo -e "  ${RED}${FAIL} $1${NC}"; GATE_FAILURES=$((GATE_FAILURES + 1)); }
warn() { echo -e "  ${YELLOW}${WARN} $1${NC}"; }

# Header
echo ""
echo -e "${BOLD}═══════════════════════════════════════════════════${NC}"
echo -e "${BOLD}  OMMAE Production Deployment Gate${NC}"
echo -e "${BOLD}  $(date '+%Y-%m-%d %H:%M:%S')${NC}"
echo -e "${BOLD}═══════════════════════════════════════════════════${NC}"
echo ""

# Init results log
echo -e "gate\tstatus\tduration_ms\tdetails" > "$RESULTS_FILE"
log_result() {
    echo -e "$1\t$2\t$3\t$4" >> "$RESULTS_FILE"
}

# ── GATE 1: Git Status (no uncommitted changes) ──────────────
log "Gate 1/7: Git Status"
START=$(date +%s%3N)
if [ -n "$(git status --porcelain)" ]; then
    fail "Uncommitted changes detected — commit or stash before deploying"
    git status --short | head -10
    log_result "git-status" "FAIL" "$(($(date +%s%3N) - START))" "uncommitted changes"
else
    pass "Working tree clean"
    log_result "git-status" "PASS" "$(($(date +%s%3N) - START))" "clean"
fi
echo ""

# ── GATE 2: Environment Variables ─────────────────────────────
log "Gate 2/7: Critical Environment Variables"
START=$(date +%s%3N)
REQUIRED_VARS=(
    "DATABASE_URL"
    "AUTH_SECRET"
    "CRON_SECRET"
    "WC_STORE_URL"
    "WC_CONSUMER_KEY"
    "WC_CONSUMER_SECRET"
)
ENV_MISSING=0

# Check production env vars via Vercel
for var in "${REQUIRED_VARS[@]}"; do
    if vercel env ls 2>/dev/null | grep -q "$var.*Production"; then
        pass "$var — set in Production"
    else
        fail "$var — MISSING from Production environment"
        ENV_MISSING=$((ENV_MISSING + 1))
    fi
done

if [ "$ENV_MISSING" -eq 0 ]; then
    log_result "env-vars" "PASS" "$(($(date +%s%3N) - START))" "all ${#REQUIRED_VARS[@]} vars present"
else
    log_result "env-vars" "FAIL" "$(($(date +%s%3N) - START))" "$ENV_MISSING vars missing"
fi
echo ""

# ── GATE 3: TypeScript Build ─────────────────────────────────
log "Gate 3/7: TypeScript Build (next build)"
START=$(date +%s%3N)
BUILD_OUTPUT=$(npx next build 2>&1)
BUILD_EXIT=$?

if [ $BUILD_EXIT -eq 0 ]; then
    PAGE_COUNT=$(echo "$BUILD_OUTPUT" | grep -c "├\|└" || true)
    pass "Build succeeded — ${PAGE_COUNT} routes compiled"
    log_result "build" "PASS" "$(($(date +%s%3N) - START))" "${PAGE_COUNT} routes"
else
    fail "Build FAILED"
    echo "$BUILD_OUTPUT" | tail -20
    log_result "build" "FAIL" "$(($(date +%s%3N) - START))" "build error"
fi
echo ""

# ── GATE 4: Lint Check ───────────────────────────────────────
log "Gate 4/7: Lint Check"
START=$(date +%s%3N)
LINT_OUTPUT=$(npx eslint --quiet . 2>&1 || true)
LINT_ERRORS=$(echo "$LINT_OUTPUT" | grep -c "error" || true)

if [ "$LINT_ERRORS" -eq 0 ]; then
    pass "No lint errors"
    log_result "lint" "PASS" "$(($(date +%s%3N) - START))" "0 errors"
else
    warn "Lint: $LINT_ERRORS errors (non-blocking)"
    log_result "lint" "WARN" "$(($(date +%s%3N) - START))" "$LINT_ERRORS errors"
fi
echo ""

# ── GATE 5: Security Checks ──────────────────────────────────
log "Gate 5/7: Security Checks"
START=$(date +%s%3N)
SEC_ISSUES=0

# Check for hardcoded secrets
HARDCODED=$(grep -rn "sk-\|sk_live\|AKIA\|ghp_\|gho_\|xoxb-\|xoxp-" --include="*.ts" --include="*.tsx" --include="*.js" app/ lib/ components/ server/ 2>/dev/null | grep -v node_modules | grep -v ".env" || true)
if [ -n "$HARDCODED" ]; then
    fail "Possible hardcoded secrets found:"
    echo "$HARDCODED" | head -5
    SEC_ISSUES=$((SEC_ISSUES + 1))
else
    pass "No hardcoded secrets detected"
fi

# Check AUTH_SECRET guard is in proxy.ts
if grep -q "AUTH_SECRET not configured" proxy.ts 2>/dev/null; then
    pass "AUTH_SECRET guard present in proxy.ts"
else
    fail "AUTH_SECRET guard MISSING from proxy.ts"
    SEC_ISSUES=$((SEC_ISSUES + 1))
fi

# Check .env files not in git
if git ls-files --cached | grep -q "\.env$\|\.env\.local\|\.env\.production"; then
    fail ".env file tracked by git!"
    SEC_ISSUES=$((SEC_ISSUES + 1))
else
    pass ".env files properly gitignored"
fi

# npm audit (high/critical only)
AUDIT_OUTPUT=$(npm audit --audit-level=high 2>&1 || true)
AUDIT_VULNS=$(echo "$AUDIT_OUTPUT" | grep -c "high\|critical" || true)
if [ "$AUDIT_VULNS" -gt 0 ]; then
    warn "npm audit: $AUDIT_VULNS high/critical vulnerabilities"
else
    pass "npm audit: no high/critical vulnerabilities"
fi

if [ "$SEC_ISSUES" -eq 0 ]; then
    log_result "security" "PASS" "$(($(date +%s%3N) - START))" "0 issues"
else
    log_result "security" "FAIL" "$(($(date +%s%3N) - START))" "$SEC_ISSUES issues"
fi
echo ""

# ── GATE 6: Broken Image/Asset Check ─────────────────────────
log "Gate 6/7: Asset Integrity"
START=$(date +%s%3N)
ASSET_ISSUES=0

# Check logo.png exists
if [ -f "public/logo.png" ]; then
    pass "public/logo.png exists"
else
    fail "public/logo.png MISSING (schema.org reference)"
    ASSET_ISSUES=$((ASSET_ISSUES + 1))
fi

# Check og-image.png exists
if [ -f "public/og-image.png" ]; then
    pass "public/og-image.png exists"
else
    fail "public/og-image.png MISSING (social share preview)"
    ASSET_ISSUES=$((ASSET_ISSUES + 1))
fi

# Check hero images
for hero in hero-deals-ounces.webp hero-flower-premium.webp hero-edibles-gummies.webp hero-concentrates-hash.webp; do
    if [ -f "public/assets/hero/$hero" ]; then
        pass "Hero: $hero"
    else
        fail "Hero MISSING: $hero"
        ASSET_ISSUES=$((ASSET_ISSUES + 1))
    fi
done

if [ "$ASSET_ISSUES" -eq 0 ]; then
    log_result "assets" "PASS" "$(($(date +%s%3N) - START))" "all assets present"
else
    log_result "assets" "FAIL" "$(($(date +%s%3N) - START))" "$ASSET_ISSUES missing"
fi
echo ""

# ── GATE 7: Deployment Diff Summary ──────────────────────────
log "Gate 7/7: Change Summary"
START=$(date +%s%3N)
COMMITS_AHEAD=$(git log origin/main..HEAD --oneline 2>/dev/null | wc -l | tr -d ' ')
FILES_CHANGED=$(git diff origin/main --name-only 2>/dev/null | wc -l | tr -d ' ')

if [ "$COMMITS_AHEAD" -gt 0 ]; then
    pass "$COMMITS_AHEAD commits ahead of origin/main"
    pass "$FILES_CHANGED files changed"
    echo ""
    echo -e "  ${CYAN}Recent commits:${NC}"
    git log origin/main..HEAD --oneline 2>/dev/null | head -10 | while read line; do
        echo "    $line"
    done
else
    pass "Up to date with origin/main"
fi
log_result "diff" "PASS" "$(($(date +%s%3N) - START))" "${COMMITS_AHEAD} commits, ${FILES_CHANGED} files"
echo ""

# ── VERDICT ───────────────────────────────────────────────────
echo -e "${BOLD}═══════════════════════════════════════════════════${NC}"
if [ "$GATE_FAILURES" -eq 0 ]; then
    echo -e "${GREEN}${BOLD}  ALL GATES PASSED — Safe to deploy to production${NC}"
    echo -e "${BOLD}═══════════════════════════════════════════════════${NC}"
    echo ""
    echo -e "  Run: ${CYAN}vercel --prod${NC}"
    echo ""
    cat "$RESULTS_FILE" | column -t -s $'\t'
    echo ""
    exit 0
else
    echo -e "${RED}${BOLD}  ${GATE_FAILURES} GATE(S) FAILED — DO NOT DEPLOY${NC}"
    echo -e "${BOLD}═══════════════════════════════════════════════════${NC}"
    echo ""
    echo "  Fix the failures above before deploying."
    echo ""
    cat "$RESULTS_FILE" | column -t -s $'\t'
    echo ""
    exit 1
fi
