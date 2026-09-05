#!/bin/bash

# ============================================================
# ALE KIRCHA - COMPLETE SYSTEM TEST
# ============================================================

echo ""
echo "╔══════════════════════════════════════════════════════════════╗"
echo "║                                                              ║"
echo "║           🧪 ALE KIRCHA - COMPLETE SYSTEM TEST              ║"
echo "║           አለ ቅርጫ - ሙሉ ስርዓት ሙከራ                        ║"
echo "║                                                              ║"
echo "╚══════════════════════════════════════════════════════════════╝"
echo ""

# ============================================================
# COLORS
# ============================================================

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

PASS=0
FAIL=0
SKIP=0

# ============================================================
# TEST FUNCTION
# ============================================================

test_service() {
    local name=$1
    local url=$2
    local expected=$3
    
    echo -n "  Testing $name... "
    
    if [ -z "$url" ]; then
        echo -e "${YELLOW}SKIPPED${NC} (no URL)"
        ((SKIP++))
        return
    fi
    
    local response=$(curl -s -o /dev/null -w "%{http_code}" $url 2>/dev/null)
    
    if [ "$response" = "$expected" ]; then
        echo -e "${GREEN}PASS${NC} (HTTP $response)"
        ((PASS++))
        return 0
    else
        echo -e "${RED}FAIL${NC} (HTTP $response, expected $expected)"
        ((FAIL++))
        return 1
    fi
}

test_db_query() {
    local name=$1
    local query=$2
    local expected=$3
    
    echo -n "  Testing $name... "
    
    local result=$(psql -d ale_kircha -t -c "$query" 2>/dev/null | tr -d ' ')
    
    if [ "$result" = "$expected" ]; then
        echo -e "${GREEN}PASS${NC} ($result)"
        ((PASS++))
        return 0
    else
        echo -e "${RED}FAIL${NC} (expected $expected, got $result)"
        ((FAIL++))
        return 1
    fi
}

test_api_endpoint() {
    local name=$1
    local method=$2
    local url=$3
    local data=$4
    local expected_field=$5
    
    echo -n "  Testing $name... "
    
    if [ -z "$data" ]; then
        response=$(curl -s -X $method "$url" 2>/dev/null)
    else
        response=$(curl -s -X $method "$url" -H "Content-Type: application/json" -d "$data" 2>/dev/null)
    fi
    
    if echo "$response" | grep -q "$expected_field"; then
        echo -e "${GREEN}PASS${NC}"
        ((PASS++))
        return 0
    else
        echo -e "${RED}FAIL${NC}"
        echo "    Response: ${response:0:100}..."
        ((FAIL++))
        return 1
    fi
}

# ============================================================
# SECTION 1: DATABASE TESTS
# ============================================================

echo -e "${PURPLE}╔══════════════════════════════════════════════════════════════╗${NC}"
echo -e "${PURPLE}║                   1. DATABASE TESTS                         ║${NC}"
echo -e "${PURPLE}╚══════════════════════════════════════════════════════════════╝${NC}"
echo ""

# Test PostgreSQL connection
echo -n "  Testing PostgreSQL connection... "
if pg_ctl -D $PREFIX/var/lib/postgresql status &> /dev/null; then
    echo -e "${GREEN}PASS${NC}"
    ((PASS++))
else
    echo -e "${RED}FAIL${NC} (PostgreSQL not running)"
    ((FAIL++))
fi

# Test database exists
echo -n "  Testing database exists... "
if psql -lqt | cut -d \| -f 1 | grep -qw ale_kircha; then
    echo -e "${GREEN}PASS${NC}"
    ((PASS++))
else
    echo -e "${RED}FAIL${NC} (database not found)"
    ((FAIL++))
fi

# Test tables count
echo -n "  Testing tables count (expected >= 30)... "
TABLES=$(psql -d ale_kircha -t -c "SELECT COUNT(*) FROM information_schema.tables WHERE table_schema='public';" 2>/dev/null | tr -d ' ')
if [ "$TABLES" -ge 30 ] 2>/dev/null; then
    echo -e "${GREEN}PASS${NC} ($TABLES tables)"
    ((PASS++))
else
    echo -e "${RED}FAIL${NC} ($TABLES tables, expected >= 30)"
    ((FAIL++))
fi

# Test User table exists
test_db_query "User table exists" "SELECT COUNT(*) FROM information_schema.tables WHERE table_name='User';" "1"

# Test Customer table exists
test_db_query "Customer table exists" "SELECT COUNT(*) FROM information_schema.tables WHERE table_name='Customer';" "1"

# Test Order table exists
test_db_query "Order table exists" "SELECT COUNT(*) FROM information_schema.tables WHERE table_name='Order';" "1"

# Test Payment table exists
test_db_query "Payment table exists" "SELECT COUNT(*) FROM information_schema.tables WHERE table_name='Payment';" "1"

