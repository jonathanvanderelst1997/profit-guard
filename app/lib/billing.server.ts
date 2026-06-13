type AdminGraphqlClient = { graphql: (query: string, options?: { variables?: Record<string, unknown> }) => Promise<Response>; };
import { PLAN_LIMITS, normalizePlanKey, setShopPlan, type PlanKey } from "./plan.server";

export async function createRecurringSubscription(admin: AdminGraphqlClient, input: { name: string; amount: number; returnUrl: string; trialDays?: number; test?: boolean }) {
  const response = await admin.graphql(`#graphql
    mutation ProfitGuardSubscriptionCreate($name: String!, $lineItems: [AppSubscriptionLineItemInput!]!, $returnUrl: URL!, $trialDays: Int, $test: Boolean) {
      appSubscriptionCreate(name: $name, returnUrl: $returnUrl, lineItems: $lineItems, trialDays: $trialDays, test: $test) {
        userErrors { field message }
        appSubscription { id name status }
        confirmationUrl
      }
    }`, { variables: { name: input.name, returnUrl: input.returnUrl, trialDays: input.trialDays ?? 14, test: input.test ?? process.env.NODE_ENV !== "production", lineItems: [{ plan: { appRecurringPricingDetails: { interval: "EVERY_30_DAYS", price: { amount: input.amount, currencyCode: "USD" } } } }] } });
  const json = await response.json();
  const payload = json.data?.appSubscriptionCreate;
  if (payload?.userErrors?.length) throw new Error(payload.userErrors.map((e: { message: string }) => e.message).join(", "));
  return payload?.confirmationUrl as string | undefined;
}

const ACTIVE_SUBSCRIPTIONS_QUERY = `#graphql
  query ProfitGuardActiveSubscriptions {
    currentAppInstallation {
      activeSubscriptions { id name status }
    }
  }
`;

export function planFromSubscriptionName(name: string | null | undefined): PlanKey {
  const lower = String(name ?? "").toLowerCase();
  if (lower.includes("growth")) return "growth";
  if (lower.includes("starter")) return "starter";
  return "free";
}

export async function syncPlanFromShopifyBilling(admin: AdminGraphqlClient, shop: string): Promise<PlanKey> {
  const response = await admin.graphql(ACTIVE_SUBSCRIPTIONS_QUERY);
  const json = await response.json();
  if (json.errors?.length) throw new Error(`Shopify billing query error: ${JSON.stringify(json.errors)}`);
  const subscriptions = json.data?.currentAppInstallation?.activeSubscriptions ?? [];
  const active = subscriptions.find((s: { name?: string; status?: string }) => String(s.status).toUpperCase() === "ACTIVE") ?? null;
  if (!active) {
    await setShopPlan(shop, "free", null);
    return "free";
  }
  const planKey = normalizePlanKey(planFromSubscriptionName(active?.name));
  await setShopPlan(shop, planKey, planKey === "free" ? null : active?.id ?? null);
  return planKey;
}

export function paidPlanNames() {
  return Object.entries(PLAN_LIMITS).filter(([key]) => key !== "free").map(([key, p]) => ({ key, name: `Margin Sentinel ${p.label}` }));
}
