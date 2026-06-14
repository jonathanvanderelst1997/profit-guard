import assert from "node:assert/strict";
import {
  billingPlanNameForKey,
  buildBillingReturnUrl,
  isBillablePlanKey,
  shouldUseTestBilling,
} from "../app/lib/billing.server";

const request = new Request(
  "https://profit-guard-xzku.onrender.com/app/pricing?embedded=1&shop=profit-guard-putjxynn.myshopify.com&host=YWRtaW4uc2hvcGlmeS5jb20vc3RvcmUvcHJvZml0LWd1YXJkLXB1dGp5eW5u&id_token=temporary",
);

const returnUrl = new URL(buildBillingReturnUrl(request, "profit-guard-putjxynn.myshopify.com", "starter"));
assert.equal(returnUrl.origin, "https://profit-guard-xzku.onrender.com");
assert.equal(returnUrl.pathname, "/app/pricing");
assert.equal(returnUrl.searchParams.get("selected_plan"), "starter");
assert.equal(returnUrl.searchParams.get("shop"), "profit-guard-putjxynn.myshopify.com");
assert.equal(returnUrl.searchParams.get("host"), "YWRtaW4uc2hvcGlmeS5jb20vc3RvcmUvcHJvZml0LWd1YXJkLXB1dGp5eW5u");
assert.equal(returnUrl.searchParams.has("embedded"), false);
assert.equal(returnUrl.searchParams.has("id_token"), false);

assert.equal(isBillablePlanKey("starter"), true);
assert.equal(isBillablePlanKey("growth"), true);
assert.equal(isBillablePlanKey("free"), false);
assert.equal(billingPlanNameForKey("starter"), "Margin Sentinel Starter");

const originalBillingTest = process.env.SHOPIFY_BILLING_TEST;
const originalNodeEnv = process.env.NODE_ENV;

process.env.SHOPIFY_BILLING_TEST = "true";
assert.equal(shouldUseTestBilling(), true);

process.env.SHOPIFY_BILLING_TEST = "false";
assert.equal(shouldUseTestBilling(), false);

delete process.env.SHOPIFY_BILLING_TEST;
process.env.NODE_ENV = "production";
assert.equal(shouldUseTestBilling(), false);

process.env.NODE_ENV = "development";
assert.equal(shouldUseTestBilling(), true);

if (originalBillingTest === undefined) {
  delete process.env.SHOPIFY_BILLING_TEST;
} else {
  process.env.SHOPIFY_BILLING_TEST = originalBillingTest;
}

if (originalNodeEnv === undefined) {
  delete process.env.NODE_ENV;
} else {
  process.env.NODE_ENV = originalNodeEnv;
}

console.log("Margin Sentinel billing tests passed.");
