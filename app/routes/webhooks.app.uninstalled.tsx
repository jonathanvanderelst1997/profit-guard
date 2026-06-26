import type { ActionFunctionArgs } from "react-router";
import { authenticate } from "../shopify.server";
import { trackAnalyticsEvent } from "../lib/analytics.server";

export const action = async ({ request }: ActionFunctionArgs) => {
  const { shop } = await authenticate.webhook(request);
  const { deleteAllShopData } = await import("../lib/privacy.server");
  await deleteAllShopData(shop);
  await trackAnalyticsEvent({ eventName: "app_uninstalled", source: "webhook", request, shop });
  return new Response();
};
