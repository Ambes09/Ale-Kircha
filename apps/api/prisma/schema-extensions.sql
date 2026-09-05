-- ============================================================
-- SETTINGS & CONFIGURATION TABLES
-- ============================================================

-- System Settings (key-value store)
CREATE TABLE IF NOT EXISTS "SystemSettings" (
    "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    "key" TEXT UNIQUE NOT NULL,
    "value" TEXT NOT NULL,
    "type" TEXT NOT NULL DEFAULT 'string',
    "category" TEXT NOT NULL DEFAULT 'general',
    "description" TEXT,
    "updatedAt" TIMESTAMP DEFAULT NOW()
);

-- Group Rules
CREATE TABLE IF NOT EXISTS "GroupRules" (
    "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    "ruleKey" TEXT UNIQUE NOT NULL,
    "ruleValue" TEXT NOT NULL,
    "descriptionEn" TEXT,
    "descriptionAm" TEXT,
    "isActive" BOOLEAN DEFAULT true,
    "updatedAt" TIMESTAMP DEFAULT NOW()
);

-- FAQ
CREATE TABLE IF NOT EXISTS "FAQ" (
    "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    "questionEn" TEXT NOT NULL,
    "questionAm" TEXT NOT NULL,
    "answerEn" TEXT NOT NULL,
    "answerAm" TEXT NOT NULL,
    "category" TEXT DEFAULT 'general',
    "displayOrder" INTEGER DEFAULT 0,
    "isActive" BOOLEAN DEFAULT true,
    "createdAt" TIMESTAMP DEFAULT NOW(),
    "updatedAt" TIMESTAMP DEFAULT NOW()
);

-- About Us / Contact
CREATE TABLE IF NOT EXISTS "AboutContent" (
    "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    "contentEn" TEXT NOT NULL,
    "contentAm" TEXT NOT NULL,
    "type" TEXT DEFAULT 'about',
    "isActive" BOOLEAN DEFAULT true,
    "updatedAt" TIMESTAMP DEFAULT NOW()
);

-- Contact Info
CREATE TABLE IF NOT EXISTS "ContactInfo" (
    "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    "type" TEXT NOT NULL, -- phone, email, address, social
    "labelEn" TEXT NOT NULL,
    "labelAm" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "displayOrder" INTEGER DEFAULT 0,
    "isActive" BOOLEAN DEFAULT true,
    "updatedAt" TIMESTAMP DEFAULT NOW()
);

-- Fees & Charges
CREATE TABLE IF NOT EXISTS "Fees" (
    "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    "name" TEXT NOT NULL,
    "nameAm" TEXT NOT NULL,
    "type" TEXT NOT NULL, -- fixed, percentage, per_unit
    "value" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "category" TEXT NOT NULL, -- delivery, service, tax, discount
    "minAmount" DECIMAL(10,2),
    "maxAmount" DECIMAL(10,2),
    "isActive" BOOLEAN DEFAULT true,
    "createdAt" TIMESTAMP DEFAULT NOW(),
    "updatedAt" TIMESTAMP DEFAULT NOW()
);

-- Delivery Zones
CREATE TABLE IF NOT EXISTS "DeliveryZones" (
    "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    "name" TEXT NOT NULL,
    "nameAm" TEXT NOT NULL,
    "baseFee" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "perKmFee" DECIMAL(10,2) DEFAULT 0,
    "minOrder" DECIMAL(10,2) DEFAULT 0,
    "maxOrder" DECIMAL(10,2),
    "isActive" BOOLEAN DEFAULT true,
    "createdAt" TIMESTAMP DEFAULT NOW(),
    "updatedAt" TIMESTAMP DEFAULT NOW()
);

-- Self Help
CREATE TABLE IF NOT EXISTS "SelfHelp" (
    "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    "titleEn" TEXT NOT NULL,
    "titleAm" TEXT NOT NULL,
    "contentEn" TEXT NOT NULL,
    "contentAm" TEXT NOT NULL,
    "category" TEXT DEFAULT 'general',
    "displayOrder" INTEGER DEFAULT 0,
    "isActive" BOOLEAN DEFAULT true,
    "createdAt" TIMESTAMP DEFAULT NOW(),
    "updatedAt" TIMESTAMP DEFAULT NOW()
);

