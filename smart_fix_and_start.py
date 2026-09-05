from pathlib import Path
import shutil
import subprocess
import re
import sys
import time

ROOT = Path.home() / "Ale-Kircha"

API = ROOT / "apps/api/src/server-pg.ts"
CUSTOMER = ROOT / "apps/customer-bot/src/bot.ts"
ADMIN = ROOT / "apps/admin-bot/src/bot.ts"
EN = CUSTOMER.parent / "i18n/en.ts"
AM = CUSTOMER.parent / "i18n/am.ts"

FILES = [API, CUSTOMER, ADMIN, EN, AM]

print("=" * 70)
print("ALE KIRCHA — SMART CHECK / FIX / VALIDATE")
print("=" * 70)

for f in FILES:
    if not f.exists():
        print(f"❌ Missing: {f}")
        sys.exit(1)

# ============================================================
# BACKUPS
# ============================================================

for f in FILES:
    backup = f.with_suffix(f.suffix + ".smart-backup")
    if not backup.exists():
        shutil.copy2(f, backup)
        print(f"✅ Backup: {backup.name}")

# ============================================================
# 1. FIX API — MISSING AUDIT ROUTE
# ============================================================

print("\n" + "=" * 70)
print("1. REPAIRING API")
print("=" * 70)

text = API.read_text(encoding="utf-8")

bad_audit = '''// ---------- Audit Log ----------
  try {
    const result = await db.query(`
      SELECT al.*, u.username
      FROM "AuditLog" al
      LEFT JOIN "User" u ON al."userId" = u.id
      ORDER BY al."createdAt" DESC
      LIMIT 50
    `);
    return { success: true, data: result.rows };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
});'''

good_audit = '''// ---------- Audit Log ----------
fastify.get('/api/v1/audit', async (request, reply) => {
  try {
    const result = await db.query(`
      SELECT al.*, u.username
      FROM "AuditLog" al
      LEFT JOIN "User" u ON al."userId" = u.id
      ORDER BY al."createdAt" DESC
      LIMIT 50
    `);
    return { success: true, data: result.rows };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
});'''

if bad_audit in text:
    text = text.replace(bad_audit, good_audit, 1)
    API.write_text(text, encoding="utf-8")
    print("✅ Repaired missing Audit Log route.")
else:
    print("ℹ️ Audit Log malformed block not found exactly.")
    print("   Manual inspection may be required.")

# ============================================================
# 2. REMOVE DUPLICATE API ADMIN USER GET ROUTE
# ============================================================

text = API.read_text(encoding="utf-8")

route = "fastify.get('/api/v1/admin/users'"

positions = [m.start() for m in re.finditer(re.escape(route), text)]

print(f"Admin users GET routes found: {len(positions)}")

if len(positions) > 1:
    # Keep the later, complete implementation.
    first = positions[0]
    second = positions[1]

    first_end = text.find("\n});", first)

    if first_end != -1 and first_end < second:
        first_end += len("\n});")
        text = text[:first] + text[first_end:]
        API.write_text(text, encoding="utf-8")
        print("✅ Removed duplicate early admin users GET route.")
else:
    print("✅ No duplicate admin users GET route.")

# ============================================================
# 3. CHECK API SYNTAX
# ============================================================

def run(cmd, cwd):
    print("\n>>>", " ".join(cmd))
    return subprocess.run(
        cmd,
        cwd=str(cwd),
        text=True
    )

print("\n" + "=" * 70)
print("2. API SYNTAX CHECK")
print("=" * 70)

result = run(
    ["pnpm", "exec", "tsx", "--eval",
     "import './src/server-pg.ts';"],
    ROOT / "apps/api"
)

if result.returncode != 0:
    print("⚠️ API still has syntax/runtime startup errors.")
else:
    print("✅ API TypeScript loaded successfully.")

# ============================================================
# 4. CUSTOMER BOT DUPLICATE FUNCTION CHECK
# ============================================================

print("\n" + "=" * 70)
print("3. CUSTOMER BOT DUPLICATE CHECK")
print("=" * 70)

text = CUSTOMER.read_text(encoding="utf-8")

def count_func(name, source):
    return len(re.findall(
        rf"async\s+function\s+{re.escape(name)}\s*\(",
        source
    ))

functions = [
    "registrationConversation",
    "refundRequestConversation",
    "createGroupConversation",
    "paymentAdviceConversation",
]

for fn in functions:
    count = count_func(fn, text)
    print(f"{fn}: {count}")

# ------------------------------------------------------------
# Duplicate registration/refund functions
# ------------------------------------------------------------

def remove_duplicate_function(source, name):
    pattern = re.compile(
        rf"async\s+function\s+{re.escape(name)}\s*\("
    )

    matches = list(pattern.finditer(source))

    if len(matches) <= 1:
        return source, False

    # Keep FIRST implementation.
    start_remove = matches[1].start()

    # Find next top-level section marker after duplicate.
    marker = source.find(
        "\n// ============================================================",
        start_remove + 10
    )

    if marker == -1:
        return source, False

    return source[:start_remove] + source[marker:], True

