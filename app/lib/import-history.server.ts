import prisma from "../db.server";
import type { ImportRunMetrics } from "./import-history";

export async function createImportRun(
  shop: string,
  input: ImportRunMetrics & { fileName?: string | null; saved: boolean },
) {
  return prisma.importRun.create({
    data: {
      shop,
      fileName: input.fileName?.slice(0, 180) || null,
      saved: input.saved,
      csvRows: input.csvRows,
      matchedSkuCount: input.matchedSkuCount,
      unmatchedSkuCount: input.unmatchedSkuCount,
      savedCostCount: input.savedCostCount,
      duplicateSkuCount: input.duplicateSkuCount,
      warningCount: input.warningCount,
    },
  });
}

export async function getRecentImportRuns(shop: string, take = 8) {
  return prisma.importRun.findMany({
    where: { shop },
    orderBy: { createdAt: "desc" },
    take,
  });
}
