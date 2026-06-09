import type { VariantMarginInput } from "./margin";

function hashString(value: string): number {
  let hash = 0;
  for (let index = 0; index < value.length; index += 1) {
    hash = (hash * 31 + value.charCodeAt(index)) >>> 0;
  }
  return hash;
}

export function buildDemoCostForVariant(variant: VariantMarginInput): number {
  const hash = hashString(`${variant.variantId}:${variant.sku ?? ""}:${variant.productTitle}`);
  const ratio = 0.3 + ((hash % 41) / 100); // 30% - 70% of selling price
  return Number((variant.priceAmount * ratio).toFixed(2));
}

export function applyDemoCostsWhenAllMissing(variants: VariantMarginInput[]) {
  const hasRealCost = variants.some((variant) => variant.costAmount !== null && variant.costAmount !== undefined);
  if (hasRealCost || variants.length === 0) return { variants, demoMode: false };
  return {
    demoMode: true,
    variants: variants.map((variant) => ({ ...variant, costAmount: buildDemoCostForVariant(variant), demoCost: true })),
  };
}
