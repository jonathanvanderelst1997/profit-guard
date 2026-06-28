import "dotenv/config";
import { getLaunchMetrics } from "../app/lib/analytics.server";
import prisma from "../app/db.server";

function formatGroup(rows: Array<Record<string, unknown>>, key: string): string {
  if (rows.length === 0) return "  none";
  return rows
    .map((row) => `  ${String(row[key] ?? "(none)")}: ${String((row._count as { _all?: number })?._all ?? 0)}`)
    .join("\n");
}

async function main() {
  const days = Number(process.argv[2] ?? 30);
  const metrics = await getLaunchMetrics(days);

  console.log(`# Margin Sentinel metrics`);
  console.log(`Generated: ${metrics.generatedAt}`);
  console.log(`Window: ${metrics.windowDays} days`);
  console.log("");
  console.log("Counts:");
  for (const [key, value] of Object.entries(metrics.counts)) {
    console.log(`  ${key}: ${value}`);
  }
  console.log("");
  console.log("Funnel:");
  for (const [key, value] of Object.entries(metrics.funnel)) {
    console.log(`  ${key}: ${value}`);
  }
  console.log("");
  console.log("Downloads:");
  for (const [key, value] of Object.entries(metrics.downloads)) {
    console.log(`  ${key}: ${value}`);
  }
  console.log("");
  console.log("Events by name:");
  console.log(formatGroup(metrics.eventsByName, "eventName"));
  console.log("");
  console.log("Events by source:");
  console.log(formatGroup(metrics.eventsBySource, "source"));
  console.log("");
  console.log("Events by UTM source:");
  console.log(formatGroup(metrics.eventsByUtmSource, "utmSource"));
  console.log("");
  console.log("Events by UTM content:");
  console.log(formatGroup(metrics.eventsByUtmContent, "utmContent"));
  console.log("");
  console.log("Recent download events:");
  for (const event of metrics.recentDownloadEvents.slice(0, 10)) {
    console.log(`  ${event.createdAt.toISOString()} | ${event.eventName} | ${event.shop ?? "public"} | ${event.path ?? ""}`);
  }
  console.log("");
  console.log("Recent events:");
  for (const event of metrics.recentEvents.slice(0, 10)) {
    console.log(`  ${event.createdAt.toISOString()} | ${event.eventName} | ${event.shop ?? "public"} | ${event.path ?? ""}`);
  }
}

main()
  .catch((error) => {
    const message = error instanceof Error ? error.message : String(error);
    if (message.includes("DATABASE_URL") || message.includes("PrismaClientInitializationError")) {
      console.error("Could not read local launch metrics because DATABASE_URL is not connected to a compatible local/production database.");
      console.error("For production metrics, set METRICS_TOKEN locally and run: npm run metrics:internal -- 30");
      process.exitCode = 1;
      return;
    }
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
