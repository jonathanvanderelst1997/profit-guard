import type { HeadersFunction, LoaderFunctionArgs } from "react-router";
import { useLoaderData } from "react-router";
import { boundary } from "@shopify/shopify-app-react-router/server";
import { authenticate } from "../shopify.server";
import { getLaunchMetrics, trackAnalyticsEvent } from "../lib/analytics.server";
import { formatMoney } from "../lib/security";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const { session } = await authenticate.admin(request);
  const url = new URL(request.url);
  const days = Number(url.searchParams.get("days") ?? 30);
  await trackAnalyticsEvent({ eventName: "metrics_viewed", source: "app", request, shop: session.shop });
  return {
    shop: session.shop,
    metrics: await getLaunchMetrics({ days, shop: session.shop }),
  };
};

function formatDateTime(value: string | Date): string {
  return new Intl.DateTimeFormat("en", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" }).format(new Date(value));
}

function countLabel(value: number): string {
  return value.toLocaleString();
}

function StatBox({ label, value }: { label: string; value: string | number }) {
  return (
    <s-box padding="base" borderWidth="base" borderRadius="base" background="subdued">
      <s-stack direction="block" gap="small">
        <s-text>{label}</s-text>
        <s-heading>{typeof value === "number" ? countLabel(value) : value}</s-heading>
      </s-stack>
    </s-box>
  );
}

export default function Metrics() {
  const { shop, metrics } = useLoaderData<typeof loader>();
  const latestAudit = metrics.latestAuditRuns[0];
  const recentEvents = metrics.recentEvents.slice(0, 12);
  const hasUtm = metrics.eventsByUtmSource.length > 0;

  return (
    <s-page heading="Monitoring">
      <s-section heading="Activity snapshot">
        <s-stack direction="block" gap="base">
          <s-stack direction="inline" gap="base">
            <s-link href="/app/metrics?days=7">7 days</s-link>
            <s-link href="/app/metrics?days=30">30 days</s-link>
            <s-link href="/app/metrics?days=90">90 days</s-link>
          </s-stack>
          <s-grid gridTemplateColumns="repeat(auto-fit, minmax(160px, 1fr))" gap="base">
            <StatBox label="Sessions" value={metrics.counts.sessions} />
            <StatBox label="App events" value={metrics.counts.analyticsEvents} />
            <StatBox label="Scans" value={metrics.counts.auditRuns} />
            <StatBox label="Imports" value={metrics.counts.importRuns} />
            <StatBox label="Alerts" value={metrics.counts.alertLogs} />
          </s-grid>
          <s-paragraph>{shop} since {formatDateTime(metrics.since)}.</s-paragraph>
        </s-stack>
      </s-section>

      <s-section heading="Latest scan">
        {latestAudit ? (
          <s-grid gridTemplateColumns="repeat(auto-fit, minmax(170px, 1fr))" gap="base">
            <StatBox label="Variants checked" value={latestAudit.totalVariants} />
            <StatBox label="Loss findings" value={latestAudit.lossCount} />
            <StatBox label="Low-margin findings" value={latestAudit.lowMarginCount} />
            <StatBox label="Missing costs" value={latestAudit.missingCostCount} />
            <StatBox label="Inventory risk" value={formatMoney(Number(latestAudit.inventoryRiskAmount ?? 0))} />
          </s-grid>
        ) : (
          <s-box padding="base" borderWidth="base" borderRadius="base" background="subdued">
            <s-paragraph>No scan recorded for this shop yet.</s-paragraph>
          </s-box>
        )}
      </s-section>

      <s-section heading="Events">
        {metrics.eventsByName.length ? (
          <s-table variant="auto">
            <s-table-header-row>
              <s-table-header listSlot="primary">Event</s-table-header>
              <s-table-header format="numeric">Count</s-table-header>
            </s-table-header-row>
            <s-table-body>
              {metrics.eventsByName.slice(0, 15).map((event) => (
                <s-table-row key={event.eventName}>
                  <s-table-cell>{event.eventName}</s-table-cell>
                  <s-table-cell>{event._count._all}</s-table-cell>
                </s-table-row>
              ))}
            </s-table-body>
          </s-table>
        ) : (
          <s-box padding="base" borderWidth="base" borderRadius="base" background="subdued">
            <s-paragraph>No app events recorded for this shop in this window.</s-paragraph>
          </s-box>
        )}
      </s-section>

      {hasUtm ? (
        <s-section heading="UTM sources">
          <s-table variant="auto">
            <s-table-header-row>
              <s-table-header listSlot="primary">Source</s-table-header>
              <s-table-header format="numeric">Events</s-table-header>
            </s-table-header-row>
            <s-table-body>
              {metrics.eventsByUtmSource.slice(0, 10).map((source) => (
                <s-table-row key={source.utmSource ?? "unknown"}>
                  <s-table-cell>{source.utmSource ?? "unknown"}</s-table-cell>
                  <s-table-cell>{source._count._all}</s-table-cell>
                </s-table-row>
              ))}
            </s-table-body>
          </s-table>
        </s-section>
      ) : null}

      <s-section heading="Recent activity">
        {recentEvents.length ? (
          <s-table variant="auto">
            <s-table-header-row>
              <s-table-header listSlot="primary">Time</s-table-header>
              <s-table-header>Event</s-table-header>
              <s-table-header>Source</s-table-header>
              <s-table-header>Path</s-table-header>
              <s-table-header>Campaign</s-table-header>
            </s-table-header-row>
            <s-table-body>
              {recentEvents.map((event, index) => (
                <s-table-row key={`${event.eventName}-${event.createdAt}-${index}`}>
                  <s-table-cell>{formatDateTime(event.createdAt)}</s-table-cell>
                  <s-table-cell>{event.eventName}</s-table-cell>
                  <s-table-cell>{event.source}</s-table-cell>
                  <s-table-cell>{event.path ?? "-"}</s-table-cell>
                  <s-table-cell>{event.utmCampaign ?? "-"}</s-table-cell>
                </s-table-row>
              ))}
            </s-table-body>
          </s-table>
        ) : (
          <s-box padding="base" borderWidth="base" borderRadius="base" background="subdued">
            <s-paragraph>No recent events for this shop.</s-paragraph>
          </s-box>
        )}
      </s-section>

      <s-section heading="External data">
        <s-banner tone="info">
          Shopify App Store listing views and install-button clicks are only available through Shopify Partner Dashboard tracking with GA4 or Meta Pixel. This page shows app-owned events after installation.
        </s-banner>
      </s-section>
    </s-page>
  );
}

export const headers: HeadersFunction = (headersArgs) => boundary.headers(headersArgs);
