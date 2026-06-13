import type { ActionFunctionArgs, HeadersFunction, LoaderFunctionArgs } from "react-router";
import { useFetcher, useLoaderData } from "react-router";
import { boundary } from "@shopify/shopify-app-react-router/server";
import { authenticate } from "../shopify.server";
import { applyDemoCostsWhenAllMissing } from "../lib/demo-costs";
import { getImportedCosts, applyImportedCostsBySku } from "../lib/imported-costs.server";
import { basisPointsToPercent, calculateMinimumPriceForTargetMargin, getCostSourceLabel, getFindingAction, getSeverityLabel, type MarginFinding } from "../lib/margin";
import { getShopPlan, getVariantLimitForPlan, PLAN_LIMITS } from "../lib/plan.server";
import { getShopSettings } from "../lib/settings.server";
import { fetchVariantsForAudit } from "../lib/shopify-products.server";
import { buildCostIncreaseScenario, normalizeCostIncreasePercent } from "../lib/what-if";
import { formatMoney } from "../lib/security";

type ScenarioFinding = MarginFinding & { id?: string | null };

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const { session } = await authenticate.admin(request);
  const settings = await getShopSettings(session.shop);
  const planKey = await getShopPlan(session.shop);
  return { settings, plan: PLAN_LIMITS[planKey], defaultIncreasePercent: 8 };
};

export const action = async ({ request }: ActionFunctionArgs) => {
  const { admin, session } = await authenticate.admin(request);
  const formData = await request.formData();
  const costIncreasePercent = normalizeCostIncreasePercent(formData.get("costIncreasePercent"));
  const settings = await getShopSettings(session.shop);
  const planKey = await getShopPlan(session.shop);
  const variantLimit = getVariantLimitForPlan(planKey);
  const scan = await fetchVariantsForAudit(admin, { maxVariants: variantLimit });
  const importedCosts = await getImportedCosts(session.shop);
  const withImportedCosts = applyImportedCostsBySku(scan.variants, importedCosts);
  const demoResult = applyDemoCostsWhenAllMissing(withImportedCosts);
  const scenario = buildCostIncreaseScenario(demoResult.variants, settings.minimumMarginBps, costIncreasePercent);
  const currencyCode = demoResult.variants.find((variant) => variant.currencyCode)?.currencyCode ?? null;

  return {
    ok: true,
    costIncreasePercent: scenario.costIncreasePercent,
    affectedVariantCount: scenario.affectedVariantCount,
    baselineIssueCount: scenario.baseline.lossCount + scenario.baseline.lowMarginCount + scenario.baseline.missingCostCount,
    scenarioIssueCount: scenario.scenario.lossCount + scenario.scenario.lowMarginCount + scenario.scenario.missingCostCount,
    newlyAtRiskCount: scenario.newlyAtRiskCount,
    addedMarginGapAmount: scenario.addedMarginGapAmount,
    addedInventoryRiskAmount: scenario.addedInventoryRiskAmount,
    scenarioInventoryRiskAmount: scenario.scenario.inventoryRiskAmount,
    minimumMarginBps: settings.minimumMarginBps,
    demoMode: demoResult.demoMode,
    scanLimitReached: scan.limitReached,
    variantLimit,
    currencyCode,
    findings: scenario.scenario.findings.slice(0, 100),
  };
};

