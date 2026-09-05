#!/bin/bash

# ============================================================
# ALE KIRCHA - START ALL SERVICES
# ============================================================

echo ""
echo "╔══════════════════════════════════════════════════════════════╗"
echo "║                                                              ║"
echo "║           🥩 ALE KIRCHA - START ALL SERVICES                ║"
echo "║           አለ ቅርጫ - ሁሉንም አገልግሎቶች ማስነሻ               ║"
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
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# ============================================================
# KILL OLD PROCESSES
# ============================================================

echo -e "${BLUE}📋 Stopping old processes...${NC}"
pkill -f 'tsx.*server-pg' 2>/dev/null
pkill -f 'customer-bot.*bot.ts' 2>/dev/null
pkill -f 'admin-bot.*bot.ts' 2>/dev/null
pkill -f 'pnpm.*dev' 2>/dev/null
sleep 2
echo -e "  ${GREEN}✅ Old processes stopped${NC}"
echo ""

# ============================================================
# START POSTGRESQL
# ============================================================

echo -e "${BLUE}🗄️  Starting PostgreSQL...${NC}"
pg_ctl -D $PREFIX/var/lib/postgresql start 2>/dev/null || echo "  ${YELLOW}⚠️  PostgreSQL already running${NC}"
sleep 2
if pg_ctl -D $PREFIX/var/lib/postgresql status &> /dev/null; then
    echo -e "  ${GREEN}✅ PostgreSQL is running${NC}"
else
    echo -e "  ${RED}❌ PostgreSQL failed to start${NC}"
    exit 1
fi
echo ""

# ============================================================
# START API
# ============================================================

echo -e "${BLUE}🔌 Starting API Server...${NC}"
cd ~/Ale-Kircha/apps/api
set -a
. ./.env.postgres 2>/dev/null
set +a
nohup pnpm exec tsx src/server-pg.ts > api.log 2>&1 &
API_PID=$!
echo -e "  ${GREEN}✅ API started (PID: $API_PID)${NC}"

# Wait for API to be ready
echo -n "  ⏳ Waiting for API..."
for i in {1..15}; do
    if curl -s http://localhost:4000/health &> /dev/null; then
        echo -e " ${GREEN}READY${NC}"
        break
    fi
    echo -n "."
    sleep 1
done
echo ""

# ============================================================
# START CUSTOMER BOT
# ============================================================

echo -e "${BLUE}🤖 Starting Customer Bot...${NC}"
cd ~/Ale-Kircha/apps/customer-bot
PORT=10001 nohup node --import tsx src/bot.ts > customer-bot.log 2>&1 &
BOT_PID=$!
echo -e "  ${GREEN}✅ Customer Bot started (PID: $BOT_PID)${NC}"

# Wait for bot to be ready
echo -n "  ⏳ Waiting for Customer Bot..."
for i in {1..15}; do
    if curl -s http://localhost:10001/health &> /dev/null; then
        echo -e " ${GREEN}READY${NC}"
        break
    fi
    echo -n "."
    sleep 1
done
echo ""

# ============================================================
# START ADMIN BOT
# ============================================================

echo -e "${BLUE}👤 Starting Admin Bot...${NC}"
cd ~/Ale-Kircha/apps/admin-bot
PORT=10002 nohup node --import tsx src/bot.ts > admin-bot.log 2>&1 &
ADMIN_PID=$!
echo -e "  ${GREEN}✅ Admin Bot started (PID: $ADMIN_PID)${NC}"

# Wait for bot to be ready
echo -n "  ⏳ Waiting for Admin Bot..."
for i in {1..15}; do
    if curl -s http://localhost:10002/health &> /dev/null; then
        echo -e " ${GREEN}READY${NC}"
        break
    fi
    echo -n "."
    sleep 1
done
echo ""

# ============================================================
# FINAL STATUS
# ============================================================

echo ""
echo -e "${CYAN}╔══════════════════════════════════════════════════════════════╗${NC}"
echo -e "${CYAN}║                    SYSTEM STATUS                            ║${NC}"
echo -e "${CYAN}╚══════════════════════════════════════════════════════════════╝${NC}"
echo ""

# Check API
if curl -s http://localhost:4000/health &> /dev/null; then
    echo -e "  ${GREEN}✅ API Server:${NC} RUNNING (port 4000)"
else
    echo -e "  ${RED}❌ API Server:${NC} DOWN"
fi

# Check Customer Bot
if curl -s http://localhost:10001/health &> /dev/null; then
    echo -e "  ${GREEN}✅ Customer Bot:${NC} RUNNING (port 10001)"
else
    echo -e "  ${RED}❌ Customer Bot:${NC} DOWN"
fi

# Check Admin Bot
if curl -s http://localhost:10002/health &> /dev/null; then
    echo -e "  ${GREEN}✅ Admin Bot:${NC} RUNNING (port 10002)"
else
    echo -e "  ${RED}❌ Admin Bot:${NC} DOWN"
fi

echo ""
echo -e "${CYAN}╔══════════════════════════════════════════════════════════════╗${NC}"
echo -e "${CYAN}║                    BOT LINKS                               ║${NC}"
echo -e "${CYAN}╚══════════════════════════════════════════════════════════════╝${NC}"
echo ""

echo -e "  ${BLUE}🤖 Customer Bot:${NC} @kirchaaleBot"
echo -e "  ${BLUE}👤 Admin Bot:${NC}    @Ale_kircha_admin_bot"

echo ""
echo -e "${CYAN}╔══════════════════════════════════════════════════════════════╗${NC}"
echo -e "${CYAN}║                    LOG FILES                               ║${NC}"
echo -e "${CYAN}╚══════════════════════════════════════════════════════════════╝${NC}"
echo ""
echo -e "  ${BLUE}API:${NC}         ~/Ale-Kircha/apps/api/api.log"
echo -e "  ${BLUE}Customer Bot:${NC} ~/Ale-Kircha/apps/customer-bot/customer-bot.log"
echo -e "  ${BLUE}Admin Bot:${NC}   ~/Ale-Kircha/apps/admin-bot/admin-bot.log"

echo ""
echo -e "${CYAN}╔══════════════════════════════════════════════════════════════╗${NC}"
echo -e "${CYAN}║                    QUICK COMMANDS                          ║${NC}"
echo -e "${CYAN}╚══════════════════════════════════════════════════════════════╝${NC}"
echo ""
echo -e "  ${YELLOW}📊 Check status:${NC}      curl http://localhost:4000/health"
echo -e "  ${YELLOW}🛑 Stop all:${NC}          pkill -f 'tsx' && pkill -f 'bot.ts'"
echo -e "  ${YELLOW}📋 View logs:${NC}         tail -f ~/Ale-Kircha/apps/api/api.log"
echo ""

echo -e "${GREEN}════════════════════════════════════════════════════════════════${NC}"
echo -e "${GREEN}   🎉 ALL SERVICES STARTED! TEST YOUR BOTS ON TELEGRAM       ${NC}"
echo -e "${GREEN}════════════════════════════════════════════════════════════════${NC}"
echo ""

