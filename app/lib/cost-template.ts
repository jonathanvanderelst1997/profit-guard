import type { VariantMarginInput } from "./margin";
import { neutralizeSpreadsheetFormula } from "./security";

function csvEscape(value: unknown): string {
  if (value === null || value === undefined) return "";
  const safe = neutralizeSpreadsheetFormula(value);
  if (/[",\n\r]/.test(safe)) return `"${safe.replace(/"/g, '""')}"`;
  return safe;
}

export function variantsToCostTemplateCsv(variants: VariantMarginInput[]): string {
  const headers = [
    "variant_id",
    "inventory_item_id",
    "sku",
    "product_title",
    "variant_title",
    "current_price",
    "current_shopify_cost",
    "new_cost",
    "currency",
  ];
  const rows = variants.map((variant) => [
    variant.variantId,
    variant.inventoryItemId ?? "",
    variant.sku ?? "",
    variant.productTitle,
    variant.variantTitle ?? "",
    variant.priceAmount.toFixed(2),
    variant.costAmount == null ? "" : variant.costAmount.toFixed(2),
    variant.costAmount == null ? "" : variant.costAmount.toFixed(2),
    variant.currencyCode ?? "",
  ]);

  return [headers, ...rows].map((row) => row.map(csvEscape).join(",")).join("\n") + "\n";
}

