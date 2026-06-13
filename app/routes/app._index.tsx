import { useEffect, useMemo, useState, type CSSProperties } from "react";
import type { ActionFunctionArgs, HeadersFunction, LoaderFunctionArgs } from "react-router";
import { useFetcher, useLoaderData } from "react-router";
import { useAppBridge } from "@shopify/app-bridge-react";
import { boundary } from "@shopify/shopify-app-react-router/server";
import { authenticate } from "../shopify.server";
import { auditVariants, basisPointsToPercent, calculateMinimumPriceForTargetMargin, getCostSourceLabel, getFindingAction, getSeverityLabel, SEVERITY_ORDER, type MarginFinding, type Severity } from "../lib/margin";
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

type StatTone = "critical" | "warning" | "neutral";
type FindingFilter = "ALL" | Severity;
type FindingSort = "priority" | "risk" | "gap" | "margin" | "product";
type AuditFinding = Omit<MarginFinding, "severity" | "costSource"> & { id?: string | null; severity: string; costSource?: string | null };
type DashboardAudit = {
  totalVariants: number;
  lossCount: number;
  lowMarginCount: number;
  missingCostCount: number;
  okCount: number;
  lossAmount: unknown;
  marginGapAmount: unknown;
  inventoryRiskAmount: unknown;
  minimumMarginBps: number;
  findings: AuditFinding[];
};

function normalizeSeverity(value: string): Severity {
  if (value === "LOSS" || value === "LOW_MARGIN" || value === "MISSING_COST") return value;
  return "LOW_MARGIN";
}

function StatCard({ label, value, tone }: { label: string; value: number | string; tone?: StatTone }) {
  return (
    <s-box padding="base" borderWidth="base" borderRadius="base" background="subdued">
      <s-stack direction="block" gap="small">
        <s-text tone={tone ?? "neutral"}>{label}</s-text>
        <s-heading>{value}</s-heading>
      </s-stack>
    </s-box>
  );
}

function findingMatchesQuery(finding: AuditFinding, query: string): boolean {
  if (!query.trim()) return true;
  const haystack = [finding.productTitle, finding.variantTitle, finding.sku, finding.reason, finding.severity, getCostSourceLabel(finding.costSource)].filter(Boolean).join(" ").toLowerCase();
  return haystack.includes(query.trim().toLowerCase());
}

function sortFindings(findings: AuditFinding[], sort: FindingSort): AuditFinding[] {
  return [...findings].sort((a, b) => {
    if (sort === "risk") return (b.inventoryRiskAmount ?? 0) - (a.inventoryRiskAmount ?? 0);
    if (sort === "gap") return (b.gapToTargetAmount ?? 0) - (a.gapToTargetAmount ?? 0);
    if (sort === "margin") return (a.marginBps ?? Number.POSITIVE_INFINITY) - (b.marginBps ?? Number.POSITIVE_INFINITY);
    if (sort === "product") return `${a.productTitle} ${a.variantTitle ?? ""}`.localeCompare(`${b.productTitle} ${b.variantTitle ?? ""}`);
    const severityDelta = SEVERITY_ORDER[normalizeSeverity(a.severity)] - SEVERITY_ORDER[normalizeSeverity(b.severity)];
    if (severityDelta !== 0) return severityDelta;
    return (b.gapToTargetAmount ?? 0) - (a.gapToTargetAmount ?? 0);
  });
}

