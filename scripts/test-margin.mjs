import assert from "node:assert/strict";

function toBasisPoints(decimalRatio) { return Math.round(decimalRatio * 10000); }
function roundMoney(value) { return Math.round((value + Number.EPSILON) * 100) / 100; }
function calculateMarginBps(priceAmount, costAmount) { if (!Number.isFinite(priceAmount) || !Number.isFinite(costAmount)) throw new Error("invalid"); if (priceAmount <= 0) return -10000; return toBasisPoints((priceAmount - costAmount) / priceAmount); }
function calculateProfitAmount(priceAmount, costAmount) { return roundMoney(priceAmount - costAmount); }
function auditVariant(input, minimumMarginBps) {
  if (input.costAmount == null) return { ...input, costAmount: null, profitAmount: null, marginBps: null, targetProfitAmount: null, gapToTargetAmount: null, severity: "MISSING_COST" };
  const profitAmount = calculateProfitAmount(input.priceAmount, input.costAmount);
  const marginBps = calculateMarginBps(input.priceAmount, input.costAmount);
  const targetProfitAmount = roundMoney(input.priceAmount * (minimumMarginBps / 10000));
  const gapToTargetAmount = roundMoney(Math.max(0, targetProfitAmount - profitAmount));
  if (marginBps < 0) return { ...input, profitAmount, marginBps, targetProfitAmount, gapToTargetAmount, severity: "LOSS" };
  if (marginBps < minimumMarginBps) return { ...input, profitAmount, marginBps, targetProfitAmount, gapToTargetAmount, severity: "LOW_MARGIN" };
  return null;
}

assert.equal(calculateMarginBps(100, 60), 4000);
assert.equal(calculateMarginBps(50, 55), -1000);
assert.equal(calculateProfitAmount(100, 80), 20);
assert.equal(auditVariant({ variantId: "1", productTitle: "A", priceAmount: 100, costAmount: 60 }, 3000), null);
const low = auditVariant({ variantId: "2", productTitle: "B", priceAmount: 100, costAmount: 80 }, 3000);
assert.equal(low.severity, "LOW_MARGIN");
assert.equal(low.profitAmount, 20);
assert.equal(low.gapToTargetAmount, 10);
const loss = auditVariant({ variantId: "3", productTitle: "C", priceAmount: 100, costAmount: 120 }, 3000);
assert.equal(loss.severity, "LOSS");
assert.equal(loss.profitAmount, -20);
assert.equal(loss.gapToTargetAmount, 50);
assert.equal(auditVariant({ variantId: "4", productTitle: "D", priceAmount: 100, costAmount: null }, 3000).severity, "MISSING_COST");
console.log("Profit Guard margin tests passed.");
