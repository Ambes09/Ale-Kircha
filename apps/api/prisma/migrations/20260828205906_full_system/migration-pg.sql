-- ============================================================
-- ALE KIRCHA - PostgreSQL Migration
-- Converted from SQLite to PostgreSQL syntax
-- ============================================================

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "telegramId" TEXT NOT NULL,
    "username" TEXT,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT,
    "phone" TEXT,
    "role" TEXT NOT NULL DEFAULT 'CUSTOMER',
    "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP NOT NULL
);

-- CreateTable
CREATE TABLE "Customer" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "fullName" TEXT NOT NULL,
    "additionalPhone" TEXT,
    "preferredLanguage" TEXT NOT NULL DEFAULT 'en',
    "registrationDate" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    CONSTRAINT "Customer_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "CustomerAddress" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "customerId" TEXT NOT NULL,
    "city" TEXT NOT NULL,
    "subCity" TEXT,
    "woreda" TEXT,
    "houseNumber" TEXT,
    "landmark" TEXT,
    "directions" TEXT,
    "latitude" REAL,
    "longitude" REAL,
    "isDefault" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP NOT NULL,
    CONSTRAINT "CustomerAddress_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "Customer" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "KirchaType" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "code" TEXT NOT NULL,
    "nameEn" TEXT NOT NULL,
    "nameAm" TEXT NOT NULL,
    "descriptionEn" TEXT,
    "descriptionAm" TEXT,
    "imageUrl" TEXT,
    "icon" TEXT,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "displayOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP NOT NULL
);