export default function WhatIfScenario() {
  const { settings, plan, defaultIncreasePercent } = useLoaderData<typeof loader>();
  const fetcher = useFetcher<typeof action>();
  const data = fetcher.data;
  const isRunning = fetcher.state !== "idle";

  return (
    <s-page heading="Cost-change what-if">
      <s-section heading="Model supplier cost changes">
        <s-paragraph>Enter a supplier cost increase to see which SKUs would fall below your target margin and how much inventory value becomes risky. Margin Sentinel does not change prices.</s-paragraph>
        <fetcher.Form method="post">
          <s-stack direction="inline" gap="base" alignItems="end">
            <s-number-field label="Supplier cost increase" name="costIncreasePercent" defaultValue={String(defaultIncreasePercent)} min={0} max={100} step={0.5} suffix="%" />
            <s-button type="submit" variant="primary" disabled={isRunning} loading={isRunning}>Run what-if</s-button>
          </s-stack>
        </fetcher.Form>
        <s-paragraph>Current target margin: {basisPointsToPercent(settings.minimumMarginBps)}. Current plan: {plan.label}, scanning up to {plan.variantLimit.toLocaleString()} variants.</s-paragraph>
      </s-section>

      {data?.ok ? (
        <s-section heading={`If costs rise ${data.costIncreasePercent}%`}>
          <s-stack direction="block" gap="base">
            {data.demoMode ? (
              <s-banner tone="info" heading="Demo data active">
                This store has no real Shopify unit costs or imported supplier costs yet, so this scenario uses safe demo costs.
              </s-banner>
            ) : null}
            {data.scanLimitReached ? (
              <s-banner tone="warning" heading="Plan scan limit reached">
                This scenario checked the first {data.variantLimit.toLocaleString()} variants on the current plan.
              </s-banner>
            ) : null}
            <s-grid gridTemplateColumns="repeat(4, minmax(0, 1fr))" gap="base">
              <s-box padding="base" borderWidth="base" borderRadius="base" background="subdued"><s-heading>{data.affectedVariantCount}</s-heading><s-text>Variants with cost</s-text></s-box>
              <s-box padding="base" borderWidth="base" borderRadius="base" background="subdued"><s-heading>{data.newlyAtRiskCount}</s-heading><s-text>New at-risk SKUs</s-text></s-box>
              <s-box padding="base" borderWidth="base" borderRadius="base" background="subdued"><s-heading>{formatMoney(Number(data.addedInventoryRiskAmount ?? 0), data.currencyCode)}</s-heading><s-text>Added inventory risk</s-text></s-box>
              <s-box padding="base" borderWidth="base" borderRadius="base" background="subdued"><s-heading>{formatMoney(Number(data.scenarioInventoryRiskAmount ?? 0), data.currencyCode)}</s-heading><s-text>Total inventory risk</s-text></s-box>
            </s-grid>
            <s-paragraph>Issues before scenario: {data.baselineIssueCount}. Issues after scenario: {data.scenarioIssueCount}. Added margin gap: {formatMoney(Number(data.addedMarginGapAmount ?? 0), data.currencyCode)}.</s-paragraph>
            {data.findings.length > 0 ? (
              <s-table variant="auto">
                <s-table-header-row>
                  <s-table-header listSlot="primary">Product</s-table-header>
                  <s-table-header>Issue</s-table-header>
                  <s-table-header>SKU</s-table-header>
                  <s-table-header format="currency">Price</s-table-header>
                  <s-table-header format="currency">Scenario cost</s-table-header>
                  <s-table-header>Cost source</s-table-header>
                  <s-table-header format="numeric">Margin</s-table-header>
                  <s-table-header format="currency">Gap</s-table-header>
                  <s-table-header format="numeric">Inventory</s-table-header>
                  <s-table-header format="currency">Inventory risk</s-table-header>
                  <s-table-header>Next action</s-table-header>
                </s-table-header-row>
                <s-table-body>
                  {(data.findings as ScenarioFinding[]).slice(0, 25).map((finding) => {
                    const suggestedPrice = calculateMinimumPriceForTargetMargin(finding.costAmount, data.minimumMarginBps);
                    return (
                      <s-table-row key={finding.id ?? finding.variantId}>
                        <s-table-cell>{finding.productTitle}{finding.variantTitle && finding.variantTitle !== "Default Title" ? ` / ${finding.variantTitle}` : ""}</s-table-cell>
                        <s-table-cell>{getSeverityLabel(finding.severity)}</s-table-cell>
                        <s-table-cell>{finding.sku ?? "—"}</s-table-cell>
                        <s-table-cell>{formatMoney(Number(finding.priceAmount), finding.currencyCode)}</s-table-cell>
                        <s-table-cell>{finding.costAmount == null ? "—" : formatMoney(Number(finding.costAmount), finding.currencyCode)}</s-table-cell>
                        <s-table-cell>{getCostSourceLabel(finding.costSource)}</s-table-cell>
                        <s-table-cell>{basisPointsToPercent(finding.marginBps)}</s-table-cell>
                        <s-table-cell>{finding.gapToTargetAmount == null ? "—" : formatMoney(Number(finding.gapToTargetAmount), finding.currencyCode)}</s-table-cell>
                        <s-table-cell>{finding.inventoryQuantity ?? "—"}</s-table-cell>
                        <s-table-cell>{finding.inventoryRiskAmount == null ? "—" : formatMoney(Number(finding.inventoryRiskAmount), finding.currencyCode)}</s-table-cell>
                        <s-table-cell>{getFindingAction(finding.severity)}{suggestedPrice ? ` Suggested minimum: ${formatMoney(suggestedPrice, finding.currencyCode)}.` : ""}</s-table-cell>
                      </s-table-row>
                    );
                  })}
                </s-table-body>
              </s-table>
            ) : (
              <s-banner tone="success" heading="No scenario risks found">
                No variants fell below the target margin in this scenario.
              </s-banner>
            )}
          </s-stack>
        </s-section>
      ) : null}
    </s-page>
  );
}

export const headers: HeadersFunction = (headersArgs) => boundary.headers(headersArgs);
