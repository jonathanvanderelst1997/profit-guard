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
  const normalized = value.trim().replace(/€/g, "").replace(/\s/g, "").replace(",", ".");
  if (!normalized) return null;
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
  for (let i = 1; i < lines.length; i += 1) {
    const columns = splitCsvLine(lines[i]);
    const rowNumber = i + 1;
    const sku = columns[skuIndex]?.trim();
    const cost = parseNumber(columns[costIndex] ?? "");
    if (!sku) { errors.push(`Row ${rowNumber}: missing SKU.`); continue; }
    if (cost === null || cost < 0) { errors.push(`Row ${rowNumber}: invalid cost for SKU ${sku}.`); continue; }
    rows.push({ sku, cost, rowNumber });
  }
  return { rows, errors };
}
export function supplierRowsToMap(rows: SupplierCostRow[]): Map<string, number> { return new Map(rows.map((row) => [row.sku, row.cost])); }
