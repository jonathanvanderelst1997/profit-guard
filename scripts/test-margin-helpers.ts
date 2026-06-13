import assert from "node:assert/strict";
import {
  auditVariants,
  calculateMinimumPriceForTargetMargin,
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

const summary = auditVariants(
  [
    { variantId: "low", productTitle: "Low", priceAmount: 100, costAmount: 80 },
    { variantId: "loss", productTitle: "Loss", priceAmount: 100, costAmount: 140 },
    { variantId: "missing", productTitle: "Missing", priceAmount: 100, costAmount: null },
  ],
  3000,
);

assert.deepEqual(summary.findings.map((finding) => finding.severity), ["LOSS", "LOW_MARGIN", "MISSING_COST"]);
assert.equal(summary.marginGapAmount, 80);

console.log("Margin Sentinel margin helper tests passed.");
