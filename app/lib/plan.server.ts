import prisma from "../db.server";

export type PlanKey = "free" | "starter" | "growth";

export const PLAN_LIMITS: Record<PlanKey, { label: string; variantLimit: number; monthlyPrice: number; features: string[] }> = {
  free: {
    label: "Free",
    variantLimit: 100,
    monthlyPrice: 0,
    features: ["Scan up to 100 variants", "Margin leak dashboard", "CSV findings export"],
  },
  starter: {
    label: "Starter",
    variantLimit: 5000,
    monthlyPrice: 15,
    features: ["Scan up to 5,000 variants", "Supplier CSV cost import", "Suggested minimum prices", "Weekly alerts"],
  },
  growth: {
    label: "Growth",
    variantLimit: 25000,
    monthlyPrice: 39,
    features: ["Scan up to 25,000 variants", "Supplier CSV cost import", "Suggested minimum prices", "Weekly alerts", "Priority support"],
  },
};

export function normalizePlanKey(value: unknown): PlanKey {
  return value === "starter" || value === "growth" ? value : "free";
}

export async function getShopPlan(shop: string): Promise<PlanKey> {
  const settings = await prisma.shopSettings.findUnique({ where: { shop }, select: { planKey: true } });
  return normalizePlanKey(settings?.planKey);
}

export async function setShopPlan(shop: string, planKey: PlanKey, subscriptionId?: string | null) {
  return prisma.shopSettings.upsert({
    where: { shop },
    create: { shop, planKey, subscriptionId: subscriptionId ?? null },
    update: { planKey, subscriptionId: subscriptionId ?? null },
  });
}

export function getVariantLimitForPlan(planKey: PlanKey): number {
  return PLAN_LIMITS[planKey].variantLimit;
}
