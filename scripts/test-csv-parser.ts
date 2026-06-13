import assert from "node:assert/strict";
import { parseSupplierCostCsv, supplierRowsToMap } from "../app/lib/csv";
import { buildImportRunMetrics } from "../app/lib/import-history";

const parsed = parseSupplierCostCsv(`sku,cost
EURO-DECIMAL,"€12,50"
US-THOUSANDS,"$1,234.56"
EU-THOUSANDS,"1.234,56"
DUPLICATE,10
DUPLICATE,11
`);

assert.equal(parsed.rows.length, 5);
assert.equal(parsed.rows[0].cost, 12.5);
assert.equal(parsed.rows[1].cost, 1234.56);
assert.equal(parsed.rows[2].cost, 1234.56);
assert.match(parsed.errors.join("\n"), /duplicate sku/);
assert.equal(supplierRowsToMap(parsed.rows).get("sku:DUPLICATE"), 11);

const idParsed = parseSupplierCostCsv(`variant_id,inventory_item_id,sku,cost
gid://shopify/ProductVariant/1,,IGNORED-SKU,19.99
,gid://shopify/InventoryItem/2,,8.40
,,FALLBACK-SKU,5
`);
assert.equal(idParsed.errors.length, 0);
assert.equal(idParsed.rows[0].matchKey, "variant:gid://shopify/ProductVariant/1");
assert.equal(idParsed.rows[1].matchKey, "inventory_item:gid://shopify/InventoryItem/2");
assert.equal(idParsed.rows[2].matchKey, "sku:FALLBACK-SKU");

const metrics = buildImportRunMetrics({
  rows: parsed.rows,
  errors: parsed.errors,
  matchedKeys: new Set(["sku:EURO-DECIMAL", "sku:DUPLICATE"]),
  savedCostCount: 2,
});
assert.deepEqual(metrics, {
  csvRows: 5,
  matchedSkuCount: 2,
  unmatchedSkuCount: 2,
  savedCostCount: 2,
  duplicateSkuCount: 1,
  warningCount: 1,
});

const invalid = parseSupplierCostCsv("sku,cost\nBAD,-1\n,10\n");
assert.equal(invalid.rows.length, 0);
assert.equal(invalid.errors.length, 2);

console.log("Margin Sentinel CSV parser tests passed.");
