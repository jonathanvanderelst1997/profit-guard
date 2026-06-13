export type ImportMetricRow = { sku: string };

export type ImportRunMetrics = {
  csvRows: number;
  matchedSkuCount: number;
  unmatchedSkuCount: number;
  savedCostCount: number;
  duplicateSkuCount: number;
  warningCount: number;
};

export function buildImportRunMetrics(input: {
  rows: ImportMetricRow[];
  errors: string[];
  matchedSkus: Set<string>;
  savedCostCount: number;
}): ImportRunMetrics {
  const csvSkus = new Set(input.rows.map((row) => row.sku).filter(Boolean));
  const unmatchedSkuCount = [...csvSkus].filter((sku) => !input.matchedSkus.has(sku)).length;
  const duplicateSkuCount = input.errors.filter((error) => error.includes("duplicate SKU")).length;

  return {
    csvRows: input.rows.length,
    matchedSkuCount: input.matchedSkus.size,
    unmatchedSkuCount,
    savedCostCount: input.savedCostCount,
    duplicateSkuCount,
    warningCount: input.errors.length,
  };
}