-- CreateTable
CREATE TABLE "KirchaGroup" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "groupCode" TEXT NOT NULL,
    "kirchaTypeId" TEXT NOT NULL,
    "nameEn" TEXT NOT NULL,
    "nameAm" TEXT NOT NULL,
    "descriptionEn" TEXT,
    "descriptionAm" TEXT,
    "status" TEXT NOT NULL DEFAULT 'DRAFT',
    "totalCapacity" REAL NOT NULL DEFAULT 0,
    "reservedQuantity" REAL NOT NULL DEFAULT 0,
    "soldQuantity" REAL NOT NULL DEFAULT 0,
    "unitPrice" REAL NOT NULL DEFAULT 0,
    "halfPrice" REAL,
    "quarterPrice" REAL,
    "deliveryFee" REAL NOT NULL DEFAULT 0,
    "discount" REAL NOT NULL DEFAULT 0,
    "tax" REAL NOT NULL DEFAULT 0,
    "additionalFees" REAL NOT NULL DEFAULT 0,
    "registrationOpenAt" TIMESTAMP NOT NULL,
    "registrationCloseAt" TIMESTAMP NOT NULL,
    "slaughterDate" TIMESTAMP,
    "slaughterTime" TEXT,
    "slaughterLocation" TEXT,
    "processingDate" TIMESTAMP,
    "deliveryDate" TIMESTAMP,
    "deliveryTimeStart" TEXT,
    "deliveryTimeEnd" TEXT,
    "deliveryArea" TEXT,
    "minQuantity" REAL NOT NULL DEFAULT 0.25,
    "maxQuantity" REAL NOT NULL DEFAULT 3,
    "quantityStep" REAL NOT NULL DEFAULT 0.25,
    "allowHalfShare" BOOLEAN NOT NULL DEFAULT true,
    "allowQuarterShare" BOOLEAN NOT NULL DEFAULT true,
    "expiryDate" TIMESTAMP,
    "autoExpire" BOOLEAN NOT NULL DEFAULT false,
    "minMembersRequired" INTEGER NOT NULL DEFAULT 2,
    "maxMembersAllowed" INTEGER NOT NULL DEFAULT 10,
    "createdBy" TEXT,
    "createdByCustomerId" TEXT,
    "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP NOT NULL,
    "closedAt" TIMESTAMP,
    CONSTRAINT "KirchaGroup_kirchaTypeId_fkey" FOREIGN KEY ("kirchaTypeId") REFERENCES "KirchaType" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "KirchaGroup_createdByCustomerId_fkey" FOREIGN KEY ("createdByCustomerId") REFERENCES "Customer" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "KirchaGroupImage" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "groupId" TEXT NOT NULL,
    "storageKey" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "mimeType" TEXT NOT NULL,
    "size" INTEGER NOT NULL,
    "isPrimary" BOOLEAN NOT NULL DEFAULT false,
    "displayOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "KirchaGroupImage_groupId_fkey" FOREIGN KEY ("groupId") REFERENCES "KirchaGroup" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "KirchaGroupMembership" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "groupId" TEXT NOT NULL,
    "customerId" TEXT NOT NULL,
    "portionType" TEXT NOT NULL DEFAULT 'FULL',
    "quantity" REAL NOT NULL,
    "unitPrice" REAL NOT NULL,
    "subtotal" REAL NOT NULL,
    "discount" REAL NOT NULL,
    "deliveryFee" REAL NOT NULL,
    "additionalFees" REAL NOT NULL,
    "tax" REAL NOT NULL,
    "totalAmount" REAL NOT NULL,
    "reservationStatus" TEXT NOT NULL DEFAULT 'PENDING',
    "paymentStatus" TEXT NOT NULL DEFAULT 'UNPAID',
    "orderStatus" TEXT NOT NULL DEFAULT 'DRAFT',
    "joinedAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "confirmedAt" TIMESTAMP,
    "cancelledAt" TIMESTAMP,
    "expiresAt" TIMESTAMP,
    CONSTRAINT "KirchaGroupMembership_groupId_fkey" FOREIGN KEY ("groupId") REFERENCES "KirchaGroup" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "KirchaGroupMembership_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "Customer" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Order" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "orderNumber" TEXT NOT NULL,
    "customerId" TEXT NOT NULL,
    "groupId" TEXT,
    "membershipId" TEXT,
    "quantity" REAL NOT NULL,
    "unitPrice" REAL NOT NULL,
    "subtotal" REAL NOT NULL,
    "discount" REAL NOT NULL,
    "discountType" TEXT NOT NULL DEFAULT 'FIXED',
    "discountDescription" TEXT,
    "serviceCharge" REAL NOT NULL DEFAULT 0,
    "serviceChargeType" TEXT NOT NULL DEFAULT 'FIXED',
    "serviceChargeDescription" TEXT,
    "deliveryFee" REAL NOT NULL DEFAULT 0,
    "deliveryZone" TEXT,
    "tax" REAL NOT NULL DEFAULT 0,
    "taxRate" REAL NOT NULL DEFAULT 0,
    "additionalFees" REAL NOT NULL DEFAULT 0,
    "totalAmount" REAL NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'DRAFT',
    "createdBy" TEXT,
    "deliveryAddressId" TEXT,
    "deliveryDate" TIMESTAMP,
    "deliveryTimeSlot" TEXT,
    "paymentMethodId" TEXT,
    "expiryDate" TIMESTAMP,
    "isExpired" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP NOT NULL,
    "cancelledAt" TIMESTAMP,
    "expiresAt" TIMESTAMP,
    CONSTRAINT "Order_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "Customer" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Order_groupId_fkey" FOREIGN KEY ("groupId") REFERENCES "KirchaGroup" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Order_membershipId_fkey" FOREIGN KEY ("membershipId") REFERENCES "KirchaGroupMembership" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Order_deliveryAddressId_fkey" FOREIGN KEY ("deliveryAddressId") REFERENCES "CustomerAddress" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Order_paymentMethodId_fkey" FOREIGN KEY ("paymentMethodId") REFERENCES "PaymentMethod" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "PaymentMethod" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "nameAm" TEXT,
    "accountName" TEXT NOT NULL,
    "accountNumber" TEXT NOT NULL,
    "instructions" TEXT,
    "instructionsAm" TEXT,
    "logoUrl" TEXT,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "displayOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP NOT NULL
);

-- CreateTable
CREATE TABLE "Payment" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "orderId" TEXT NOT NULL,
    "amount" REAL NOT NULL,
    "paymentMethodId" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'UNPAID',
    "adviceSubmittedAt" TIMESTAMP,
    "verifiedAt" TIMESTAMP,
    "verifiedBy" TEXT,
    "rejectionReason" TEXT,
    "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP NOT NULL,
    CONSTRAINT "Payment_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Payment_paymentMethodId_fkey" FOREIGN KEY ("paymentMethodId") REFERENCES "PaymentMethod" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "PaymentAdvice" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "paymentId" TEXT NOT NULL,
    "customerId" TEXT NOT NULL,
    "storageKey" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "mimeType" TEXT NOT NULL,
    "size" INTEGER NOT NULL,
    "uploadedAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "status" TEXT NOT NULL DEFAULT 'SUBMITTED',
    "adminNote" TEXT,
    "orderId" TEXT,
    CONSTRAINT "PaymentAdvice_paymentId_fkey" FOREIGN KEY ("paymentId") REFERENCES "Payment" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "PaymentAdvice_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "Customer" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "PaymentAdvice_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Delivery" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "orderId" TEXT NOT NULL,
    "assignedTo" TEXT,
    "assignedAt" TIMESTAMP,
    "pickedUpAt" TIMESTAMP,
    "outForDeliveryAt" TIMESTAMP,
    "deliveredAt" TIMESTAMP,
    "failedAt" TIMESTAMP,
    "status" TEXT NOT NULL DEFAULT 'UNASSIGNED',
    "notes" TEXT,
    "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP NOT NULL,
    CONSTRAINT "Delivery_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "FeeConfiguration" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "key" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "nameEn" TEXT NOT NULL,
    "nameAm" TEXT NOT NULL,
    "descriptionEn" TEXT,
    "descriptionAm" TEXT,
    "valueType" TEXT NOT NULL,
    "value" REAL NOT NULL DEFAULT 0,
    "minValue" REAL,
    "maxValue" REAL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "priority" INTEGER NOT NULL DEFAULT 0,
    "applyTo" TEXT NOT NULL DEFAULT 'ALL',
    "applyToId" TEXT,
    "startDate" TIMESTAMP,
    "endDate" TIMESTAMP,
    "createdBy" TEXT,
    "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP NOT NULL
);

