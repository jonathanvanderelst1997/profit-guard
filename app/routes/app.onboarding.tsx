import type { HeadersFunction, LoaderFunctionArgs } from "react-router";
import type { CSSProperties } from "react";
import { useLoaderData } from "react-router";
import { boundary } from "@shopify/shopify-app-react-router/server";
import { authenticate } from "../shopify.server";
import { getLatestAuditRun } from "../lib/audit-store.server";
import { getRecentImportRuns } from "../lib/import-history.server";
import { getShopSettings } from "../lib/settings.server";
import { basisPointsToPercent } from "../lib/margin";
import { getShopPlan, isPaidPlan, PLAN_LIMITS } from "../lib/plan.server";
import { formatMoney } from "../lib/security";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const { session } = await authenticate.admin(request);
  const [settings, latestAudit, importRuns, planKey] = await Promise.all([
    getShopSettings(session.shop),
    getLatestAuditRun(session.shop),
    getRecentImportRuns(session.shop, 5),
    getShopPlan(session.shop),
  ]);
  return { settings, latestAudit, importRuns, plan: PLAN_LIMITS[planKey], canUseAlerts: isPaidPlan(planKey) };
};

type StepState = "complete" | "current" | "waiting";

function getIssueCount(audit: Awaited<ReturnType<typeof getLatestAuditRun>>): number {
  if (!audit) return 0;
  return audit.lossCount + audit.lowMarginCount + audit.missingCostCount;
}

