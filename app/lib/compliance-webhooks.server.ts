import { authenticate } from "../shopify.server";
import { deleteAllShopData } from "./privacy.server";
import { trackAnalyticsEvent } from "./analytics.server";

const COMPLIANCE_TOPICS = {
  CUSTOMERS_DATA_REQUEST: "CUSTOMERS_DATA_REQUEST",
  CUSTOMERS_REDACT: "CUSTOMERS_REDACT",
  SHOP_REDACT: "SHOP_REDACT",
} as const;

function normalizeTopic(topic: string) {
  return topic.toUpperCase().replace(/[/.]/g, "_");
}

export async function handleComplianceWebhook(request: Request) {
  // Shopify's React Router helper validates the raw-body HMAC before returning.
  const { shop, topic } = await authenticate.webhook(request);
  const normalizedTopic = normalizeTopic(topic);

  if (normalizedTopic === COMPLIANCE_TOPICS.CUSTOMERS_DATA_REQUEST) {
    await trackAnalyticsEvent({ eventName: "customers_data_request", source: "webhook", request, shop });
    return Response.json({ customerData: [] });
  }

  if (normalizedTopic === COMPLIANCE_TOPICS.CUSTOMERS_REDACT) {
    await trackAnalyticsEvent({ eventName: "customers_redact", source: "webhook", request, shop });
    return new Response();
  }

  if (normalizedTopic === COMPLIANCE_TOPICS.SHOP_REDACT) {
    await deleteAllShopData(shop);
    return new Response();
  }

  return new Response(undefined, { status: 404, statusText: "Unsupported compliance webhook topic" });
}
