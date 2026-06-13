import prisma from "../db.server";
import type { AuditSummary } from "./margin";

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
          currencyCode: f.currencyCode ?? null,
          profitAmount: f.profitAmount,
          marginBps: f.marginBps,
          targetProfitAmount: f.targetProfitAmount,
          gapToTargetAmount: f.gapToTargetAmount,
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
