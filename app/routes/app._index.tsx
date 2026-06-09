import { useEffect } from "react";
import type { ActionFunctionArgs, HeadersFunction, LoaderFunctionArgs } from "react-router";
import { useFetcher, useLoaderData } from "react-router";
import { useAppBridge } from "@shopify/app-bridge-react";
import { boundary } from "@shopify/shopify-app-react-router/server";
import { authenticate } from "../shopify.server";
import { auditVariants, basisPointsToPercent } from "../lib/margin";
import { fetchVariantsForAudit } from "../lib/shopify-products.server";
import { getLatestAuditRun, saveAuditRun } from "../lib/audit-store.server";
import { getShopSettings, updateMinimumMargin } from "../lib/settings.server";
import { getImportedCosts, applyImportedCostsBySku } from "../lib/imported-costs.server";
import { applyDemoCostsWhenAllMissing } from "../lib/demo-costs";
import { getShopPlan, getVariantLimitForPlan, PLAN_LIMITS } from "../lib/plan.server";
import { formatMoney } from "../lib/security";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const { session } = await authenticate.admin(request);
  const settings = await getShopSettings(session.shop);
  const latestAudit = await getLatestAuditRun(session.shop);
  const planKey = await getShopPlan(session.shop);
  return { settings, latestAudit, planKey, plan: PLAN_LIMITS[planKey] };
};

export const action = async ({ request }: ActionFunctionArgs) => {
  const { admin, session } = await authenticate.admin(request);
  const formData = await request.formData();
  const intent = String(formData.get("intent") ?? "scan");

  if (intent === "settings") {
    const minimumMarginPercent = Number(formData.get("minimumMarginPercent") ?? 30);
    const settings = await updateMinimumMargin(session.shop, minimumMarginPercent);
    return { ok: true, type: "settings", settings };
  }

  const settings = await getShopSettings(session.shop);
  const planKey = await getShopPlan(session.shop);
  const scan = await fetchVariantsForAudit(admin, { maxVariants: getVariantLimitForPlan(planKey) });
  const importedCosts = await getImportedCosts(session.shop);
  const withImportedCosts = applyImportedCostsBySku(scan.variants, importedCosts);
  const demoResult = applyDemoCostsWhenAllMissing(withImportedCosts);
  const summary = auditVariants(demoResult.variants, settings.minimumMarginBps);
  const auditRun = await saveAuditRun(session.shop, settings.minimumMarginBps, summary, { demoMode: demoResult.demoMode, scanLimitReached: scan.limitReached });
  return { ok: true, type: "scan", auditRun };
};

function StatCard({ label, value, tone }: { label: string; value: number | string; tone?: string }) {
  return (
    <s-box padding="base" borderWidth="base" borderRadius="base" background="subdued">
      <s-stack direction="block" gap="small">
        <s-text tone="neutral">{label}</s-text>
        <s-heading>{value}</s-heading>
      </s-stack>
    </s-box>
  );
}

