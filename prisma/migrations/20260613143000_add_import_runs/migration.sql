CREATE TABLE "ImportRun" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "shop" TEXT NOT NULL,
    "fileName" TEXT,
    "saved" BOOLEAN NOT NULL DEFAULT false,
    "csvRows" INTEGER NOT NULL DEFAULT 0,
    "matchedSkuCount" INTEGER NOT NULL DEFAULT 0,
    "unmatchedSkuCount" INTEGER NOT NULL DEFAULT 0,
    "savedCostCount" INTEGER NOT NULL DEFAULT 0,
    "duplicateSkuCount" INTEGER NOT NULL DEFAULT 0,
    "warningCount" INTEGER NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX "ImportRun_shop_createdAt_idx" ON "ImportRun"("shop", "createdAt");
