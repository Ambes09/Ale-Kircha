-- ============================================================
-- ALE KIRCHA - COMPLETE DATABASE SCHEMA EXTENSIONS
-- ============================================================

-- EXTEND CUSTOMER TABLE
ALTER TABLE "Customer" ADD COLUMN IF NOT EXISTS "status" TEXT DEFAULT 'ACTIVE';
ALTER TABLE "Customer" ADD COLUMN IF NOT EXISTS "termsVersion" TEXT;
ALTER TABLE "Customer" ADD COLUMN IF NOT EXISTS "termsAcceptedAt" TIMESTAMP;
ALTER TABLE "Customer" ADD COLUMN IF NOT EXISTS "lastActivity" TIMESTAMP;

-- KIRCHA TYPES (Admin Configurable)
CREATE TABLE IF NOT EXISTS "KirchaTypes" (
    "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    "nameEn" TEXT NOT NULL,
    "nameAm" TEXT NOT NULL,
    "code" TEXT UNIQUE NOT NULL,
    "isActive" BOOLEAN DEFAULT true,
    "createdAt" TIMESTAMP DEFAULT NOW(),
    "updatedAt" TIMESTAMP DEFAULT NOW()
);

-- QUOTA TYPES (Admin Configurable)
CREATE TABLE IF NOT EXISTS "QuotaTypes" (
    "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    "nameEn" TEXT NOT NULL,
    "nameAm" TEXT NOT NULL,
    "weight" DECIMAL(10,2) NOT NULL,
    "isActive" BOOLEAN DEFAULT true,
    "createdAt" TIMESTAMP DEFAULT NOW(),
    "updatedAt" TIMESTAMP DEFAULT NOW()
);

-- GROUPS TABLE (Complete)
CREATE TABLE IF NOT EXISTS "Groups" (
    "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    "groupId" TEXT UNIQUE NOT NULL,
    "name" TEXT NOT NULL,
    "nameAm" TEXT,
    "description" TEXT,
    "descriptionAm" TEXT,
    "kirchaTypeId" TEXT REFERENCES "KirchaTypes"("id"),
    "status" TEXT DEFAULT 'DRAFT',
    "maxQuota" DECIMAL(10,2) NOT NULL,
    "consumedQuota" DECIMAL(10,2) DEFAULT 0,
    "remainingQuota" DECIMAL(10,2) DEFAULT 0,
    "maxMembers" INTEGER,
    "currentMembers" INTEGER DEFAULT 0,
    "fullPrice" DECIMAL(10,2),
    "halfPrice" DECIMAL(10,2),
    "quarterPrice" DECIMAL(10,2),
    "serviceFee" DECIMAL(10,2) DEFAULT 0,
    "processingFee" DECIMAL(10,2) DEFAULT 0,
    "deliveryFee" DECIMAL(10,2) DEFAULT 0,
    "otherFee" DECIMAL(10,2) DEFAULT 0,
    "discount" DECIMAL(10,2) DEFAULT 0,
    "address" TEXT NOT NULL,
    "addressAm" TEXT,
    "city" TEXT,
    "subCity" TEXT,
    "woreda" TEXT,
    "landmark" TEXT,
    "maturityDate" TIMESTAMP,
    "expiryDate" TIMESTAMP,
    "maturityMode" TEXT DEFAULT 'QUOTA_BASED',
    "minPaidQuota" DECIMAL(10,2) DEFAULT 0,
    "minMembersRequired" INTEGER DEFAULT 0,
    "isPublished" BOOLEAN DEFAULT false,
    "approvedBy" TEXT,
    "approvedAt" TIMESTAMP,
    "createdBy" TEXT,
    "createdAt" TIMESTAMP DEFAULT NOW(),
    "updatedAt" TIMESTAMP DEFAULT NOW(),
    "remarks" TEXT,
    "remarksAm" TEXT
);