# Test RefundRequest table exists
test_db_query "RefundRequest table exists" "SELECT COUNT(*) FROM information_schema.tables WHERE table_name='RefundRequest';" "1"

echo ""
echo -e "  ${CYAN}📊 Users in DB: $(psql -d ale_kircha -t -c "SELECT COUNT(*) FROM \"User\";" 2>/dev/null | tr -d ' ')${NC}"
echo -e "  ${CYAN}👤 Customers in DB: $(psql -d ale_kircha -t -c "SELECT COUNT(*) FROM \"Customer\";" 2>/dev/null | tr -d ' ')${NC}"
echo -e "  ${CYAN}📦 Orders in DB: $(psql -d ale_kircha -t -c "SELECT COUNT(*) FROM \"Order\";" 2>/dev/null | tr -d ' ')${NC}"
echo ""

# ============================================================
# SECTION 2: API TESTS
# ============================================================

echo -e "${PURPLE}╔══════════════════════════════════════════════════════════════╗${NC}"
echo -e "${PURPLE}║                   2. API TESTS                              ║${NC}"
echo -e "${PURPLE}╚══════════════════════════════════════════════════════════════╝${NC}"
echo ""

# Test health endpoint
test_service "API Health Check" "http://localhost:4000/health" "200"

# Test API version endpoint
test_service "API Version" "http://localhost:4000/api/v1/health" "200"

# Test admin stats endpoint
test_service "Admin Stats" "http://localhost:4000/api/v1/admin/stats" "200"

# Test customer registration endpoint
test_api_endpoint "Customer Registration" "POST" \
    "http://localhost:4000/api/v1/customers/register" \
    '{"telegramId":"999999999","phoneNumber":"+251911111111","firstName":"TestAPI","lastName":"UserAPI"}' \
    "success"

# Test debug users endpoint
test_service "Debug Users" "http://localhost:4000/api/v1/debug/users" "200"

echo ""

# ============================================================
# SECTION 3: BOT TESTS
# ============================================================

echo -e "${PURPLE}╔══════════════════════════════════════════════════════════════╗${NC}"
echo -e "${PURPLE}║                   3. BOT TESTS                             ║${NC}"
echo -e "${PURPLE}╚══════════════════════════════════════════════════════════════╝${NC}"
echo ""

# Test Customer Bot
test_service "Customer Bot Health" "http://localhost:10001/health" "200"

# Test Admin Bot
test_service "Admin Bot Health" "http://localhost:10002/health" "200"

echo ""

# ============================================================
# SECTION 4: PROCESS TESTS
# ============================================================

echo -e "${PURPLE}╔══════════════════════════════════════════════════════════════╗${NC}"
echo -e "${PURPLE}║                   4. PROCESS TESTS                          ║${NC}"
echo -e "${PURPLE}╚══════════════════════════════════════════════════════════════╝${NC}"
echo ""

# Check API process
echo -n "  Testing API process running... "
if ps aux | grep -v grep | grep -q "tsx.*server-pg"; then
    echo -e "${GREEN}PASS${NC}"
    ((PASS++))
else
    echo -e "${RED}FAIL${NC} (API process not found)"
    ((FAIL++))
fi

# Check Customer Bot process
echo -n "  Testing Customer Bot process running... "
if ps aux | grep -v grep | grep -q "tsx.*src/bot.ts"; then
    echo -e "${GREEN}PASS${NC}"
    ((PASS++))
else
    echo -e "${RED}FAIL${NC} (Customer Bot process not found)"
    ((FAIL++))
fi

# Check Admin Bot process
echo -n "  Testing Admin Bot process running... "
if ps aux | grep -v grep | grep -q "tsx.*src/bot.ts"; then
    echo -e "${GREEN}PASS${NC}"
    ((PASS++))
else
    echo -e "${RED}FAIL${NC} (Admin Bot process not found)"
    ((FAIL++))
fi

# Check PostgreSQL process
echo -n "  Testing PostgreSQL process running... "
if ps aux | grep -v grep | grep -q "postgres"; then
    echo -e "${GREEN}PASS${NC}"
    ((PASS++))
else
    echo -e "${RED}FAIL${NC} (PostgreSQL process not found)"
    ((FAIL++))
fi

echo ""

# ============================================================
# SECTION 5: PORT TESTS
# ============================================================

echo -e "${PURPLE}╔══════════════════════════════════════════════════════════════╗${NC}"
echo -e "${PURPLE}║                   5. PORT TESTS                             ║${NC}"
echo -e "${PURPLE}╚══════════════════════════════════════════════════════════════╝${NC}"
echo ""

echo -n "  Testing port 4000 (API)... "
if netstat -tln 2>/dev/null | grep -q ":4000"; then
    echo -e "${GREEN}PASS${NC}"
    ((PASS++))
