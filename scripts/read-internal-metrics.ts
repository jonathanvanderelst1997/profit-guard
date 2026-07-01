import "dotenv/config";

type MetricsPayload = {
  ok?: boolean;
  generatedAt?: string;
  windowDays?: number;
  counts?: Record<string, unknown>;
  funnel?: Record<string, unknown>;
  downloads?: Record<string, unknown>;
  findingWorkflow?: Record<string, unknown>;
  eventsByUtmSource?: Array<Record<string, unknown>>;
  eventsByUtmContent?: Array<Record<string, unknown>>;
  recentDownloadEvents?: Array<Record<string, unknown>>;
  error?: string;
};

function formatGroup(rows: Array<Record<string, unknown>> | undefined, key: string): string {
  if (!rows?.length) return "  none";
  return rows
    .map((row) => `  ${String(row[key] ?? "(none)")}: ${String((row._count as { _all?: number })?._all ?? 0)}`)
    .join("\n");
}

function printBlock(label: string, values: Record<string, unknown> | undefined) {
  console.log(`${label}:`);
  if (!values || Object.keys(values).length === 0) {
    console.log("  none");
    return;
  }
  for (const [key, value] of Object.entries(values)) console.log(`  ${key}: ${String(value)}`);
}

async function main() {
  const days = Number(process.argv[2] ?? 30);
  const token = process.env.METRICS_TOKEN;
  const baseUrl = process.env.METRICS_BASE_URL ?? "https://profit-guard-xzku.onrender.com";

  if (!token) {
    throw new Error("METRICS_TOKEN is missing locally. Set it in an ignored .env file or export it before running this command.");
  }

  const url = new URL("/internal/metrics", baseUrl);
  url.searchParams.set("days", String(days));

  const response = await fetch(url, { headers: { Authorization: `Bearer ${token}` } });
  const payload = await response.json() as MetricsPayload;

  if (!response.ok || payload.ok === false) {
    throw new Error(`Metrics request failed with HTTP ${response.status}: ${payload.error ?? JSON.stringify(payload)}`);
  }

  console.log("# Margin Sentinel production metrics");
  console.log(`Generated: ${payload.generatedAt ?? "unknown"}`);
  console.log(`Window: ${payload.windowDays ?? days} days`);
  console.log("");
  printBlock("Counts", payload.counts);
  console.log("");
  printBlock("Funnel", payload.funnel);
  console.log("");
  printBlock("Downloads", payload.downloads);
  console.log("");
  printBlock("Finding workflow", payload.findingWorkflow);
  console.log("");
  console.log("Events by UTM source:");
  console.log(formatGroup(payload.eventsByUtmSource, "utmSource"));
  console.log("");
  console.log("Events by UTM content:");
  console.log(formatGroup(payload.eventsByUtmContent, "utmContent"));
  console.log("");
  console.log("Recent download events:");
  for (const event of payload.recentDownloadEvents?.slice(0, 10) ?? []) {
    console.log(`  ${String(event.createdAt)} | ${String(event.eventName)} | ${String(event.shop ?? "public")} | ${String(event.path ?? "")}`);
  }
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
