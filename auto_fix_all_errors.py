#!/usr/bin/env python3
"""
ALE KIRCHA - AUTO FIX SCRIPT
Detects and fixes common TypeScript errors in the project
"""

import os
import re
import subprocess
from pathlib import Path

# Colors for output
GREEN = '\033[92m'
YELLOW = '\033[93m'
RED = '\033[91m'
BLUE = '\033[94m'
NC = '\033[0m'

def print_status(msg, type="info"):
    colors = {
        "info": BLUE,
        "success": GREEN,
        "warning": YELLOW,
        "error": RED
    }
    prefix = {
        "info": "ℹ️",
        "success": "✅",
        "warning": "⚠️",
        "error": "❌"
    }
    print(f"{colors.get(type, BLUE)}{prefix.get(type, 'ℹ️')} {msg}{NC}")

def find_files(directory, pattern):
    """Find all files matching pattern"""
    matches = []
    for root, dirs, files in os.walk(directory):
        for file in files:
            if file.endswith(pattern):
                matches.append(os.path.join(root, file))
    return matches

def fix_kircha_group_controller(file_path):
    """Fix KirchaGroupController errors"""
    print_status(f"Fixing {file_path}...", "info")
    
    with open(file_path, 'r') as f:
        content = f.read()
    
    # Fix additionalFees -> additionalFee
    content = content.replace('additionalFees', 'additionalFee')
    
    # Fix reservedQuantity -> reservedQuota (or remove if not needed)
    # Replace reservedQuantity with reservedQuota
    content = content.replace('reservedQuantity', 'reservedQuota')
    content = content.replace('soldQuantity', 'soldQuota')
    content = content.replace('totalCapacity', 'maxQuota')
    
    # Fix Decimal arithmetic - wrap with Number() or parseFloat
    # This is a simple fix - in production you'd want proper Decimal handling
    content = re.sub(r'(\w+)\.unitPrice', r'Number(\1.unitPrice)', content)
    content = re.sub(r'(\w+)\.deliveryFee', r'Number(\1.deliveryFee)', content)
    content = re.sub(r'(\w+)\.discount', r'Number(\1.discount)', content)
    content = re.sub(r'(\w+)\.tax', r'Number(\1.tax)', content)
    content = re.sub(r'(\w+)\.additionalFee', r'Number(\1.additionalFee)', content)
    
    with open(file_path, 'w') as f:
        f.write(content)
    
    print_status(f"Fixed {file_path}", "success")

def fix_kircha_type_controller(file_path):
    """Fix KirchaTypeController errors"""
    print_status(f"Fixing {file_path}...", "info")
    
    with open(file_path, 'r') as f:
        content = f.read()
    
    # Fix active -> isActive
    content = content.replace('active:', 'isActive:')
    content = content.replace('active =', 'isActive =')
    content = content.replace('{ active:', '{ isActive:')
    content = content.replace('active: true', 'isActive: true')
    content = content.replace('active: false', 'isActive: false')
    
    # Fix where clause
    content = re.sub(r'where:\s*\{\s*active:\s*true\s*\}', 'where: { isActive: true }', content)
    
    with open(file_path, 'w') as f:
        f.write(content)
    
    print_status(f"Fixed {file_path}", "success")

def fix_notification_controller(file_path):
    """Fix NotificationController errors"""
    print_status(f"Fixing {file_path}...", "info")
    
    with open(file_path, 'r') as f:
        content = f.read()
    
    # Fix customerId -> customer relation
    content = re.sub(r'customerId:', 'customer: { connect: { id: ', content)
    content = re.sub(r'customerId\s*=\s*([^,\s]+)', r'customer: { connect: { id: \1 } }', content)
    
    # Fix sentAt -> createdAt
    content = content.replace('sentAt:', 'createdAt:')
    content = content.replace('orderBy: { sentAt:', 'orderBy: { createdAt:')
    
    # Fix read -> isRead
    content = content.replace('read:', 'isRead:')
    content = content.replace('read =', 'isRead =')
    
    with open(file_path, 'w') as f:
        f.write(content)
    
    print_status(f"Fixed {file_path}", "success")

def fix_order_controller(file_path):
    """Fix OrderController errors"""
    print_status(f"Fixing {file_path}...", "info")
    
    with open(file_path, 'r') as f:
        content = f.read()
    
    # Fix payment relation access
    content = content.replace('order.payment?.verifiedAt', 'order.payment?.verifiedAt')
    # Ensure payment is included in query
    content = re.sub(r'include:\s*\{', 'include: { payment: true, delivery: true, ', content)
    
    with open(file_path, 'w') as f:
        f.write(content)
    
    print_status(f"Fixed {file_path}", "success")

def fix_payment_advice_controller(file_path):
    """Fix PaymentAdviceController errors"""
    print_status(f"Fixing {file_path}...", "info")
    
    with open(file_path, 'r') as f:
        content = f.read()
    
    # Fix customerId -> customer connect
    content = re.sub(r'customerId:\s*([^,]+),', r'customer: { connect: { id: \1 } },', content)
    
    # Fix status values
    content = content.replace("'VERIFICATION'", "'UNDER_REVIEW'")
    content = content.replace("'PAYMENT_REVIEW'", "'PAYMENT_UNDER_REVIEW'")
    
    with open(file_path, 'w') as f:
        f.write(content)
    
    print_status(f"Fixed {file_path}", "success")

