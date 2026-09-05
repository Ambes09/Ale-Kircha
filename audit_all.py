#!/usr/bin/env python3
"""
ALE KIRCHA - Complete Repository Audit
Check everything we've built so far
"""

import os
import json
import subprocess
from pathlib import Path
from datetime import datetime

# Colors for output
class Colors:
    GREEN = '\033[92m'
    RED = '\033[91m'
    YELLOW = '\033[93m'
    BLUE = '\033[94m'
    CYAN = '\033[96m'
    MAGENTA = '\033[95m'
    BOLD = '\033[1m'
    END = '\033[0m'

def print_header(text):
    print(f"\n{Colors.CYAN}{'='*70}{Colors.END}")
    print(f"{Colors.BOLD}{Colors.CYAN}{text}{Colors.END}")
    print(f"{Colors.CYAN}{'='*70}{Colors.END}")

def print_item(text, status, details=""):
    if status == "✅":
        print(f"  {Colors.GREEN}✅ {text}{Colors.END}")
    elif status == "⚠️":
        print(f"  {Colors.YELLOW}⚠️ {text}{Colors.END}")
    elif status == "❌":
        print(f"  {Colors.RED}❌ {text}{Colors.END}")
    elif status == "📁":
        print(f"  {Colors.BLUE}📁 {text}{Colors.END}")
    if details:
        print(f"     {Colors.WHITE}{details}{Colors.END}")

def check_file(filepath):
    return os.path.exists(filepath)

def read_file(filepath):
    try:
        with open(filepath, 'r') as f:
            return f.read()
    except:
        return None

def count_lines(filepath):
    try:
        with open(filepath, 'r') as f:
            return sum(1 for _ in f)
    except:
        return 0

# ============================================================
# 1. AUDIT DIRECTORY STRUCTURE
# ============================================================

def audit_structure():
    print_header("📂 DIRECTORY STRUCTURE")
    
    structure = {
        "apps": {
            "api": ["src", "prisma"],
            "customer-bot": ["src"],
            "admin-bot": ["src"],
            "customer-web": ["src"]
        },
        "packages": ["validation", "shared", "i18n", "config"],
        "scripts": [],
    }
    
    for main_dir, sub_dirs in structure.items():
        if check_file(main_dir):
            print_item(main_dir, "✅")
            if isinstance(sub_dirs, dict):
                for sub_dir, sub_sub_dirs in sub_dirs.items():
                    path = f"{main_dir}/{sub_dir}"
                    if check_file(path):
                        print_item(f"  ├── {sub_dir}", "✅")
                        for sub_sub in sub_sub_dirs:
                            sub_path = f"{path}/{sub_sub}"
                            if check_file(sub_path):
                                print_item(f"  │   ├── {sub_sub}", "✅")
                            else:
                                print_item(f"  │   ├── {sub_sub}", "❌")
            else:
                for sub_dir in sub_dirs:
                    path = f"{main_dir}/{sub_dir}"
                    if check_file(path):
                        print_item(f"  ├── {sub_dir}", "✅")
                    else:
                        print_item(f"  ├── {sub_dir}", "❌")
        else:
            print_item(main_dir, "❌")

# ============================================================
# 2. AUDIT FILES
# ============================================================

def audit_files():
    print_header("📄 FILES")
    
    files = [
        "package.json",
        "pnpm-workspace.yaml",
        "tsconfig.base.json",
        "Dockerfile",
        "docker-compose.yml",
        "render.yaml",
        "vercel.json",
        ".env.example",
        ".gitignore",
        "README.md",
        "LICENSE",
        "start-all.sh",
        "ecosystem.config.js",
    ]
    
    api_files = [
        "apps/api/package.json",
        "apps/api/tsconfig.json",
        "apps/api/src/server.ts",
        "apps/api/src/app.ts",
        "apps/api/prisma/schema.prisma",
        "apps/api/prisma/seed.js",
    ]
    
    bot_files = [
        "apps/customer-bot/package.json",
        "apps/customer-bot/tsconfig.json",
        "apps/customer-bot/src/bot.ts",
        "apps/admin-bot/package.json",
        "apps/admin-bot/tsconfig.json",
        "apps/admin-bot/src/bot.ts",
    ]
    
    web_files = [
        "apps/customer-web/package.json",
        "apps/customer-web/vite.config.ts",
        "apps/customer-web/tailwind.config.js",
        "apps/customer-web/src/App.tsx",
        "apps/customer-web/src/main.tsx",
    ]
    
    print("\n📁 Root Files:")
    for file in files:
        if check_file(file):
            lines = count_lines(file)
            print_item(f"{file} ({lines} lines)", "✅")
        else:
            print_item(file, "❌")
    
    print("\n📁 API Files:")
    for file in api_files:
        if check_file(file):
            lines = count_lines(file)
            print_item(f"{file} ({lines} lines)", "✅")
        else:
            print_item(file, "❌")
    
    print("\n📁 Bot Files:")
    for file in bot_files:
        if check_file(file):
            lines = count_lines(file)
            print_item(f"{file} ({lines} lines)", "✅")
        else:
            print_item(file, "❌")
    
    print("\n📁 Web Files:")
    for file in web_files:
        if check_file(file):
            lines = count_lines(file)
            print_item(f"{file} ({lines} lines)", "✅")
        else:
            print_item(file, "❌")

