export type Severity = "LOSS" | "LOW_MARGIN" | "MISSING_COST";

export type VariantMarginInput = {
  variantId: string;
  productTitle: string;
  variantTitle?: string | null;
  sku?: string | null;
  priceAmount: number;
  costAmount?: number | null;
  currencyCode?: string | null;
};

export type MarginFinding = VariantMarginInput & {
  severity: Severity;
  profitAmount: number | null;
  marginBps: number | null;
  targetProfitAmount: number | null;
  gapToTargetAmount: number | null;
  reason: string;
};

export type AuditSummary = {
  totalVariants: number;
  lossCount: number;
  lowMarginCount: number;
  missingCostCount: number;
  okCount: number;
  totalPriceAmount: number;
  lossAmount: number;
  marginGapAmount: number;
  findings: MarginFinding[];
};

export const SEVERITY_ORDER: Record<Severity, number> = {
  LOSS: 0,
  LOW_MARGIN: 1,
  MISSING_COST: 2,
};

export function getSeverityLabel(severity: Severity): string {
  if (severity === "LOSS") return "Losing money";
  if (severity === "LOW_MARGIN") return "Low margin";
  return "Missing cost";
}

export function getFindingAction(severity: Severity): string {
  if (severity === "LOSS") return "Raise price or reduce cost before selling more.";
  if (severity === "LOW_MARGIN") return "Review price, supplier cost, or discount rules.";
  return "Add Shopify unit cost or import supplier cost by SKU.";
}

export function toBasisPoints(decimalRatio: number): number {
  return Math.round(decimalRatio * 10000);
}

export function basisPointsToPercent(bps: number | null | undefined): string {
  return bps == null || Number.isNaN(bps) ? "—" : `${(bps / 100).toFixed(1)}%`;
}

export function calculateMarginBps(priceAmount: number, costAmount: number): number {
  if (!Number.isFinite(priceAmount) || !Number.isFinite(costAmount)) {
    throw new Error("priceAmount and costAmount must be finite numbers");
  }
  if (priceAmount <= 0) return -10000;
  return toBasisPoints((priceAmount - costAmount) / priceAmount);
}

export function calculateProfitAmount(priceAmount: number, costAmount: number): number {
  if (!Number.isFinite(priceAmount) || !Number.isFinite(costAmount)) {
    throw new Error("priceAmount and costAmount must be finite numbers");
  }
  return roundMoney(priceAmount - costAmount);
}

export function calculateTargetProfitAmount(priceAmount: number, minimumMarginBps: number): number {
  return roundMoney(priceAmount * (minimumMarginBps / 10000));
}

export function calculateMinimumPriceForTargetMargin(costAmount: number | null | undefined, minimumMarginBps: number): number | null {
  if (costAmount === null || costAmount === undefined || !Number.isFinite(costAmount)) return null;
  const marginRatio = minimumMarginBps / 10000;
  if (marginRatio >= 1) return null;
  return roundMoney(costAmount / (1 - marginRatio));
}

export function roundMoney(value: number): number {
  return Math.round((value + Number.EPSILON) * 100) / 100;
}

export function auditVariant(input: VariantMarginInput, minimumMarginBps: number): MarginFinding | null {
  if (input.costAmount === null || input.costAmount === undefined) {
    return {
      ...input,
      costAmount: null,
      profitAmount: null,
      marginBps: null,
      targetProfitAmount: null,
      gapToTargetAmount: null,
      severity: "MISSING_COST",
      reason: "No cost is set for this variant, so true product margin is unknown.",
    };
  }

  const profitAmount = calculateProfitAmount(input.priceAmount, input.costAmount);
  const marginBps = calculateMarginBps(input.priceAmount, input.costAmount);
  const targetProfitAmount = calculateTargetProfitAmount(input.priceAmount, minimumMarginBps);
  const gapToTargetAmount = roundMoney(Math.max(0, targetProfitAmount - profitAmount));

  if (marginBps < 0) {
    return {
      ...input,
      profitAmount,
      marginBps,
      targetProfitAmount,
      gapToTargetAmount,
      severity: "LOSS",
      reason: "Cost is higher than selling price.",
    };
  }

  if (marginBps < minimumMarginBps) {
    return {
      ...input,
      profitAmount,
      marginBps,
      targetProfitAmount,
      gapToTargetAmount,
      severity: "LOW_MARGIN",
      reason: `Margin is below target of ${basisPointsToPercent(minimumMarginBps)}.`,
    };
  }

  return null;
}

export function auditVariants(inputs: VariantMarginInput[], minimumMarginBps: number): AuditSummary {
  const findings = inputs.map((i) => auditVariant(i, minimumMarginBps)).filter((f): f is MarginFinding => Boolean(f));
  findings.sort((a, b) => {
    const severityDelta = SEVERITY_ORDER[a.severity] - SEVERITY_ORDER[b.severity];
    if (severityDelta !== 0) return severityDelta;
    return (b.gapToTargetAmount ?? 0) - (a.gapToTargetAmount ?? 0);
  });
  const lossCount = findings.filter((f) => f.severity === "LOSS").length;
  const lowMarginCount = findings.filter((f) => f.severity === "LOW_MARGIN").length;
  const missingCostCount = findings.filter((f) => f.severity === "MISSING_COST").length;
  const lossAmount = roundMoney(
    findings.filter((f) => f.severity === "LOSS").reduce((sum, f) => sum + Math.abs(Math.min(0, f.profitAmount ?? 0)), 0),
  );
  const marginGapAmount = roundMoney(findings.reduce((sum, f) => sum + (f.gapToTargetAmount ?? 0), 0));
  const totalPriceAmount = roundMoney(inputs.reduce((sum, input) => sum + input.priceAmount, 0));

  return {
    totalVariants: inputs.length,
    lossCount,
    lowMarginCount,
    missingCostCount,
    okCount: inputs.length - findings.length,
    totalPriceAmount,
    lossAmount,
    marginGapAmount,
    findings,
  };
}

export function applySupplierCostsBySku(variants: VariantMarginInput[], supplierCosts: Map<string, number>): VariantMarginInput[] {
  return variants.map((variant) => {
    const sku = variant.sku?.trim();
    if (!sku || !supplierCosts.has(sku)) return variant;
    return { ...variant, costAmount: supplierCosts.get(sku) ?? variant.costAmount };
  });
}
