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

export const loader = async ({ request }: LoaderFunctionArgs) => { const { session } = await authenticate.admin(request); const settings = await getShopSettings(session.shop); const latestAudit = await getLatestAuditRun(session.shop); const planKey = await getShopPlan(session.shop); return { settings, hasAudit: Boolean(latestAudit), plan: PLAN_LIMITS[planKey], canUseAlerts: isPaidPlan(planKey) }; };

function skippedAlertReason(result: unknown): string | null {
  if (!result || typeof result !== "object" || !("skipped" in result)) return null;
  const reason = "reason" in result ? result.reason : null;
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
export default function Alerts() {
  const { settings, hasAudit, plan, canUseAlerts } = useLoaderData<typeof loader>();
  const fetcher = useFetcher<typeof action>();
  const shopify = useAppBridge();
  const isSubmitting = fetcher.state !== "idle";

  useEffect(() => {
    if (fetcher.data?.ok) shopify.toast.show(fetcher.data.message);
  }, [fetcher.data, shopify]);

  return (
    <s-page heading="Alerts">
      <s-section heading="Weekly margin report">
        <s-paragraph>Send a weekly email when Margin Sentinel finds products with loss, low margin, or missing cost. Optional and needs an email provider key in production.</s-paragraph>
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

      <s-section heading="Send test">
        <s-paragraph>{hasAudit ? "A latest scan exists, so a test email can use real findings." : "Run a scan first before sending a test email."}</s-paragraph>
        <fetcher.Form method="post">
          <input type="hidden" name="intent" value="send-test" />
          <s-button type="submit" disabled={!hasAudit || isSubmitting || !canUseAlerts} loading={isSubmitting}>Send test alert</s-button>
        </fetcher.Form>
        {fetcher.data?.message ? <s-banner tone={fetcher.data.ok ? "success" : "warning"}>{fetcher.data.message}</s-banner> : null}
      </s-section>
    </s-page>
  );
}
export const headers: HeadersFunction = (headersArgs) => boundary.headers(headersArgs);
