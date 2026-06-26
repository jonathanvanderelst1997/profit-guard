import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

function neutralizeSpreadsheetFormula(value) {
  const text = String(value ?? "");
  return /^[=+\-@\t\r]/.test(text) ? `'${text}` : text;
}
function escapeHtml(value) {
  return String(value ?? "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#39;");
}

assert.equal(neutralizeSpreadsheetFormula("=1+1"), "'=1+1");
assert.equal(neutralizeSpreadsheetFormula("normal"), "normal");
assert.equal(escapeHtml("<b>x</b>"), "&lt;b&gt;x&lt;/b&gt;");

const metricsRoute = readFileSync("app/routes/internal.metrics.tsx", "utf8");
assert(metricsRoute.includes("METRICS_TOKEN"), "Internal metrics route must require METRICS_TOKEN");
assert(metricsRoute.includes("Forbidden"), "Internal metrics route must reject invalid tokens");

console.log("Margin Sentinel security tests passed.");
