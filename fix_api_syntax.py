from pathlib import Path
import shutil
import re

ROOT = Path.home() / "Ale-Kircha"
FILE = ROOT / "apps/api/src/server-pg.ts"
BACKUP = FILE.with_suffix(".ts.syntax-backup")

print("=" * 70)
print("ALE KIRCHA — API SYNTAX REPAIR")
print("=" * 70)

if not FILE.exists():
    print(f"❌ File not found: {FILE}")
    raise SystemExit(1)

# ------------------------------------------------------------
# 1. BACKUP
# ------------------------------------------------------------
if not BACKUP.exists():
    shutil.copy2(FILE, BACKUP)
    print(f"✅ Backup created: {BACKUP}")
else:
    print(f"ℹ️ Backup already exists: {BACKUP}")

text = FILE.read_text(encoding="utf-8")
lines = text.splitlines()

print(f"📄 File: {FILE}")
print(f"📏 Lines: {len(lines)}")

# ------------------------------------------------------------
# 2. SHOW ERROR AREA
# ------------------------------------------------------------
target = 1534
start = max(1, target - 35)
end = min(len(lines), target + 20)

print()
print(f"--- Lines {start}-{end} around reported error ---")

for n in range(start, end + 1):
    marker = " >>>" if n == target else "    "
    print(f"{marker} {n:5}: {lines[n-1]}")

# ------------------------------------------------------------
# 3. BASIC STRUCTURAL SCAN
#    Ignore strings and comments approximately so that
#    braces inside strings do not create false positives.
# ------------------------------------------------------------
def strip_strings_comments(line, state):
    result = []
    i = 0
    in_block = state["block"]

    while i < len(line):
        c = line[i]
        n = line[i+1] if i + 1 < len(line) else ""

        if in_block:
            if c == "*" and n == "/":
                in_block = False
                i += 2
            else:
                i += 1
            continue

        if c == "/" and n == "*":
            in_block = True
            i += 2
            continue

        if c == "/" and n == "/":
            break

        if c in ("'", '"', "`"):
            quote = c
            i += 1

            while i < len(line):
                if line[i] == "\\":
                    i += 2
                    continue
                if line[i] == quote:
                    i += 1
                    break
                i += 1
            result.append(" ")
            continue

        result.append(c)
        i += 1

    state["block"] = in_block
    return "".join(result)

stack = []
state = {"block": False}

for lineno, line in enumerate(lines, 1):
    clean = strip_strings_comments(line, state)

    for col, char in enumerate(clean, 1):
        if char in "{[(":
            stack.append((char, lineno, col))
        elif char in "}])":
            expected = {
                "}": "{",
                "]": "[",
                ")": "("
            }[char]

            if not stack:
                print()
                print("❌ UNMATCHED CLOSING BRACKET")
                print(f"   Character : {char}")
                print(f"   Line      : {lineno}")
                print(f"   Column    : {col}")
                raise SystemExit(2)

            opening, open_line, open_col = stack[-1]

            if opening != expected:
                print()
                print("❌ MISMATCHED BRACKET")
                print(f"   Closing   : {char} at line {lineno}")
                print(f"   Opening   : {opening} at line {open_line}")
                raise SystemExit(3)

            stack.pop()

print()
print("=== STRUCTURAL RESULT ===")

if stack:
    print(f"❌ {len(stack)} unclosed bracket(s)")
    for item in stack[-20:]:
        print("   ", item)
    raise SystemExit(4)

print("✅ Brackets are structurally balanced.")
print()
print("If esbuild still reports an unexpected '}', the problem is")
print("likely caused by TypeScript syntax/context rather than raw")
print("brace balance.")
