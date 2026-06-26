import type { ActionFunctionArgs } from "react-router";
import { authenticate } from "../shopify.server";
import { planFromSubscriptionName } from "../lib/billing.server";
import { setShopPlan } from "../lib/plan.server";
import { trackAnalyticsEvent } from "../lib/analytics.server";

type AppSubscriptionPayload = {
  app_subscription?: {
    status?: string;
    name?: string;
    admin_graphql_api_id?: string;
    id?: string | number;
  };
  status?: string;
  name?: string;
  admin_graphql_api_id?: string;
  id?: string | number;
};

export const action = async ({ request }: ActionFunctionArgs) => {
  const { shop, payload } = await authenticate.webhook(request);
  const subscriptionPayload = payload as AppSubscriptionPayload;
  const subscription = subscriptionPayload.app_subscription ?? subscriptionPayload;
  const status = String(subscription?.status ?? "").toUpperCase();
  const name = String(subscription?.name ?? "");
  const subscriptionId = String(subscription?.admin_graphql_api_id ?? subscription?.id ?? "") || null;

  if (["CANCELLED", "DECLINED", "EXPIRED", "FROZEN"].includes(status)) {
    await setShopPlan(shop, "free", null);
    await trackAnalyticsEvent({ eventName: "subscription_inactive", source: "webhook", request, shop, subjectId: subscriptionId, metadata: { status, name } });
    return new Response();
  }

  if (["ACTIVE", "ACCEPTED"].includes(status)) {
    const planKey = planFromSubscriptionName(name);
    await setShopPlan(shop, planKey, subscriptionId);
    await trackAnalyticsEvent({ eventName: "subscription_active", source: "webhook", request, shop, subjectId: subscriptionId, metadata: { status, name, planKey } });
  }

  return new Response();
};
