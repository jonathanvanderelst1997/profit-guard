import type { LoaderFunctionArgs } from "react-router";
import { authenticate } from "../shopify.server";
import { fetchVariantsForAudit } from "../lib/shopify-products.server";
import { getShopPlan, getVariantLimitForPlan } from "../lib/plan.server";
import { variantsToCostTemplateCsv } from "../lib/cost-template";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const { admin, session } = await authenticate.admin(request);
  const planKey = await getShopPlan(session.shop);
  const scan = await fetchVariantsForAudit(admin, { maxVariants: getVariantLimitForPlan(planKey) });
  const csv = variantsToCostTemplateCsv(scan.variants);
  const fileName = `margin-sentinel-cost-template-${new Date().toISOString().slice(0, 10)}.csv`;
  return new Response(csv, { headers: { "Content-Type": "text/csv; charset=utf-8", "Content-Disposition": `attachment; filename="${fileName}"` } });
};

