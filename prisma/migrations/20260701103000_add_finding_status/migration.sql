ALTER TABLE "AuditFinding" ADD COLUMN "status" TEXT NOT NULL DEFAULT 'ACTIVE';
ALTER TABLE "AuditFinding" ADD COLUMN "statusUpdatedAt" DATETIME;

CREATE INDEX "AuditFinding_shop_status_idx" ON "AuditFinding"("shop", "status");