-- CreateTable
CREATE TABLE "DeliveryZone" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "nameEn" TEXT NOT NULL,
    "nameAm" TEXT NOT NULL,
    "fee" REAL NOT NULL DEFAULT 0,
    "minOrder" REAL NOT NULL DEFAULT 0,
    "maxOrder" REAL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "priority" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP NOT NULL
);

-- CreateTable
CREATE TABLE "ServiceCharge" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "nameEn" TEXT NOT NULL,
    "nameAm" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "value" REAL NOT NULL DEFAULT 0,
    "descriptionEn" TEXT,
    "descriptionAm" TEXT,
    "applyTo" TEXT NOT NULL DEFAULT 'ALL',
    "applyToId" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "priority" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP NOT NULL
);

-- CreateTable
CREATE TABLE "DeliveryCharge" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "zoneId" TEXT,
    "baseFee" REAL NOT NULL DEFAULT 0,
    "perKmFee" REAL NOT NULL DEFAULT 0,
    "perKgFee" REAL NOT NULL DEFAULT 0,
    "minimumOrder" REAL NOT NULL DEFAULT 0,
    "maximumOrder" REAL,
    "weightRangeStart" REAL,
    "weightRangeEnd" REAL,
    "distanceRangeStart" REAL,
    "distanceRangeEnd" REAL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "priority" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP NOT NULL,
    CONSTRAINT "DeliveryCharge_zoneId_fkey" FOREIGN KEY ("zoneId") REFERENCES "DeliveryZone" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "RefundRequest" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "orderId" TEXT NOT NULL,
    "customerId" TEXT NOT NULL,
    "membershipId" TEXT,
    "originalAmount" REAL NOT NULL,
    "serviceCharge" REAL NOT NULL DEFAULT 0,
    "penaltyAmount" REAL NOT NULL DEFAULT 0,
    "refundAmount" REAL NOT NULL,
    "penaltyReason" TEXT,
    "bankName" TEXT,
    "accountName" TEXT,
    "accountNumber" TEXT,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "adminNote" TEXT,
    "adminActionAt" TIMESTAMP,
    "completedAt" TIMESTAMP,
    "paymentAdviceUrl" TEXT,
    "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP NOT NULL,
    CONSTRAINT "RefundRequest_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "RefundRequest_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "Customer" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "RefundRequest_membershipId_fkey" FOREIGN KEY ("membershipId") REFERENCES "KirchaGroupMembership" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Complaint" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "refundRequestId" TEXT NOT NULL,
    "customerId" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "imageUrl" TEXT,
    "status" TEXT NOT NULL DEFAULT 'OPEN',
    "adminResponse" TEXT,
    "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP NOT NULL,
    CONSTRAINT "Complaint_refundRequestId_fkey" FOREIGN KEY ("refundRequestId") REFERENCES "RefundRequest" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Complaint_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "Customer" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "SystemSetting" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "key" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "description" TEXT,
    "updatedAt" TIMESTAMP NOT NULL
);

