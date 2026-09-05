#!/usr/bin/env python3

from pathlib import Path
from datetime import datetime
import shutil
import re
import subprocess
import sys

SCHEMA = Path("prisma/schema.prisma")

print("=" * 72)
print("ALE KIRCHA - FINAL AUDIT RELATION CLEANUP")
print("=" * 72)

if not SCHEMA.exists():
    print(f"ERROR: {SCHEMA} not found.")
    sys.exit(1)

text = SCHEMA.read_text(encoding="utf-8")

# ================================================================
# BACKUP
# ================================================================

timestamp = datetime.now().strftime("%Y%m%d-%H%M%S")
backup = SCHEMA.with_name(f"schema.prisma.audit-backup-{timestamp}")
shutil.copy2(SCHEMA, backup)

print(f"\nBackup created:")
print(f"  {backup}")

# ================================================================
# 1. REMOVE auditLogs FROM TARGET MODELS
# ================================================================

targets = [
    "Customer",
    "Admin",
    "KirchaGroup",
    "Order",
    "Payment",
    "RefundRequest",
    "Complaint",
    "Delivery",
]

print("\n[1] Removing obsolete AuditLog inverse relations...")

removed = []

for model_name in targets:

    pattern = re.compile(
        rf'(\bmodel\s+{re.escape(model_name)}\s*\{{)(.*?)(\n\}})',
        re.DOTALL
    )

    match = pattern.search(text)

    if not match:
        print(f"  WARNING: model {model_name} not found")
        continue

    block = match.group(2)

    # Remove auditLogs lines.
    new_block, count = re.subn(
        r'^\s*auditLogs\s+AuditLog\[\]\s+@relation\("'
        r'(CustomerAudit|AdminAudit|GroupAudit|OrderAudit|PaymentAudit|'
        r'RefundAudit|ComplaintAudit|DeliveryAudit)"\)\s*\n?',
        "",
        block,
        flags=re.MULTILINE
    )

    if count:
        removed.append(model_name)
        print(f"  OK: removed {model_name}.auditLogs")

        text = (
            text[:match.start(2)]
            + new_block
            + text[match.end(2):]
        )

print(f"\nRemoved audit inverse fields from {len(removed)} models.")

# ================================================================
# 2. LOCATE ALL AuditLog MODELS
# ================================================================

print("\n[2] Locating AuditLog model...")

audit_pattern = re.compile(
    r'\bmodel\s+AuditLog\s*\{.*?\n\}',
    re.DOTALL
)

matches = list(audit_pattern.finditer(text))

if not matches:
    print("ERROR: No AuditLog model found.")
    print("Backup is available at:")
    print(backup)
    sys.exit(1)

print(f"  Found {len(matches)} AuditLog model block(s).")

# There should only be one. If there are multiple, remove all and
# insert one clean definition at the position of the first one.

first_start = matches[0].start()

# ================================================================
# 3. REMOVE ALL AuditLog BLOCKS
# ================================================================

# Remove from bottom to top so positions remain valid.
for match in reversed(matches):
    text = text[:match.start()] + text[match.end():]

# ================================================================
# 4. REMOVE LEFTOVER AUDIT FIELDS THAT MAY HAVE BEEN CREATED
# ================================================================

print("\n[3] Removing obsolete AuditLog foreign-key fields...")

# These are the fields seen in your current broken AuditLog.
obsolete_fields = [
    "customerId",
    "adminId",
    "kirchaGroupId",
    "orderId",
    "paymentId",
    "refundRequestId",
    "complaintId",
    "deliveryId",
]

# IMPORTANT:
# Only remove these fields if they are inside the AuditLog model.
# Since we removed the entire AuditLog block above, nothing needs
# to be removed here. This list is informational.

print("  Old polymorphic FK fields will not be recreated.")

# ================================================================
# 5. CREATE ONE CLEAN AuditLog
# ================================================================

