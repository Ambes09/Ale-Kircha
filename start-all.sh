#!/bin/bash
echo "🚀 Starting Siga Kircha Services..."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
(cd apps/api && npm run dev) &
(cd apps/customer-bot && npm run dev) &
(cd apps/admin-bot && npm run dev) &
echo "✅ All services started!"
echo "📡 API: http://localhost:4000"
echo "🤖 Customer Bot: @kirchaaleBot"
echo "🔐 Admin Bot: @Ale_kircha_admin_bot"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Press Ctrl+C to stop all"
wait
