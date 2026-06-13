import assert from "node:assert/strict";
import { fetchVariantsForAudit } from "../app/lib/shopify-products.server";

const calls: Array<{ query: string; variables?: Record<string, unknown> }> = [];

const admin = {
  async graphql(query: string, options?: { variables?: Record<string, unknown> }) {
    calls.push({ query, variables: options?.variables });
    return new Response(JSON.stringify({
      data: {
        shop: { currencyCode: "EUR" },
        products: {
          pageInfo: { hasNextPage: false, endCursor: null },
          nodes: [
            {
              id: "gid://shopify/Product/1",
              title: "Demo Product",
              variants: {
                pageInfo: { hasNextPage: false, endCursor: null },
                nodes: [
                  {
                    id: "gid://shopify/ProductVariant/1",
                    title: "Default Title",
                    sku: "NO-COST",
                    price: "19.99",
                    inventoryQuantity: 3,
                    inventoryItem: { id: "gid://shopify/InventoryItem/1", unitCost: null },
                  },
                  {
                    id: "gid://shopify/ProductVariant/2",
                    title: "Blue",
                    sku: "WITH-COST",
                    price: "25.00",
                    inventoryQuantity: 12,
                    inventoryItem: {
                      id: "gid://shopify/InventoryItem/2",
                      unitCost: { amount: "7.50", currencyCode: "USD" },
                    },
                  },
                ],
              },
            },
          ],
        },
      },
    }), { headers: { "Content-Type": "application/json" } });
  },
};

const result = await fetchVariantsForAudit(admin, { maxVariants: 10 });

assert.equal(calls.length, 1);
assert.equal(result.limitReached, false);
assert.equal(result.variants.length, 2);
assert.equal(result.variants[0].currencyCode, "EUR");
assert.equal(result.variants[0].costAmount, null);
assert.equal(result.variants[0].costSource, "MISSING");
assert.equal(result.variants[0].inventoryQuantity, 3);
assert.equal(result.variants[0].inventoryItemId, "gid://shopify/InventoryItem/1");
assert.equal(result.variants[1].currencyCode, "USD");
assert.equal(result.variants[1].costAmount, 7.5);
assert.equal(result.variants[1].costSource, "SHOPIFY_UNIT_COST");
assert.equal(result.variants[1].inventoryQuantity, 12);
assert.equal(result.variants[1].inventoryItemId, "gid://shopify/InventoryItem/2");

console.log("Margin Sentinel Shopify product tests passed.");
