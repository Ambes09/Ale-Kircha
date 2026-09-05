#!/usr/bin/env python3

from pathlib import Path
from datetime import datetime
import shutil
import subprocess
import sys
import re

SCHEMA = Path("prisma/schema.prisma")

print("=" * 70)
print("ALE KIRCHA - PRISMA SCHEMA REPAIR")
print("=" * 70)

if not SCHEMA.exists():
    print(f"ERROR: Schema not found: {SCHEMA}")
    sys.exit(1)

original = SCHEMA.read_text(encoding="utf-8")

# ------------------------------------------------------------------
# 1. BACKUP
# ------------------------------------------------------------------

timestamp = datetime.now().strftime("%Y%m%d-%H%M%S")
backup = SCHEMA.with_name(f"schema.prisma.backup-{timestamp}")

shutil.copy2(SCHEMA, backup)

print(f"\n[1/5] Backup created:")
print(f"      {backup}")

text = original

# ------------------------------------------------------------------
# 2. FIX Order.membershipId
# ------------------------------------------------------------------

print("\n[2/5] Checking Order.membershipId...")

order_match = re.search(
    r'(model\s+Order\s*\{.*?)(?=\n\})',
    text,
    flags=re.DOTALL
)

if not order_match:
    print("ERROR: model Order not found.")
    sys.exit(1)

order_block = order_match.group(1)

membership_pattern = re.compile(
    r'^(\s*membershipId\s+String\?)\s*$',
    flags=re.MULTILINE
)

if re.search(r'^\s*membershipId\s+String\?\s+@unique\s*$', order_block, re.MULTILINE):
    print("      Already has @unique. No change needed.")

elif membership_pattern.search(order_block):
    new_order_block = membership_pattern.sub(
        r'\1       @unique',
        order_block,
        count=1
    )

    text = text[:order_match.start()] + new_order_block + text[order_match.end():]

    print("      FIXED: Order.membershipId -> @unique")

else:
    print("ERROR: Could not find Order.membershipId in expected form.")
    print("      No changes will be written.")
    sys.exit(1)

# ------------------------------------------------------------------
# 3. FIX UserLegalAcceptance inverse relation
# ------------------------------------------------------------------

print("\n[3/5] Checking User.legalAcceptances...")

user_match = re.search(
    r'(model\s+User\s*\{.*?)(?=\n\})',
    text,
    flags=re.DOTALL
)

if not user_match:
    print("ERROR: model User not found.")
    sys.exit(1)

user_block = user_match.group(1)

if re.search(
    r'^\s*legalAcceptances\s+UserLegalAcceptance\[\]\s*$',
    user_block,
    re.MULTILINE
):
    print("      Already has legalAcceptances. No change needed.")

else:
    # Insert immediately after the customer/admin relation area.
    anchor = re.search(
        r'^(\s*admin\s+Admin\?\s*)$',
        user_block,
        re.MULTILINE
    )

    if not anchor:
        print("ERROR: Could not safely locate User.admin relation.")
        print("      No changes will be written.")
        sys.exit(1)

    insertion = (
        anchor.group(1)
        + "\n"
        + "  legalAcceptances UserLegalAcceptance[]"
    )

    new_user_block = (
        user_block[:anchor.start()]
        + insertion
        + user_block[anchor.end():]
    )

    text = text[:user_match.start()] + new_user_block + text[user_match.end():]

    print("      FIXED: User.legalAcceptances added.")

# ------------------------------------------------------------------
# 4. REPLACE AuditLog
# ------------------------------------------------------------------

print("\n[4/5] Checking AuditLog...")

audit_pattern = re.compile(
    r'model\s+AuditLog\s*\{.*?\n\}',
    flags=re.DOTALL
)

audit_match = audit_pattern.search(text)

if not audit_match:
    print("ERROR: model AuditLog not found.")
    print("      No changes will be written.")
    sys.exit(1)

old_audit = audit_match.group(0)

new_audit = '''model AuditLog {
  id          String    @id @default(cuid())
  userId      String?
  username    String?
  role        String?
  action      String
  entityType  String
  entityId    String?
  oldValue    Json?
  newValue    Json?
  changes     Json?
  ipAddress   String?
  userAgent   String?
  metadata    Json?
  createdAt   DateTime  @default(now())

  // Actor
  user        User?     @relation("UserAudit", fields: [userId], references: [id])

  // Polymorphic target:
  // entityType identifies the target model.
  // entityId identifies the target record.
  //
  // Examples:
  // entityType = "ORDER",   entityId = order.id
  // entityType = "PAYMENT", entityId = payment.id
  // entityType = "REFUND",  entityId = refund.id
  //
  // Prisma does not support a true polymorphic foreign key,
  // so entityId intentionally has no FK relation.

  @@index([userId])
  @@index([entityType, entityId])
  @@index([action])
  @@index([createdAt])

  @@map("audit_logs")
}'''

