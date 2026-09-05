#!/data/data/com.termux/files/usr/bin/bash

set -u

ROOT="$HOME/Ale-Kircha"
API="$ROOT/apps/api"
CUSTOMER="$ROOT/apps/customer-bot"
ADMIN="$ROOT/apps/admin-bot"

cd "$ROOT" || exit 1

echo "============================================================"
echo "ALE KIRCHA SMART SOURCE CHECK"
echo "============================================================"

echo
echo "Project: $ROOT"
echo "Node:    $(node -v 2>/dev/null || echo missing)"
echo "pnpm:    $(pnpm -v 2>/dev/null || echo missing)"
echo

echo "============================================================"
echo "1. CHECKING DUPLICATE API ROUTES"
echo "============================================================"

python3 - "$API/src/server-pg.ts" <<'PY'
import sys
import re
from collections import defaultdict

path = sys.argv[1]

try:
    text = open(path, encoding="utf-8").read()
except Exception as e:
    print("ERROR:", e)
    sys.exit(1)

routes = defaultdict(list)

pattern = re.compile(
    r'fastify\.(get|post|put|patch|delete)\(\s*[\'"]([^\'"]+)[\'"]'
)

for n, line in enumerate(text.splitlines(), 1):
    m = pattern.search(line)
    if m:
        method, route = m.groups()
        routes[(method.upper(), route)].append(n)

duplicates = {
    k: v for k, v in routes.items()
    if len(v) > 1
}

if not duplicates:
    print("OK: No duplicate Fastify routes found.")
else:
    print("DUPLICATE ROUTES FOUND:")
    for (method, route), lines in duplicates.items():
        print(f"  {method} {route} -> lines {lines}")
PY

echo
echo "============================================================"
echo "2. CUSTOMER BOT DECLARATION CHECK"
echo "============================================================"

python3 - "$CUSTOMER/src/bot.ts" <<'PY'
import sys
import re
from collections import defaultdict

path = sys.argv[1]
text = open(path, encoding="utf-8").read()

for name in [
    "registrationConversation",
    "refundRequestConversation",
    "paymentAdviceConversation",
    "createGroupConversation",
]:
    lines = [
        i for i, line in enumerate(text.splitlines(), 1)
        if re.search(rf'\bfunction\s+{name}\s*\(', line)
    ]

    if len(lines) > 1:
        print(f"DUPLICATE FUNCTION: {name}: lines {lines}")
    elif len(lines) == 1:
        print(f"OK: {name}: line {lines[0]}")
    else:
        print(f"WARNING: {name} not found")
PY

echo
echo "============================================================"
echo "3. ADMIN BOT DECLARATION CHECK"
echo "============================================================"

python3 - "$ADMIN/src/bot.ts" <<'PY'
import sys
import re
from collections import defaultdict

path = sys.argv[1]
text = open(path, encoding="utf-8").read()

names = ["generateReport"]

for name in names:
    lines = [
        i for i, line in enumerate(text.splitlines(), 1)
        if re.search(rf'\bfunction\s+{name}\s*\(', line)
    ]

    if len(lines) > 1:
        print(f"DUPLICATE FUNCTION: {name}: lines {lines}")
    elif len(lines) == 1:
        print(f"OK: {name}: line {lines[0]}")
    else:
        print(f"WARNING: {name} not found")
PY

echo
echo "============================================================"
echo "4. CUSTOMER BOT SYNTAX CHECK"
echo "============================================================"

cd "$CUSTOMER"

if pnpm exec tsc --noEmit --pretty false 2>&1 | tee /tmp/customer-tsc.log; then
    echo "CUSTOMER TYPECHECK: PASS"
else
    echo "CUSTOMER TYPECHECK: FAILED"
fi

echo
echo "============================================================"
echo "5. ADMIN BOT SYNTAX/TYPE CHECK"
echo "============================================================"

cd "$ADMIN"

if pnpm exec tsc --noEmit --pretty false 2>&1 | tee /tmp/admin-tsc.log; then
    echo "ADMIN TYPECHECK: PASS"
else
    echo "ADMIN TYPECHECK: FAILED"
fi

echo
echo "============================================================"
echo "6. API TYPECHECK"
echo "============================================================"

cd "$API"

if pnpm exec tsc --noEmit --pretty false 2>&1 | tee /tmp/api-tsc.log; then
    echo "API TYPECHECK: PASS"
else
    echo "API TYPECHECK: FAILED"
fi

echo
echo "============================================================"
echo "7. PRISMA VALIDATION"
echo "============================================================"

cd "$API"

if [ -f .env.postgres ]; then
    set -a
    . ./.env.postgres
    set +a
else
    echo "WARNING: .env.postgres not found"
fi

if pnpm exec prisma validate; then
    echo "PRISMA VALIDATION: PASS"
else
    echo "PRISMA VALIDATION: FAILED"
fi

echo
echo "============================================================"
echo "SMART CHECK COMPLETE"
echo "============================================================"
