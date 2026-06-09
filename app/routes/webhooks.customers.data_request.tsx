import type { ActionFunctionArgs } from "react-router";
import { authenticate } from "../shopify.server";

export const action = async ({ request }: ActionFunctionArgs) => {
  await authenticate.webhook(request);
  // Profit Guard does not store customer data. Shopify requires this compliance topic to return successfully.
  return new Response(JSON.stringify({ customerData: [] }), { headers: { "Content-Type": "application/json" } });
};
