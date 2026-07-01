import prisma from "../db.server";
import type { Prisma } from "@prisma/client";

type AnalyticsMetadata = Record<string, unknown>;

type TrackAnalyticsInput = {
  eventName: string;
  source: "app" | "public" | "webhook" | "billing" | "system";
  request?: Request;
  shop?: string | null;
  subjectId?: string | null;
  metadata?: AnalyticsMetadata;
};

type LaunchMetricsInput = number | {
  days?: number;
  shop?: string | null;
  includePublic?: boolean;
};

export const GA4_KEY_EVENTS = {
  appOpen: "app_open",
  sampleScanViewed: "sample_scan_viewed",
  scanCompleted: "scan_completed",
  firstScanCompleted: "first_scan_completed",
  missingCostsFound: "missing_costs_found",
  csvImportCompleted: "csv_import_completed",
  scenarioRun: "scenario_run",
  trialStarted: "trial_started",
} as const;

const PUBLIC_PAGE_PREFIXES = ["/", "/beta", "/resources", "/privacy", "/terms", "/refund", "/support"];
const IGNORED_PUBLIC_PREFIXES = ["/app", "/auth", "/webhooks", "/healthz", "/internal", "/assets", "/__manifest"];

function truncate(value: string | null | undefined, maxLength: number): string | null {
  if (!value) return null;
  return value.length > maxLength ? value.slice(0, maxLength) : value;
}

function metadataToString(metadata: AnalyticsMetadata | undefined): string | null {
  if (!metadata) return null;
  try {
    return truncate(JSON.stringify(metadata), 4000);
  } catch {
    return JSON.stringify({ serializationError: true });
  }
}

function getRequestUrl(request?: Request): URL | null {
  if (!request) return null;
  try {
    return new URL(request.url);
  } catch {
    return null;
  }
}

function getUtm(url: URL | null) {
  return {
    utmSource: truncate(url?.searchParams.get("utm_source"), 120),
    utmMedium: truncate(url?.searchParams.get("utm_medium"), 120),
    utmCampaign: truncate(url?.searchParams.get("utm_campaign"), 160),
    utmContent: truncate(url?.searchParams.get("utm_content"), 160),
  };
}

export async function trackAnalyticsEvent(input: TrackAnalyticsInput): Promise<void> {
  const url = getRequestUrl(input.request);
  const utm = getUtm(url);
  try {
    await prisma.analyticsEvent.create({
      data: {
        shop: truncate(input.shop ?? null, 255),
        eventName: truncate(input.eventName, 120) ?? input.eventName,
        source: input.source,
        path: truncate(url?.pathname, 255),
        method: input.request?.method ?? null,
        ...utm,
        referrer: truncate(input.request?.headers.get("referer"), 500),
        userAgent: truncate(input.request?.headers.get("user-agent"), 500),
        subjectId: truncate(input.subjectId ?? null, 255),
        metadata: metadataToString(input.metadata),
      },
    });
  } catch (error) {
    console.warn("Analytics event skipped", input.eventName, error instanceof Error ? error.message : error);
  }
}

export async function trackPublicPageView(request: Request): Promise<void> {
  const url = getRequestUrl(request);
  if (!url) return;
  if (request.method !== "GET") return;
  if (IGNORED_PUBLIC_PREFIXES.some((prefix) => url.pathname === prefix || url.pathname.startsWith(`${prefix}/`))) return;
  if (!PUBLIC_PAGE_PREFIXES.some((prefix) => url.pathname === prefix || url.pathname.startsWith(`${prefix}/`))) return;
  await trackAnalyticsEvent({ eventName: "public_page_view", source: "public", request });
}

function parseMetadata(value: string | null): unknown {
  if (!value) return null;
  try {
    return JSON.parse(value);
  } catch {
    return value;
  }
}

function groupedCount(rows: Array<{ eventName: string; _count: { _all: number } }>, eventName: string): number {
  return rows.find((row) => row.eventName === eventName)?._count._all ?? 0;
}

function daysAgo(days: number): Date {
  const since = new Date();
  since.setDate(since.getDate() - days);
  return since;
}

function clampDays(days: number): number {
  if (!Number.isFinite(days)) return 30;
  return Math.min(Math.max(Math.round(days), 1), 180);
}

function resolveMetricsInput(input: LaunchMetricsInput = 30) {
  if (typeof input === "number") {
    return { days: clampDays(input), shop: null, includePublic: false };
  }
  return {
    days: clampDays(input.days ?? 30),
    shop: input.shop ?? null,
    includePublic: Boolean(input.includePublic),
  };
}