else
    echo -e "${RED}FAIL${NC} (port 4000 not listening)"
    ((FAIL++))
fi

echo -n "  Testing port 10001 (Customer Bot)... "
if netstat -tln 2>/dev/null | grep -q ":10001"; then
    echo -e "${GREEN}PASS${NC}"
    ((PASS++))
else
    echo -e "${RED}FAIL${NC} (port 10001 not listening)"
    ((FAIL++))
fi

echo -n "  Testing port 10002 (Admin Bot)... "
if netstat -tln 2>/dev/null | grep -q ":10002"; then
    echo -e "${GREEN}PASS${NC}"
    ((PASS++))
else
    echo -e "${RED}FAIL${NC} (port 10002 not listening)"
    ((FAIL++))
fi

echo -n "  Testing port 5432 (PostgreSQL)... "
if netstat -tln 2>/dev/null | grep -q ":5432"; then
    echo -e "${GREEN}PASS${NC}"
    ((PASS++))
else
    echo -e "${RED}FAIL${NC} (port 5432 not listening)"
    ((FAIL++))
fi

echo ""

# ============================================================
# SECTION 6: END-TO-END FLOW TEST
# ============================================================

echo -e "${PURPLE}╔══════════════════════════════════════════════════════════════╗${NC}"
echo -e "${PURPLE}║                   6. END-TO-END FLOW TEST                   ║${NC}"
echo -e "${PURPLE}╚══════════════════════════════════════════════════════════════╝${NC}"
echo ""

echo -e "${CYAN}📝 Testing complete user flow...${NC}"

# Step 1: Register user
echo -n "  Step 1: Register user... "
REGISTER_RESULT=$(curl -s -X POST http://localhost:4000/api/v1/customers/register \
    -H "Content-Type: application/json" \
    -d '{"telegramId":"777777777","phoneNumber":"+251933333333","firstName":"Flow","lastName":"Test"}' 2>/dev/null)

if echo "$REGISTER_RESULT" | grep -q "success"; then
    echo -e "${GREEN}PASS${NC}"
    ((PASS++))
else
    echo -e "${RED}FAIL${NC}"
    ((FAIL++))
fi

# Step 2: Check user in database
echo -n "  Step 2: Verify user in DB... "
USER_COUNT=$(psql -d ale_kircha -t -c "SELECT COUNT(*) FROM \"User\" WHERE \"telegramId\"='777777777';" 2>/dev/null | tr -d ' ')
if [ "$USER_COUNT" = "1" ]; then
    echo -e "${GREEN}PASS${NC}"
    ((PASS++))
else
    echo -e "${RED}FAIL${NC} (user not found)"
    ((FAIL++))
fi

# Step 3: Check stats
echo -n "  Step 3: Check admin stats... "
STATS_RESULT=$(curl -s http://localhost:4000/api/v1/admin/stats 2>/dev/null)
if echo "$STATS_RESULT" | grep -q "users"; then
    echo -e "${GREEN}PASS${NC}"
    ((PASS++))
else
    echo -e "${RED}FAIL${NC}"
    ((FAIL++))
fi

echo ""

# ============================================================
# SUMMARY
# ============================================================

echo -e "${PURPLE}╔══════════════════════════════════════════════════════════════╗${NC}"
echo -e "${PURPLE}║                       TEST SUMMARY                         ║${NC}"
echo -e "${PURPLE}╚══════════════════════════════════════════════════════════════╝${NC}"
echo ""

TOTAL=$((PASS + FAIL + SKIP))

echo -e "  ${GREEN}✅ PASS:  $PASS${NC}"
echo -e "  ${RED}❌ FAIL:  $FAIL${NC}"
echo -e "  ${YELLOW}⏭️ SKIP:  $SKIP${NC}"
echo -e "  ${CYAN}📊 TOTAL: $TOTAL${NC}"
echo ""

if [ $FAIL -eq 0 ]; then
    echo -e "${GREEN}════════════════════════════════════════════════════════════════${NC}"
    echo -e "${GREEN}   🎉 ALL TESTS PASSED! SYSTEM IS FULLY FUNCTIONAL!         ${NC}"
    echo -e "${GREEN}════════════════════════════════════════════════════════════════${NC}"
else
    echo -e "${YELLOW}════════════════════════════════════════════════════════════════${NC}"
    echo -e "${YELLOW}   ⚠️  SOME TESTS FAILED. CHECK THE ERRORS ABOVE.           ${NC}"
    echo -e "${YELLOW}════════════════════════════════════════════════════════════════${NC}"
fi

echo ""
echo -e "  ${CYAN}📊 API:${NC}     http://localhost:4000"
echo -e "  ${CYAN}🤖 Customer:${NC} @kirchaaleBot"
echo -e "  ${CYAN}👤 Admin:${NC}    @Ale_kircha_admin_bot"
echo ""

