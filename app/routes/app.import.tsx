import type { ActionFunctionArgs, HeadersFunction, LoaderFunctionArgs } from "react-router";
import { useFetcher } from "react-router";
import { boundary } from "@shopify/shopify-app-react-router/server";
import { authenticate } from "../shopify.server";
import { applySupplierCostsBySku, auditVariants, basisPointsToPercent } from "../lib/margin";
import { parseSupplierCostCsv, supplierRowsToMap } from "../lib/csv";
import { fetchVariantsForAudit } from "../lib/shopify-products.server";
import { getShopSettings } from "../lib/settings.server";
import { upsertImportedCosts } from "../lib/imported-costs.server";
import { getShopPlan, getVariantLimitForPlan } from "../lib/plan.server";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  await authenticate.admin(request);
  return null;
};

export const action = async ({ request }: ActionFunctionArgs) => {
  const { admin, session } = await authenticate.admin(request);
  const formData = await request.formData();
  const file = formData.get("supplierCsv");
  const shouldSave = String(formData.get("saveCosts") ?? "false") === "true";

  if (!(file instanceof File)) return { ok: false, errors: ["Please upload a CSV file."], preview: null };

  const parsed = parseSupplierCostCsv(await file.text());
  if (parsed.errors.length > 0 && parsed.rows.length === 0) return { ok: false, errors: parsed.errors, preview: null };

  const settings = await getShopSettings(session.shop);
  const planKey = await getShopPlan(session.shop);
  const variantLimit = getVariantLimitForPlan(planKey);
  const supplierMap = supplierRowsToMap(parsed.rows);
  const variants = await fetchVariantsForAudit(admin, { maxVariants: variantLimit });
  const updatedVariants = applySupplierCostsBySku(variants.variants, supplierMap);
  const matchedSkus = new Set(updatedVariants.filter((variant) => variant.sku && supplierMap.has(variant.sku)).map((variant) => variant.sku));
  const summary = auditVariants(updatedVariants, settings.minimumMarginBps);
  const imported = shouldSave ? await upsertImportedCosts(session.shop, supplierMap) : 0;

  return {
    ok: true,
    errors: parsed.errors,
    imported,
    matchedSkuCount: matchedSkus.size,
    csvRows: parsed.rows.length,
    preview: { ...summary, findings: summary.findings.slice(0, 100), minimumMarginBps: settings.minimumMarginBps, scanLimitReached: variants.limitReached, variantLimit },
  };
};

export default function SupplierImport() {
  const fetcher = useFetcher<typeof action>();
  const data = fetcher.data;
  const isUploading = fetcher.state !== "idle";

  return (
    <s-page heading="Import supplier costs">
      <s-section heading="Bulk cost import">
        <s-paragraph>Upload a CSV with SKU and COST. Profit Guard matches rows to Shopify variant SKUs. Tick save to store these costs in Profit Guard and use them on the dashboard scan.</s-paragraph>
        <fetcher.Form method="post" encType="multipart/form-data">
          <s-stack direction="block" gap="base">
            <input type="file" name="supplierCsv" accept=".csv,text/csv" />
            <label><input type="checkbox" name="saveCosts" value="true" /> Save imported costs for future scans</label>
            <s-button type="submit" disabled={isUploading} loading={isUploading}>Preview / import costs</s-button>
          </s-stack>
        </fetcher.Form>
      </s-section>

      {data?.errors?.length ? (
        <s-section heading="CSV warnings">
          <s-unordered-list>{data.errors.map((e) => <s-list-item key={e}>{e}</s-list-item>)}</s-unordered-list>
        </s-section>
      ) : null}

      {data?.preview ? (
        <s-section heading="Import result">
          <s-stack direction="block" gap="base">
            <s-paragraph>CSV rows: {data.csvRows}. Matched SKUs: {data.matchedSkuCount}. Saved costs: {data.imported}. Target margin: {basisPointsToPercent(data.preview.minimumMarginBps)}.</s-paragraph>
            {data.preview.scanLimitReached ? (
              <s-banner tone="warning" heading="Plan scan limit reached">
                This import preview checked the first {data.preview.variantLimit.toLocaleString()} variants on the current plan.
              </s-banner>
            ) : null}
            <s-grid gridTemplateColumns="repeat(4, minmax(0, 1fr))" gap="base">
              <s-box padding="base" borderWidth="base" borderRadius="base" background="subdued"><s-heading>{data.preview.totalVariants}</s-heading><s-text>Variants checked</s-text></s-box>
              <s-box padding="base" borderWidth="base" borderRadius="base" background="subdued"><s-heading>{data.preview.lossCount}</s-heading><s-text>Losing money</s-text></s-box>
              <s-box padding="base" borderWidth="base" borderRadius="base" background="subdued"><s-heading>{data.preview.lowMarginCount}</s-heading><s-text>Low margin</s-text></s-box>
              <s-box padding="base" borderWidth="base" borderRadius="base" background="subdued"><s-heading>{data.preview.missingCostCount}</s-heading><s-text>Missing cost</s-text></s-box>
            </s-grid>
            <s-grid gridTemplateColumns="repeat(2, minmax(0, 1fr))" gap="base">
              <s-box padding="base" borderWidth="base" borderRadius="base" background="subdued"><s-heading>${Number(data.preview.lossAmount ?? 0).toFixed(2)}</s-heading><s-text>Direct loss found</s-text></s-box>
              <s-box padding="base" borderWidth="base" borderRadius="base" background="subdued"><s-heading>${Number(data.preview.marginGapAmount ?? 0).toFixed(2)}</s-heading><s-text>Gap to target margin</s-text></s-box>
            </s-grid>
            <s-link href="/app">Go back and run profit scan</s-link>
          </s-stack>
        </s-section>
      ) : null}
    </s-page>
  );
}

export const headers: HeadersFunction = (headersArgs) => boundary.headers(headersArgs);
