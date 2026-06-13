import assert from "node:assert/strict";
import { sendWeeklyAlertEmail } from "../app/lib/email.server";

const settings = {
  alertEmail: "owner@example.com",
  weeklyAlertsEnabled: true,
  minimumMarginBps: 3000,
};

const audit = {
  findings: [],
  demoMode: false,
  totalVariants: 10,
  lossCount: 0,
  lowMarginCount: 1,
  missingCostCount: 2,
};

delete process.env.RESEND_API_KEY;
delete process.env.ALERTS_FROM_EMAIL;

const noProvider = await sendWeeklyAlertEmail(settings as never, audit as never);
assert.equal(noProvider.skipped, true);
assert.equal(noProvider.reason, "RESEND_API_KEY is not configured.");

process.env.RESEND_API_KEY = "test-key";
delete process.env.ALERTS_FROM_EMAIL;

const noSender = await sendWeeklyAlertEmail(settings as never, audit as never);
assert.equal(noSender.skipped, true);
assert.equal(noSender.reason, "ALERTS_FROM_EMAIL is not configured.");

console.log("Margin Sentinel email tests passed.");
