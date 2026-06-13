import prisma from "../db.server";
import type { VariantMarginInput } from "./margin";
import { findImportedCostForVariant, normalizeStoredCostKey } from "./cost-matching";

export async function upsertImportedCosts(shop: string, costs: Map<string, number>) {
  let imported = 0;
  for (const [costKey, costAmount] of costs.entries()) {
    await prisma.importedCost.upsert({
      where: { shop_sku: { shop, sku: costKey } },
      create: { shop, sku: costKey, costAmount },
      update: { costAmount },
    });
    imported += 1;
  }
  return imported;
}

export async function getImportedCosts(shop: string) {
  const rows = await prisma.importedCost.findMany({ where: { shop } });
  return new Map(rows.map((row) => [normalizeStoredCostKey(row.sku), row.costAmount]));
}

export function applyImportedCostsBySku(variants: VariantMarginInput[], importedCosts: Map<string, number>): VariantMarginInput[] {
  return variants.map((variant) => {
    const importedCost = findImportedCostForVariant(variant, importedCosts);
    if (importedCost === null) return variant;
    return { ...variant, costAmount: importedCost, costSource: "SUPPLIER_IMPORT" };
  });
}
