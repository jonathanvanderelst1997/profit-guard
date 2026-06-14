import type { ActionFunctionArgs, HeadersFunction, LoaderFunctionArgs } from "react-router";
import { useFetcher, useLoaderData } from "react-router";
import { boundary } from "@shopify/shopify-app-react-router/server";
import { authenticate } from "../shopify.server";
import {
  billingPlanNameForKey,
  buildBillingReturnUrl,
  isBillablePlanKey,
  shouldUseTestBilling,
  syncPlanFromShopifyBilling,
} from "../lib/billing.server";
import { getShopPlan, PLAN_LIMITS, setShopPlan, type PlanKey } from "../lib/plan.server";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const { admin, session } = await authenticate.admin(request);
  const url = new URL(request.url);
  const selectedPlan = url.searchParams.get("selected_plan") as PlanKey | null;
  if (isBillablePlanKey(selectedPlan)) {
    await setShopPlan(session.shop, selectedPlan, url.searchParams.get("charge_id"));
  }
  let currentPlan = await getShopPlan(session.shop);
  try { currentPlan = await syncPlanFromShopifyBilling(admin, session.shop); } catch { /* Billing sync can fail in local/dev mode. Keep stored plan. */ }
  return { plans: PLAN_LIMITS, currentPlan };
};

export const action = async ({ request }: ActionFunctionArgs) => {
  const { billing, session } = await authenticate.admin(request);
  const formData = await request.formData();
  const planKey = String(formData.get("plan") ?? "starter") as PlanKey;

  if (planKey === "free") {
    await setShopPlan(session.shop, "free", null);
    return { ok: true, downgraded: true };
  }

  if (!isBillablePlanKey(planKey)) return { ok: false, error: "Unknown plan." };

  try {
    return await billing.request({
      plan: billingPlanNameForKey(planKey),
      isTest: shouldUseTestBilling(),
      returnUrl: buildBillingReturnUrl(request, session.shop, planKey),
      trialDays: 14,
    });
  } catch (error) {
    if (error instanceof Response) throw error;
    console.error("Failed to request Shopify billing approval", error);
    return { ok: false, error: "Could not open Shopify billing approval." };
  }
};

export default function Pricing() {
  const { plans, currentPlan } = useLoaderData<typeof loader>();
  const fetcher = useFetcher<typeof action>();
  const isSubmitting = fetcher.state !== "idle";
  return (
    <s-page heading="Pricing">
      <s-section heading="Simple catalog-based pricing">
        <s-paragraph>Current plan: {plans[currentPlan].label}. Margin Sentinel is priced for catalog margin protection, not full accounting. Upgrade when you need larger catalog scans, supplier cost imports, cost-change what-if checks, weekly alerts, or priority support.</s-paragraph>
        {fetcher.data?.ok ? <s-banner tone="success">Plan updated.</s-banner> : null}
        {fetcher.data?.ok === false ? <s-banner tone="critical">{fetcher.data.error}</s-banner> : null}
        <s-grid gridTemplateColumns="repeat(3, minmax(0, 1fr))" gap="base">
          {Object.entries(plans).map(([key, plan]) => (
            <s-box key={key} padding="base" borderWidth="base" borderRadius="base">
              <s-stack direction="block" gap="base">
                <s-heading>{plan.label}</s-heading>
                <s-heading>{plan.monthlyPrice === 0 ? "Free" : `$${plan.monthlyPrice}/month`}</s-heading>
                <s-paragraph>Scan up to {plan.variantLimit.toLocaleString()} variants.</s-paragraph>
                <s-unordered-list>{plan.features.map((feature) => <s-list-item key={feature}>{feature}</s-list-item>)}</s-unordered-list>
                <fetcher.Form method="post">
                  <input type="hidden" name="plan" value={key} />
                  <s-button type="submit" disabled={currentPlan === key || isSubmitting} loading={isSubmitting}>{currentPlan === key ? "Current plan" : key === "free" ? "Use Free" : "Start 14-day trial"}</s-button>
                </fetcher.Form>
              </s-stack>
            </s-box>
          ))}
        </s-grid>
      </s-section>
    </s-page>
  );
}
export const headers: HeadersFunction = (headersArgs) => boundary.headers(headersArgs);
