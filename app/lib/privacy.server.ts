import prisma from "../db.server";

export async function deleteAllShopData(shop: string) {
  await prisma.analyticsEvent.deleteMany({ where: { shop } });
  await prisma.auditFinding.deleteMany({ where: { shop } });
  await prisma.auditRun.deleteMany({ where: { shop } });
  await prisma.importedCost.deleteMany({ where: { shop } });
  await prisma.shopSettings.deleteMany({ where: { shop } });
  await prisma.session.deleteMany({ where: { shop } });
}