clean_audit = r'''
// ============================================================
// AUDIT
// ============================================================
//
// Audit design:
// - userId identifies the actor performing the action.
// - entityType identifies the affected entity type.
// - entityId identifies the affected record.
//
// entityId is intentionally NOT a Prisma foreign key because
// this is a polymorphic audit target. For example:
//
//   entityType = "CUSTOMER" and entityId = Customer.id
//   entityType = "ORDER"    and entityId = Order.id
//   entityType = "PAYMENT"  and entityId = Payment.id
//   entityType = "REFUND"   and entityId = RefundRequest.id
//   entityType = "GROUP"    and entityId = KirchaGroup.id
//
// ============================================================

model AuditLog {
  id          String    @id @default(cuid())

  // Actor
  userId      String?
  username    String?
  role        String?

  // Action
  action      String

  // Polymorphic target
  entityType  String
  entityId    String?

  // Change information
  oldValue    Json?
  newValue    Json?
  changes     Json?

  // Request information
  ipAddress   String?
  userAgent   String?

  // Additional information
  metadata    Json?

  createdAt   DateTime  @default(now())

  // Actor relation
  user        User?     @relation("UserAudit", fields: [userId], references: [id])

  // Indexes
  @@index([userId])
  @@index([entityType, entityId])
  @@index([action])
  @@index([createdAt])

  @@map("audit_logs")
}
'''

# ================================================================
# 6. INSERT CLEAN AuditLog
# ================================================================

# Put it at the end of the schema.
if not text.endswith("\n"):
    text += "\n"

text += clean_audit

# ================================================================
# 7. REMOVE POSSIBLE DUPLICATE User AUDIT RELATION
# ================================================================

print("\n[4] Checking User relations...")

user_pattern = re.compile(
    r'(\bmodel\s+User\s*\{)(.*?)(\n\})',
    re.DOTALL
)

user_match = user_pattern.search(text)

if not user_match:
    print("ERROR: User model not found.")
    sys.exit(1)

user_block = user_match.group(2)

# We want exactly one UserAudit relation.
user_audit_lines = re.findall(
    r'^\s*auditLogs\s+AuditLog\[\]\s+@relation\("UserAudit"\)\s*$',
    user_block,
    flags=re.MULTILINE
)

if len(user_audit_lines) == 0:
    print("  Adding User.auditLogs...")
    insertion = '\n  auditLogs         AuditLog[] @relation("UserAudit")'

    # Add after admin if possible.
    admin_match = re.search(
        r'^(\s*admin\s+Admin\?\s*)$',
        user_block,
        flags=re.MULTILINE
    )

    if admin_match:
        new_user_block = (
            user_block[:admin_match.end()]
            + insertion
            + user_block[admin_match.end():]
        )
    else:
        new_user_block = user_block + insertion

    text = (
        text[:user_match.start(2)]
        + new_user_block
        + text[user_match.end(2):]
    )

elif len(user_audit_lines) == 1:
    print("  OK: User.auditLogs already exists.")

else:
    print("  Multiple UserAudit relations found; normalizing.")

    user_block = re.sub(
        r'^\s*auditLogs\s+AuditLog\[\]\s+@relation\("UserAudit"\)\s*\n?',
        "",
        user_block,
        flags=re.MULTILINE
    )

    insertion = '\n  auditLogs         AuditLog[] @relation("UserAudit")'

    admin_match = re.search(
        r'^(\s*admin\s+Admin\?\s*)$',
        user_block,
        flags=re.MULTILINE
    )

    if admin_match:
        new_user_block = (
            user_block[:admin_match.end()]
            + insertion
            + user_block[admin_match.end():]
        )
    else:
        new_user_block = user_block + insertion

    text = (
        text[:user_match.start(2)]
        + new_user_block
        + text[user_match.end(2):]
    )

# ================================================================
# 8. CHECK LEGAL ACCEPTANCE
# ================================================================

print("\n[5] Checking UserLegalAcceptance relation...")

user_match = user_pattern.search(text)

if not user_match:
    print("ERROR: User model disappeared unexpectedly.")
    sys.exit(1)

user_block = user_match.group(2)

if re.search(
    r'^\s*legalAcceptances\s+UserLegalAcceptance\[\]\s*$',
    user_block,
    flags=re.MULTILINE
):
    print("  OK: User.legalAcceptances exists.")
else:
    print("  Adding User.legalAcceptances...")
    insertion = '\n  legalAcceptances UserLegalAcceptance[]'

    admin_match = re.search(
        r'^(\s*admin\s+Admin\?\s*)$',
        user_block,
        flags=re.MULTILINE
    )

    if admin_match:
        new_user_block = (
            user_block[:admin_match.end()]
            + insertion
            + user_block[admin_match.end():]
        )
    else:
        new_user_block = user_block + insertion

    text = (
        text[:user_match.start(2)]
        + new_user_block
        + text[user_match.end(2):]
    )

# ================================================================
# 9. CHECK ORDER MEMBERSHIP
# ================================================================

print("\n[6] Checking Order.membershipId...")

