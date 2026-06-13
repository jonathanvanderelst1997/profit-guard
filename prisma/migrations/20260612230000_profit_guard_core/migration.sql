-- CreateTable
CREATE TABLE IF NOT EXISTS "ShopSettings" (
    "shop" TEXT NOT NULL PRIMARY KEY,
    "minimumMarginBps" INTEGER NOT NULL DEFAULT 3000,
    "alertEmail" TEXT,
    "weeklyAlertsEnabled" BOOLEAN NOT NULL DEFAULT false,
    "planKey" TEXT NOT NULL DEFAULT 'free',
    "subscriptionId" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "AuditRun" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "shop" TEXT NOT NULL,
    "minimumMarginBps" INTEGER NOT NULL,
    "totalVariants" INTEGER NOT NULL,
    "lossCount" INTEGER NOT NULL,
    "lowMarginCount" INTEGER NOT NULL,
    "missingCostCount" INTEGER NOT NULL,
    "okCount" INTEGER NOT NULL,
    "totalPriceAmount" REAL NOT NULL DEFAULT 0,
    "lossAmount" REAL NOT NULL DEFAULT 0,
    "marginGapAmount" REAL NOT NULL DEFAULT 0,
    "demoMode" BOOLEAN NOT NULL DEFAULT false,
    "scanLimitReached" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "AuditFinding" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "auditRunId" TEXT NOT NULL,
    "shop" TEXT NOT NULL,
    "variantId" TEXT NOT NULL,
    "productTitle" TEXT NOT NULL,
    "variantTitle" TEXT,
    "sku" TEXT,
    "priceAmount" REAL NOT NULL,
    "costAmount" REAL,
    "currencyCode" TEXT,
    "profitAmount" REAL,
    "marginBps" INTEGER,
    "targetProfitAmount" REAL,
    "gapToTargetAmount" REAL,
    "severity" TEXT NOT NULL,
    "reason" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "AuditFinding_auditRunId_fkey" FOREIGN KEY ("auditRunId") REFERENCES "AuditRun" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "ImportedCost" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "shop" TEXT NOT NULL,
    "sku" TEXT NOT NULL,
    "costAmount" REAL NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "AlertLog" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "shop" TEXT NOT NULL,
    "email" TEXT,
    "status" TEXT NOT NULL,
    "message" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateIndex
CREATE INDEX IF NOT EXISTS "AuditRun_shop_createdAt_idx" ON "AuditRun"("shop", "createdAt");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "AuditFinding_shop_severity_idx" ON "AuditFinding"("shop", "severity");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "AuditFinding_auditRunId_idx" ON "AuditFinding"("auditRunId");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "ImportedCost_shop_idx" ON "ImportedCost"("shop");

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "ImportedCost_shop_sku_key" ON "ImportedCost"("shop", "sku");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "AlertLog_shop_createdAt_idx" ON "AlertLog"("shop", "createdAt");
