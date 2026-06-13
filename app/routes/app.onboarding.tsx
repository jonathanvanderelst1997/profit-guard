import type { HeadersFunction, LoaderFunctionArgs } from "react-router";
import { useLoaderData } from "react-router";
import { boundary } from "@shopify/shopify-app-react-router/server";
import { authenticate } from "../shopify.server";
import { getLatestAuditRun } from "../lib/audit-store.server";
import { getShopSettings } from "../lib/settings.server";
import { basisPointsToPercent } from "../lib/margin";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const { session } = await authenticate.admin(request);
  const settings = await getShopSettings(session.shop);
  const latestAudit = await getLatestAuditRun(session.shop);
  return { settings, latestAudit };
};

export default function Onboarding() {
  const { settings, latestAudit } = useLoaderData<typeof loader>();
  return (
    <s-page heading="Merchant setup">
      <s-section heading="Recommended first run">
        <s-grid gridTemplateColumns="repeat(4, minmax(0, 1fr))" gap="base">
          <s-box padding="base" borderWidth="base" borderRadius="base" background="subdued">
            <s-heading>1. Add costs</s-heading>
            <s-paragraph>Use Shopify unit costs or import supplier costs with the generated variant template. Missing costs are the most common reason profit reports cannot be trusted.</s-paragraph>
          </s-box>
          <s-box padding="base" borderWidth="base" borderRadius="base" background="subdued">
            <s-heading>2. Set target</s-heading>
            <s-paragraph>Current target: {basisPointsToPercent(settings.minimumMarginBps)}. Most merchants should start with their minimum acceptable gross product margin.</s-paragraph>
          </s-box>
          <s-box padding="base" borderWidth="base" borderRadius="base" background="subdued">
            <s-heading>3. Fix the list</s-heading>
            <s-paragraph>{latestAudit ? `${latestAudit.lossCount + latestAudit.lowMarginCount + latestAudit.missingCostCount} issues were found in the latest scan.` : "Run a scan to get a prioritized fix list."}</s-paragraph>
          </s-box>
          <s-box padding="base" borderWidth="base" borderRadius="base" background="subdued">
            <s-heading>4. Run what-if</s-heading>
            <s-paragraph>Model supplier cost increases before a promo, reorder, or price list update.</s-paragraph>
          </s-box>
        </s-grid>
      </s-section>

      <s-section heading="Launch checklist for the merchant">
        <s-ordered-list>
          <s-list-item>Add Shopify unit costs, or import supplier costs with the generated CSV template.</s-list-item>
          <s-list-item>Set the minimum margin target. The default is 30%.</s-list-item>
          <s-list-item>Run the profit scan.</s-list-item>
          <s-list-item>Run a cost-change what-if scenario for the next supplier increase.</s-list-item>
          <s-list-item>Export the findings and fix the highest-risk products first.</s-list-item>
          <s-list-item>Enable weekly alerts so new low-margin products are caught automatically.</s-list-item>
        </s-ordered-list>
      </s-section>

      <s-section heading="CSV format">
        <s-paragraph>Use the generated template when SKUs are missing or inconsistent.</s-paragraph>
        <pre>{`variant_id,inventory_item_id,sku,cost\ngid://shopify/ProductVariant/123,,ABC123,12.50\n,gid://shopify/InventoryItem/456,,8.40`}</pre>
        <s-stack direction="inline" gap="base">
          <s-link href="/app/import">Import supplier costs</s-link>
          <s-link href="/app/what-if">Run cost-change what-if</s-link>
        </s-stack>
      </s-section>

      <s-section heading="Positioning">
        <s-paragraph>Margin Sentinel is a catalog margin guardrail. It helps merchants catch missing costs, loss-making variants, and prices below target margin before those issues hide inside wider accounting reports.</s-paragraph>
      </s-section>

      <s-section heading="What Margin Sentinel does not do">
        <s-unordered-list>
          <s-list-item>It does not change product prices automatically.</s-list-item>
          <s-list-item>It does not order stock or contact suppliers.</s-list-item>
          <s-list-item>It only reads product, variant, price, SKU, and cost information needed for margin analysis.</s-list-item>
        </s-unordered-list>
      </s-section>
    </s-page>
  );
}

export const headers: HeadersFunction = (headersArgs) => boundary.headers(headersArgs);
