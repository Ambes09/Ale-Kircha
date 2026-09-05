#!/usr/bin/env python3

from pathlib import Path
import re
import shutil
import subprocess
import os
import sys
import time

ROOT = Path.home() / "Ale-Kircha"
API = ROOT / "apps" / "api"
CUSTOMER = ROOT / "apps" / "customer-bot"
ADMIN = ROOT / "apps" / "admin-bot"

SERVER = API / "src" / "server-pg.ts"
CUSTOMER_BOT = CUSTOMER / "src" / "bot.ts"
ADMIN_BOT = ADMIN / "src" / "bot.ts"

BACKUP = ROOT / ".repair-backups"
BACKUP.mkdir(exist_ok=True)

timestamp = time.strftime("%Y%m%d_%H%M%S")


def run(cmd, cwd=None, check=True, env=None):
    print("\n>>>", " ".join(str(x) for x in cmd))
    result = subprocess.run(
        cmd,
        cwd=str(cwd) if cwd else None,
        env=env,
        text=True
    )

    if check and result.returncode != 0:
        print(f"\n❌ COMMAND FAILED: exit code {result.returncode}")
        sys.exit(result.returncode)

    return result.returncode


def backup_file(path):
    if path.exists():
        target = BACKUP / f"{path.name}.{timestamp}.bak"
        shutil.copy2(path, target)
        print(f"✅ Backup: {target}")


def brace_end(lines, start):
    """
    Find the end of a TypeScript block beginning at start.
    Counts { and } while ignoring simple strings/comments sufficiently
    for the known blocks being repaired.
    """
    depth = 0
    started = False

    for i in range(start, len(lines)):
        line = lines[i]

        # Remove // comments for brace counting.
        clean = re.sub(r'//.*', '', line)

        # Remove simple quoted strings.
        clean = re.sub(r'"(?:\\.|[^"\\])*"', '""', clean)
        clean = re.sub(r"'(?:\\.|[^'\\])*'", "''", clean)
        clean = re.sub(r"`(?:\\.|[^`\\])*`", "``", clean)

        for ch in clean:
            if ch == "{":
                depth += 1
                started = True
            elif ch == "}":
                depth -= 1

                if started and depth == 0:
                    return i

    raise RuntimeError(f"Could not find block end starting at line {start+1}")


def find_function_occurrences(lines, name):
    pattern = re.compile(
        rf'^\s*(?:export\s+)?(?:async\s+)?function\s+{re.escape(name)}\s*\('
    )

    result = []

    for i, line in enumerate(lines):
        if pattern.search(line):
            result.append(i)

    return result


def remove_function_occurrence(lines, name, occurrence_index):
    occurrences = find_function_occurrences(lines, name)

    if len(occurrences) <= occurrence_index:
        return lines, False

    start = occurrences[occurrence_index]
    end = brace_end(lines, start)

    print(
        f"  Removing duplicate function {name}: "
        f"lines {start+1}-{end+1}"
    )

    return lines[:start] + lines[end + 1:], True


def find_route_occurrences(lines, method, path):
    pattern = re.compile(
        rf'^\s*fastify\.{re.escape(method)}\(\s*[\'"]'
        rf'{re.escape(path)}[\'"]\s*,'
    )

    return [i for i, line in enumerate(lines) if pattern.search(line)]


def remove_route_occurrence(lines, method, path, occurrence_index):
    occurrences = find_route_occurrences(lines, method, path)

    if len(occurrences) <= occurrence_index:
        return lines, False

    start = occurrences[occurrence_index]
    end = brace_end(lines, start)

    print(
        f"  Removing duplicate route "
        f"{method.upper()} {path}: lines {start+1}-{end+1}"
    )

    return lines[:start] + lines[end + 1:], True


def find_callback_occurrences(lines, callback):
    pattern = re.compile(
        rf'^\s*bot\.callbackQuery\(\s*[\'"]'
        rf'{re.escape(callback)}[\'"]\s*,'
    )

    return [i for i, line in enumerate(lines) if pattern.search(line)]


def remove_callback_occurrence(lines, callback, occurrence_index):
    occurrences = find_callback_occurrences(lines, callback)

    if len(occurrences) <= occurrence_index:
        return lines, False

    start = occurrences[occurrence_index]
    end = brace_end(lines, start)

    print(
        f"  Removing duplicate callback {callback}: "
        f"lines {start+1}-{end+1}"
    )

    return lines[:start] + lines[end + 1:], True