-- GROUP MEMBERSHIPS
CREATE TABLE IF NOT EXISTS "GroupMemberships" (
    "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    "groupId" TEXT REFERENCES "Groups"("id"),
    "customerId" TEXT REFERENCES "Customer"("id"),
    "quotaTypeId" TEXT REFERENCES "QuotaTypes"("id"),
    "quantity" INTEGER NOT NULL DEFAULT 1,
    "quotaUnits" DECIMAL(10,2) NOT NULL,
    "unitPrice" DECIMAL(10,2),
    "subtotal" DECIMAL(10,2),
    "serviceFee" DECIMAL(10,2) DEFAULT 0,
    "processingFee" DECIMAL(10,2) DEFAULT 0,
    "deliveryFee" DECIMAL(10,2) DEFAULT 0,
    "otherFee" DECIMAL(10,2) DEFAULT 0,
    "discount" DECIMAL(10,2) DEFAULT 0,
    "totalAmount" DECIMAL(10,2),
    "status" TEXT DEFAULT 'PENDING',
    "joinedAt" TIMESTAMP DEFAULT NOW(),
    "createdAt" TIMESTAMP DEFAULT NOW(),
    "updatedAt" TIMESTAMP DEFAULT NOW()
);

-- ORDERS (Complete)
CREATE TABLE IF NOT EXISTS "Orders" (
    "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    "orderNumber" TEXT UNIQUE NOT NULL,
    "customerId" TEXT REFERENCES "Customer"("id"),
    "groupId" TEXT REFERENCES "Groups"("id"),
    "membershipId" TEXT REFERENCES "GroupMemberships"("id"),
    "kirchaType" TEXT,
    "quotaType" TEXT,
    "quantity" INTEGER,
    "quotaUnits" DECIMAL(10,2),
    "unitPrice" DECIMAL(10,2),
    "subtotal" DECIMAL(10,2),
    "discount" DECIMAL(10,2) DEFAULT 0,
    "serviceFee" DECIMAL(10,2) DEFAULT 0,
    "processingFee" DECIMAL(10,2) DEFAULT 0,
    "deliveryFee" DECIMAL(10,2) DEFAULT 0,
    "otherFee" DECIMAL(10,2) DEFAULT 0,
    "tax" DECIMAL(10,2) DEFAULT 0,
    "totalAmount" DECIMAL(10,2),
    "paymentStatus" TEXT DEFAULT 'PENDING',
    "orderStatus" TEXT DEFAULT 'DRAFT',
    "refundStatus" TEXT DEFAULT 'NONE',
    "paymentMethod" TEXT,
    "paymentReference" TEXT,
    "paymentDate" TIMESTAMP,
    "verifiedBy" TEXT,
    "verifiedAt" TIMESTAMP,
    "completedAt" TIMESTAMP,
    "cancelledAt" TIMESTAMP,
    "createdAt" TIMESTAMP DEFAULT NOW(),
    "updatedAt" TIMESTAMP DEFAULT NOW(),
    "remarks" TEXT
);

-- PAYMENTS
CREATE TABLE IF NOT EXISTS "Payments" (
    "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    "paymentId" TEXT UNIQUE NOT NULL,
    "orderId" TEXT REFERENCES "Orders"("id"),
    "customerId" TEXT REFERENCES "Customer"("id"),
    "amount" DECIMAL(10,2) NOT NULL,
    "paymentMethod" TEXT NOT NULL,
    "payerName" TEXT,
    "transactionReference" TEXT,
    "paymentDate" TIMESTAMP,
    "adviceUrl" TEXT,
    "adviceStorageKey" TEXT,
    "adviceMimeType" TEXT,
    "adviceSize" INTEGER,
    "status" TEXT DEFAULT 'PENDING',
    "verifiedBy" TEXT,
    "verifiedAt" TIMESTAMP,
    "rejectionReason" TEXT,
    "remarks" TEXT,
    "createdAt" TIMESTAMP DEFAULT NOW(),
    "updatedAt" TIMESTAMP DEFAULT NOW()
);

