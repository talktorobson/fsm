#!/bin/bash
# E2E Tests for Staging Environment
# Run against: https://goexec.de/api/v1

# Don't exit on error - we track failures ourselves
set +e

BASE_URL="${BASE_URL:-https://goexec.de}"
API_URL="$BASE_URL/api/v1"
FAILED=0
PASSED=0

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

log_pass() { echo -e "${GREEN}✓${NC} $1"; ((PASSED++)); }
log_fail() { echo -e "${RED}✗${NC} $1"; ((FAILED++)); }
log_info() { echo -e "${YELLOW}→${NC} $1"; }

# =============================================================================
# API Health Tests
# =============================================================================

test_health() {
    log_info "Testing API health..."
    response=$(curl -sf "$API_URL/health" 2>/dev/null || echo "FAILED")
    if echo "$response" | grep -q '"status":"ok"'; then
        log_pass "API health check"
    else
        log_fail "API health check"
    fi
}

# =============================================================================
# Authentication Tests
# =============================================================================

test_login_operator() {
    log_info "Testing operator login..."
    response=$(curl -sf "$API_URL/auth/login" \
        -H "Content-Type: application/json" \
        -d '{"email":"operator.fr@adeo.com","password":"Admin123!"}' 2>/dev/null || echo "FAILED")
    
    if echo "$response" | grep -q '"accessToken"'; then
        log_pass "Operator login"
        # Export token for subsequent tests
        export AUTH_TOKEN=$(echo "$response" | jq -r '.data.accessToken')
    else
        log_fail "Operator login"
    fi
}

test_login_admin() {
    log_info "Testing admin login..."
    response=$(curl -sf "$API_URL/auth/login" \
        -H "Content-Type: application/json" \
        -d '{"email":"admin.fr@adeo.com","password":"Admin123!"}' 2>/dev/null || echo "FAILED")
    
    if echo "$response" | grep -q '"accessToken"'; then
        log_pass "Admin login"
    else
        log_fail "Admin login"
    fi
}

test_login_invalid() {
    log_info "Testing invalid login..."
    response=$(curl -s "$API_URL/auth/login" \
        -H "Content-Type: application/json" \
        -d '{"email":"invalid@test.com","password":"wrongpassword123"}' 2>/dev/null)
    
    if echo "$response" | grep -qE '"statusCode":\s*4[0-9][0-9]|Invalid|credentials'; then
        log_pass "Invalid login rejected"
    else
        log_fail "Invalid login rejected"
    fi
}

# =============================================================================
# Service Orders Tests (requires auth)
# =============================================================================

test_get_service_orders() {
    if [ -z "$AUTH_TOKEN" ]; then
        log_fail "Service orders (no auth token)"
        return
    fi
    
    log_info "Testing get service orders..."
    response=$(curl -sf "$API_URL/service-orders?take=5" \
        -H "Authorization: Bearer $AUTH_TOKEN" 2>/dev/null || echo "FAILED")
    
    if echo "$response" | grep -q '"data"'; then
        log_pass "Get service orders"
    else
        log_fail "Get service orders"
    fi
}

test_get_providers() {
    if [ -z "$AUTH_TOKEN" ]; then
        log_fail "Providers (no auth token)"
        return
    fi
    
    log_info "Testing get providers..."
    response=$(curl -sf "$API_URL/providers" \
        -H "Authorization: Bearer $AUTH_TOKEN" 2>/dev/null || echo "FAILED")
    
    if echo "$response" | grep -q '"data"'; then
        log_pass "Get providers"
    else
        log_fail "Get providers"
    fi
}

# =============================================================================
# Web App Tests
# =============================================================================

test_web_app() {
    log_info "Testing web app..."
    response=$(curl -sf "$BASE_URL" 2>/dev/null || echo "FAILED")
    
    if echo "$response" | grep -qE '<div id="root"|<!DOCTYPE html>'; then
        log_pass "Web app loads"
    else
        log_fail "Web app loads"
    fi
}

test_mobile_app() {
    log_info "Testing mobile app..."
    response=$(curl -sf "$BASE_URL/mobile/" 2>/dev/null || echo "FAILED")
    
    if echo "$response" | grep -qE 'expo|<!DOCTYPE html>'; then
        log_pass "Mobile app loads"
    else
        log_fail "Mobile app loads"
    fi
}

# =============================================================================
# Run All Tests
# =============================================================================

echo ""
echo "=========================================="
echo "  Yellow Grid E2E Tests"
echo "  Target: $BASE_URL"
echo "=========================================="
echo ""

# Health
test_health

# Auth
test_login_operator
test_login_admin
test_login_invalid

# API (with auth)
test_get_service_orders
test_get_providers

# Web
test_web_app
test_mobile_app

echo ""
echo "=========================================="
echo "  Results: $PASSED passed, $FAILED failed"
echo "=========================================="
echo ""

if [ $FAILED -gt 0 ]; then
    exit 1
fi
