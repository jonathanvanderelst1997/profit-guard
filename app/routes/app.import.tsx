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
import { getShopPlan, getVariantLimitForPlan } from "../lib/plan.server";
import { formatMoney } from "../lib/security";

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
  return { importRuns: await getRecentImportRuns(session.shop) };
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
  const matchedSkus = new Set<string>();
  for (const variant of updatedVariants) {
    const sku = variant.sku?.trim();
    if (sku && supplierMap.has(sku)) matchedSkus.add(sku);
  }
  const currencyCode = updatedVariants.find((variant) => variant.currencyCode)?.currencyCode ?? null;
  const summary = auditVariants(updatedVariants, settings.minimumMarginBps);
  const imported = shouldSave ? await upsertImportedCosts(session.shop, supplierMap) : 0;
  const importMetrics = buildImportRunMetrics({ rows: parsed.rows, errors: parsed.errors, matchedSkus, savedCostCount: imported });
  await createImportRun(session.shop, { ...importMetrics, fileName: file.name, saved: shouldSave });
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
  const { importRuns: initialImportRuns } = useLoaderData<typeof loader>();
  const fetcher = useFetcher<typeof action>();
  const data = fetcher.data;
  const importRuns = data?.importRuns ?? initialImportRuns;
  const isUploading = fetcher.state !== "idle";

  return (
    <s-page heading="Import supplier costs">
      <s-section heading="Bulk cost import">
        <s-paragraph>Upload a CSV with SKU and COST. Margin Sentinel matches rows to Shopify variant SKUs, previews the margin impact, and only saves costs when you tick the save box.</s-paragraph>
        <s-box padding="base" borderWidth="base" borderRadius="base" background="subdued">
          <s-stack direction="block" gap="small">
            <s-heading>CSV template</s-heading>
            <pre>{`SKU,COST\nABC123,12.50\nEU-SKU-9,"1.234,56"`}</pre>
            <s-paragraph>Costs can include currency symbols, commas, or EU decimal formatting. Duplicate SKUs are reported as warnings.</s-paragraph>
          </s-stack>
        </s-box>
        <fetcher.Form method="post" encType="multipart/form-data">
          <s-stack direction="block" gap="base">
            <input type="file" name="supplierCsv" accept=".csv,text/csv" />
            <label><input type="checkbox" name="saveCosts" value="true" /> Save imported costs for future scans</label>
            <s-button type="submit" disabled={isUploading} loading={isUploading}>Preview / import costs</s-button>
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
              <s-table-header format="numeric">Matched</s-table-header>
              <s-table-header format="numeric">Unmatched</s-table-header>
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
            <s-paragraph>CSV rows: {data.csvRows}. Matched SKUs: {data.matchedSkuCount}. Unmatched SKUs: {data.unmatchedSkuCount}. Saved costs: {data.imported}. Target margin: {basisPointsToPercent(data.preview.minimumMarginBps)}.</s-paragraph>
            {data.csvRows > 0 && data.matchedSkuCount === 0 ? (
              <s-banner tone="critical" heading="No Shopify SKUs matched">
                Check that the CSV SKU column matches Shopify variant SKUs exactly before saving.
              </s-banner>
            ) : null}
            {data.matchedSkuCount > 0 ? (
              <s-banner tone="success" heading="Costs matched">
                {data.matchedSkuCount} SKUs matched Shopify variants. Review the preview below before changing prices or supplier costs elsewhere.
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
            <s-grid gridTemplateColumns="repeat(2, minmax(0, 1fr))" gap="base">
              <s-box padding="base" borderWidth="base" borderRadius="base" background="subdued"><s-heading>{formatMoney(Number(data.preview.lossAmount ?? 0), data.preview.currencyCode)}</s-heading><s-text>Direct loss found</s-text></s-box>
              <s-box padding="base" borderWidth="base" borderRadius="base" background="subdued"><s-heading>{formatMoney(Number(data.preview.marginGapAmount ?? 0), data.preview.currencyCode)}</s-heading><s-text>Gap to target margin</s-text></s-box>
            </s-grid>
            {data.preview.findings.length > 0 ? (
              <div style={{ overflowX: "auto" }}>
                <table style={{ width: "100%", borderCollapse: "collapse" }}>
                  <thead><tr><th align="left">Issue</th><th align="left">Product</th><th align="left">SKU</th><th align="right">Price</th><th align="right">Imported cost</th><th align="left">Cost source</th><th align="right">Margin</th><th align="right">Suggested min price</th><th align="left">Next action</th></tr></thead>
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
