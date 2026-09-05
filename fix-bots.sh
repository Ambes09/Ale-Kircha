#!/bin/bash

echo "🔧 FIXING BOT HEALTH CHECK PORTS..."
echo ""

# ============================================================
# FIX CUSTOMER BOT
# ============================================================

echo "📝 Fixing Customer Bot..."

cd ~/Ale-Kircha/apps/customer-bot

# Show current PORT value
echo "Current PORT: $(grep -n "const PORT" src/bot.ts | head -1)"

# Fix the health check server to use PORT variable
# The issue is the listen() call is using 4000 directly

# Replace the hardcoded port with PORT variable
sed -i 's/}).listen(4000/}).listen(PORT/g' src/bot.ts
sed -i 's/}).listen(10000/}).listen(PORT/g' src/bot.ts
sed -i 's/}).listen(10001/}).listen(PORT/g' src/bot.ts

# Also fix the log message
sed -i 's/Health check: http:\/\/localhost:4000/Health check: http:\/\/localhost:${PORT}/g' src/bot.ts
sed -i 's/🔗 Health check: http:\/\/localhost:4000/🔗 Health check: http:\/\/localhost:${PORT}/g' src/bot.ts

echo "✅ Customer Bot fixed"

# ============================================================
# FIX ADMIN BOT
# ============================================================

echo "📝 Fixing Admin Bot..."

cd ~/Ale-Kircha/apps/admin-bot

# Show current PORT value
echo "Current PORT: $(grep -n "const PORT" src/bot.ts | head -1)"

# Fix the health check server to use PORT variable
sed -i 's/}).listen(4000/}).listen(PORT/g' src/bot.ts
sed -i 's/}).listen(10000/}).listen(PORT/g' src/bot.ts
sed -i 's/}).listen(10002/}).listen(PORT/g' src/bot.ts

# Also fix the log message
sed -i 's/Health check: http:\/\/localhost:4000/Health check: http:\/\/localhost:${PORT}/g' src/bot.ts
sed -i 's/🔗 Health check: http:\/\/localhost:4000/🔗 Health check: http:\/\/localhost:${PORT}/g' src/bot.ts

echo "✅ Admin Bot fixed"

# ============================================================
# VERIFY THE FIX
# ============================================================

echo ""
echo "✅ VERIFYING FIX..."
echo ""

echo "Customer Bot - Health check port:"
grep -B2 -A2 "http.createServer" ~/Ale-Kircha/apps/customer-bot/src/bot.ts | grep -E "PORT|listen"

echo ""
echo "Admin Bot - Health check port:"
grep -B2 -A2 "http.createServer" ~/Ale-Kircha/apps/admin-bot/src/bot.ts | grep -E "PORT|listen"

echo ""
echo "✅ Bots fixed! Now restart them."
