import { readFileSync } from "node:fs";

const mandatoryComplianceTopics = ["customers/data_request", "customers/redact", "shop/redact"];
const configFiles = ["shopify.app.toml", "shopify.app.profit-guard.toml"];

function assert(condition: unknown, message: string): asserts condition {
  if (!condition) throw new Error(message);
}

function parseArrayValues(value: string) {
  return [...value.matchAll(/"([^"]+)"/g)].map((match) => match[1]);
}

function assertWebhookConfig(file: string) {
  const source = readFileSync(file, "utf8");
  const complianceTopics = [...source.matchAll(/compliance_topics\s*=\s*\[([^\]]+)\]/g)].flatMap((match) => parseArrayValues(match[1]));
  const standardTopics = [...source.matchAll(/(?<!compliance_)topics\s*=\s*\[([^\]]+)\]/g)].flatMap((match) => parseArrayValues(match[1]));

  for (const topic of mandatoryComplianceTopics) {
    assert(complianceTopics.includes(topic), `${file} is missing compliance topic ${topic}`);
    assert(!standardTopics.includes(topic), `${file} registers ${topic} as a standard topic instead of a compliance topic`);
  }

  assert(source.includes('uri = "/webhooks/compliance"'), `${file} should route compliance topics to /webhooks/compliance`);
}

function assertShopifyHelperUsesTimingSafeHmacValidation() {
  const authenticateSource = readFileSync(
    "node_modules/@shopify/shopify-app-react-router/dist/cjs/server/authenticate/webhooks/authenticate.js",
    "utf8",
  );
  const safeCompareSource = readFileSync(
    "node_modules/@shopify/shopify-api/dist/esm/lib/auth/oauth/safe-compare.mjs",
    "utf8",
  );

  assert(authenticateSource.includes("api.webhooks.validate"), "authenticate.webhook should validate webhooks through Shopify API");
  assert(authenticateSource.includes("status: 401"), "authenticate.webhook should reject invalid HMAC signatures with 401");
  assert(safeCompareSource.includes("timingSafeEqual"), "Shopify API safe compare should use timing-safe comparison");
}

function assertComplianceHandlerUsesShopifyWebhookAuthentication() {
  const handlerSource = readFileSync("app/lib/compliance-webhooks.server.ts", "utf8");
  const authIndex = handlerSource.indexOf("authenticate.webhook(request)");
  const topicIndex = handlerSource.indexOf("normalizeTopic(topic)");
  const deleteIndex = handlerSource.indexOf("deleteAllShopData(shop)");

  assert(authIndex !== -1, "Compliance handler must call authenticate.webhook(request)");
  assert(topicIndex > authIndex, "Compliance handler should branch on topic only after Shopify webhook authentication");
  assert(deleteIndex > authIndex, "Compliance handler should delete shop data only after Shopify webhook authentication");
}

for (const file of configFiles) assertWebhookConfig(file);
assertShopifyHelperUsesTimingSafeHmacValidation();
assertComplianceHandlerUsesShopifyWebhookAuthentication();

console.log("Margin Sentinel webhook compliance tests passed.");
