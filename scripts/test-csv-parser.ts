import assert from "node:assert/strict";
import { parseSupplierCostCsv, supplierRowsToMap } from "../app/lib/csv";

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
assert.match(parsed.errors.join("\n"), /duplicate SKU DUPLICATE/);
assert.equal(supplierRowsToMap(parsed.rows).get("DUPLICATE"), 11);

const invalid = parseSupplierCostCsv("sku,cost\nBAD,-1\n,10\n");
assert.equal(invalid.rows.length, 0);
assert.equal(invalid.errors.length, 2);

console.log("Margin Sentinel CSV parser tests passed.");
