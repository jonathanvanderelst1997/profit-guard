CREATE TABLE "ImportRun" (
    "id" TEXT NOT NULL,
    "shop" TEXT NOT NULL,
    "fileName" TEXT,
    "saved" BOOLEAN NOT NULL DEFAULT false,
    "csvRows" INTEGER NOT NULL DEFAULT 0,
    "matchedSkuCount" INTEGER NOT NULL DEFAULT 0,
    "unmatchedSkuCount" INTEGER NOT NULL DEFAULT 0,
    "savedCostCount" INTEGER NOT NULL DEFAULT 0,
    "duplicateSkuCount" INTEGER NOT NULL DEFAULT 0,
    "warningCount" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ImportRun_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "ImportRun_shop_createdAt_idx" ON "ImportRun"("shop", "createdAt");
