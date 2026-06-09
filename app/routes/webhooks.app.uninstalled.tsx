import type { ActionFunctionArgs } from "react-router";
import { authenticate } from "../shopify.server";

export const action = async ({ request }: ActionFunctionArgs) => {
  const { shop } = await authenticate.webhook(request);
  const { deleteAllShopData } = await import("../lib/privacy.server");
  await deleteAllShopData(shop);
  return new Response();
};
