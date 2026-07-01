ALTER TABLE "AuditFinding" ADD COLUMN "status" TEXT NOT NULL DEFAULT 'ACTIVE';
ALTER TABLE "AuditFinding" ADD COLUMN "statusUpdatedAt" TIMESTAMP(3);

CREATE INDEX "AuditFinding_shop_status_idx" ON "AuditFinding"("shop", "status");
