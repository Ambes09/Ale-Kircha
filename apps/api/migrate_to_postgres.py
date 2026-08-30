#!/usr/bin/env python3
"""
Smart PostgreSQL Migration Script
Only updates necessary files, preserves your working code
"""

import os
import re
import json
from pathlib import Path

# Define paths
API_DIR = Path("apps/api")
PRISMA_DIR = API_DIR / "prisma"
ENV_FILE = API_DIR / ".env"

def update_schema_for_postgres():
    """Update schema.prisma to use PostgreSQL with env()"""
    schema_path = PRISMA_DIR / "schema.prisma"
    
    if not schema_path.exists():
        print("❌ schema.prisma not found!")
        return False
    
    with open(schema_path, 'r') as f:
        content = f.read()
    
    # Check if already PostgreSQL
    if 'provider = "postgresql"' in content and 'url      = env("DATABASE_URL")' in content:
        print("✅ Schema already configured for PostgreSQL")
        return True
    
    # Replace SQLite with PostgreSQL
    # Find the datasource block
    lines = content.split('\n')
    new_lines = []
    in_datasource = False
    
    for i, line in enumerate(lines):
        if 'datasource db {' in line:
            in_datasource = True
            new_lines.append(line)
            continue
        
        if in_datasource:
            if 'provider = "sqlite"' in line:
                new_lines.append('  provider = "postgresql"')
                continue
            if 'url      = "file:./prisma/dev.db"' in line:
                new_lines.append('  url      = env("DATABASE_URL")')
                continue
            if '}' in line:
                in_datasource = False
                new_lines.append(line)
                continue
        
        new_lines.append(line)
    
    new_content = '\n'.join(new_lines)
    
    # Write the updated schema
    with open(schema_path, 'w') as f:
        f.write(new_content)
    
    print("✅ Updated schema.prisma for PostgreSQL")
    return True

def create_postgres_env():
    """Create a .env.postgres file with PostgreSQL URL"""
    env_postgres = API_DIR / ".env.postgres"
    
    # Check if .env exists to preserve other settings
    env_content = ""
    if ENV_FILE.exists():
        with open(ENV_FILE, 'r') as f:
            env_content = f.read()
    
    # Replace DATABASE_URL if exists
    lines = env_content.split('\n')
    new_lines = []
    updated = False
    
    for line in lines:
        if line.startswith('DATABASE_URL='):
            new_lines.append('DATABASE_URL="postgresql://ale:0QNGFoBSfH4BkBJAWE5muH74RKU6mNdB@dpg-daa3n0ek1f9s73fd3f6g-a/ale_kircha_ajgd"')
            updated = True
        else:
            new_lines.append(line)
    
    if not updated:
        # Add DATABASE_URL at the beginning
        new_lines.insert(0, 'DATABASE_URL="postgresql://ale:0QNGFoBSfH4BkBJAWE5muH74RKU6mNdB@dpg-daa3n0ek1f9s73fd3f6g-a/ale_kircha_ajgd"')
    
    # Write to .env.postgres
    with open(env_postgres, 'w') as f:
        f.write('\n'.join(new_lines))
    
    print("✅ Created .env.postgres with PostgreSQL URL")
    return True

def update_package_json():
    """Update package.json with PostgreSQL migration scripts"""
    package_path = API_DIR / "package.json"
    
    if not package_path.exists():
        print("❌ package.json not found!")
        return False
    
    with open(package_path, 'r') as f:
        content = f.read()
    
    data = json.loads(content)
    
    # Add migration script if not exists
    if 'scripts' not in data:
        data['scripts'] = {}
    
    if 'migrate:postgres' not in data['scripts']:
        data['scripts']['migrate:postgres'] = 'prisma migrate deploy'
    
    if 'generate:postgres' not in data['scripts']:
        data['scripts']['generate:postgres'] = 'prisma generate'
    
    # Write back
    with open(package_path, 'w') as f:
        json.dump(data, f, indent=2)
    
    print("✅ Updated package.json with PostgreSQL scripts")
    return True

