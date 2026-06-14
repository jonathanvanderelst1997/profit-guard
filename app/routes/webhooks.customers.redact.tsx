import type { ActionFunctionArgs } from "react-router";
import { handleComplianceWebhook } from "../lib/compliance-webhooks.server";

export const action = async ({ request }: ActionFunctionArgs) => handleComplianceWebhook(request);
