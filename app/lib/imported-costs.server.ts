import prisma from "../db.server";
import type { VariantMarginInput } from "./margin";

export async function upsertImportedCosts(shop: string, costs: Map<string, number>) {
  let imported = 0;
  for (const [sku, costAmount] of costs.entries()) {
    await prisma.importedCost.upsert({
      where: { shop_sku: { shop, sku } },
      create: { shop, sku, costAmount },
      update: { costAmount },
    });
    imported += 1;
  }
  return imported;
}

export async function getImportedCosts(shop: string) {
  const rows = await prisma.importedCost.findMany({ where: { shop } });
  return new Map(rows.map((row) => [row.sku, row.costAmount]));
}

export function applyImportedCostsBySku(variants: VariantMarginInput[], importedCosts: Map<string, number>): VariantMarginInput[] {
  return variants.map((variant) => {
    const sku = variant.sku?.trim();
    if (!sku || !importedCosts.has(sku)) return variant;
    return { ...variant, costAmount: importedCosts.get(sku) ?? variant.costAmount };
  });
}
