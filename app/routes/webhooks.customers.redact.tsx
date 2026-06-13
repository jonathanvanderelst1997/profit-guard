import type { ActionFunctionArgs } from "react-router";
import { authenticate } from "../shopify.server";

export const action = async ({ request }: ActionFunctionArgs) => {
  await authenticate.webhook(request);
  // Margin Sentinel does not store customer data. Nothing to redact for customer-specific requests.
  return new Response();
};
