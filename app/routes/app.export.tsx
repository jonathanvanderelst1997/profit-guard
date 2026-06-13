import type { LoaderFunctionArgs } from "react-router";
import { authenticate } from "../shopify.server";
import { getLatestAuditRunForExport } from "../lib/audit-store.server";
import { findingsToCsv } from "../lib/export";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const { session } = await authenticate.admin(request);
  const latestAudit = await getLatestAuditRunForExport(session.shop);
  if (!latestAudit) return new Response("No audit run found. Run a scan first.\n", { status: 404, headers: { "Content-Type": "text/plain; charset=utf-8" } });
  const csv = findingsToCsv(latestAudit.findings, { minimumMarginBps: latestAudit.minimumMarginBps });
  const fileName = `margin-sentinel-findings-${new Date().toISOString().slice(0, 10)}.csv`;
  return new Response(csv, { headers: { "Content-Type": "text/csv; charset=utf-8", "Content-Disposition": `attachment; filename="${fileName}"` } });
};
