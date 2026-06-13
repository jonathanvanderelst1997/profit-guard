import type { MarginFinding } from "./margin";
import { calculateMinimumPriceForTargetMargin, getFindingAction } from "./margin";
import { neutralizeSpreadsheetFormula } from "./security";

export type CsvFinding = Omit<MarginFinding, "severity"> & { severity: string; id?: string; createdAt?: Date | string };

function csvEscape(value: unknown): string {
  if (value === null || value === undefined) return "";
  const safe = neutralizeSpreadsheetFormula(value);
  if (/[",\n\r]/.test(safe)) return `"${safe.replace(/"/g, '""')}"`;
  return safe;
}

export function findingsToCsv(findings: CsvFinding[], options: { minimumMarginBps?: number } = {}): string {
  const headers = [
    "issue",
    "product_title",
    "variant_title",
    "sku",
    "price",
    "cost",
    "profit",
    "margin_percent",
    "target_profit",
    "gap_to_target",
    "suggested_min_price",
    "currency",
    "next_action",
    "reason",
  ];

  const rows = findings.map((finding) => [
    finding.severity,
    finding.productTitle,
    finding.variantTitle ?? "",
    finding.sku ?? "",
    finding.priceAmount.toFixed(2),
    finding.costAmount == null ? "" : finding.costAmount.toFixed(2),
    finding.profitAmount == null ? "" : finding.profitAmount.toFixed(2),
    finding.marginBps == null ? "" : (finding.marginBps / 100).toFixed(1),
    finding.targetProfitAmount == null ? "" : finding.targetProfitAmount.toFixed(2),
    finding.gapToTargetAmount == null ? "" : finding.gapToTargetAmount.toFixed(2),
    options.minimumMarginBps == null ? "" : calculateMinimumPriceForTargetMargin(finding.costAmount, options.minimumMarginBps)?.toFixed(2) ?? "",
    finding.currencyCode ?? "",
    getFindingAction(finding.severity as MarginFinding["severity"]),
    finding.reason,
  ]);

  return [headers, ...rows].map((row) => row.map(csvEscape).join(",")).join("\n") + "\n";
}
