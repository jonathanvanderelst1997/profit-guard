import type { ActionFunctionArgs, HeadersFunction, LoaderFunctionArgs } from "react-router";
import { useEffect } from "react";
import { useFetcher, useLoaderData } from "react-router";
import { useAppBridge } from "@shopify/app-bridge-react";
import { boundary } from "@shopify/shopify-app-react-router/server";
import { authenticate } from "../shopify.server";
import { getShopSettings, updateAlertSettings } from "../lib/settings.server";
import { getLatestAuditRun } from "../lib/audit-store.server";
import { sendWeeklyAlertEmail, type AuditRunWithFindings } from "../lib/email.server";
import { getShopPlan, isPaidPlan, PLAN_LIMITS } from "../lib/plan.server";
import { basisPointsToPercent, getCostSourceLabel, getSeverityLabel, type Severity } from "../lib/margin";
import { formatMoney } from "../lib/security";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const { session } = await authenticate.admin(request);
  const [settings, latestAudit, planKey] = await Promise.all([
    getShopSettings(session.shop),
    getLatestAuditRun(session.shop),
    getShopPlan(session.shop),
  ]);
  return { settings, latestAudit, hasAudit: Boolean(latestAudit), plan: PLAN_LIMITS[planKey], canUseAlerts: isPaidPlan(planKey) };
};

function skippedAlertReason(result: unknown): string | null {
  if (!result || typeof result !== "object" || !("skipped" in result)) return null;
  const reason = "reason" in result ? result.reason : null;
  if (reason === "RESEND_API_KEY is not configured." || reason === "ALERTS_FROM_EMAIL is not configured.") {
    return "Email delivery is not fully configured yet. Your alert settings can still be saved, but test emails are not available right now.";
  }
  return typeof reason === "string" ? reason : "Test alert skipped.";
}

export const action = async ({ request }: ActionFunctionArgs) => {
  const { session } = await authenticate.admin(request);
  const formData = await request.formData();
  const intent = String(formData.get("intent") ?? "save");
  const settings = await getShopSettings(session.shop);
  const planKey = await getShopPlan(session.shop);
  if (!isPaidPlan(planKey)) return { ok: false, message: "Upgrade to Starter to enable weekly alerts." };
  if (intent === "send-test") {
    const latestAudit = await getLatestAuditRun(session.shop);
    if (!latestAudit) return { ok: false, message: "Run a scan before sending a test alert." };
    const result = await sendWeeklyAlertEmail(settings, latestAudit as AuditRunWithFindings);
    const skippedReason = skippedAlertReason(result);
    if (skippedReason) return { ok: false, message: skippedReason, result };
    return { ok: true, message: "Test alert sent.", result };
  }
  const updated = await updateAlertSettings(session.shop, { alertEmail: String(formData.get("alertEmail") ?? ""), weeklyAlertsEnabled: formData.get("weeklyAlertsEnabled") === "on" });
  return { ok: true, message: "Alert settings saved.", settings: updated };
};

function issueCount(audit: AuditRunWithFindings | null): number {
  if (!audit) return 0;
  return audit.lossCount + audit.lowMarginCount + audit.missingCostCount;
}

function normalizeSeverity(value: string): Severity {
  if (value === "LOSS" || value === "LOW_MARGIN" || value === "MISSING_COST") return value;
  return "LOW_MARGIN";
}

