import type { VariantMarginInput } from "./margin";

export const COST_KEY_PREFIXES = {
  sku: "sku:",
  variant: "variant:",
  inventoryItem: "inventory_item:",
} as const;

function clean(value: string | null | undefined): string {
  return (value ?? "").trim();
}

export function costKeyFromSku(sku: string | null | undefined): string | null {
  const value = clean(sku);
  return value ? `${COST_KEY_PREFIXES.sku}${value}` : null;
}

export function costKeyFromVariantId(variantId: string | null | undefined): string | null {
  const value = clean(variantId);
  return value ? `${COST_KEY_PREFIXES.variant}${value}` : null;
}

export function costKeyFromInventoryItemId(inventoryItemId: string | null | undefined): string | null {
  const value = clean(inventoryItemId);
  return value ? `${COST_KEY_PREFIXES.inventoryItem}${value}` : null;
}

export function normalizeStoredCostKey(value: string): string {
  const trimmed = clean(value);
  if (
    trimmed.startsWith(COST_KEY_PREFIXES.sku) ||
    trimmed.startsWith(COST_KEY_PREFIXES.variant) ||
    trimmed.startsWith(COST_KEY_PREFIXES.inventoryItem)
  ) {
    return trimmed;
  }
  return `${COST_KEY_PREFIXES.sku}${trimmed}`;
}

export function getVariantCostKeys(variant: VariantMarginInput): string[] {
  return [
    costKeyFromVariantId(variant.variantId),
    costKeyFromInventoryItemId(variant.inventoryItemId),
    costKeyFromSku(variant.sku),
  ].filter((key): key is string => Boolean(key));
}

export function findImportedCostForVariant(variant: VariantMarginInput, importedCosts: Map<string, number>): number | null {
  for (const key of getVariantCostKeys(variant)) {
    const cost = importedCosts.get(key);
    if (cost !== undefined) return cost;
  }
  return null;
}

