import type { ActionFunctionArgs, HeadersFunction, LoaderFunctionArgs } from "react-router";
import type { CSSProperties } from "react";
import { useFetcher, useLoaderData } from "react-router";
import { boundary } from "@shopify/shopify-app-react-router/server";
import { authenticate } from "../shopify.server";
import { applySupplierCostsBySku, auditVariants, basisPointsToPercent, calculateMinimumPriceForTargetMargin, getCostSourceLabel, getFindingAction, getSeverityLabel, type MarginFinding } from "../lib/margin";
import { parseSupplierCostCsv, supplierRowsToMap } from "../lib/csv";
import { fetchVariantsForAudit } from "../lib/shopify-products.server";
import { getShopSettings } from "../lib/settings.server";
import { upsertImportedCosts } from "../lib/imported-costs.server";
import { buildImportRunMetrics } from "../lib/import-history";
import { createImportRun, getRecentImportRuns } from "../lib/import-history.server";
import { getShopPlan, getVariantLimitForPlan, isPaidPlan, PLAN_LIMITS } from "../lib/plan.server";
import { formatMoney } from "../lib/security";
import { getVariantCostKeys } from "../lib/cost-matching";
import { trackAnalyticsEvent } from "../lib/analytics.server";

type PreviewFinding = MarginFinding & { id?: string | null };

function severityStyle(severity: PreviewFinding["severity"]): CSSProperties {
  const palette: Record<PreviewFinding["severity"], CSSProperties> = {
    LOSS: { color: "#8e1f0b", background: "#fff1ed", borderColor: "#ffd2c2" },
    LOW_MARGIN: { color: "#6f4e00", background: "#fff8db", borderColor: "#f1d992" },
    MISSING_COST: { color: "#1f4e79", background: "#edf5ff", borderColor: "#c6dcff" },
  };
  return {
    ...palette[severity],
    display: "inline-block",
    border: "1px solid",
    borderRadius: 6,
    padding: "2px 8px",
    fontSize: 12,
    fontWeight: 600,
    whiteSpace: "nowrap",
  };
}

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const { session } = await authenticate.admin(request);
  const planKey = await getShopPlan(session.shop);
  return { importRuns: await getRecentImportRuns(session.shop), planKey, plan: PLAN_LIMITS[planKey], canImport: isPaidPlan(planKey) };
};

export const action = async ({ request }: ActionFunctionArgs) => {
  const { admin, session } = await authenticate.admin(request);
  const formData = await request.formData();
  const file = formData.get("supplierCsv");
  const shouldSave = String(formData.get("saveCosts") ?? "false") === "true";
  const planKey = await getShopPlan(session.shop);
  if (!isPaidPlan(planKey)) {
    await trackAnalyticsEvent({ eventName: "supplier_import_blocked", source: "app", request, shop: session.shop, metadata: { planKey } });
    return { ok: false, errors: ["Upgrade to Starter to preview and save supplier cost imports."], preview: null, importRuns: await getRecentImportRuns(session.shop) };
  }

  if (!(file instanceof File)) {
    await trackAnalyticsEvent({ eventName: "supplier_import_failed", source: "app", request, shop: session.shop, metadata: { reason: "missing_file", planKey } });
    return { ok: false, errors: ["Please upload a CSV file."], preview: null };
  }

  const parsed = parseSupplierCostCsv(await file.text());
  if (parsed.errors.length > 0 && parsed.rows.length === 0) {
    await trackAnalyticsEvent({ eventName: "supplier_import_failed", source: "app", request, shop: session.shop, metadata: { reason: "parse_errors", errorCount: parsed.errors.length, fileName: file.name, planKey } });
    return { ok: false, errors: parsed.errors, preview: null };
  }

  const settings = await getShopSettings(session.shop);
  const variantLimit = getVariantLimitForPlan(planKey);
  const supplierMap = supplierRowsToMap(parsed.rows);
  const variants = await fetchVariantsForAudit(admin, { maxVariants: variantLimit });
  const updatedVariants = applySupplierCostsBySku(variants.variants, supplierMap);
  const matchedKeys = new Set<string>();
  for (const variant of updatedVariants) {
    for (const key of getVariantCostKeys(variant)) {
      if (supplierMap.has(key)) matchedKeys.add(key);
    }
  }
  const currencyCode = updatedVariants.find((variant) => variant.currencyCode)?.currencyCode ?? null;
  const summary = auditVariants(updatedVariants, settings.minimumMarginBps);
  const imported = shouldSave ? await upsertImportedCosts(session.shop, supplierMap) : 0;
  const importMetrics = buildImportRunMetrics({ rows: parsed.rows, errors: parsed.errors, matchedKeys, savedCostCount: imported });
  const importRun = await createImportRun(session.shop, { ...importMetrics, fileName: file.name, saved: shouldSave });
  await trackAnalyticsEvent({
    eventName: shouldSave ? "supplier_import_saved" : "supplier_import_previewed",
    source: "app",
    request,
    shop: session.shop,
    subjectId: importRun.id,
      metadata: { ...importMetrics, fileName: file.name, planKey, scanLimitReached: variants.limitReached },
  });
  await trackAnalyticsEvent({
    eventName: "csv_import_completed",
    source: "app",
    request,
    shop: session.shop,
    subjectId: importRun.id,
    metadata: { ...importMetrics, fileName: file.name, saved: shouldSave, planKey, scanLimitReached: variants.limitReached },
  });
  const importRuns = await getRecentImportRuns(session.shop);

  return {
    ok: true,
    errors: parsed.errors,
    imported,
    importRuns,
    matchedSkuCount: importMetrics.matchedSkuCount,
    unmatchedSkuCount: importMetrics.unmatchedSkuCount,
    csvRows: importMetrics.csvRows,
    preview: { ...summary, findings: summary.findings.slice(0, 100), minimumMarginBps: settings.minimumMarginBps, scanLimitReached: variants.limitReached, variantLimit, currencyCode },
  };
};