export default function Alerts() {
  const { settings, hasAudit, plan, canUseAlerts, latestAudit } = useLoaderData<typeof loader>();
  const fetcher = useFetcher<typeof action>();
  const shopify = useAppBridge();
  const isSubmitting = fetcher.state !== "idle";
  const alertPreviewAudit = latestAudit as AuditRunWithFindings | null;
  const canSendTest = Boolean(hasAudit && settings.alertEmail && settings.weeklyAlertsEnabled && canUseAlerts);

  useEffect(() => {
    if (fetcher.data?.ok) shopify.toast.show(fetcher.data.message);
  }, [fetcher.data, shopify]);

  return (
    <s-page heading="Alerts">
      <s-section heading="Weekly margin report">
        <s-paragraph>Send a weekly email when Margin Sentinel finds products with loss, low margin, or missing cost. The report is read-only and points the team back to the app before anyone changes prices.</s-paragraph>
        {!canUseAlerts ? (
          <s-banner tone="warning" heading="Starter feature">
            Your current plan is {plan.label}. Upgrade to Starter to enable weekly alerts.
            <s-link href="/app/pricing">Open pricing</s-link>
          </s-banner>
        ) : null}
        <fetcher.Form method="post">
          <input type="hidden" name="intent" value="save" />
          <s-stack direction="block" gap="base">
            <s-email-field label="Alert email" name="alertEmail" defaultValue={settings.alertEmail ?? ""} placeholder="owner@example.com" />
            <label><input type="checkbox" name="weeklyAlertsEnabled" defaultChecked={settings.weeklyAlertsEnabled} /> Enable weekly alerts</label>
            <s-button type="submit" disabled={isSubmitting || !canUseAlerts} loading={isSubmitting}>Save alert settings</s-button>
          </s-stack>
        </fetcher.Form>
      </s-section>

      <s-section heading="Weekly report preview">
        {!alertPreviewAudit ? (
          <s-box padding="base" borderWidth="base" borderRadius="base" background="subdued">
            <s-stack direction="block" gap="small">
              <s-heading>No scan to preview yet</s-heading>
              <s-paragraph>Run a profit scan first. The weekly report preview will then show the exact summary your team receives.</s-paragraph>
              <s-link href="/app">Run profit scan</s-link>
            </s-stack>
          </s-box>
        ) : (
          <s-stack direction="block" gap="base">
            {alertPreviewAudit.demoMode ? (
              <s-banner tone="info" heading="Demo data in latest scan">
                Add Shopify unit costs or import supplier costs before relying on weekly alert numbers for pricing decisions.
              </s-banner>
            ) : null}
            <s-grid gridTemplateColumns="repeat(auto-fit, minmax(170px, 1fr))" gap="base">
              <s-box padding="base" borderWidth="base" borderRadius="base" background="subdued"><s-heading>{alertPreviewAudit.totalVariants.toLocaleString()}</s-heading><s-text>Variants checked</s-text></s-box>
              <s-box padding="base" borderWidth="base" borderRadius="base" background="subdued"><s-heading>{issueCount(alertPreviewAudit)}</s-heading><s-text>Issues in report</s-text></s-box>
              <s-box padding="base" borderWidth="base" borderRadius="base" background="subdued"><s-heading>{alertPreviewAudit.missingCostCount}</s-heading><s-text>Missing costs</s-text></s-box>
              <s-box padding="base" borderWidth="base" borderRadius="base" background="subdued"><s-heading>{formatMoney(Number(alertPreviewAudit.inventoryRiskAmount ?? 0), alertPreviewAudit.findings[0]?.currencyCode)}</s-heading><s-text>Inventory risk</s-text></s-box>
            </s-grid>
            <s-paragraph>Target margin: {basisPointsToPercent(alertPreviewAudit.minimumMarginBps)}. The email includes the highest-priority findings and tells the team to review Margin Sentinel before changing prices.</s-paragraph>
            {alertPreviewAudit.findings.length > 0 ? (
              <s-table variant="auto">
                <s-table-header-row>
                  <s-table-header listSlot="primary">Product</s-table-header>
                  <s-table-header>Issue</s-table-header>
                  <s-table-header>SKU</s-table-header>
                  <s-table-header>Cost source</s-table-header>
                  <s-table-header format="currency">Inventory risk</s-table-header>
                </s-table-header-row>
                <s-table-body>
                  {alertPreviewAudit.findings.slice(0, 5).map((finding) => (
                    <s-table-row key={finding.id}>
                      <s-table-cell>{finding.productTitle}{finding.variantTitle && finding.variantTitle !== "Default Title" ? ` / ${finding.variantTitle}` : ""}</s-table-cell>
                      <s-table-cell>{getSeverityLabel(normalizeSeverity(finding.severity))}</s-table-cell>
                      <s-table-cell>{finding.sku ?? "—"}</s-table-cell>
                      <s-table-cell>{getCostSourceLabel(finding.costSource)}</s-table-cell>
                      <s-table-cell>{formatMoney(Number(finding.inventoryRiskAmount ?? 0), finding.currencyCode)}</s-table-cell>
                    </s-table-row>
                  ))}
                </s-table-body>
              </s-table>
            ) : (
              <s-banner tone="success" heading="Clean report">
                The latest scan has no findings. Weekly alerts will still help catch new issues after product, supplier, or pricing changes.
              </s-banner>
            )}
          </s-stack>
        )}
      </s-section>

      <s-section heading="Send test">
        <s-paragraph>{canSendTest ? `Send a test report to ${settings.alertEmail}.` : "Save an alert email, enable weekly alerts, and run a scan before sending a test report."}</s-paragraph>
        <fetcher.Form method="post">
          <input type="hidden" name="intent" value="send-test" />
          <s-button type="submit" disabled={!canSendTest || isSubmitting} loading={isSubmitting}>Send test alert</s-button>
        </fetcher.Form>
        {fetcher.data?.message ? <s-banner tone={fetcher.data.ok ? "success" : "warning"}>{fetcher.data.message}</s-banner> : null}
      </s-section>
    </s-page>
  );
}
export const headers: HeadersFunction = (headersArgs) => boundary.headers(headersArgs);