def fix_report_controller(file_path):
    """Fix ReportController errors"""
    print_status(f"Fixing {file_path}...", "info")
    
    with open(file_path, 'r') as f:
        content = f.read()
    
    # Fix Decimal arithmetic - wrap with Number()
    content = re.sub(r'sum\s*\+\s*(\w+\.\w+)', r'sum + Number(\1)', content)
    content = re.sub(r'(\w+)\s*\+\s*(\w+\.\w+)', r'\1 + Number(\2)', content)
    
    # Fix status comparisons
    content = content.replace("'PAID'", "'CONFIRMED'")
    content = content.replace("'VERIFICATION'", "'UNDER_REVIEW'")
    content = content.replace("'FAILED'", "'FAILED_DELIVERY'")
    
    # Fix include fields
    content = content.replace('deliveryAddress:', 'delivery: { include: { order: true } },')
    content = content.replace('groupMemberships:', 'memberships:')
    content = content.replace('registrationDate:', 'createdAt:')
    
    # Fix property access
    content = content.replace('g.totalCapacity', 'g.maxQuota')
    content = content.replace('g.reservedQuantity', 'g.reservedQuota')
    content = content.replace('g.soldQuantity', 'g.soldQuota')
    content = content.replace('c.orders', 'c.orders || []')
    content = content.replace('c.groupMemberships', 'c.memberships || []')
    
    with open(file_path, 'w') as f:
        f.write(content)
    
    print_status(f"Fixed {file_path}", "success")

def fix_settings_controller(file_path):
    """Fix SettingsController errors"""
    print_status(f"Fixing {file_path}...", "info")
    
    with open(file_path, 'r') as f:
        content = f.read()
    
    # Add missing fields to SystemSetting create
    content = re.sub(
        r'create:\s*\{\s*key,\s*value,\s*description\s*\}',
        'create: { key, value, description, type: "string", category: "general" }',
        content
    )
    
    with open(file_path, 'w') as f:
        f.write(content)
    
    print_status(f"Fixed {file_path}", "success")

def fix_support_controller(file_path):
    """Fix SupportController errors"""
    print_status(f"Fixing {file_path}...", "info")
    
    with open(file_path, 'r') as f:
        content = f.read()
    
    # Fix orderId -> order connect
    content = re.sub(r'orderId:\s*([^,]+),', r'order: { connect: { id: \1 } },', content)
    
    with open(file_path, 'w') as f:
        f.write(content)
    
    print_status(f"Fixed {file_path}", "success")

def fix_terms_controller(file_path):
    """Fix TermsController errors"""
    print_status(f"Fixing {file_path}...", "info")
    
    with open(file_path, 'r') as f:
        content = f.read()
    
    # Fix isActive -> isCurrent for terms
    content = content.replace('isActive:', 'isCurrent:')
    content = content.replace('isActive =', 'isCurrent =')
    content = content.replace('{ isActive: true }', '{ isCurrent: true }')
    
    # Fix effectiveFrom -> effectiveDate
    content = content.replace('effectiveFrom:', 'effectiveDate:')
    content = content.replace('effectiveFrom =', 'effectiveDate =')
    content = content.replace('orderBy: { effectiveFrom:', 'orderBy: { effectiveDate:')
    
    # Fix languageUsed -> language
    content = content.replace('languageUsed:', 'language:')
    content = content.replace('languageUsed =', 'language =')
    
    with open(file_path, 'w') as f:
        f.write(content)
    
    print_status(f"Fixed {file_path}", "success")

def fix_auth_middleware(file_path):
    """Fix Auth middleware errors"""
    print_status(f"Fixing {file_path}...", "info")
    
    with open(file_path, 'r') as f:
        content = f.read()
    
    # Fix telegramId -> telegramId (keep as is, but ensure proper usage)
    content = content.replace('where: { telegramId }', 'where: { telegramId: telegramId }')
    content = content.replace('data: { active:', 'data: { isActive:')
    
    with open(file_path, 'w') as f:
        f.write(content)
    
    print_status(f"Fixed {file_path}", "success")

def fix_server_pg(file_path):
    """Fix server-pg.ts errors"""
    print_status(f"Fixing {file_path}...", "info")
    
    with open(file_path, 'r') as f:
        content = f.read()
    
    # Fix NOW() -> new Date()
    content = content.replace('NOW()', 'new Date()')
    
    with open(file_path, 'w') as f:
        f.write(content)
    
    print_status(f"Fixed {file_path}", "success")

def main():
    print("=" * 60)
    print("🔧 ALE KIRCHA - AUTO FIX SCRIPT")
    print("=" * 60)
    print()
    
    # Find all TypeScript files
    api_dir = "apps/api/src"
    
    if not os.path.exists(api_dir):
        print_status(f"Directory {api_dir} not found!", "error")
        return
    
    # Fix files based on their content
    fixes = [
        (r'kirchaGroupController\.ts$', fix_kircha_group_controller),
        (r'kirchaTypeController\.ts$', fix_kircha_type_controller),
        (r'notificationController\.ts$', fix_notification_controller),
        (r'orderController\.ts$', fix_order_controller),
        (r'paymentAdviceController\.ts$', fix_payment_advice_controller),
        (r'reportController\.ts$', fix_report_controller),
        (r'settingsController\.ts$', fix_settings_controller),
        (r'supportController\.ts$', fix_support_controller),
        (r'termsController\.ts$', fix_terms_controller),
        (r'auth\.ts$', fix_auth_middleware),
        (r'server-pg\.ts$', fix_server_pg),
    ]
    
    for pattern, fix_func in fixes:
        for root, dirs, files in os.walk(api_dir):
            for file in files:
                if re.search(pattern, file):
                    file_path = os.path.join(root, file)
                    try:
                        fix_func(file_path)
                    except Exception as e:
                        print_status(f"Error fixing {file_path}: {e}", "error")
    
    print()
    print_status("All fixes applied!", "success")
    print()
    print_status("Now run: pnpm exec prisma validate", "info")
    print_status("Then: pnpm exec tsc --noEmit", "info")
    print("=" * 60)

if __name__ == "__main__":
    main()