def clean_api():
    print("\n============================================================")
    print("REPAIRING API")
    print("============================================================")

    backup_file(SERVER)

    lines = SERVER.read_text().splitlines(True)
    changed = False

    # There are two GET /api/v1/admin/users routes.
    # Keep the later comprehensive implementation and remove the old one.
    occurrences = find_route_occurrences(
        lines,
        "get",
        "/api/v1/admin/users"
    )

    if len(occurrences) > 1:
        # Remove first occurrence.
        lines, did = remove_route_occurrence(
            lines,
            "get",
            "/api/v1/admin/users",
            0
        )
        changed |= did

    SERVER.write_text("".join(lines))

    print("✅ API duplicate-route cleanup complete.")


def clean_customer():
    print("\n============================================================")
    print("REPAIRING CUSTOMER BOT")
    print("============================================================")

    backup_file(CUSTOMER_BOT)

    lines = CUSTOMER_BOT.read_text().splitlines(True)
    changed = False

    # registrationConversation:
    # first implementation is the actual registration flow;
    # second implementation is only the later duplicate enhancement.
    occurrences = find_function_occurrences(
        lines,
        "registrationConversation"
    )

    if len(occurrences) > 1:
        lines, did = remove_function_occurrence(
            lines,
            "registrationConversation",
            1
        )
        changed |= did

    # refundRequestConversation:
    # two complete duplicate implementations exist.
    # Keep the first one.
    occurrences = find_function_occurrences(
        lines,
        "refundRequestConversation"
    )

    if len(occurrences) > 1:
        lines, did = remove_function_occurrence(
            lines,
            "refundRequestConversation",
            1
        )
        changed |= did

    CUSTOMER_BOT.write_text("".join(lines))

    print("✅ Customer bot duplicate cleanup complete.")


def clean_admin():
    print("\n============================================================")
    print("REPAIRING ADMIN BOT")
    print("============================================================")

    backup_file(ADMIN_BOT)

    lines = ADMIN_BOT.read_text().splitlines(True)
    changed = False

    # generateReport appears twice.
    # Keep the later implementation because it contains the
    # richer report navigation/back functionality.
    occurrences = find_function_occurrences(
        lines,
        "generateReport"
    )

    if len(occurrences) > 1:
        lines, did = remove_function_occurrence(
            lines,
            "generateReport",
            0
        )
        changed |= did

    # Report callbacks were implemented twice.
    # Keep the later complete implementation.
    callbacks = [
        "report_customers",
        "report_groups",
        "report_orders",
        "report_payments",
        "report_delivery",
    ]

    for callback in callbacks:
        occurrences = find_callback_occurrences(lines, callback)

        if len(occurrences) > 1:
            # Recalculate each time because line numbers change.
            lines, did = remove_callback_occurrence(
                lines,
                callback,
                0
            )
            changed |= did

    ADMIN_BOT.write_text("".join(lines))

    print("✅ Admin bot duplicate cleanup complete.")


def check_duplicates():
    print("\n============================================================")
    print("CHECKING FOR REMAINING KNOWN DUPLICATES")
    print("============================================================")

    checks = [
        (SERVER, "api/v1/admin/users"),
        (CUSTOMER_BOT, "registrationConversation"),
        (CUSTOMER_BOT, "refundRequestConversation"),
        (ADMIN_BOT, "generateReport"),
    ]

    failed = False

    for path, term in checks:
        text = path.read_text()

        if term == "api/v1/admin/users":
            count = len(re.findall(
                r"fastify\.get\(['\"]\/api\/v1\/admin\/users['\"]",
                text
            ))
        else:
            count = len(re.findall(
                rf"\bfunction\s+{re.escape(term)}\s*\(",
                text
            ))

        print(f"{path.relative_to(ROOT)} :: {term} = {count}")

        if count > 1:
            failed = True

    if failed:
        print("\n❌ Known duplicates still remain.")
        sys.exit(1)

    print("\n✅ No known duplicate declarations remain.")


