import type { HeadersFunction, LoaderFunctionArgs } from "react-router";
import { useState } from "react";
import { useLoaderData } from "react-router";
import { useAppBridge } from "@shopify/app-bridge-react";
import { boundary } from "@shopify/shopify-app-react-router/server";
import { authenticate } from "../shopify.server";
import { getLatestAuditRunForExport } from "../lib/audit-store.server";
import { findingsToCsv } from "../lib/export";
import { basisPointsToPercent } from "../lib/margin";
import { formatMoney } from "../lib/security";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const { session } = await authenticate.admin(request);
  const url = new URL(request.url);
  const latestAudit = await getLatestAuditRunForExport(session.shop);
  const fileName = `margin-sentinel-findings-${new Date().toISOString().slice(0, 10)}.csv`;

  if (url.searchParams.get("download") === "1") {
    if (!latestAudit) return new Response("No audit run found. Run a scan first.\n", { status: 404, headers: { "Content-Type": "text/plain; charset=utf-8" } });
    const csv = findingsToCsv(latestAudit.findings, { minimumMarginBps: latestAudit.minimumMarginBps });
    return new Response(csv, { headers: { "Content-Type": "text/csv; charset=utf-8", "Content-Disposition": `attachment; filename="${fileName}"` } });
  }

  if (!latestAudit) return { hasAudit: false as const };
  const issueCount = latestAudit.lossCount + latestAudit.lowMarginCount + latestAudit.missingCostCount;
  const currencyCode = latestAudit.findings[0]?.currencyCode;
  const csv = findingsToCsv(latestAudit.findings, { minimumMarginBps: latestAudit.minimumMarginBps });
  return {
    hasAudit: true as const,
    fileName,
    csv,
    createdAt: latestAudit.createdAt,
    totalVariants: latestAudit.totalVariants,
    issueCount,
    findingCount: latestAudit.findings.length,
    lossCount: latestAudit.lossCount,
    lowMarginCount: latestAudit.lowMarginCount,
    missingCostCount: latestAudit.missingCostCount,
    inventoryRisk: formatMoney(Number(latestAudit.inventoryRiskAmount ?? 0), currencyCode),
    targetMargin: basisPointsToPercent(latestAudit.minimumMarginBps),
  };
};

function formatDateTime(value: string | Date): string {
  return new Intl.DateTimeFormat("en", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" }).format(new Date(value));
}

export default function ExportFindings() {
  const data = useLoaderData<typeof loader>();
  const shopify = useAppBridge();
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadError, setDownloadError] = useState<string | null>(null);

  async function downloadCsv() {
    if (!data.hasAudit) return;
    setIsDownloading(true);
    setDownloadError(null);
    try {
      const blob = new Blob([data.csv], { type: "text/csv;charset=utf-8" });
      const objectUrl = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = objectUrl;
      link.download = data.fileName;
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(objectUrl);
      shopify.toast.show("CSV export downloaded");
    } catch (error) {
      const message = error instanceof Error ? error.message : "Could not download CSV export.";
      setDownloadError(message);
      shopify.toast.show("Could not download CSV export");
    } finally {
      setIsDownloading(false);
    }
  }

  return (
    <s-page heading="Export findings">
      <s-section heading="CSV export">
        {!data.hasAudit ? (
          <s-box padding="base" borderWidth="base" borderRadius="base" background="subdued">
            <s-stack direction="block" gap="base">
              <s-heading>No scan to export yet</s-heading>
              <s-paragraph>Run a profit scan first. Margin Sentinel will then create a CSV with every saved finding, suggested minimum prices, margin gaps, and next actions.</s-paragraph>
              <s-link href="/app">Run profit scan</s-link>
            </s-stack>
          </s-box>
        ) : (
          <s-stack direction="block" gap="base">
            <s-box padding="base" borderWidth="base" borderRadius="base" background="subdued">
              <s-stack direction="block" gap="small">
                <s-heading>{data.fileName}</s-heading>
                <s-paragraph>Latest scan: {formatDateTime(data.createdAt)}. The file is read-only and does not change prices or product data in Shopify.</s-paragraph>
                <s-button type="button" onClick={downloadCsv} loading={isDownloading} disabled={isDownloading}>Download findings CSV</s-button>
                {downloadError ? <s-banner tone="critical">{downloadError}</s-banner> : null}
              </s-stack>
            </s-box>
            <s-grid gridTemplateColumns="repeat(auto-fit, minmax(170px, 1fr))" gap="base">
              <s-box padding="base" borderWidth="base" borderRadius="base" background="subdued"><s-heading>{data.totalVariants.toLocaleString()}</s-heading><s-text>Variants checked</s-text></s-box>
              <s-box padding="base" borderWidth="base" borderRadius="base" background="subdued"><s-heading>{data.issueCount.toLocaleString()}</s-heading><s-text>Issues to review</s-text></s-box>
              <s-box padding="base" borderWidth="base" borderRadius="base" background="subdued"><s-heading>{data.findingCount.toLocaleString()}</s-heading><s-text>Rows in CSV</s-text></s-box>
              <s-box padding="base" borderWidth="base" borderRadius="base" background="subdued"><s-heading>{data.inventoryRisk}</s-heading><s-text>Inventory risk</s-text></s-box>
            </s-grid>
            <s-section heading="What the CSV includes">
              <s-unordered-list>
                <s-list-item>Products losing money, products below the target margin, and products with missing cost data.</s-list-item>
                <s-list-item>Price, cost source, profit, margin, margin gap, inventory risk, and suggested minimum price.</s-list-item>
                <s-list-item>Recommended next action for each finding so a merchant can hand the file to their team.</s-list-item>
              </s-unordered-list>
              <s-paragraph>Target margin: {data.targetMargin}. Issue mix: {data.lossCount} losing money, {data.lowMarginCount} low margin, {data.missingCostCount} missing cost.</s-paragraph>
            </s-section>
          </s-stack>
        )}
      </s-section>
    </s-page>
  );
}

export const headers: HeadersFunction = (headersArgs) => boundary.headers(headersArgs);
