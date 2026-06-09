import prisma from "../db.server";

export async function getShopSettings(shop: string) {
  return prisma.shopSettings.upsert({ where: { shop }, update: {}, create: { shop, minimumMarginBps: 3000 } });
}
export async function updateMinimumMargin(shop: string, minimumMarginPercent: number) {
  const bounded = Math.max(1, Math.min(95, minimumMarginPercent));
  return prisma.shopSettings.upsert({ where: { shop }, update: { minimumMarginBps: Math.round(bounded * 100) }, create: { shop, minimumMarginBps: Math.round(bounded * 100) } });
}
export async function updateAlertSettings(shop: string, input: { alertEmail?: string | null; weeklyAlertsEnabled: boolean }) {
  const email = input.alertEmail?.trim() || null;
  return prisma.shopSettings.upsert({ where: { shop }, update: { alertEmail: email, weeklyAlertsEnabled: input.weeklyAlertsEnabled }, create: { shop, minimumMarginBps: 3000, alertEmail: email, weeklyAlertsEnabled: input.weeklyAlertsEnabled } });
}