order_pattern = re.compile(
    r'(\bmodel\s+Order\s*\{)(.*?)(\n\})',
    re.DOTALL
)

order_match = order_pattern.search(text)

if not order_match:
    print("ERROR: Order model not found.")
    sys.exit(1)

order_block = order_match.group(2)

if re.search(
    r'^\s*membershipId\s+String\?\s+@unique\s*$',
    order_block,
    flags=re.MULTILINE
):
    print("  OK: Order.membershipId is unique.")

elif re.search(
    r'^\s*membershipId\s+String\?\s*$',
    order_block,
    flags=re.MULTILINE
):
    print("  Adding @unique to Order.membershipId...")

    new_order_block = re.sub(
        r'^(\s*membershipId\s+String\?)\s*$',
        r'\1 @unique',
        order_block,
        count=1,
        flags=re.MULTILINE
    )

    text = (
        text[:order_match.start(2)]
        + new_order_block
        + text[order_match.end(2):]
    )

else:
    print("ERROR: Order.membershipId not found.")
    sys.exit(1)

# ================================================================
# 10. SAFETY CHECK
# ================================================================

print("\n[7] Running safety checks...")

checks = {
    "User model":
        r'\bmodel\s+User\s*\{',

    "Order model":
        r'\bmodel\s+Order\s*\{',

    "AuditLog model":
        r'\bmodel\s+AuditLog\s*\{',

    "UserAudit":
        r'@relation\("UserAudit"\)',

    "legalAcceptances":
        r'legalAcceptances\s+UserLegalAcceptance\[\]',

    "membership unique":
        r'membershipId\s+String\?\s+@unique',
}

for name, pattern in checks.items():
    if re.search(pattern, text, flags=re.DOTALL):
        print(f"  OK: {name}")
    else:
        print(f"  FAIL: {name}")
        print("\nABORTING.")
        print("Original schema remains backed up at:")
        print(backup)
        sys.exit(1)

# Ensure target models no longer have auditLogs relations.
for model_name in targets:
    pattern = re.compile(
        rf'\bmodel\s+{re.escape(model_name)}\s*\{{.*?\n\}}',
        re.DOTALL
    )

    match = pattern.search(text)

    if match:
        if re.search(
            r'^\s*auditLogs\s+AuditLog\[\]',
            match.group(0),
            flags=re.MULTILINE
        ):
            print(f"  FAIL: {model_name} still contains auditLogs.")
            sys.exit(1)

print("  OK: obsolete target audit relations are gone.")

# Count AuditLog models.
audit_models = re.findall(
    r'\bmodel\s+AuditLog\s*\{',
    text
)

if len(audit_models) != 1:
    print(f"  FAIL: Expected exactly 1 AuditLog model, found {len(audit_models)}")
    sys.exit(1)

print("  OK: exactly one AuditLog model exists.")

# ================================================================
# 11. WRITE
# ================================================================

SCHEMA.write_text(text, encoding="utf-8")

print("\nSchema written successfully.")

# ================================================================
# 12. FORMAT
# ================================================================

print("\n" + "=" * 72)
print("RUNNING PRISMA FORMAT")
print("=" * 72)

fmt = subprocess.run(
    ["pnpm", "exec", "prisma", "format"],
    text=True,
    capture_output=True
)

if fmt.stdout:
    print(fmt.stdout)

if fmt.stderr:
    print(fmt.stderr)

if fmt.returncode != 0:
    print("\nWARNING: Prisma format returned an error.")
    print("The schema has still been saved.")
else:
    print("Prisma format: SUCCESS")

# ================================================================
# 13. VALIDATE
# ================================================================

print("\n" + "=" * 72)
print("RUNNING PRISMA VALIDATE")
print("=" * 72)

validation = subprocess.run(
    ["pnpm", "exec", "prisma", "validate"],
    text=True,
    capture_output=True
)

output = validation.stdout + validation.stderr

log = Path.home() / "prisma-validate-after-audit-fix.txt"
log.write_text(output, encoding="utf-8")

print(output)

print("=" * 72)

if validation.returncode == 0:
    print("SUCCESS: PRISMA SCHEMA VALIDATION PASSED.")
    print(f"Validation log: {log}")
    print("\nNEXT STEP: inspect the complete schema before migrations.")
else:
    print("VALIDATION STILL HAS ERRORS.")
    print(f"Full validation log: {log}")
    print("\nDO NOT run migrations yet.")

print("=" * 72)
