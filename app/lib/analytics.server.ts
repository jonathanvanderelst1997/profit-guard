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
    eventsByPath,
    latestAuditRuns,
    latestImportRuns,
    recentEvents,
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
  ]);

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
    topPaths: eventsByPath.sort((a, b) => b._count._all - a._count._all).slice(0, 25),
    latestAuditRuns,
    latestImportRuns,
    recentEvents: recentEvents.map((event) => ({ ...event, metadata: parseMetadata(event.metadata) })),
    dataGaps: [
      "Shopify App Store listing views and install-button clicks require Shopify Partner Dashboard tracking with GA4 or Meta Pixel.",
      "Server-side Shopify install attribution requires GA4 Measurement Protocol API secret or Meta Pixel access token in the app listing tracking settings.",
      "This endpoint reports app-owned data only: public site events, authenticated app events, webhooks, scans, imports, exports, alerts, and pricing actions.",
    ],
  };
}
