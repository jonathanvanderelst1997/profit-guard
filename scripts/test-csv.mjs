import assert from "node:assert/strict";
function splitCsvLine(line) { const result = []; let current = ""; let inQuotes = false; for (let i = 0; i < line.length; i += 1) { const char = line[i]; const next = line[i + 1]; if (char === '"' && inQuotes && next === '"') { current += '"'; i += 1; continue; } if (char === '"') { inQuotes = !inQuotes; continue; } if (char === "," && !inQuotes) { result.push(current.trim()); current = ""; continue; } current += char; } result.push(current.trim()); return result; }
assert.deepEqual(splitCsvLine('sku,cost'), ['sku', 'cost']);
assert.deepEqual(splitCsvLine('"SKU,1",12.50'), ['SKU,1', '12.50']);
assert.deepEqual(splitCsvLine('"A ""quoted"" SKU",4'), ['A "quoted" SKU', '4']);
console.log('Margin Sentinel CSV tests passed.');