-- CreateTable
CREATE TABLE "TermsVersion" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "version" TEXT NOT NULL,
    "titleEn" TEXT NOT NULL,
    "titleAm" TEXT NOT NULL,
    "contentEn" TEXT NOT NULL,
    "contentAm" TEXT NOT NULL,
    "effectiveFrom" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "isActive" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "PrivacyPolicyVersion" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "version" TEXT NOT NULL,
    "contentEn" TEXT NOT NULL,
    "contentAm" TEXT NOT NULL,
    "effectiveFrom" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "isActive" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "UserLegalAcceptance" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "customerId" TEXT,
    "termsVersionId" TEXT NOT NULL,
    "privacyVersionId" TEXT NOT NULL,
    "languageUsed" TEXT NOT NULL DEFAULT 'en',
    "telegramUserId" TEXT NOT NULL,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "acceptedAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "UserLegalAcceptance_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "UserLegalAcceptance_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "Customer" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "UserLegalAcceptance_termsVersionId_fkey" FOREIGN KEY ("termsVersionId") REFERENCES "TermsVersion" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "UserLegalAcceptance_privacyVersionId_fkey" FOREIGN KEY ("privacyVersionId") REFERENCES "PrivacyPolicyVersion" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "FAQ" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "order" INTEGER NOT NULL DEFAULT 0,
    "questionEn" TEXT NOT NULL,
    "questionAm" TEXT NOT NULL,
    "answerEn" TEXT NOT NULL,
    "answerAm" TEXT NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP NOT NULL
);

-- CreateTable
CREATE TABLE "Notification" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "customerId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "data" TEXT,
    "read" BOOLEAN NOT NULL DEFAULT false,
    "sentAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deliveredAt" TIMESTAMP,
    CONSTRAINT "Notification_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "Customer" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "SupportRequest" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "customerId" TEXT NOT NULL,
    "orderId" TEXT,
    "category" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'OPEN',
    "assignedTo" TEXT,
    "resolvedAt" TIMESTAMP,
    "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP NOT NULL,
    CONSTRAINT "SupportRequest_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "Customer" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "BannedUser" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "telegramId" TEXT NOT NULL,
    "reason" TEXT,
    "bannedBy" TEXT NOT NULL,
    "bannedAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiresAt" TIMESTAMP,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "notes" TEXT
);

-- CreateTable
CREATE TABLE "BulkMessage" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "target" TEXT NOT NULL,
    "targetId" TEXT,
    "sentBy" TEXT NOT NULL,
    "sentAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deliveredCount" INTEGER NOT NULL DEFAULT 0,
    "failedCount" INTEGER NOT NULL DEFAULT 0,
    "status" TEXT NOT NULL DEFAULT 'PENDING'
);

-- CreateTable
CREATE TABLE "BulkMessageRecipient" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "messageId" TEXT NOT NULL,
    "customerId" TEXT NOT NULL,
    "deliveredAt" TIMESTAMP,
    "readAt" TIMESTAMP,
    "status" TEXT NOT NULL DEFAULT 'PENDING'
);

-- CreateTable
CREATE TABLE "AuditLog" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "actorId" TEXT NOT NULL,
    "actorRole" TEXT NOT NULL,
    "actorName" TEXT,
    "action" TEXT NOT NULL,
    "entity" TEXT NOT NULL,
    "entityId" TEXT NOT NULL,
    "before" TEXT,
    "after" TEXT,
    "ip" TEXT,
    "userAgent" TEXT,
    "metadata" TEXT,
    "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "IdempotencyKey" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "key" TEXT NOT NULL,
    "response" TEXT NOT NULL,
    "expiresAt" TIMESTAMP NOT NULL,
    "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateIndexes
CREATE UNIQUE INDEX "User_telegramId_key" ON "User"("telegramId");
CREATE UNIQUE INDEX "User_phone_key" ON "User"("phone");
CREATE UNIQUE INDEX "Customer_userId_key" ON "Customer"("userId");
CREATE UNIQUE INDEX "KirchaType_code_key" ON "KirchaType"("code");
CREATE UNIQUE INDEX "KirchaGroup_groupCode_key" ON "KirchaGroup"("groupCode");
CREATE UNIQUE INDEX "Order_orderNumber_key" ON "Order"("orderNumber");
CREATE UNIQUE INDEX "PaymentMethod_name_key" ON "PaymentMethod"("name");
CREATE UNIQUE INDEX "Payment_orderId_key" ON "Payment"("orderId");
CREATE UNIQUE INDEX "Delivery_orderId_key" ON "Delivery"("orderId");
CREATE UNIQUE INDEX "FeeConfiguration_key_key" ON "FeeConfiguration"("key");
CREATE UNIQUE INDEX "SystemSetting_key_key" ON "SystemSetting"("key");
CREATE UNIQUE INDEX "TermsVersion_version_key" ON "TermsVersion"("version");
CREATE UNIQUE INDEX "PrivacyPolicyVersion_version_key" ON "PrivacyPolicyVersion"("version");
CREATE UNIQUE INDEX "BannedUser_telegramId_key" ON "BannedUser"("telegramId");
CREATE UNIQUE INDEX "IdempotencyKey_key_key" ON "IdempotencyKey"("key");