function formatDateTime(value: string | Date): string {
  return new Intl.DateTimeFormat("en", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" }).format(new Date(value));
}

export default function SupplierImport() {
  const { importRuns: initialImportRuns, plan, canImport } = useLoaderData<typeof loader>();
  const fetcher = useFetcher<typeof action>();
  const data = fetcher.data;
  const importRuns = data?.importRuns ?? initialImportRuns;
  const isUploading = fetcher.state !== "idle";

  return (
    <s-page heading="Import supplier costs">
      <s-section heading="Bulk cost import">
        <s-paragraph>Upload a CSV with variant_id, inventory_item_id, or SKU plus COST. Margin Sentinel matches rows to Shopify variants, previews the margin impact, and only saves costs when you tick the save box.</s-paragraph>
        <s-paragraph>Saved imports are used for future scans. Previous saved scans keep their own findings, so a new supplier cost file does not silently rewrite an earlier exception list.</s-paragraph>
        {!canImport ? (
          <s-banner tone="warning" heading="Starter feature">
            Your current plan is {plan.label}. Upgrade to Starter to preview and save supplier cost imports.
            <s-link href="/app/pricing">Open pricing</s-link>
          </s-banner>
        ) : null}
        <s-box padding="base" borderWidth="base" borderRadius="base" background="subdued">
          <s-stack direction="block" gap="small">
            <s-heading>CSV template</s-heading>
            <pre>{`variant_id,inventory_item_id,sku,cost\ngid://shopify/ProductVariant/123,,ABC123,12.50\n,gid://shopify/InventoryItem/456,,8.40`}</pre>
            <s-paragraph>Use the generated template when you do not know SKUs. Costs can include currency symbols, commas, or EU decimal formatting.</s-paragraph>
            <s-link href="/app/import/template">Download variant cost template</s-link>
          </s-stack>
        </s-box>
        <fetcher.Form method="post" encType="multipart/form-data">
          <s-stack direction="block" gap="base">
            <input type="file" name="supplierCsv" accept=".csv,text/csv" />
            <label><input type="checkbox" name="saveCosts" value="true" /> Save imported costs for future scans</label>
            <s-button type="submit" disabled={isUploading || !canImport} loading={isUploading}>Preview / import costs</s-button>
          </s-stack>
        </fetcher.Form>
      </s-section>

      <s-section heading="Recent imports">
        {importRuns.length === 0 ? (
          <s-box padding="base" borderWidth="base" borderRadius="base" background="subdued">
            <s-paragraph>No supplier cost imports yet. Your latest previews and saved imports will appear here.</s-paragraph>
          </s-box>
        ) : (
          <s-table variant="auto">
            <s-table-header-row>
              <s-table-header listSlot="primary">Date</s-table-header>
              <s-table-header>File</s-table-header>
              <s-table-header>Status</s-table-header>
              <s-table-header format="numeric">Rows</s-table-header>
              <s-table-header format="numeric">Matched rows</s-table-header>
              <s-table-header format="numeric">Unmatched rows</s-table-header>
              <s-table-header format="numeric">Duplicates</s-table-header>
              <s-table-header format="numeric">Warnings</s-table-header>
            </s-table-header-row>
            <s-table-body>
              {importRuns.map((run) => (
                <s-table-row key={run.id}>
                  <s-table-cell>{formatDateTime(run.createdAt)}</s-table-cell>
                  <s-table-cell>{run.fileName ?? "Supplier cost CSV"}</s-table-cell>
                  <s-table-cell>{run.saved ? `${run.savedCostCount} saved` : "Preview only"}</s-table-cell>
                  <s-table-cell>{run.csvRows}</s-table-cell>
                  <s-table-cell>{run.matchedSkuCount}</s-table-cell>
                  <s-table-cell>{run.unmatchedSkuCount}</s-table-cell>
                  <s-table-cell>{run.duplicateSkuCount}</s-table-cell>
                  <s-table-cell>{run.warningCount}</s-table-cell>
                </s-table-row>
              ))}
            </s-table-body>
          </s-table>
        )}
      </s-section>

      {data?.errors?.length ? (
        <s-section heading="CSV warnings">
          <s-unordered-list>{data.errors.map((e) => <s-list-item key={e}>{e}</s-list-item>)}</s-unordered-list>
        </s-section>
      ) : null}

      {data?.preview ? (
        <s-section heading="Import result">
          <s-stack direction="block" gap="base">
            <s-paragraph>CSV rows: {data.csvRows}. Matched rows: {data.matchedSkuCount}. Unmatched rows: {data.unmatchedSkuCount}. Saved costs: {data.imported}. Target margin: {basisPointsToPercent(data.preview.minimumMarginBps)}.</s-paragraph>
            {data.csvRows > 0 && data.matchedSkuCount === 0 ? (
              <s-banner tone="critical" heading="No Shopify variants matched">
                Use the generated template or check that variant_id, inventory_item_id, or SKU matches Shopify exactly before saving.
              </s-banner>
            ) : null}
            {data.matchedSkuCount > 0 ? (
              <s-banner tone="success" heading="Costs matched">
                {data.matchedSkuCount} rows matched Shopify variants. Review the preview below before changing prices or supplier costs elsewhere.
              </s-banner>
            ) : null}
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
            <s-grid gridTemplateColumns="repeat(3, minmax(0, 1fr))" gap="base">
              <s-box padding="base" borderWidth="base" borderRadius="base" background="subdued"><s-heading>{formatMoney(Number(data.preview.lossAmount ?? 0), data.preview.currencyCode)}</s-heading><s-text>Direct loss found</s-text></s-box>
              <s-box padding="base" borderWidth="base" borderRadius="base" background="subdued"><s-heading>{formatMoney(Number(data.preview.marginGapAmount ?? 0), data.preview.currencyCode)}</s-heading><s-text>Gap to target margin</s-text></s-box>
              <s-box padding="base" borderWidth="base" borderRadius="base" background="subdued"><s-heading>{formatMoney(Number(data.preview.inventoryRiskAmount ?? 0), data.preview.currencyCode)}</s-heading><s-text>Inventory risk</s-text></s-box>
            </s-grid>
            {data.preview.findings.length > 0 ? (
              <div style={{ overflowX: "auto" }}>
                <table style={{ width: "100%", borderCollapse: "collapse" }}>
                  <thead><tr><th align="left">Issue</th><th align="left">Product</th><th align="left">SKU</th><th align="right">Price</th><th align="right">Imported cost</th><th align="left">Cost source</th><th align="right">Margin</th><th align="right">Inventory</th><th align="right">Inventory risk</th><th align="right">Suggested min price</th><th align="left">Next action</th></tr></thead>
                  <tbody>
                    {(data.preview.findings as PreviewFinding[]).slice(0, 25).map((finding) => {
                      const suggestedPrice = calculateMinimumPriceForTargetMargin(finding.costAmount, data.preview.minimumMarginBps);
                      return (
                        <tr key={finding.id ?? finding.variantId}>
                          <td><span style={severityStyle(finding.severity)}>{getSeverityLabel(finding.severity)}</span></td>
                          <td>{finding.productTitle}{finding.variantTitle && finding.variantTitle !== "Default Title" ? ` / ${finding.variantTitle}` : ""}</td>
                          <td>{finding.sku ?? "—"}</td>
                          <td align="right">{formatMoney(Number(finding.priceAmount), finding.currencyCode)}</td>
                          <td align="right">{finding.costAmount == null ? "—" : formatMoney(Number(finding.costAmount), finding.currencyCode)}</td>
                          <td>{getCostSourceLabel(finding.costSource)}</td>
                          <td align="right">{basisPointsToPercent(finding.marginBps)}</td>
                          <td align="right">{finding.inventoryQuantity ?? "—"}</td>
                          <td align="right">{finding.inventoryRiskAmount == null ? "—" : formatMoney(Number(finding.inventoryRiskAmount), finding.currencyCode)}</td>
                          <td align="right">{suggestedPrice == null ? "—" : formatMoney(suggestedPrice, finding.currencyCode)}</td>
                          <td>{getFindingAction(finding.severity)}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            ) : null}
            <s-link href="/app">Go back and run profit scan</s-link>
          </s-stack>
        </s-section>
      ) : null}
    </s-page>
  );
}

export const headers: HeadersFunction = (headersArgs) => boundary.headers(headersArgs);
