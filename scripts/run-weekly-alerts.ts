import prisma from "../app/db.server";
import { sendWeeklyAlertEmail } from "../app/lib/email.server";

async function main() {
  const settings = await prisma.shopSettings.findMany({ where: { weeklyAlertsEnabled: true, alertEmail: { not: null } } });
  for (const s of settings) {
    try {
      const latestAudit = await prisma.auditRun.findFirst({
        where: { shop: s.shop, demoMode: false },
        orderBy: { createdAt: "desc" },
        include: { findings: { take: 50, orderBy: [{ severity: "asc" }, { marginBps: "asc" }] } },
      });
      if (!latestAudit) {
        await prisma.alertLog.create({ data: { shop: s.shop, email: s.alertEmail, status: "skipped", message: "No real audit run available." } });
        continue;
      }
      const result = await sendWeeklyAlertEmail(s, latestAudit);
      await prisma.alertLog.create({ data: { shop: s.shop, email: s.alertEmail, status: "sent", message: JSON.stringify(result).slice(0, 1000) } });
    } catch (error) {
      await prisma.alertLog.create({ data: { shop: s.shop, email: s.alertEmail, status: "failed", message: error instanceof Error ? error.message : String(error) } });
    }
  }
}
main().then(() => prisma.$disconnect()).catch(async (e) => { console.error(e); await prisma.$disconnect(); process.exit(1); });