-- REFUNDS
CREATE TABLE IF NOT EXISTS "Refunds" (
    "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    "refundId" TEXT UNIQUE NOT NULL,
    "orderId" TEXT REFERENCES "Orders"("id"),
    "customerId" TEXT REFERENCES "Customer"("id"),
    "originalAmount" DECIMAL(10,2) NOT NULL,
    "refundableAmount" DECIMAL(10,2) NOT NULL,
    "refundFee" DECIMAL(10,2) DEFAULT 0,
    "processingFee" DECIMAL(10,2) DEFAULT 0,
    "otherDeduction" DECIMAL(10,2) DEFAULT 0,
    "netRefund" DECIMAL(10,2) NOT NULL,
    "bankName" TEXT NOT NULL,
    "accountName" TEXT NOT NULL,
    "accountNumber" TEXT NOT NULL,
    "status" TEXT DEFAULT 'PENDING',
    "approvedBy" TEXT,
    "approvedAt" TIMESTAMP,
    "processedBy" TEXT,
    "processedAt" TIMESTAMP,
    "paymentReference" TEXT,
    "paymentAdviceUrl" TEXT,
    "paymentAdviceStorageKey" TEXT,
    "paymentDate" TIMESTAMP,
    "customerConfirmed" BOOLEAN DEFAULT false,
    "customerConfirmedAt" TIMESTAMP,
    "confirmationTimeout" BOOLEAN DEFAULT false,
    "issueReason" TEXT,
    "remarks" TEXT,
    "createdAt" TIMESTAMP DEFAULT NOW(),
    "updatedAt" TIMESTAMP DEFAULT NOW()
);

-- REFUND BANKS (Admin Configurable)
CREATE TABLE IF NOT EXISTS "RefundBanks" (
    "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    "nameEn" TEXT NOT NULL,
    "nameAm" TEXT NOT NULL,
    "code" TEXT UNIQUE NOT NULL,
    "minLength" INTEGER DEFAULT 10,
    "maxLength" INTEGER DEFAULT 20,
    "allowedChars" TEXT DEFAULT '0123456789',
    "isActive" BOOLEAN DEFAULT true,
    "createdAt" TIMESTAMP DEFAULT NOW(),
    "updatedAt" TIMESTAMP DEFAULT NOW()
);

-- REFUND FEES (Admin Configurable)
CREATE TABLE IF NOT EXISTS "RefundFees" (
    "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    "nameEn" TEXT NOT NULL,
    "nameAm" TEXT NOT NULL,
    "type" TEXT NOT NULL, -- percentage, fixed
    "value" DECIMAL(10,2) NOT NULL,
    "minAmount" DECIMAL(10,2) DEFAULT 0,
    "maxAmount" DECIMAL(10,2),
    "isActive" BOOLEAN DEFAULT true,
    "createdAt" TIMESTAMP DEFAULT NOW(),
    "updatedAt" TIMESTAMP DEFAULT NOW()
);

-- COMPLAINTS
CREATE TABLE IF NOT EXISTS "Complaints" (
    "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    "complaintId" TEXT UNIQUE NOT NULL,
    "customerId" TEXT REFERENCES "Customer"("id"),
    "orderId" TEXT REFERENCES "Orders"("id"),
    "paymentId" TEXT REFERENCES "Payments"("id"),
    "refundId" TEXT REFERENCES "Refunds"("id"),
    "category" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "descriptionAm" TEXT,
    "evidenceUrl" TEXT,
    "status" TEXT DEFAULT 'OPEN',
    "priority" TEXT DEFAULT 'NORMAL',
    "assignedTo" TEXT,
    "adminNotes" TEXT,
    "resolution" TEXT,
    "resolvedAt" TIMESTAMP,
    "createdAt" TIMESTAMP DEFAULT NOW(),
    "updatedAt" TIMESTAMP DEFAULT NOW()
);

-- SUPPORT TICKETS
CREATE TABLE IF NOT EXISTS "SupportTickets" (
    "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    "ticketId" TEXT UNIQUE NOT NULL,
    "customerId" TEXT REFERENCES "Customer"("id"),
    "category" TEXT NOT NULL,
    "subject" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "status" TEXT DEFAULT 'OPEN',
    "assignedTo" TEXT,
    "adminResponse" TEXT,
    "resolvedAt" TIMESTAMP,
    "createdAt" TIMESTAMP DEFAULT NOW(),
    "updatedAt" TIMESTAMP DEFAULT NOW()
);