def load_env():
    env = os.environ.copy()

    env_file = API / ".env.postgres"

    if not env_file.exists():
        print(f"❌ Missing {env_file}")
        print("Create/fix .env.postgres before continuing.")
        sys.exit(1)

    print(f"Loading {env_file}")

    for raw in env_file.read_text().splitlines():
        line = raw.strip()

        if not line or line.startswith("#") or "=" not in line:
            continue

        key, value = line.split("=", 1)

        key = key.strip()
        value = value.strip()

        if (
            len(value) >= 2
            and value[0] == value[-1]
            and value[0] in ("'", '"')
        ):
            value = value[1:-1]

        env[key] = value

    if not env.get("DATABASE_URL"):
        print("❌ DATABASE_URL is missing from apps/api/.env.postgres")
        sys.exit(1)

    print("✅ DATABASE_URL loaded.")

    return env


def validate_api(env):
    print("\n============================================================")
    print("PRISMA FORMAT")
    print("============================================================")

    run(
        ["pnpm", "exec", "prisma", "format"],
        cwd=API,
        env=env
    )

    print("\n============================================================")
    print("PRISMA VALIDATE")
    print("============================================================")

    run(
        ["pnpm", "exec", "prisma", "validate"],
        cwd=API,
        env=env
    )

    print("\n============================================================")
    print("PRISMA GENERATE")
    print("============================================================")

    run(
        ["pnpm", "exec", "prisma", "generate"],
        cwd=API,
        env=env
    )

    print("\n⚠️ Prisma validation/generation passed.")
    print("No migration or db push is performed by this script.")


def typecheck_apps(env):
    print("\n============================================================")
    print("TYPECHECKING CUSTOMER BOT")
    print("============================================================")

    rc = run(
        ["pnpm", "exec", "tsc", "--noEmit"],
        cwd=CUSTOMER,
        check=False,
        env=env
    )

    if rc != 0:
        print(
            "\n⚠️ Customer bot TypeScript check failed."
            "\nThe service will NOT be started."
        )
        sys.exit(rc)

    print("\n============================================================")
    print("TYPECHECKING ADMIN BOT")
    print("============================================================")

    rc = run(
        ["pnpm", "exec", "tsc", "--noEmit"],
        cwd=ADMIN,
        check=False,
        env=env
    )

    if rc != 0:
        print(
            "\n⚠️ Admin bot TypeScript check failed."
            "\nThe service will NOT be started."
        )
        sys.exit(rc)

    print("\n============================================================")
    print("TYPECHECKING API")
    print("============================================================")

    rc = run(
        ["pnpm", "exec", "tsc", "--noEmit"],
        cwd=API,
        check=False,
        env=env
    )

    if rc != 0:
        print(
            "\n⚠️ API TypeScript check failed."
            "\nThe service will NOT be started."
        )
        sys.exit(rc)

    print("\n✅ All TypeScript checks passed.")


def kill_old_services():
    print("\n============================================================")
    print("STOPPING OLD SERVICES")
    print("============================================================")

    patterns = [
        "server-pg.ts",
        "apps/api/src/server-pg.ts",
        "apps/customer-bot/src/bot.ts",
        "apps/admin-bot/src/bot.ts",
    ]

    for pattern in patterns:
        subprocess.run(
            ["pkill", "-f", pattern],
            stdout=subprocess.DEVNULL,
            stderr=subprocess.DEVNULL
        )

    time.sleep(2)

    print("✅ Old services stopped.")


