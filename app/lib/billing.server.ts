type AdminGraphqlClient = { graphql: (query: string, options?: { variables?: Record<string, unknown> }) => Promise<Response>; };
import { PLAN_LIMITS, normalizePlanKey, setShopPlan, type PlanKey } from "./plan.server";

export type BillablePlanKey = Exclude<PlanKey, "free">;

export const BILLABLE_PLAN_KEYS = ["starter", "growth"] as const satisfies readonly BillablePlanKey[];

export const STARTER_BILLING_PLAN = "Margin Sentinel Starter";
export const GROWTH_BILLING_PLAN = "Margin Sentinel Growth";

export const BILLING_PLAN_NAMES: Record<BillablePlanKey, string> = {
  starter: STARTER_BILLING_PLAN,
  growth: GROWTH_BILLING_PLAN,
};

export function isBillablePlanKey(value: unknown): value is BillablePlanKey {
  return BILLABLE_PLAN_KEYS.includes(value as BillablePlanKey);
}

export function billingPlanNameForKey(planKey: BillablePlanKey) {
  return BILLING_PLAN_NAMES[planKey];
}

export function shouldUseTestBilling() {
  const override = process.env.SHOPIFY_BILLING_TEST;
  if (override === "true") return true;
  if (override === "false") return false;
  return process.env.NODE_ENV !== "production";
}

export function shopHandleFromDomain(shop: string) {
  return shop.replace(/\.myshopify\.com$/i, "");
}

export function buildBillingReturnUrl(_request: Request, shop: string, planKey: BillablePlanKey, appHandle = process.env.SHOPIFY_API_KEY || "") {
  const storeHandle = shopHandleFromDomain(shop);
  const returnUrl = new URL(`/store/${storeHandle}/apps/${appHandle}/app/pricing`, "https://admin.shopify.com");
  returnUrl.searchParams.set("selected_plan", planKey);

  return returnUrl.toString();
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
