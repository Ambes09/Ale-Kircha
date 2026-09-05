#!/bin/bash

echo ""
echo "╔══════════════════════════════════════════════════════════════╗"
echo "║                                                              ║"
echo "║           🥩 ALE KIRCHA - START ALL SERVICES                ║"
echo "║           አለ ቅርጫ - ሁሉንም አገልግሎቶች ማስነሻ               ║"
echo "║                                                              ║"
echo "╚══════════════════════════════════════════════════════════════╝"
echo ""

# Kill old processes
echo "🔄 Stopping old processes..."
pkill -f 'tsx' 2>/dev/null
pkill -f 'bot.ts' 2>/dev/null
sleep 2
echo "✅ Old processes stopped"
echo ""

# Start PostgreSQL
echo "🗄️  Starting PostgreSQL..."
pg_ctl -D $PREFIX/var/lib/postgresql start 2>/dev/null || echo "PostgreSQL already running"
sleep 2
echo "✅ PostgreSQL ready"
echo ""

# Start API
echo "🔌 Starting API Server..."
cd ~/Ale-Kircha/apps/api
set -a
. ./.env.postgres
set +a
nohup pnpm exec tsx src/server-pg.ts > api.log 2>&1 &
sleep 5
echo "✅ API started on port 4000"
cd ~/Ale-Kircha
echo ""

# Start Customer Bot
echo "🤖 Starting Customer Bot..."
cd ~/Ale-Kircha/apps/customer-bot
PORT=10001 nohup node --import tsx src/bot.ts > customer-bot.log 2>&1 &
sleep 3
echo "✅ Customer Bot started on port 10001"
cd ~/Ale-Kircha
echo ""

# Start Admin Bot
echo "👤 Starting Admin Bot..."
cd ~/Ale-Kircha/apps/admin-bot
PORT=10002 nohup node --import tsx src/bot.ts > admin-bot.log 2>&1 &
sleep 3
echo "✅ Admin Bot started on port 10002"
cd ~/Ale-Kircha
echo ""

# Check services
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📊 SERVICE STATUS"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

API_STATUS=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:4000/health 2>/dev/null)
if [ "$API_STATUS" = "200" ]; then
    echo "✅ API Server: RUNNING (port 4000)"
else
    echo "❌ API Server: DOWN (HTTP $API_STATUS)"
fi

BOT_STATUS=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:10001/health 2>/dev/null)
if [ "$BOT_STATUS" = "200" ]; then
    echo "✅ Customer Bot: RUNNING (port 10001)"
else
    echo "❌ Customer Bot: DOWN (HTTP $BOT_STATUS)"
fi

ADMIN_STATUS=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:10002/health 2>/dev/null)
if [ "$ADMIN_STATUS" = "200" ]; then
    echo "✅ Admin Bot: RUNNING (port 10002)"
else
    echo "❌ Admin Bot: DOWN (HTTP $ADMIN_STATUS)"
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📱 BOT LINKS"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "🤖 Customer Bot: @kirchaaleBot"
echo "👤 Admin Bot: @Ale_kircha_admin_bot"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📝 LOG FILES"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "📄 API:         ~/Ale-Kircha/apps/api/api.log"
echo "📄 Customer Bot: ~/Ale-Kircha/apps/customer-bot/customer-bot.log"
echo "📄 Admin Bot:   ~/Ale-Kircha/apps/admin-bot/admin-bot.log"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🛑 STOP ALL SERVICES"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "pkill -f 'tsx' 2>/dev/null; pkill -f 'bot.ts' 2>/dev/null"
echo ""
echo "════════════════════════════════════════════════════════════════"
echo "   🚀 SYSTEM READY! TEST YOUR BOTS ON TELEGRAM                "
echo "════════════════════════════════════════════════════════════════"
