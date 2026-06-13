export type SupplierCostRow = { sku: string; cost: number; rowNumber: number; };
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
  const costIndex = headers.findIndex((h) => ["cost", "unit_cost", "new_cost", "supplier_cost", "price"].includes(h));
  const errors: string[] = [];
  if (skuIndex === -1) errors.push("Missing SKU column. Use 'sku'.");
  if (costIndex === -1) errors.push("Missing cost column. Use 'cost'.");
  if (errors.length > 0) return { rows: [], errors };
  const rows: SupplierCostRow[] = [];
  const seenSkus = new Set<string>();
  for (let i = 1; i < lines.length; i += 1) {
    const columns = splitCsvLine(lines[i]);
    const rowNumber = i + 1;
    const sku = columns[skuIndex]?.trim();
    const cost = parseNumber(columns[costIndex] ?? "");
    if (!sku) { errors.push(`Row ${rowNumber}: missing SKU.`); continue; }
    if (cost === null || cost < 0) { errors.push(`Row ${rowNumber}: invalid cost for SKU ${sku}.`); continue; }
    if (seenSkus.has(sku)) errors.push(`Row ${rowNumber}: duplicate SKU ${sku}; latest cost will be used.`);
    seenSkus.add(sku);
    rows.push({ sku, cost, rowNumber });
  }
  return { rows, errors };
}
export function supplierRowsToMap(rows: SupplierCostRow[]): Map<string, number> { return new Map(rows.map((row) => [row.sku, row.cost])); }
