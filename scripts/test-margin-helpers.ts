import assert from "node:assert/strict";
import {
  auditVariants,
  calculateInventoryRiskAmount,
  calculateMinimumPriceForTargetMargin,
  getCostSourceLabel,
  getFindingAction,
  getSeverityLabel,
} from "../app/lib/margin";
import { applyCostIncreaseScenario, buildCostIncreaseScenario, normalizeCostIncreasePercent } from "../app/lib/what-if";

assert.equal(calculateMinimumPriceForTargetMargin(30, 3000), 42.86);
assert.equal(calculateMinimumPriceForTargetMargin(null, 3000), null);
assert.equal(calculateMinimumPriceForTargetMargin(10, 10000), null);
assert.equal(calculateInventoryRiskAmount(10, 8), 80);
assert.equal(calculateInventoryRiskAmount(10, 0), 0);
assert.equal(calculateInventoryRiskAmount(10, null), null);
assert.equal(normalizeCostIncreasePercent("8.04"), 8);
assert.equal(normalizeCostIncreasePercent("8.06"), 8.1);
assert.equal(normalizeCostIncreasePercent("-10"), 0);
assert.equal(normalizeCostIncreasePercent("120"), 100);

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
    { variantId: "low", productTitle: "Low", priceAmount: 100, costAmount: 80, costSource: "SUPPLIER_IMPORT", inventoryQuantity: 5 },
    { variantId: "loss", productTitle: "Loss", priceAmount: 100, costAmount: 140, costSource: "SHOPIFY_UNIT_COST", inventoryQuantity: 2 },
    { variantId: "missing", productTitle: "Missing", priceAmount: 100, costAmount: null },
  ],
  3000,
);

assert.deepEqual(summary.findings.map((finding) => finding.severity), ["LOSS", "LOW_MARGIN", "MISSING_COST"]);
assert.deepEqual(summary.findings.map((finding) => finding.costSource), ["SHOPIFY_UNIT_COST", "SUPPLIER_IMPORT", "MISSING"]);
assert.deepEqual(summary.findings.map((finding) => finding.inventoryRiskAmount), [140, 50, null]);
assert.equal(summary.marginGapAmount, 80);
assert.equal(summary.inventoryRiskAmount, 190);

const scenarioInputs = [
  { variantId: "ok-now", productTitle: "OK Now", priceAmount: 100, costAmount: 68, costSource: "SUPPLIER_IMPORT" as const, inventoryQuantity: 10 },
  { variantId: "bad-now", productTitle: "Bad Now", priceAmount: 100, costAmount: 80, costSource: "SUPPLIER_IMPORT" as const, inventoryQuantity: 2 },
];
const increased = applyCostIncreaseScenario(scenarioInputs, 10);
assert.equal(increased[0].costAmount, 74.8);
assert.equal(increased[1].costAmount, 88);
const scenario = buildCostIncreaseScenario(scenarioInputs, 3000, 10);
assert.equal(scenario.affectedVariantCount, 2);
assert.equal(scenario.baseline.findings.length, 1);
assert.equal(scenario.scenario.findings.length, 2);
assert.equal(scenario.newlyAtRiskCount, 1);
assert.equal(scenario.addedInventoryRiskAmount, 64);

console.log("Margin Sentinel margin helper tests passed.");