-- NOTIFICATIONS
CREATE TABLE IF NOT EXISTS "Notifications" (
    "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    "notificationId" TEXT UNIQUE NOT NULL,
    "customerId" TEXT REFERENCES "Customer"("id"),
    "type" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "titleAm" TEXT,
    "body" TEXT NOT NULL,
    "bodyAm" TEXT,
    "language" TEXT DEFAULT 'en',
    "data" JSONB,
    "relatedEntity" TEXT,
    "relatedEntityId" TEXT,
    "isRead" BOOLEAN DEFAULT false,
    "readAt" TIMESTAMP,
    "deliveredAt" TIMESTAMP,
    "createdAt" TIMESTAMP DEFAULT NOW()
);

-- ADMIN NOTIFICATIONS
CREATE TABLE IF NOT EXISTS "AdminNotifications" (
    "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    "type" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "titleAm" TEXT,
    "body" TEXT NOT NULL,
    "bodyAm" TEXT,
    "data" JSONB,
    "relatedEntity" TEXT,
    "relatedEntityId" TEXT,
    "isRead" BOOLEAN DEFAULT false,
    "readAt" TIMESTAMP,
    "createdAt" TIMESTAMP DEFAULT NOW()
);

-- SYSTEM SETTINGS (Key-Value Store)
CREATE TABLE IF NOT EXISTS "SystemSettings" (
    "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    "key" TEXT UNIQUE NOT NULL,
    "value" TEXT NOT NULL,
    "type" TEXT DEFAULT 'string',
    "category" TEXT DEFAULT 'general',
    "description" TEXT,
    "updatedAt" TIMESTAMP DEFAULT NOW()
);

-- AUDIT LOG (Already exists, ensure complete)
ALTER TABLE "AuditLog" ADD COLUMN IF NOT EXISTS "entityType" TEXT;
ALTER TABLE "AuditLog" ADD COLUMN IF NOT EXISTS "entityId" TEXT;
ALTER TABLE "AuditLog" ADD COLUMN IF NOT EXISTS "oldValue" JSONB;
ALTER TABLE "AuditLog" ADD COLUMN IF NOT EXISTS "newValue" JSONB;
ALTER TABLE "AuditLog" ADD COLUMN IF NOT EXISTS "reason" TEXT;

-- INSERT DEFAULT DATA
-- Default Kircha Types
INSERT INTO "KirchaTypes" (nameEn, nameAm, code, isActive) VALUES 
('Goat', 'ፍየል', 'GOAT', true),
('Sheep', 'በግ', 'SHEEP', true),
('Ox', 'በሬ', 'OX', true)
ON CONFLICT (code) DO NOTHING;

-- Default Quota Types
INSERT INTO "QuotaTypes" (nameEn, nameAm, weight, isActive) VALUES 
('Full', 'ሙሉ', 1.00, true),
('Half', 'ግማሽ', 0.50, true),
('Quarter', 'ሩብ', 0.25, true)
ON CONFLICT DO NOTHING;

-- Default Refund Banks
INSERT INTO "RefundBanks" (nameEn, nameAm, code, minLength, maxLength) VALUES 
('Commercial Bank of Ethiopia', 'የኢትዮጵያ ንግድ ባንክ', 'CBE', 10, 20),
('Awash Bank', 'አዋሽ ባንክ', 'AWASH', 10, 20),
('Dashen Bank', 'ዳሽን ባንክ', 'DASHEN', 10, 20),
('Wegagen Bank', 'ወጋገን ባንክ', 'WEGAGEN', 10, 20)
ON CONFLICT DO NOTHING;

-- Default Settings
INSERT INTO "SystemSettings" (key, value, type, category, description) VALUES 
('refund_confirmation_hours', '1', 'number', 'refund', 'Hours to wait for customer refund confirmation'),
('refund_processing_hours', '2', 'number', 'refund', 'Expected refund processing time in hours'),
('max_groups_per_user', '5', 'number', 'groups', 'Maximum number of groups a user can create'),
('max_members_per_group', '50', 'number', 'groups', 'Maximum members per group'),
('group_expiry_days', '30', 'number', 'groups', 'Default group expiry in days'),
('max_quota_per_group', '100', 'number', 'groups', 'Maximum quota per group')
ON CONFLICT (key) DO NOTHING;

