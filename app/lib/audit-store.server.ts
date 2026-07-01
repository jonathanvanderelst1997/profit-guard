import prisma from "../db.server";
import type { AuditSummary } from "./margin";

export const FINDING_STATUSES = ["ACTIVE", "RESOLVED", "IGNORED"] as const;
export type FindingStatus = (typeof FINDING_STATUSES)[number];

export function normalizeFindingStatus(value: FormDataEntryValue | string | null | undefined): FindingStatus {
  const status = String(value ?? "ACTIVE").toUpperCase();
  if (status === "RESOLVED" || status === "IGNORED") return status;
  return "ACTIVE";
}

export async function saveAuditRun(shop: string, minimumMarginBps: number, summary: AuditSummary, options: { demoMode?: boolean; scanLimitReached?: boolean } = {}) {
  return prisma.auditRun.create({
    data: {
      shop,
      minimumMarginBps,
      totalVariants: summary.totalVariants,
      lossCount: summary.lossCount,
      lowMarginCount: summary.lowMarginCount,
      missingCostCount: summary.missingCostCount,
      okCount: summary.okCount,
      totalPriceAmount: summary.totalPriceAmount,
      lossAmount: summary.lossAmount,
      marginGapAmount: summary.marginGapAmount,
      inventoryRiskAmount: summary.inventoryRiskAmount,
      demoMode: options.demoMode ?? false,
      scanLimitReached: options.scanLimitReached ?? false,
      findings: {
        create: summary.findings.map((f) => ({
          shop,
          variantId: f.variantId,
          productTitle: f.productTitle,
          variantTitle: f.variantTitle ?? null,
          sku: f.sku ?? null,
          priceAmount: f.priceAmount,
          costAmount: f.costAmount ?? null,
          costSource: f.costSource ?? null,
          inventoryQuantity: f.inventoryQuantity ?? null,
          currencyCode: f.currencyCode ?? null,
          profitAmount: f.profitAmount,
          marginBps: f.marginBps,
          targetProfitAmount: f.targetProfitAmount,
          gapToTargetAmount: f.gapToTargetAmount,
          inventoryRiskAmount: f.inventoryRiskAmount,
          severity: f.severity,
          reason: f.reason,
        })),
      },
    },
    include: { findings: { orderBy: [{ severity: "asc" }, { marginBps: "asc" }] } },
  });
}

export async function getLatestAuditRun(shop: string, options: { takeFindings?: number } = {}) {
  return prisma.auditRun.findFirst({
    where: { shop },
    orderBy: { createdAt: "desc" },
    include: { findings: { orderBy: [{ severity: "asc" }, { marginBps: "asc" }], take: options.takeFindings ?? 100 } },
  });
}

export async function getLatestAuditRunForExport(shop: string) {
  return prisma.auditRun.findFirst({
    where: { shop },
    orderBy: { createdAt: "desc" },
    include: { findings: { orderBy: [{ severity: "asc" }, { marginBps: "asc" }] } },
  });
}

export async function updateAuditFindingStatus(shop: string, findingId: string, status: FindingStatus) {
  const result = await prisma.auditFinding.updateMany({
    where: { id: findingId, shop },
    data: { status, statusUpdatedAt: new Date() },
  });
  if (result.count === 0) throw new Error("Finding not found.");
  return { id: findingId, status };
}
