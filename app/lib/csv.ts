import { costKeyFromInventoryItemId, costKeyFromSku, costKeyFromVariantId } from "./cost-matching";

export type SupplierCostRow = {
  sku: string;
  variantId?: string | null;
  inventoryItemId?: string | null;
  matchKey: string;
  matchLabel: string;
  cost: number;
  rowNumber: number;
};
export type CsvParseResult = { rows: SupplierCostRow[]; errors: string[]; };

export function splitCsvLine(line: string): string[] {
  const result: string[] = [];
  let current = "";
  let inQuotes = false;
  for (let i = 0; i < line.length; i += 1) {
    const char = line[i];
    const next = line[i + 1];
    if (char === '"' && inQuotes && next === '"') { current += '"'; i += 1; continue; }
    if (char === '"') { inQuotes = !inQuotes; continue; }
    if (char === "," && !inQuotes) { result.push(current.trim()); current = ""; continue; }
    current += char;
  }
  result.push(current.trim());
  return result;
}
function normalizeHeader(value: string): string { return value.trim().toLowerCase().replace(/\s+/g, "_"); }

function parseNumber(value: string): number | null {
  let normalized = value.trim().replace(/[\s\u00A0]/g, "").replace(/[^\d,.-]/g, "");
  if (!normalized) return null;

  const lastComma = normalized.lastIndexOf(",");
  const lastDot = normalized.lastIndexOf(".");

  if (lastComma !== -1 && lastDot !== -1) {
    const decimalSeparator = lastComma > lastDot ? "," : ".";
    const thousandsSeparator = decimalSeparator === "," ? "." : ",";
    normalized = normalized.replace(new RegExp(`\\${thousandsSeparator}`, "g"), "").replace(decimalSeparator, ".");
  } else if (lastComma !== -1) {
    const parts = normalized.split(",");
    normalized = parts.length === 2 && parts[1].length <= 2 ? normalized.replace(",", ".") : normalized.replace(/,/g, "");
  } else if (lastDot !== -1) {
    const parts = normalized.split(".");
    if (parts.length === 2 && parts[1].length > 2) normalized = parts.join("");
    if (parts.length > 2) {
      const decimalPart = parts[parts.length - 1];
      normalized = decimalPart.length <= 2 ? `${parts.slice(0, -1).join("")}.${decimalPart}` : parts.join("");
    }
  }

  const parsed = Number(normalized);
  return Number.isFinite(parsed) ? parsed : null;
}

export function parseSupplierCostCsv(text: string): CsvParseResult {
  const lines = text.replace(/^\uFEFF/, "").split(/\r?\n/).map((line) => line.trim()).filter(Boolean);
  if (lines.length < 2) return { rows: [], errors: ["CSV must include a header row and at least one data row."] };
  const headers = splitCsvLine(lines[0]).map(normalizeHeader);
  const skuIndex = headers.findIndex((h) => ["sku", "variant_sku", "product_sku"].includes(h));
  const variantIdIndex = headers.findIndex((h) => ["variant_id", "shopify_variant_id", "product_variant_id"].includes(h));
  const inventoryItemIdIndex = headers.findIndex((h) => ["inventory_item_id", "inventoryitemid", "shopify_inventory_item_id"].includes(h));
  const costIndex = headers.findIndex((h) => ["cost", "unit_cost", "new_cost", "supplier_cost", "price"].includes(h));
  const errors: string[] = [];
  if (skuIndex === -1 && variantIdIndex === -1 && inventoryItemIdIndex === -1) errors.push("Missing identifier column. Use 'variant_id', 'inventory_item_id', or 'sku'.");
  if (costIndex === -1) errors.push("Missing cost column. Use 'cost'.");
  if (errors.length > 0) return { rows: [], errors };
  const rows: SupplierCostRow[] = [];
  const seenKeys = new Set<string>();
  for (let i = 1; i < lines.length; i += 1) {
    const columns = splitCsvLine(lines[i]);
    const rowNumber = i + 1;
    const sku = skuIndex === -1 ? "" : columns[skuIndex]?.trim() ?? "";
    const variantId = variantIdIndex === -1 ? "" : columns[variantIdIndex]?.trim() ?? "";
    const inventoryItemId = inventoryItemIdIndex === -1 ? "" : columns[inventoryItemIdIndex]?.trim() ?? "";
    const variantKey = costKeyFromVariantId(variantId);
    const inventoryItemKey = costKeyFromInventoryItemId(inventoryItemId);
    const skuKey = costKeyFromSku(sku);
    const matchKey = variantKey ?? inventoryItemKey ?? skuKey;
    const matchLabel = variantKey ? "variant_id" : inventoryItemKey ? "inventory_item_id" : "sku";
    const cost = parseNumber(columns[costIndex] ?? "");
    if (!matchKey) { errors.push(`Row ${rowNumber}: missing variant_id, inventory_item_id, or SKU.`); continue; }
    if (cost === null || cost < 0) { errors.push(`Row ${rowNumber}: invalid cost for ${matchLabel}.`); continue; }
    if (seenKeys.has(matchKey)) errors.push(`Row ${rowNumber}: duplicate ${matchLabel}; latest cost will be used.`);
    seenKeys.add(matchKey);
    rows.push({ sku, variantId, inventoryItemId, matchKey, matchLabel, cost, rowNumber });
  }
  return { rows, errors };
}
export function supplierRowsToMap(rows: SupplierCostRow[]): Map<string, number> { return new Map(rows.map((row) => [row.matchKey, row.cost])); }