def start_services(env):
    print("\n============================================================")
    print("STARTING API")
    print("============================================================")

    api_log = API / "api.log"

    api_file = open(api_log, "a")

    api_process = subprocess.Popen(
        ["pnpm", "exec", "tsx", "src/server-pg.ts"],
        cwd=str(API),
        env=env,
        stdout=api_file,
        stderr=subprocess.STDOUT,
        start_new_session=True
    )

    print(f"API PID: {api_process.pid}")
    time.sleep(5)

    if api_process.poll() is not None:
        print("❌ API exited immediately.")
        print(f"Check: {api_log}")
        sys.exit(1)

    print("✅ API process running.")

    print("\n============================================================")
    print("STARTING CUSTOMER BOT")
    print("============================================================")

    customer_env = env.copy()
    customer_env["PORT"] = "10001"

    customer_log = CUSTOMER / "customer-bot.log"
    customer_file = open(customer_log, "a")

    customer_process = subprocess.Popen(
        ["pnpm", "exec", "tsx", "src/bot.ts"],
        cwd=str(CUSTOMER),
        env=customer_env,
        stdout=customer_file,
        stderr=subprocess.STDOUT,
        start_new_session=True
    )

    print(f"Customer PID: {customer_process.pid}")
    time.sleep(4)

    if customer_process.poll() is not None:
        print("❌ Customer bot exited immediately.")
        print(f"Check: {customer_log}")
        sys.exit(1)

    print("✅ Customer bot process running.")

    print("\n============================================================")
    print("STARTING ADMIN BOT")
    print("============================================================")

    admin_env = env.copy()
    admin_env["PORT"] = "10002"

    admin_env_file = ADMIN / ".env"

    if admin_env_file.exists():
        for raw in admin_env_file.read_text().splitlines():
            line = raw.strip()

            if not line or line.startswith("#") or "=" not in line:
                continue

            key, value = line.split("=", 1)

            key = key.strip()
            value = value.strip()

            if (
                len(value) >= 2
                and value[0] == value[-1]
                and value[0] in ("'", '"')
            ):
                value = value[1:-1]

            admin_env[key] = value

    admin_log = ADMIN / "admin-bot.log"
    admin_file = open(admin_log, "a")

    admin_process = subprocess.Popen(
        ["pnpm", "exec", "tsx", "src/bot.ts"],
        cwd=str(ADMIN),
        env=admin_env,
        stdout=admin_file,
        stderr=subprocess.STDOUT,
        start_new_session=True
    )

    print(f"Admin PID: {admin_process.pid}")
    time.sleep(4)

    if admin_process.poll() is not None:
        print("❌ Admin bot exited immediately.")
        print(f"Check: {admin_log}")
        sys.exit(1)

    print("✅ Admin bot process running.")


def health_check():
    print("\n============================================================")
    print("SERVICE HEALTH CHECK")
    print("============================================================")

    import urllib.request

    services = [
        ("API", "http://127.0.0.1:4000/health"),
        ("Customer Bot", "http://127.0.0.1:10001/health"),
        ("Admin Bot", "http://127.0.0.1:10002/health"),
    ]

    all_ok = True

    for name, url in services:
        try:
            with urllib.request.urlopen(url, timeout=3) as response:
                body = response.read().decode(errors="replace")

                if response.status == 200:
                    print(f"✅ {name}: {body}")
                else:
                    print(f"❌ {name}: HTTP {response.status}")
                    all_ok = False

        except Exception as e:
            print(f"❌ {name}: {e}")
            all_ok = False

    print()

    if all_ok:
        print("============================================================")
        print("🎉 ALL SERVICES ARE RUNNING")
        print("============================================================")
        print("API:          http://127.0.0.1:4000/health")
        print("Customer Bot: http://127.0.0.1:10001/health")
        print("Admin Bot:    http://127.0.0.1:10002/health")
        print()
        print("Logs:")
        print("  ~/Ale-Kircha/apps/api/api.log")
        print("  ~/Ale-Kircha/apps/customer-bot/customer-bot.log")
        print("  ~/Ale-Kircha/apps/admin-bot/admin-bot.log")
    else:
        print("❌ One or more services are not healthy.")
        print("Inspect the corresponding log files.")
        sys.exit(1)


def main():
    print("============================================================")
    print(" ALE KIRCHA SMART REPAIR + VALIDATE + START")
    print("============================================================")
    print(f"Project: {ROOT}")

    for path in [SERVER, CUSTOMER_BOT, ADMIN_BOT]:
        if not path.exists():
            print(f"❌ Required file missing: {path}")
            sys.exit(1)

    # Backups + targeted repairs.
    clean_api()
    clean_customer()
    clean_admin()

    # Verify targeted duplicates are gone.
    check_duplicates()

    # Load PostgreSQL environment.
    env = load_env()

    # Format + validate + generate Prisma.
    validate_api(env)

    # Check TypeScript before starting anything.
    typecheck_apps(env)

    # Stop old processes only after source validation succeeds.
    kill_old_services()

    # Start all services from their correct directories.
    start_services(env)

    # Verify health endpoints.
    health_check()


if __name__ == "__main__":
    main()
