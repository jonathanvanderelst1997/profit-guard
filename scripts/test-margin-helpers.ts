import assert from "node:assert/strict";
import {
  auditVariants,
  calculateMinimumPriceForTargetMargin,
  getCostSourceLabel,
  getFindingAction,
  getSeverityLabel,
} from "../app/lib/margin";

assert.equal(calculateMinimumPriceForTargetMargin(30, 3000), 42.86);
assert.equal(calculateMinimumPriceForTargetMargin(null, 3000), null);
assert.equal(calculateMinimumPriceForTargetMargin(10, 10000), null);

assert.equal(getSeverityLabel("LOSS"), "Losing money");
assert.equal(getSeverityLabel("LOW_MARGIN"), "Low margin");
assert.equal(getSeverityLabel("MISSING_COST"), "Missing cost");
assert.match(getFindingAction("LOSS"), /Raise price/);
assert.equal(getCostSourceLabel("SHOPIFY_UNIT_COST"), "Shopify unit cost");
assert.equal(getCostSourceLabel("SUPPLIER_IMPORT"), "Supplier import");
assert.equal(getCostSourceLabel("DEMO"), "Demo estimate");
assert.equal(getCostSourceLabel("MISSING"), "Missing cost");

const summary = auditVariants(
  [
    { variantId: "low", productTitle: "Low", priceAmount: 100, costAmount: 80, costSource: "SUPPLIER_IMPORT" },
    { variantId: "loss", productTitle: "Loss", priceAmount: 100, costAmount: 140, costSource: "SHOPIFY_UNIT_COST" },
    { variantId: "missing", productTitle: "Missing", priceAmount: 100, costAmount: null },
  ],
  3000,
);

assert.deepEqual(summary.findings.map((finding) => finding.severity), ["LOSS", "LOW_MARGIN", "MISSING_COST"]);
assert.deepEqual(summary.findings.map((finding) => finding.costSource), ["SHOPIFY_UNIT_COST", "SUPPLIER_IMPORT", "MISSING"]);
assert.equal(summary.marginGapAmount, 80);

console.log("Margin Sentinel margin helper tests passed.");