for fn in ["registrationConversation", "refundRequestConversation"]:
    text, changed = remove_duplicate_function(text, fn)
    if changed:
        print(f"✅ Removed duplicate {fn}.")
    else:
        print(f"ℹ️ No automatic duplicate removal for {fn}.")

CUSTOMER.write_text(text, encoding="utf-8")

# ============================================================
# 5. FIX CUSTOMER BOT ctx.from SAFELY
# ============================================================

text = CUSTOMER.read_text(encoding="utf-8")

# Add guard at important handlers where ctx.from is required.
# This is safer than replacing ctx.from with a fabricated value.

text = re.sub(
    r"(async function registrationConversation\(conversation: any, ctx: MyContext\) \{)",
    r"\1\n  if (!ctx.from) return;",
    text,
    count=1
)

# Add guard to any conversation that directly uses ctx.from.
for fn in [
    "createGroupConversation",
    "paymentAdviceConversation",
    "refundRequestConversation",
]:
    pattern = rf"(async function {fn}\(conversation: any, ctx: MyContext\) \{{)"
    text = re.sub(
        pattern,
        r"\1\n  if (!ctx.from) return;",
        text,
        count=1
    )

# ============================================================
# 6. FIX SESSION TYPE FOR orderId
# ============================================================

# Add optional orderId to existing session data interface/type.
# We only modify the first matching data structure.

text = text.replace(
    "termsAccepted?: boolean;",
    "termsAccepted?: boolean;\n    orderId?: string;",
    1
)

CUSTOMER.write_text(text, encoding="utf-8")
print("✅ Customer bot safety/type fixes applied.")

# ============================================================
# 7. REMOVE DUPLICATE TRANSLATION KEYS
# ============================================================

print("\n" + "=" * 70)
print("4. TRANSLATION CHECK")
print("=" * 70)

def remove_duplicate_object_keys(path):
    source = path.read_text(encoding="utf-8")
    lines = source.splitlines(True)

    seen = set()
    output = []
    removed = []

    # Only process simple "key: value" object properties.
    key_re = re.compile(r"^\s*([A-Za-z_$][A-Za-z0-9_$]*)\s*:")

    for line_no, line in enumerate(lines, 1):
        m = key_re.match(line)

        if not m:
            output.append(line)
            continue

        key = m.group(1)

        if key in seen:
            removed.append((line_no, key))
            continue

        seen.add(key)
        output.append(line)

    if removed:
        path.write_text("".join(output), encoding="utf-8")
        for line_no, key in removed:
            print(f"✅ Removed duplicate {key} from {path.name} line {line_no}")
    else:
        print(f"✅ No duplicate simple keys in {path.name}")

remove_duplicate_object_keys(EN)
remove_duplicate_object_keys(AM)

# ============================================================
# 8. TYPECHECK CUSTOMER BOT
# ============================================================

print("\n" + "=" * 70)
print("5. CUSTOMER BOT TYPECHECK")
print("=" * 70)

result = run(
    ["pnpm", "exec", "tsc", "--noEmit"],
    ROOT / "apps/customer-bot"
)

if result.returncode == 0:
    print("✅ Customer bot TypeScript passes.")
else:
    print("⚠️ Customer bot still has TypeScript errors.")

# ============================================================
# 9. TYPECHECK ADMIN BOT
# ============================================================

print("\n" + "=" * 70)
print("6. ADMIN BOT TYPECHECK")
print("=" * 70)

result = run(
    ["pnpm", "exec", "tsc", "--noEmit"],
    ROOT / "apps/admin-bot"
)

if result.returncode == 0:
    print("✅ Admin bot TypeScript passes.")
else:
    print("⚠️ Admin bot still has TypeScript errors.")

# ============================================================
# 10. PRISMA GENERATE
# ============================================================

print("\n" + "=" * 70)
print("7. PRISMA GENERATE")
print("=" * 70)

result = run(
    ["pnpm", "exec", "prisma", "generate"],
    ROOT
)

if result.returncode == 0:
    print("✅ Prisma generate passed.")
else:
    print("❌ Prisma generate failed.")

# ============================================================
# 11. FINAL API SYNTAX CHECK USING ESBUILD
# ============================================================

print("\n" + "=" * 70)
print("8. FINAL API CHECK")
print("=" * 70)

result = run(
    ["pnpm", "exec", "tsx", "--eval",
     "import './src/server-pg.ts';"],
    ROOT / "apps/api"
)

if result.returncode == 0:
    print("✅ API passed final startup compilation.")
else:
    print("❌ API still fails startup compilation.")

print("\n" + "=" * 70)
print("DIAGNOSTICS COMPLETE")
print("=" * 70)
print()
print("Backups created with .smart-backup suffix.")
print("NO database migration or db push was performed.")
print()
print("If all checks above are green, start the services manually.")
