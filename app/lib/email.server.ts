import type { AuditFinding, AuditRun, ShopSettings } from "@prisma/client";
import { getCostSourceLabel } from "./margin";
import { escapeHtml, formatMoney } from "./security";

export type AuditRunWithFindings = AuditRun & { findings: AuditFinding[] };

function buildAlertHtml(settings: ShopSettings, audit: AuditRunWithFindings) {
  const currencyCode = audit.findings[0]?.currencyCode ?? "USD";
  const rows = audit.findings.slice(0, 20).map((f) => `<tr><td>${escapeHtml(f.severity)}</td><td>${escapeHtml(f.productTitle)}</td><td>${escapeHtml(f.sku ?? "—")}</td><td style="text-align:right">${escapeHtml(formatMoney(f.priceAmount, currencyCode))}</td><td style="text-align:right">${escapeHtml(formatMoney(f.costAmount, currencyCode))}</td><td>${escapeHtml(getCostSourceLabel(f.costSource))}</td><td style="text-align:right">${escapeHtml(f.marginBps == null ? "—" : `${(f.marginBps / 100).toFixed(1)}%`)}</td></tr>`).join("");
  const demoWarning = audit.demoMode ? "<p><strong>Demo data was active for this scan.</strong> Add real Shopify unit costs or import supplier costs before making pricing decisions.</p>" : "";
  return `<h1>Margin Sentinel weekly report</h1>${demoWarning}<p>Target margin: ${(settings.minimumMarginBps / 100).toFixed(1)}%</p><ul><li>${audit.totalVariants} variants checked</li><li>${audit.lossCount} losing money</li><li>${audit.lowMarginCount} below target margin</li><li>${audit.missingCostCount} missing cost</li></ul><table cellpadding="6" cellspacing="0" border="1"><thead><tr><th>Severity</th><th>Product</th><th>SKU</th><th>Price</th><th>Cost</th><th>Cost source</th><th>Margin</th></tr></thead><tbody>${rows || "<tr><td colspan='7'>No findings. Nice work.</td></tr>"}</tbody></table><p>Margin Sentinel is read-only. Check the app before changing prices.</p>`;
}

export async function sendWeeklyAlertEmail(settings: ShopSettings, audit: AuditRunWithFindings) {
  if (!settings.alertEmail || !settings.weeklyAlertsEnabled) return { skipped: true, reason: "Alerts disabled or no email set." };
  if (!process.env.RESEND_API_KEY) return { skipped: true, reason: "RESEND_API_KEY is not configured." };
  if (!process.env.ALERTS_FROM_EMAIL) return { skipped: true, reason: "ALERTS_FROM_EMAIL is not configured." };
  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${process.env.RESEND_API_KEY}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      from: process.env.ALERTS_FROM_EMAIL,
      to: settings.alertEmail,
      subject: `Margin Sentinel: ${audit.lossCount + audit.lowMarginCount + audit.missingCostCount} margin risks found`,
      html: buildAlertHtml(settings, audit),
    }),
  });
  if (!response.ok) throw new Error(`Email provider error: ${response.status} ${await response.text()}`);
  return response.json();
}
