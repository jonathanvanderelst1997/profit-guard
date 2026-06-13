-- CreateTable
CREATE TABLE "Session" (
    "id" TEXT NOT NULL,
    "shop" TEXT NOT NULL,
    "state" TEXT NOT NULL,
    "isOnline" BOOLEAN NOT NULL DEFAULT false,
    "scope" TEXT,
    "expires" TIMESTAMP(3),
    "accessToken" TEXT NOT NULL,
    "userId" BIGINT,
    "firstName" TEXT,
    "lastName" TEXT,
    "email" TEXT,
    "accountOwner" BOOLEAN NOT NULL DEFAULT false,
    "locale" TEXT,
    "collaborator" BOOLEAN DEFAULT false,
    "emailVerified" BOOLEAN DEFAULT false,
    "refreshToken" TEXT,
    "refreshTokenExpires" TIMESTAMP(3),

    CONSTRAINT "Session_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ShopSettings" (
    "shop" TEXT NOT NULL,
    "minimumMarginBps" INTEGER NOT NULL DEFAULT 3000,
    "alertEmail" TEXT,
    "weeklyAlertsEnabled" BOOLEAN NOT NULL DEFAULT false,
    "planKey" TEXT NOT NULL DEFAULT 'free',
    "subscriptionId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ShopSettings_pkey" PRIMARY KEY ("shop")
);

-- CreateTable
CREATE TABLE "AuditRun" (
    "id" TEXT NOT NULL,
    "shop" TEXT NOT NULL,
    "minimumMarginBps" INTEGER NOT NULL,
    "totalVariants" INTEGER NOT NULL,
    "lossCount" INTEGER NOT NULL,
    "lowMarginCount" INTEGER NOT NULL,
    "missingCostCount" INTEGER NOT NULL,
    "okCount" INTEGER NOT NULL,
    "totalPriceAmount" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "lossAmount" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "marginGapAmount" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "demoMode" BOOLEAN NOT NULL DEFAULT false,
    "scanLimitReached" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AuditRun_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AuditFinding" (
    "id" TEXT NOT NULL,
    "auditRunId" TEXT NOT NULL,
    "shop" TEXT NOT NULL,
    "variantId" TEXT NOT NULL,
    "productTitle" TEXT NOT NULL,
    "variantTitle" TEXT,
    "sku" TEXT,
    "priceAmount" DOUBLE PRECISION NOT NULL,
    "costAmount" DOUBLE PRECISION,
    "currencyCode" TEXT,
    "profitAmount" DOUBLE PRECISION,
    "marginBps" INTEGER,
    "targetProfitAmount" DOUBLE PRECISION,
    "gapToTargetAmount" DOUBLE PRECISION,
    "severity" TEXT NOT NULL,
    "reason" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AuditFinding_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ImportedCost" (
    "id" TEXT NOT NULL,
    "shop" TEXT NOT NULL,
    "sku" TEXT NOT NULL,
    "costAmount" DOUBLE PRECISION NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ImportedCost_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AlertLog" (
    "id" TEXT NOT NULL,
    "shop" TEXT NOT NULL,
    "email" TEXT,
    "status" TEXT NOT NULL,
    "message" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AlertLog_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "AuditRun_shop_createdAt_idx" ON "AuditRun"("shop", "createdAt");

-- CreateIndex
CREATE INDEX "AuditFinding_shop_severity_idx" ON "AuditFinding"("shop", "severity");

-- CreateIndex
CREATE INDEX "AuditFinding_auditRunId_idx" ON "AuditFinding"("auditRunId");

-- CreateIndex
CREATE INDEX "ImportedCost_shop_idx" ON "ImportedCost"("shop");

-- CreateIndex
CREATE UNIQUE INDEX "ImportedCost_shop_sku_key" ON "ImportedCost"("shop", "sku");

-- CreateIndex
CREATE INDEX "AlertLog_shop_createdAt_idx" ON "AlertLog"("shop", "createdAt");

-- AddForeignKey
ALTER TABLE "AuditFinding" ADD CONSTRAINT "AuditFinding_auditRunId_fkey" FOREIGN KEY ("auditRunId") REFERENCES "AuditRun"("id") ON DELETE CASCADE ON UPDATE CASCADE;
