import assert from "node:assert/strict";

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
console.log("Margin Sentinel security tests passed.");