export default function Dashboard() {
  const { settings, latestAudit, planKey, plan } = useLoaderData<typeof loader>();
  const fetcher = useFetcher<typeof action>();
  const shopify = useAppBridge();
  const currentAudit = fetcher.data?.type === "scan" ? fetcher.data.auditRun : latestAudit;
  const isScanning = fetcher.state !== "idle" && fetcher.formData?.get("intent") === "scan";
  const isSavingSettings = fetcher.state !== "idle" && fetcher.formData?.get("intent") === "settings";

  useEffect(() => {
    if (fetcher.data?.ok && fetcher.data.type === "scan") shopify.toast.show("Profit scan completed");
    if (fetcher.data?.ok && fetcher.data.type === "settings") shopify.toast.show("Settings saved");
  }, [fetcher.data, shopify]);

  return (
    <s-page heading="Profit Guard">
      <fetcher.Form method="post">
        <input type="hidden" name="intent" value="scan" />
        <button type="submit" disabled={isScanning}>{isScanning ? "Scanning..." : "Run profit scan"}</button>
      </fetcher.Form>

      <s-section heading="Automatic profit scan">
        <s-paragraph>Profit Guard reads Shopify selling prices, Shopify unit costs, and imported supplier costs. It finds products that lose money, sit below your margin target, or still miss cost data. It never changes prices automatically.</s-paragraph>
        <s-paragraph>Current plan: {plan.label}. Scan limit: {plan.variantLimit.toLocaleString()} variants.</s-paragraph>
      </s-section>

      <s-section heading="Margin target">
        <fetcher.Form method="post">
          <input type="hidden" name="intent" value="settings" />
          <s-stack direction="inline" gap="base" alignItems="end">
            <input name="minimumMarginPercent" defaultValue={String(settings.minimumMarginBps / 100)} />
            <button type="submit" disabled={isSavingSettings}>{isSavingSettings ? "Saving..." : "Save"}</button>
          </s-stack>
        </fetcher.Form>
      </s-section>

      <s-section heading="Latest scan">
        {!currentAudit ? (
          <s-paragraph>No scan yet. Click “Run profit scan”.</s-paragraph>
        ) : (
          <s-stack direction="block" gap="base">
            {currentAudit.demoMode ? (
              <s-banner tone="info" heading="Demo data active">
                This store has no real Shopify unit costs or imported supplier costs yet, so Profit Guard generated safe demo costs to show what merchants will see. Import supplier costs or add Shopify unit costs to use real data.
              </s-banner>
            ) : null}
            {currentAudit.scanLimitReached ? (
              <s-banner tone="warning" heading="Plan scan limit reached">
                This scan stopped at your current plan limit. Upgrade to scan more variants.
              </s-banner>
            ) : null}
            <s-grid gridTemplateColumns="repeat(4, minmax(0, 1fr))" gap="base">
              <StatCard label="Variants checked" value={currentAudit.totalVariants} />
              <StatCard label="Losing money" value={currentAudit.lossCount} tone="critical" />
              <StatCard label="Low margin" value={currentAudit.lowMarginCount} tone="warning" />
              <StatCard label="Missing cost" value={currentAudit.missingCostCount} tone="warning" />
            </s-grid>
            <s-grid gridTemplateColumns="repeat(3, minmax(0, 1fr))" gap="base">
              <StatCard label="Direct loss found" value={formatMoney(Number(currentAudit.lossAmount ?? 0), currentAudit.findings?.[0]?.currencyCode)} tone="critical" />
              <StatCard label="Margin gap to target" value={formatMoney(Number(currentAudit.marginGapAmount ?? 0), currentAudit.findings?.[0]?.currencyCode)} tone="warning" />
              <StatCard label="OK variants" value={currentAudit.okCount} />
            </s-grid>
            <s-paragraph>Target margin: {basisPointsToPercent(currentAudit.minimumMarginBps)}. Showing the first 100 findings in-app. CSV export includes all saved findings.</s-paragraph>
            <s-stack direction="inline" gap="base">
              <s-link href="/app/import">Import supplier costs</s-link>
              <s-link href="/app/export" target="_blank">Download findings CSV</s-link>
              <s-link href="/app/alerts">Set weekly alerts</s-link>
              <s-link href="/app/pricing">Pricing</s-link>
              <s-link href="/app/onboarding">Merchant setup</s-link>
            </s-stack>
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead><tr><th align="left">Issue</th><th align="left">Product</th><th align="left">SKU</th><th align="right">Price</th><th align="right">Cost</th><th align="right">Profit</th><th align="right">Margin</th><th align="right">Gap</th><th align="left">Reason</th></tr></thead>
                <tbody>
                  {currentAudit.findings.map((f) => (
                    <tr key={f.id ?? f.variantId}>
                      <td>{f.severity}</td>
                      <td>{f.productTitle}{f.variantTitle && f.variantTitle !== "Default Title" ? ` / ${f.variantTitle}` : ""}</td>
                      <td>{f.sku ?? "—"}</td>
                      <td align="right">{f.priceAmount.toFixed(2)}</td>
                      <td align="right">{f.costAmount == null ? "—" : f.costAmount.toFixed(2)}</td>
                      <td align="right">{f.profitAmount == null ? "—" : f.profitAmount.toFixed(2)}</td>
                      <td align="right">{basisPointsToPercent(f.marginBps)}</td>
                      <td align="right">{f.gapToTargetAmount == null ? "—" : f.gapToTargetAmount.toFixed(2)}</td>
                      <td>{f.reason}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </s-stack>
        )}
      </s-section>

      <s-section slot="aside" heading="Ready for merchants">
        <s-unordered-list>
          <s-list-item>Runs on Shopify product and variant data.</s-list-item>
          <s-list-item>Bulk cost import removes manual entry.</s-list-item>
          <s-list-item>Demo mode makes empty dev stores look useful immediately.</s-list-item>
        </s-unordered-list>
      </s-section>
    </s-page>
  );
}

export const headers: HeadersFunction = (headersArgs) => boundary.headers(headersArgs);
