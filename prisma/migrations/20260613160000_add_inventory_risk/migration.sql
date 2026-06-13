ALTER TABLE "AuditRun" ADD COLUMN "inventoryRiskAmount" REAL NOT NULL DEFAULT 0;
ALTER TABLE "AuditFinding" ADD COLUMN "inventoryQuantity" INTEGER;
ALTER TABLE "AuditFinding" ADD COLUMN "inventoryRiskAmount" REAL;