function analyticsWhere(since: Date, shop: string | null, includePublic: boolean): Prisma.AnalyticsEventWhereInput {
  if (!shop) return { createdAt: { gte: since } };
  return {
    createdAt: { gte: since },
    OR: [
      { shop },
      ...(includePublic ? [{ shop: null, source: "public" }] : []),
    ],
  };
}

export async function getLaunchMetrics(input: LaunchMetricsInput = 30) {
  const { days, shop, includePublic } = resolveMetricsInput(input);
  const since = daysAgo(days);
  const shopWhere = shop ? { shop } : {};
  const datedShopWhere = shop ? { shop, createdAt: { gte: since } } : { createdAt: { gte: since } };
  const eventWhere = analyticsWhere(since, shop, includePublic);
  const [
    sessionCount,
    sessionShops,
    shopSettings,
    auditCount,
    importCount,
    alertCount,
    eventCount,
    eventsByName,
    eventsBySource,
    eventsByUtmSource,
    eventsByUtmContent,
    eventsByPath,
    latestAuditRuns,
    latestImportRuns,
    recentEvents,
    recentDownloadEvents,
    findingStatusCounts,
  ] = await Promise.all([
    prisma.session.count({ where: shopWhere }),
    prisma.session.findMany({ where: shopWhere, select: { shop: true }, distinct: ["shop"], orderBy: { shop: "asc" } }),
    prisma.shopSettings.findMany({
      where: shopWhere,
      select: { shop: true, planKey: true, weeklyAlertsEnabled: true, createdAt: true, updatedAt: true },
      orderBy: { updatedAt: "desc" },
    }),
    prisma.auditRun.count({ where: datedShopWhere }),
    prisma.importRun.count({ where: datedShopWhere }),
    prisma.alertLog.count({ where: datedShopWhere }),
    prisma.analyticsEvent.count({ where: eventWhere }),
    prisma.analyticsEvent.groupBy({ by: ["eventName"], where: eventWhere, _count: { _all: true } }),
    prisma.analyticsEvent.groupBy({ by: ["source"], where: eventWhere, _count: { _all: true } }),
    prisma.analyticsEvent.groupBy({ by: ["utmSource"], where: { ...eventWhere, utmSource: { not: null } }, _count: { _all: true } }),
    prisma.analyticsEvent.groupBy({ by: ["utmContent"], where: { ...eventWhere, utmContent: { not: null } }, _count: { _all: true } }),
    prisma.analyticsEvent.groupBy({ by: ["path"], where: { ...eventWhere, path: { not: null } }, _count: { _all: true } }),
    prisma.auditRun.findMany({
      where: shopWhere,
      select: {
        shop: true,
        totalVariants: true,
        lossCount: true,
        lowMarginCount: true,
        missingCostCount: true,
        inventoryRiskAmount: true,
        demoMode: true,
        scanLimitReached: true,
        createdAt: true,
      },
      orderBy: { createdAt: "desc" },
      take: 20,
    }),
    prisma.importRun.findMany({
      where: shopWhere,
      select: {
        shop: true,
        fileName: true,
        saved: true,
        csvRows: true,
        matchedSkuCount: true,
        unmatchedSkuCount: true,
        savedCostCount: true,
        createdAt: true,
      },
      orderBy: { createdAt: "desc" },
      take: 20,
    }),
    prisma.analyticsEvent.findMany({
      select: {
        shop: true,
        eventName: true,
        source: true,
        path: true,
        utmSource: true,
        utmMedium: true,
        utmCampaign: true,
        utmContent: true,
        subjectId: true,
        metadata: true,
        createdAt: true,
      },
      where: eventWhere,
      orderBy: { createdAt: "desc" },
      take: 50,
    }),
    prisma.analyticsEvent.findMany({
      select: {
        shop: true,
        eventName: true,
        source: true,
        path: true,
        utmSource: true,
        utmMedium: true,
        utmCampaign: true,
        utmContent: true,
        subjectId: true,
        metadata: true,
        createdAt: true,
      },
      where: { ...eventWhere, eventName: { in: ["cost_template_downloaded", "findings_export_downloaded"] } },
      orderBy: { createdAt: "desc" },
      take: 20,
    }),
    prisma.auditFinding.groupBy({
      by: ["status"],
      where: shop ? { shop, createdAt: { gte: since } } : { createdAt: { gte: since } },
      _count: { _all: true },
    }),
  ]);

  const publicPageViews = groupedCount(eventsByName, "public_page_view");
  const appOpens = groupedCount(eventsByName, "app_open");
  const sampleScanViewed = groupedCount(eventsByName, "sample_scan_viewed");
  const scanStarted = groupedCount(eventsByName, "scan_started");
  const scanCompleted = groupedCount(eventsByName, "scan_completed");
  const firstScanCompleted = groupedCount(eventsByName, "first_scan_completed");
  const missingCostsFound = groupedCount(eventsByName, "missing_costs_found");
  const scanFailed = groupedCount(eventsByName, "scan_failed");
  const supplierImports = groupedCount(eventsByName, "supplier_import_saved") + groupedCount(eventsByName, "supplier_import_previewed");
  const csvImportCompleted = groupedCount(eventsByName, "csv_import_completed");
  const scenarioRun = groupedCount(eventsByName, "scenario_run");
  const templateDownloads = groupedCount(eventsByName, "cost_template_downloaded");
  const findingsExports = groupedCount(eventsByName, "findings_export_downloaded");
  const billingApprovalRequests = groupedCount(eventsByName, "billing_approval_requested");
  const trialStarted = groupedCount(eventsByName, "trial_started");
  const subscriptionActive = groupedCount(eventsByName, "subscription_active");
  const appUninstalls = groupedCount(eventsByName, "app_uninstalled");
  const activeFindings = findingStatusCounts.find((row) => row.status === "ACTIVE")?._count._all ?? 0;
  const resolvedFindings = findingStatusCounts.find((row) => row.status === "RESOLVED")?._count._all ?? 0;
  const ignoredFindings = findingStatusCounts.find((row) => row.status === "IGNORED")?._count._all ?? 0;

  return {
    ok: true,
    generatedAt: new Date().toISOString(),
    windowDays: days,
    since: since.toISOString(),
    scope: {
      shop,
      includePublic,
    },
    counts: {
      sessions: sessionCount,
      installedSessionShops: sessionShops.length,
      shopsWithSettings: shopSettings.length,
      auditRuns: auditCount,
      importRuns: importCount,
      alertLogs: alertCount,
      analyticsEvents: eventCount,
    },
    funnel: {
      publicPageViews,
      appOpens,
      scanStarted,
      scanCompleted,
      scanFailed,
      supplierImports,
      billingApprovalRequests,
      subscriptionActive,
      appUninstalls,
    },
    downloads: {
      costTemplates: templateDownloads,
      findingsExports,
    },
    findingWorkflow: {
      activeFindings,
      resolvedFindings,
      ignoredFindings,
      completionRate: activeFindings + resolvedFindings > 0 ? Math.round((resolvedFindings / (activeFindings + resolvedFindings)) * 100) : 0,
    },
    ga4KeyEvents: {
      appOpen: appOpens,
      sampleScanViewed,
      scanCompleted,
      firstScanCompleted,
      missingCostsFound,
      csvImportCompleted,
      scenarioRun,
      trialStarted,
    },
    shops: shopSettings.map((shop) => ({
      shop: shop.shop,
      planKey: shop.planKey,
      weeklyAlertsEnabled: shop.weeklyAlertsEnabled,
      createdAt: shop.createdAt,
      updatedAt: shop.updatedAt,
    })),
    eventsByName: eventsByName.sort((a, b) => b._count._all - a._count._all),
    eventsBySource: eventsBySource.sort((a, b) => b._count._all - a._count._all),
    eventsByUtmSource: eventsByUtmSource.sort((a, b) => b._count._all - a._count._all),
    eventsByUtmContent: eventsByUtmContent.sort((a, b) => b._count._all - a._count._all),
    topPaths: eventsByPath.sort((a, b) => b._count._all - a._count._all).slice(0, 25),
    latestAuditRuns,
    latestImportRuns,
    recentEvents: recentEvents.map((event) => ({ ...event, metadata: parseMetadata(event.metadata) })),
    recentDownloadEvents: recentDownloadEvents.map((event) => ({ ...event, metadata: parseMetadata(event.metadata) })),
    dataGaps: [
      "Shopify App Store listing views and install-button clicks require Shopify Partner Dashboard tracking with GA4 or Meta Pixel.",
      "Recommended GA4 key events to mark: app_open, sample_scan_viewed, scan_completed, first_scan_completed, missing_costs_found, csv_import_completed, scenario_run, and trial_started.",
      "Server-side Shopify install attribution requires GA4 Measurement Protocol API secret or Meta Pixel access token in the app listing tracking settings.",
      "This endpoint reports app-owned data only: public site events, authenticated app events, webhooks, scans, imports, exports, alerts, and pricing actions.",
    ],
  };
}
