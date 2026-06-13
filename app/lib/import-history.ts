export type ImportMetricRow = { matchKey: string };

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
  matchedKeys: Set<string>;
  savedCostCount: number;
}): ImportRunMetrics {
  const csvKeys = new Set(input.rows.map((row) => row.matchKey).filter(Boolean));
  const unmatchedSkuCount = [...csvKeys].filter((key) => !input.matchedKeys.has(key)).length;
  const duplicateSkuCount = input.errors.filter((error) => error.includes("duplicate")).length;

  return {
    csvRows: input.rows.length,
    matchedSkuCount: input.matchedKeys.size,
    unmatchedSkuCount,
    savedCostCount: input.savedCostCount,
    duplicateSkuCount,
    warningCount: input.errors.length,
  };
}
