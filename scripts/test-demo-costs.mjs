import assert from "node:assert/strict";

function hashString(value) {
  let hash = 0;
  for (let index = 0; index < value.length; index += 1) hash = (hash * 31 + value.charCodeAt(index)) >>> 0;
  return hash;
}
function buildDemoCostForVariant(variant) {
  const hash = hashString(`${variant.variantId}:${variant.sku ?? ""}:${variant.productTitle}`);
  const ratio = 0.3 + ((hash % 41) / 100);
  return Number((variant.priceAmount * ratio).toFixed(2));
}
const variant = { variantId: "gid://shopify/ProductVariant/1", sku: "ABC", productTitle: "Snowboard", priceAmount: 100 };
const cost = buildDemoCostForVariant(variant);
assert(cost >= 30 && cost <= 70);
assert.equal(cost, buildDemoCostForVariant(variant));
console.log("Margin Sentinel demo-cost tests passed.");