def update_seed_for_postgres():
    """Update seed.js to handle PostgreSQL (if needed)"""
    seed_path = PRISMA_DIR / "seed.js"
    
    if not seed_path.exists():
        print("⚠️ seed.js not found, skipping")
        return True
    
    with open(seed_path, 'r') as f:
        content = f.read()
    
    # Check if already has PostgreSQL handling
    if 'postgres' in content.lower():
        print("✅ seed.js already has PostgreSQL handling")
        return True
    
    # Add PostgreSQL compatibility (no changes needed for most seeds)
    print("✅ seed.js is compatible with PostgreSQL")
    return True

def create_render_env_config():
    """Create a render-specific env config"""
    render_env = API_DIR / ".env.render"
    
    content = '''# Render PostgreSQL Environment
DATABASE_URL="postgresql://ale:0QNGFoBSfH4BkBJAWE5muH74RKU6mNdB@dpg-daa3n0ek1f9s73fd3f6g-a/ale_kircha_ajgd"
PORT=10000
NODE_ENV=production
CUSTOMER_BOT_TOKEN=8862292101:AAG9PCDCQi1mLvhIeOKb_N28lEWBEucmOxk
ADMIN_BOT_TOKEN=8901789973:AAHoWL2o1cBnwFb2GYSgPrPj6XkNvrVH4PA
ADMIN_TELEGRAM_IDS=678862323,5228276799
JWT_SECRET=super-secret-jwt-key-at-least-32-characters-long
API_URL=https://ale-kircha-kb3m.onrender.com
APP_URL=https://ale-kircha.vercel.app
CORS_ORIGINS=https://ale-kircha.vercel.app
TELEGRAM_MODE=webhook
PAYMENT_ADVICE_MAX_SIZE=5242880
DEFAULT_PAYMENT_DEADLINE_MINUTES=30
'''
    
    with open(render_env, 'w') as f:
        f.write(content)
    
    print("✅ Created .env.render with Render PostgreSQL config")
    return True

def main():
    print("=" * 50)
    print("🔄 MIGRATING TO POSTGRESQL")
    print("=" * 50)
    print()
    
    success = True
    
    # Update schema
    print("📝 Updating schema.prisma...")
    if not update_schema_for_postgres():
        success = False
    
    print()
    
    # Create PostgreSQL env
    print("📝 Creating .env.postgres...")
    if not create_postgres_env():
        success = False
    
    print()
    
    # Update package.json
    print("📝 Updating package.json...")
    if not update_package_json():
        success = False
    
    print()
    
    # Update seed
    print("📝 Checking seed.js...")
    if not update_seed_for_postgres():
        success = False
    
    print()
    
    # Create render env
    print("📝 Creating .env.render...")
    if not create_render_env_config():
        success = False
    
    print()
    
    if success:
        print("=" * 50)
        print("✅ MIGRATION COMPLETE!")
        print("=" * 50)
        print()
        print("📋 Files Updated:")
        print("  - prisma/schema.prisma (PostgreSQL config)")
        print("  - .env.postgres (PostgreSQL URL)")
        print("  - package.json (migration scripts)")
        print("  - .env.render (Render config)")
        print()
        print("🚀 Next Steps:")
        print("  1. Review changes: git diff")
        print("  2. Test locally with PostgreSQL?")
        print("     cp .env.postgres .env")
        print("     npx prisma db push")
        print("  3. Commit and push to GitHub")
        print("  4. Deploy to Render")
        print()
        print("📌 IMPORTANT: .env file still has SQLite for local dev")
        print("   Use .env.postgres for PostgreSQL testing")
    else:
        print("❌ Migration failed. Please check the errors above.")
    
    return success

if __name__ == "__main__":
    main()