if (
    'customer    Customer?' in old_audit
    and 'admin       Admin?' in old_audit
    and 'order       Order?' in old_audit
    and 'payment     Payment?' in old_audit
    and 'refund      RefundRequest?' in old_audit
    and 'complaint   Complaint?' in old_audit
    and 'delivery    Delivery?' in old_audit
    and 'group       KirchaGroup?' in old_audit
):
    text = (
        text[:audit_match.start()]
        + new_audit
        + text[audit_match.end():]
    )

    print("      FIXED: AuditLog polymorphic relations removed.")
    print("      FIXED: AuditLog now uses User actor + entityType/entityId.")
    print("      FIXED: AuditLog indexes added.")

else:
    print("WARNING: AuditLog does not exactly match expected old structure.")
    print("        It will NOT be automatically replaced.")
    print("        Review AuditLog manually.")

# ------------------------------------------------------------------
# 5. SAFETY CHECKS BEFORE WRITING
# ------------------------------------------------------------------

print("\n[5/5] Running safety checks...")

required_checks = [
    ("model User", r'\bmodel\s+User\s*\{'),
    ("model Order", r'\bmodel\s+Order\s*\{'),
    ("model AuditLog", r'\bmodel\s+AuditLog\s*\{'),
    ("Order.membershipId @unique",
     r'model\s+Order\s*\{.*?^\s*membershipId\s+String\?\s+@unique'),
    ("User.legalAcceptances",
     r'model\s+User\s*\{.*?^\s*legalAcceptances\s+UserLegalAcceptance\[\]'),
    ("AuditLog User relation",
     r'model\s+AuditLog\s*\{.*?^\s*user\s+User\?\s+@relation\("UserAudit"'),
    ("AuditLog entity index",
     r'model\s+AuditLog\s*\{.*?@@index\(\[entityType,\s*entityId\]\)')
]

for name, pattern in required_checks:
    if re.search(pattern, text, flags=re.DOTALL | re.MULTILINE):
        print(f"      OK: {name}")
    else:
        print(f"      FAIL: {name}")
        print("\nERROR: Safety check failed.")
        print("       Original schema has NOT been overwritten.")
        sys.exit(1)

# Make sure the old problematic AuditLog relations are gone.
for field in [
    "customer    Customer?",
    "admin       Admin?",
    "order       Order?",
    "payment     Payment?",
    "refund      RefundRequest?",
    "complaint   Complaint?",
    "delivery    Delivery?",
    "group       KirchaGroup?"
]:
    if field in new_audit:
        print(f"ERROR: Old AuditLog field still present: {field}")
        sys.exit(1)

# ------------------------------------------------------------------
# WRITE
# ------------------------------------------------------------------

SCHEMA.write_text(text, encoding="utf-8")

print("\nSchema successfully updated.")
print(f"Schema: {SCHEMA}")
print(f"Backup: {backup}")

# ------------------------------------------------------------------
# SHOW IMPORTANT CHANGES
# ------------------------------------------------------------------

print("\n" + "=" * 70)
print("IMPORTANT RESULT")
print("=" * 70)

print("""
1. Order.membershipId
   String? -> String? @unique

2. User
   Added:
   legalAcceptances UserLegalAcceptance[]

3. AuditLog
   Removed direct polymorphic Prisma relations:
   Customer
   Admin
   Order
   Payment
   RefundRequest
   Complaint
   Delivery
   KirchaGroup

4. AuditLog actor
   userId -> optional User relation

5. AuditLog target
   entityType + entityId

6. AuditLog indexes
   userId
   entityType + entityId
   action
   createdAt
""")

# ------------------------------------------------------------------
# FORMAT
# ------------------------------------------------------------------

print("=" * 70)
print("Running Prisma format...")
print("=" * 70)

format_result = subprocess.run(
    ["pnpm", "exec", "prisma", "format"],
    text=True,
    capture_output=True
)

print(format_result.stdout)

if format_result.stderr:
    print(format_result.stderr, file=sys.stderr)

if format_result.returncode != 0:
    print("\nWARNING: Prisma format failed.")
    print("The repaired schema is still saved.")
else:
    print("Prisma format completed successfully.")

# ------------------------------------------------------------------
# VALIDATE
# ------------------------------------------------------------------

print("\n" + "=" * 70)
print("Running Prisma validation...")
print("=" * 70)

validation = subprocess.run(
    ["pnpm", "exec", "prisma", "validate"],
    text=True,
    capture_output=True
)

validation_output = validation.stdout + validation.stderr

validation_file = Path.home() / "prisma-validate.txt"
validation_file.write_text(validation_output, encoding="utf-8")

print(validation_output)

print("=" * 70)

if validation.returncode == 0:
    print("SUCCESS: Prisma schema validation PASSED.")
    print(f"Validation log: {validation_file}")
else:
    print("Prisma validation still reports errors.")
    print(f"Validation log saved to: {validation_file}")
    print("\nDO NOT run migrations yet.")
    print("Review the remaining validation errors before proceeding.")

print("=" * 70)

