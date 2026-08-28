#!/bin/bash
# Start all bots simultaneously

echo "🚀 Starting Siga Kircha Bots..."

# Start API if not running
cd apps/api
pnpm dev &
API_PID=$!
echo "📡 API started (PID: $API_PID)"

sleep 3

# Start Customer Bot
cd ../customer-bot
pnpm dev &
CUSTOMER_PID=$!
echo "🤖 Customer Bot started (PID: $CUSTOMER_PID)"

sleep 2

# Start Admin Bot
cd ../admin-bot
pnpm dev &
ADMIN_PID=$!
echo "🔐 Admin Bot started (PID: $ADMIN_PID)"

echo "✅ All services started!"
echo ""
echo "📊 API: http://localhost:4000"
echo "🤖 Customer Bot: Running"
echo "🔐 Admin Bot: Running"
echo ""
echo "Press Ctrl+C to stop all services"

# Wait for user interrupt
trap "kill $API_PID $CUSTOMER_PID $ADMIN_PID; exit" INT
wait
