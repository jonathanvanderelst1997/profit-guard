import prisma from "../db.server";

const DEFAULT_MINIMUM_MARGIN_PERCENT = 30;

export function minimumMarginPercentToBps(value: unknown): number {
  const parsed = typeof value === "number" ? value : Number(value);
  const finiteValue = Number.isFinite(parsed) ? parsed : DEFAULT_MINIMUM_MARGIN_PERCENT;
  const bounded = Math.max(1, Math.min(95, finiteValue));
  return Math.round(bounded * 100);
}

export async function getShopSettings(shop: string) {
  return prisma.shopSettings.upsert({ where: { shop }, update: {}, create: { shop, minimumMarginBps: 3000 } });
}
export async function updateMinimumMargin(shop: string, minimumMarginPercent: unknown) {
  const minimumMarginBps = minimumMarginPercentToBps(minimumMarginPercent);
  return prisma.shopSettings.upsert({ where: { shop }, update: { minimumMarginBps }, create: { shop, minimumMarginBps } });
}
export async function updateAlertSettings(shop: string, input: { alertEmail?: string | null; weeklyAlertsEnabled: boolean }) {
  const email = input.alertEmail?.trim() || null;
  return prisma.shopSettings.upsert({ where: { shop }, update: { alertEmail: email, weeklyAlertsEnabled: input.weeklyAlertsEnabled }, create: { shop, minimumMarginBps: 3000, alertEmail: email, weeklyAlertsEnabled: input.weeklyAlertsEnabled } });
}