function severityStyle(severity: Severity): CSSProperties {
  const palette: Record<Severity, CSSProperties> = {
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

function humanNumber(value: number): string {
  return new Intl.NumberFormat("en").format(value);
}

function ActionCenter({ audit, minimumMarginBps }: { audit: DashboardAudit; minimumMarginBps: number }) {
  const firstLoss = audit.findings.find((finding) => normalizeSeverity(finding.severity) === "LOSS");
  const firstLowMargin = audit.findings.find((finding) => normalizeSeverity(finding.severity) === "LOW_MARGIN");
  const firstMissingCost = audit.findings.find((finding) => normalizeSeverity(finding.severity) === "MISSING_COST");
  const firstPriority = firstLoss ?? firstLowMargin ?? firstMissingCost;
  const coverage = audit.totalVariants > 0 ? Math.round((audit.okCount / audit.totalVariants) * 100) : 0;
  const issueCount = audit.lossCount + audit.lowMarginCount + audit.missingCostCount;
  const suggestedPrice = firstPriority ? calculateMinimumPriceForTargetMargin(firstPriority.costAmount, minimumMarginBps) : null;

  return (
    <s-section heading="Action center">
      {issueCount === 0 ? (
        <s-banner tone="success" heading="No margin leaks found">
          Every scanned variant is at or above your current target margin. Keep weekly alerts on so new pricing or supplier cost changes are caught early.
        </s-banner>
      ) : (
        <s-stack direction="block" gap="base">
          <s-grid gridTemplateColumns="repeat(3, minmax(0, 1fr))" gap="base">
            <StatCard label="Catalog healthy" value={`${coverage}%`} />
            <StatCard label="Issues to review" value={issueCount} tone={issueCount > 0 ? "warning" : "neutral"} />
            <StatCard label="Inventory risk" value={formatMoney(Number(audit.inventoryRiskAmount ?? 0), firstPriority?.currencyCode)} tone="warning" />
          </s-grid>
          {firstPriority ? (
            <s-box padding="base" borderWidth="base" borderRadius="base" background="subdued">
              <s-stack direction="block" gap="small">
                <s-text tone={firstPriority.severity === "LOSS" ? "critical" : "warning"}>Fix first</s-text>
                <s-heading>{firstPriority.productTitle}{firstPriority.variantTitle && firstPriority.variantTitle !== "Default Title" ? ` / ${firstPriority.variantTitle}` : ""}</s-heading>
                <s-paragraph>
                  {getFindingAction(normalizeSeverity(firstPriority.severity))}
                  {suggestedPrice ? ` Suggested minimum price for ${basisPointsToPercent(minimumMarginBps)} margin: ${formatMoney(suggestedPrice, firstPriority.currencyCode)}.` : ""}
                </s-paragraph>
                <s-paragraph>Cost source: {getCostSourceLabel(firstPriority.costSource)}.</s-paragraph>
                <s-stack direction="inline" gap="base">
                  <s-link href="/app/export">Export full fix list</s-link>
                  <s-link href="/app/import">Import supplier costs</s-link>
                  <s-link href="/app/alerts">Enable weekly alerts</s-link>
                </s-stack>
              </s-stack>
            </s-box>
          ) : null}
        </s-stack>
      )}
    </s-section>
  );
}

export default function Dashboard() {
  const { settings, latestAudit, plan } = useLoaderData<typeof loader>();
  const fetcher = useFetcher<typeof action>();
  const shopify = useAppBridge();
  const [issueFilter, setIssueFilter] = useState<FindingFilter>("ALL");
  const [sort, setSort] = useState<FindingSort>("priority");
  const [query, setQuery] = useState("");
  const currentAudit = fetcher.data?.type === "scan" ? fetcher.data.auditRun : latestAudit;
  const isScanning = fetcher.state !== "idle" && fetcher.formData?.get("intent") === "scan";
  const isSavingSettings = fetcher.state !== "idle" && fetcher.formData?.get("intent") === "settings";
  const visibleFindings = useMemo(() => {
    if (!currentAudit) return [];
    const filtered = currentAudit.findings.filter((finding) => {
      const matchesIssue = issueFilter === "ALL" || normalizeSeverity(finding.severity) === issueFilter;
      return matchesIssue && findingMatchesQuery(finding, query);
    });
    return sortFindings(filtered as AuditFinding[], sort);
  }, [currentAudit, issueFilter, query, sort]);

  useEffect(() => {
    if (fetcher.data?.ok && fetcher.data.type === "scan") shopify.toast.show("Profit scan completed");
    if (fetcher.data?.ok && fetcher.data.type === "settings") shopify.toast.show("Settings saved");
  }, [fetcher.data, shopify]);

  return (
    <s-page heading="Margin Sentinel">
      <fetcher.Form method="post">
        <input type="hidden" name="intent" value="scan" />
        <s-button type="submit" variant="primary" disabled={isScanning} loading={isScanning}>Run profit scan</s-button>
      </fetcher.Form>

      <s-section heading="Automatic profit scan">
        <s-paragraph>Margin Sentinel reads Shopify selling prices, Shopify unit costs, and imported supplier costs. It finds products that lose money, sit below your margin target, or still miss cost data. It never changes prices automatically.</s-paragraph>
        <s-paragraph>Current plan: {plan.label}. Scan limit: {plan.variantLimit.toLocaleString()} variants.</s-paragraph>
      </s-section>

      <s-section heading="Margin target">
        <fetcher.Form method="post">
          <input type="hidden" name="intent" value="settings" />
          <s-stack direction="inline" gap="base" alignItems="end">
            <s-number-field label="Minimum margin" name="minimumMarginPercent" defaultValue={String(settings.minimumMarginBps / 100)} min={1} max={95} step={0.5} suffix="%" />
            <s-button type="submit" disabled={isSavingSettings} loading={isSavingSettings}>Save</s-button>
          </s-stack>
        </fetcher.Form>
      </s-section>

      <s-section heading="Latest scan">
        {!currentAudit ? (
          <s-box padding="base" borderWidth="base" borderRadius="base" background="subdued">
            <s-stack direction="block" gap="base">
              <s-heading>Start with one scan</s-heading>
              <s-paragraph>Margin Sentinel will show missing costs, negative gross margin, low-margin variants, and the exact products to fix first. No product prices are changed.</s-paragraph>
              <s-stack direction="inline" gap="base">
                <s-link href="/app/import">Import supplier costs first</s-link>
                <s-link href="/app/onboarding">Open setup checklist</s-link>
              </s-stack>
            </s-stack>
          </s-box>
        ) : (
          <s-stack direction="block" gap="base">
            {currentAudit.demoMode ? (
              <s-banner tone="info" heading="Demo data active">
                This store has no real Shopify unit costs or imported supplier costs yet, so Margin Sentinel generated safe demo costs to show what merchants will see. Import supplier costs or add Shopify unit costs to use real data.
              </s-banner>
            ) : null}
            {currentAudit.scanLimitReached ? (
              <s-banner tone="warning" heading="Plan scan limit reached">
                This scan stopped at your current plan limit. Upgrade to scan more variants.
              </s-banner>
            ) : null}
            <ActionCenter audit={currentAudit} minimumMarginBps={currentAudit.minimumMarginBps} />
            <s-grid gridTemplateColumns="repeat(4, minmax(0, 1fr))" gap="base">
              <StatCard label="Variants checked" value={currentAudit.totalVariants} />
              <StatCard label="Losing money" value={currentAudit.lossCount} tone="critical" />
              <StatCard label="Low margin" value={currentAudit.lowMarginCount} tone="warning" />
              <StatCard label="Missing cost" value={currentAudit.missingCostCount} tone="warning" />
            </s-grid>
            <s-grid gridTemplateColumns="repeat(4, minmax(0, 1fr))" gap="base">
              <StatCard label="Direct loss found" value={formatMoney(Number(currentAudit.lossAmount ?? 0), currentAudit.findings?.[0]?.currencyCode)} tone="critical" />
              <StatCard label="Margin gap to target" value={formatMoney(Number(currentAudit.marginGapAmount ?? 0), currentAudit.findings?.[0]?.currencyCode)} tone="warning" />
              <StatCard label="Inventory risk" value={formatMoney(Number(currentAudit.inventoryRiskAmount ?? 0), currentAudit.findings?.[0]?.currencyCode)} tone="warning" />
              <StatCard label="OK variants" value={currentAudit.okCount} />
            </s-grid>
            <s-paragraph>Target margin: {basisPointsToPercent(currentAudit.minimumMarginBps)}. Inventory risk is gap to target margin multiplied by current Shopify inventory quantity. Showing the first 100 findings in-app. CSV export includes all saved findings.</s-paragraph>
            <s-stack direction="inline" gap="base">
              <s-link href="/app/import">Import supplier costs</s-link>
              <s-link href="/app/what-if">Run cost what-if</s-link>
              <s-link href="/app/export">Download findings CSV</s-link>
              <s-link href="/app/alerts">Set weekly alerts</s-link>
              <s-link href="/app/pricing">Pricing</s-link>
              <s-link href="/app/onboarding">Merchant setup</s-link>
            </s-stack>
            <s-box padding="base" borderWidth="base" borderRadius="base" background="subdued">
              <s-stack direction="block" gap="base">
                <s-heading>Review findings</s-heading>
                <s-stack direction="inline" gap="base" alignItems="end">
                  <label style={{ display: "grid", gap: 4 }}>
                    <span>Search</span>
                    <input value={query} onChange={(event) => setQuery(event.currentTarget.value)} placeholder="Product, SKU, reason" style={{ minWidth: 220, padding: "8px 10px", border: "1px solid #c9cccf", borderRadius: 6 }} />
                  </label>
                  <label style={{ display: "grid", gap: 4 }}>
                    <span>Issue</span>
                    <select value={issueFilter} onChange={(event) => setIssueFilter(event.currentTarget.value as FindingFilter)} style={{ minWidth: 160, padding: "8px 10px", border: "1px solid #c9cccf", borderRadius: 6 }}>
                      <option value="ALL">All issues</option>
                      <option value="LOSS">Losing money</option>
                      <option value="LOW_MARGIN">Low margin</option>
                      <option value="MISSING_COST">Missing cost</option>
                    </select>
                  </label>
                  <label style={{ display: "grid", gap: 4 }}>
                    <span>Sort</span>
                    <select value={sort} onChange={(event) => setSort(event.currentTarget.value as FindingSort)} style={{ minWidth: 180, padding: "8px 10px", border: "1px solid #c9cccf", borderRadius: 6 }}>
                      <option value="priority">Highest priority</option>
                      <option value="risk">Highest inventory risk</option>
                      <option value="gap">Largest margin gap</option>
                      <option value="margin">Lowest margin</option>
                      <option value="product">Product name</option>
                    </select>
                  </label>
                </s-stack>
                <s-paragraph>Showing {humanNumber(visibleFindings.length)} of {humanNumber(currentAudit.findings.length)} saved findings.</s-paragraph>
              </s-stack>
            </s-box>
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead><tr><th align="left">Issue</th><th align="left">Product</th><th align="left">SKU</th><th align="right">Price</th><th align="right">Cost</th><th align="left">Cost source</th><th align="right">Profit</th><th align="right">Margin</th><th align="right">Gap</th><th align="right">Inventory</th><th align="right">Inventory risk</th><th align="right">Suggested min price</th><th align="left">Next action</th></tr></thead>
                <tbody>
                  {visibleFindings.map((f) => {
                    const suggestedPrice = calculateMinimumPriceForTargetMargin(f.costAmount, currentAudit.minimumMarginBps);
                    const severity = normalizeSeverity(f.severity);
                    return (
                    <tr key={f.id ?? f.variantId}>
                      <td><span style={severityStyle(severity)}>{getSeverityLabel(severity)}</span></td>
                      <td>{f.productTitle}{f.variantTitle && f.variantTitle !== "Default Title" ? ` / ${f.variantTitle}` : ""}</td>
                      <td>{f.sku ?? "—"}</td>
                      <td align="right">{formatMoney(Number(f.priceAmount), f.currencyCode)}</td>
                      <td align="right">{f.costAmount == null ? "—" : formatMoney(Number(f.costAmount), f.currencyCode)}</td>
                      <td>{getCostSourceLabel(f.costSource)}</td>
                      <td align="right">{f.profitAmount == null ? "—" : formatMoney(Number(f.profitAmount), f.currencyCode)}</td>
                      <td align="right">{basisPointsToPercent(f.marginBps)}</td>
                      <td align="right">{f.gapToTargetAmount == null ? "—" : formatMoney(Number(f.gapToTargetAmount), f.currencyCode)}</td>
                      <td align="right">{f.inventoryQuantity ?? "—"}</td>
                      <td align="right">{f.inventoryRiskAmount == null ? "—" : formatMoney(Number(f.inventoryRiskAmount), f.currencyCode)}</td>
                      <td align="right">{suggestedPrice == null ? "—" : formatMoney(suggestedPrice, f.currencyCode)}</td>
                      <td>{getFindingAction(severity)}</td>
                    </tr>
                    );
                  })}
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
