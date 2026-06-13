import { auditVariants, roundMoney, type AuditSummary, type VariantMarginInput } from "./margin";

export type CostIncreaseScenario = {
  costIncreasePercent: number;
  affectedVariantCount: number;
  baseline: AuditSummary;
  scenario: AuditSummary;
  newlyAtRiskCount: number;
  addedMarginGapAmount: number;
  addedInventoryRiskAmount: number;
};

export function normalizeCostIncreasePercent(value: unknown): number {
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) return 8;
  return Math.min(100, Math.max(0, Math.round(parsed * 10) / 10));
}

export function applyCostIncreaseScenario(variants: VariantMarginInput[], costIncreasePercent: number): VariantMarginInput[] {
  const multiplier = 1 + normalizeCostIncreasePercent(costIncreasePercent) / 100;
  return variants.map((variant) => {
    if (variant.costAmount === null || variant.costAmount === undefined) return variant;
    return { ...variant, costAmount: roundMoney(variant.costAmount * multiplier) };
  });
}

export function buildCostIncreaseScenario(
  variants: VariantMarginInput[],
  minimumMarginBps: number,
  costIncreasePercent: number,
): CostIncreaseScenario {
  const normalizedPercent = normalizeCostIncreasePercent(costIncreasePercent);
  const baseline = auditVariants(variants, minimumMarginBps);
  const scenario = auditVariants(applyCostIncreaseScenario(variants, normalizedPercent), minimumMarginBps);
  const baselineFindingIds = new Set(baseline.findings.map((finding) => finding.variantId));

  return {
    costIncreasePercent: normalizedPercent,
    affectedVariantCount: variants.filter((variant) => variant.costAmount !== null && variant.costAmount !== undefined).length,
    baseline,
    scenario,
    newlyAtRiskCount: scenario.findings.filter((finding) => !baselineFindingIds.has(finding.variantId)).length,
    addedMarginGapAmount: roundMoney(Math.max(0, scenario.marginGapAmount - baseline.marginGapAmount)),
    addedInventoryRiskAmount: roundMoney(Math.max(0, scenario.inventoryRiskAmount - baseline.inventoryRiskAmount)),
  };
}
