import assert from "node:assert/strict";

function csvEscape(value) { if (value === null || value === undefined) return ""; const text = String(value); if (/[",\n\r]/.test(text)) return `"${text.replace(/"/g, '""')}"`; return text; }
function findingsToCsv(findings) {
  const headers = ["issue", "product_title", "variant_title", "sku", "price", "cost", "cost_source", "profit", "margin_percent", "target_profit", "gap_to_target", "reason"];
  const rows = findings.map((f) => [f.severity, f.productTitle, f.variantTitle ?? "", f.sku ?? "", f.priceAmount.toFixed(2), f.costAmount == null ? "" : f.costAmount.toFixed(2), f.costSource ?? "", f.profitAmount == null ? "" : f.profitAmount.toFixed(2), f.marginBps == null ? "" : (f.marginBps / 100).toFixed(1), f.targetProfitAmount == null ? "" : f.targetProfitAmount.toFixed(2), f.gapToTargetAmount == null ? "" : f.gapToTargetAmount.toFixed(2), f.reason]);
  return [headers, ...rows].map((row) => row.map(csvEscape).join(",")).join("\n");
}

const csv = findingsToCsv([{ severity: "LOW_MARGIN", productTitle: "Blue, Shirt", variantTitle: "M", sku: "ABC", priceAmount: 100, costAmount: 80, costSource: "Supplier import", profitAmount: 20, marginBps: 2000, targetProfitAmount: 30, gapToTargetAmount: 10, reason: "Below target" }]);
assert.match(csv, /gap_to_target/);
assert.match(csv, /cost_source/);
assert.match(csv, /"Blue, Shirt"/);
assert.match(csv, /Supplier import/);
assert.match(csv, /20.00/);
console.log("Margin Sentinel export tests passed.");