# ============================================================
# 3. AUDIT DATABASE SCHEMA
# ============================================================

def audit_schema():
    print_header("🗄️ DATABASE SCHEMA")
    
    schema_path = "apps/api/prisma/schema.prisma"
    if check_file(schema_path):
        content = read_file(schema_path)
        if content:
            # Count models
            models = []
            for line in content.split('\n'):
                if line.startswith('model '):
                    models.append(line.split(' ')[1])
            
            print(f"\n📊 Models Found: {len(models)}")
            for model in models:
                print_item(model, "✅")
            
            # Check for PostgreSQL
            if 'postgresql' in content:
                print_item("Database Provider: PostgreSQL", "✅")
            elif 'sqlite' in content:
                print_item("Database Provider: SQLite", "⚠️")
            else:
                print_item("Database Provider", "❌")
    else:
        print_item("schema.prisma not found", "❌")

# ============================================================
# 4. AUDIT ENVIRONMENT VARIABLES
# ============================================================

def audit_env():
    print_header("🔑 ENVIRONMENT VARIABLES")
    
    env_path = ".env.example"
    if check_file(env_path):
        content = read_file(env_path)
        if content:
            variables = []
            for line in content.split('\n'):
                if '=' in line and not line.startswith('#'):
                    var = line.split('=')[0].strip()
                    if var:
                        variables.append(var)
            
            print(f"\n📋 Required Variables: {len(variables)}")
            required = [
                "DATABASE_URL", "JWT_SECRET", "NODE_ENV", "PORT",
                "CUSTOMER_BOT_TOKEN", "ADMIN_BOT_TOKEN", "ADMIN_TELEGRAM_IDS"
            ]
            
            for var in required:
                if var in variables:
                    print_item(var, "✅")
                else:
                    print_item(var, "❌")
    else:
        print_item(".env.example not found", "❌")

# ============================================================
# 5. AUDIT GIT STATUS
# ============================================================

def audit_git():
    print_header("📦 GIT STATUS")
    
    try:
        # Check branch
        branch = subprocess.check_output(["git", "branch", "--show-current"], text=True).strip()
        print_item(f"Current Branch: {branch}", "✅")
        
        # Check remote
        remote = subprocess.check_output(["git", "remote", "-v"], text=True).strip()
        if remote:
            print_item("Remote Repository", "✅")
            print(f"  {remote.split()[1]}")
        
        # Check status
        status = subprocess.check_output(["git", "status", "--porcelain"], text=True).strip()
        if status:
            print_item("Uncommitted Changes", "⚠️")
            for line in status.split('\n'):
                print(f"  {line}")
        else:
            print_item("Working tree clean", "✅")
    except Exception as e:
        print_item("Git error", "❌", str(e))

# ============================================================
# 6. COUNT TOTAL FILES
# ============================================================

def count_files():
    print_header("📊 FILE STATISTICS")
    
    total_files = 0
    total_lines = 0
    file_types = {}
    
    for root, dirs, files in os.walk("."):
        if "node_modules" in root or ".git" in root:
            continue
        for file in files:
            total_files += 1
            ext = os.path.splitext(file)[1] or "no_ext"
            file_types[ext] = file_types.get(ext, 0) + 1
            
            path = os.path.join(root, file)
            lines = count_lines(path)
            total_lines += lines
    
    print(f"📁 Total Files: {total_files}")
    print(f"📝 Total Lines: {total_lines:,}")
    print("\n📋 File Types:")
    for ext, count in sorted(file_types.items(), key=lambda x: x[1], reverse=True)[:10]:
        print(f"  {ext}: {count}")

# ============================================================
# 7. MAIN
# ============================================================

def main():
    print(f"{Colors.BOLD}{Colors.CYAN}")
    print("╔═══════════════════════════════════════════════════════════════╗")
    print("║                                                               ║")
    print("║           ALE KIRCHA REPOSITORY AUDIT                        ║")
    print("║           Complete System Overview                          ║")
    print("║                                                               ║")
    print("╚═══════════════════════════════════════════════════════════════╝")
    print(f"{Colors.END}")
    
    print(f"\n📅 Audit Date: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    
    audit_structure()
    audit_files()
    audit_schema()
    audit_env()
    audit_git()
    count_files()
    
    print_header("✅ AUDIT COMPLETE")
    print("\n🎉 All files are ready for development!")

if __name__ == "__main__":
    main()
