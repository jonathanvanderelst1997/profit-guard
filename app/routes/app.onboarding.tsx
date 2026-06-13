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
        <s-grid gridTemplateColumns="repeat(3, minmax(0, 1fr))" gap="base">
          <s-box padding="base" borderWidth="base" borderRadius="base" background="subdued">
            <s-heading>1. Add costs</s-heading>
            <s-paragraph>Use Shopify unit costs or import supplier costs by SKU. Missing costs are the most common reason profit reports cannot be trusted.</s-paragraph>
          </s-box>
          <s-box padding="base" borderWidth="base" borderRadius="base" background="subdued">
            <s-heading>2. Set target</s-heading>
            <s-paragraph>Current target: {basisPointsToPercent(settings.minimumMarginBps)}. Most merchants should start with their minimum acceptable gross product margin.</s-paragraph>
          </s-box>
          <s-box padding="base" borderWidth="base" borderRadius="base" background="subdued">
            <s-heading>3. Fix the list</s-heading>
            <s-paragraph>{latestAudit ? `${latestAudit.lossCount + latestAudit.lowMarginCount + latestAudit.missingCostCount} issues were found in the latest scan.` : "Run a scan to get a prioritized fix list."}</s-paragraph>
          </s-box>
        </s-grid>
      </s-section>

      <s-section heading="Launch checklist for the merchant">
        <s-ordered-list>
          <s-list-item>Open Products in Shopify and make sure variants have SKUs.</s-list-item>
          <s-list-item>Add Shopify unit costs, or import supplier costs with a CSV.</s-list-item>
          <s-list-item>Set the minimum margin target. The default is 30%.</s-list-item>
          <s-list-item>Run the profit scan.</s-list-item>
          <s-list-item>Export the findings and fix the highest-risk products first.</s-list-item>
          <s-list-item>Enable weekly alerts so new low-margin products are caught automatically.</s-list-item>
        </s-ordered-list>
      </s-section>

      <s-section heading="CSV format">
        <s-paragraph>Use this exact header. SKU must match the Shopify variant SKU.</s-paragraph>
        <pre>{`SKU,COST\nABC123,12.50\nXYZ999,8.40\nEU-SKU-9,"1.234,56"`}</pre>
        <s-link href="/app/import">Import supplier costs</s-link>
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
