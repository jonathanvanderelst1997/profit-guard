import type { ActionFunctionArgs } from "react-router";
import { authenticate } from "../shopify.server";
import { planFromSubscriptionName } from "../lib/billing.server";
import { setShopPlan } from "../lib/plan.server";

export const action = async ({ request }: ActionFunctionArgs) => {
  const { shop, payload } = await authenticate.webhook(request);
  const subscription = (payload as any)?.app_subscription ?? payload;
  const status = String(subscription?.status ?? "").toUpperCase();
  const name = String(subscription?.name ?? "");
  const subscriptionId = String(subscription?.admin_graphql_api_id ?? subscription?.id ?? "") || null;

  if (["CANCELLED", "DECLINED", "EXPIRED", "FROZEN"].includes(status)) {
    await setShopPlan(shop, "free", null);
    return new Response();
  }

  if (["ACTIVE", "ACCEPTED"].includes(status)) {
    await setShopPlan(shop, planFromSubscriptionName(name), subscriptionId);
  }

  return new Response();
};