function formatDateTime(value: string | Date): string {
  return new Intl.DateTimeFormat("en", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" }).format(new Date(value));
}

function statusLabel(state: StepState): string {
  if (state === "complete") return "Done";
  if (state === "current") return "Next";
  return "Later";
}

function statusStyle(state: StepState): CSSProperties {
  const palette: Record<StepState, CSSProperties> = {
    complete: { color: "#0b6b35", background: "#eaf8ef", borderColor: "#b7e4c7" },
    current: { color: "#704900", background: "#fff5d6", borderColor: "#e9cc75" },
    waiting: { color: "#4a5568", background: "#f4f6f8", borderColor: "#d8dde3" },
  };
  return {
    ...palette[state],
    display: "inline-block",
    border: "1px solid",
    borderRadius: 6,
    padding: "2px 8px",
    fontSize: 12,
    fontWeight: 600,
    whiteSpace: "nowrap",
  };
}

function StatusPill({ state }: { state: StepState }) {
  return <span style={statusStyle(state)}>{statusLabel(state)}</span>;
}

function ChecklistStep({
  number,
  title,
  description,
  state,
  href,
  action,
}: {
  number: number;
  title: string;
  description: string;
  state: StepState;
  href: string;
  action: string;
}) {
  return (
    <s-box padding="base" borderWidth="base" borderRadius="base" background="subdued">
      <s-stack direction="block" gap="small">
        <s-stack direction="inline" justifyContent="space-between" alignItems="center">
          <s-text>Step {number}</s-text>
          <StatusPill state={state} />
        </s-stack>
        <s-heading>{title}</s-heading>
        <s-paragraph>{description}</s-paragraph>
        <s-link href={href}>{action}</s-link>
      </s-stack>
    </s-box>
  );
}

export default function Onboarding() {
  const { settings, latestAudit, importRuns, plan, canUseAlerts } = useLoaderData<typeof loader>();
  const hasScan = Boolean(latestAudit);
  const issueCount = getIssueCount(latestAudit);
  const savedImportCount = importRuns.filter((run) => run.saved && run.savedCostCount > 0).length;
  const costsReady = Boolean(savedImportCount > 0 || (latestAudit && !latestAudit.demoMode && latestAudit.missingCostCount === 0));
  const costsNeedAttention = Boolean(!costsReady || latestAudit?.demoMode || (latestAudit?.missingCostCount ?? 0) > 0);
  const hasAlerts = Boolean(settings.weeklyAlertsEnabled && canUseAlerts);
  const readinessScore = Math.round(([costsReady, hasScan, hasAlerts].filter(Boolean).length / 3) * 100);
  const nextAction = !hasScan
    ? { heading: "Run the first profit scan", body: "Start here. The scan creates the first fix list and shows whether cost data is missing.", href: "/app", label: "Run profit scan" }
    : costsNeedAttention
      ? { heading: "Confirm supplier costs", body: "The latest scan still needs stronger cost data. Import supplier costs or add Shopify unit costs, then scan again.", href: "/app/import", label: "Import supplier costs" }
      : issueCount > 0
        ? { heading: "Fix the highest-risk variants", body: "The scan found margin issues. Export the list and start with the product carrying the biggest inventory risk.", href: "/app/export", label: "Export fix list" }
        : !hasAlerts
          ? { heading: "Enable weekly margin alerts", body: "The catalog looks healthy. Turn on weekly alerts so new low-margin products are caught early.", href: "/app/alerts", label: "Set weekly alerts" }
          : { heading: "Keep monitoring weekly", body: "The core setup is complete. Re-run scans after supplier price changes, promos, or catalog imports.", href: "/app/what-if", label: "Run cost what-if" };

  return (
    <s-page heading="First scan checklist">
      <s-section heading="Best next action">
        <s-grid gridTemplateColumns="minmax(0, 2fr) minmax(220px, 1fr)" gap="base">
          <s-box padding="base" borderWidth="base" borderRadius="base" background="subdued">
            <s-stack direction="block" gap="small">
              <s-text tone="warning">Do this next</s-text>
              <s-heading>{nextAction.heading}</s-heading>
              <s-paragraph>{nextAction.body}</s-paragraph>
              <s-link href={nextAction.href}>{nextAction.label}</s-link>
            </s-stack>
          </s-box>
          <s-box padding="base" borderWidth="base" borderRadius="base" background="subdued">
            <s-stack direction="block" gap="small">
              <s-text>Setup readiness</s-text>
              <s-heading>{readinessScore}%</s-heading>
              <s-paragraph>Current plan: {plan.label}. Target margin: {basisPointsToPercent(settings.minimumMarginBps)}.</s-paragraph>
            </s-stack>
          </s-box>
        </s-grid>
      </s-section>

      <s-section heading="Your first scan path">
        <s-grid gridTemplateColumns="repeat(auto-fit, minmax(220px, 1fr))" gap="base">
          <ChecklistStep
            number={1}
            title="Confirm cost data"
            state={costsReady ? "complete" : hasScan ? "current" : "waiting"}
            description={costsReady ? "Cost data is available for the latest scan path." : "Use Shopify unit costs or import supplier costs. Missing costs are the most common reason margin reports cannot be trusted."}
            href="/app/import"
            action="Import supplier costs"
          />
          <ChecklistStep
            number={2}
            title="Run profit scan"
            state={hasScan ? "complete" : "current"}
            description={hasScan ? `Latest scan checked ${latestAudit?.totalVariants.toLocaleString()} variants.` : "Create the first prioritized fix list from Shopify prices, unit costs, supplier costs, and inventory quantity."}
            href="/app"
            action="Open dashboard"
          />
          <ChecklistStep
            number={3}
            title="Review top risk"
            state={!hasScan ? "waiting" : issueCount > 0 ? "current" : "complete"}
            description={!hasScan ? "The highest-risk products appear after the first scan." : issueCount > 0 ? `${issueCount} issues need review. Start with direct losses and highest inventory risk.` : "No issues were found in the latest scan."}
            href="/app"
            action="Review findings"
          />
          <ChecklistStep
            number={4}
            title="Export fixes"
            state={!hasScan ? "waiting" : issueCount > 0 ? "current" : "complete"}
            description={issueCount > 0 ? "Download the CSV so the team can update prices, supplier costs, or SKU data." : "Use exports after a scan finds items that need team follow-up."}
            href="/app/export"
            action="Download CSV"
          />
          <ChecklistStep
            number={5}
            title="Keep watch"
            state={hasAlerts ? "complete" : hasScan ? "current" : "waiting"}
            description={hasAlerts ? "Weekly alerts are enabled." : "Enable weekly alerts after the first useful scan so margin leaks do not return unnoticed."}
            href="/app/alerts"
            action="Set weekly alerts"
          />
        </s-grid>
      </s-section>

      <s-section heading="Latest scan snapshot">
        {!latestAudit ? (
          <s-box padding="base" borderWidth="base" borderRadius="base" background="subdued">
            <s-stack direction="block" gap="small">
              <s-heading>No scan yet</s-heading>
              <s-paragraph>Run one profit scan to turn this page into a live setup assistant.</s-paragraph>
              <s-link href="/app">Open dashboard</s-link>
            </s-stack>
          </s-box>
        ) : (
          <s-grid gridTemplateColumns="repeat(auto-fit, minmax(180px, 1fr))" gap="base">
            <s-box padding="base" borderWidth="base" borderRadius="base" background="subdued"><s-heading>{formatDateTime(latestAudit.createdAt)}</s-heading><s-text>Latest scan</s-text></s-box>
            <s-box padding="base" borderWidth="base" borderRadius="base" background="subdued"><s-heading>{latestAudit.totalVariants.toLocaleString()}</s-heading><s-text>Variants checked</s-text></s-box>
            <s-box padding="base" borderWidth="base" borderRadius="base" background="subdued"><s-heading>{issueCount}</s-heading><s-text>Issues to review</s-text></s-box>
            <s-box padding="base" borderWidth="base" borderRadius="base" background="subdued"><s-heading>{latestAudit.missingCostCount}</s-heading><s-text>Missing costs</s-text></s-box>
            <s-box padding="base" borderWidth="base" borderRadius="base" background="subdued"><s-heading>{formatMoney(Number(latestAudit.inventoryRiskAmount ?? 0), latestAudit.findings[0]?.currencyCode)}</s-heading><s-text>Inventory risk</s-text></s-box>
          </s-grid>
        )}
      </s-section>

      <s-section heading="Supplier cost CSV">
        <s-paragraph>Use the generated template when SKUs are missing or inconsistent. Costs can be matched by variant ID, inventory item ID, or SKU.</s-paragraph>
        <pre style={{ overflowX: "auto" }}>{`variant_id,inventory_item_id,sku,cost\ngid://shopify/ProductVariant/123,,ABC123,12.50\n,gid://shopify/InventoryItem/456,,8.40`}</pre>
        <s-stack direction="inline" gap="base">
          <s-link href="/app/import">Import supplier costs</s-link>
          <s-link href="/app/import/template">Download variant template</s-link>
          <s-link href="/app/what-if">Run cost-change what-if</s-link>
        </s-stack>
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
