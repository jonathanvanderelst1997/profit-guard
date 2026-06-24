# Outside-the-box acquisition research - 2026-06-25

## Hypothesis

Margin Sentinel should not be marketed as a generic "profit app" first. The sharper entry points are:

- supplier CSV cost changes
- missing Shopify unit cost data
- products selling below target margin
- inventory receiving workflows where cost/price/margin is not visible
- Stocky transition and cost continuity risk
- large catalogs where manual review is painful

## Public demand signals

### Shopify Community

- Supplier CSV / SKU matching problem:
  - `https://community.shopify.com/t/how-to-only-update-cost-and-prices-according-to-supplier-list/295931`
  - Merchant problem: supplier lists, SKU/EAN/barcode matching, cost and price updates.
- Bulk CSV price update problem:
  - `https://community.shopify.com/t/how-can-i-efficiently-update-prices-using-a-csv-file/138448`
  - Merchant problem: manually matching supplier SKUs and updating price CSVs.
- Receiving workflow cost/price/margin problem:
  - `https://community.shopify.com/t/feature-request-add-cost-price-margin-display-to-purchase-order-receiving/587455`
  - Merchant problem: native receiving screen shows quantity but not cost, price, or margin.
- Stocky transition problem:
  - `https://community.shopify.com/t/stocky-app-going-away-after-august-31-2026/587292?page=3`
  - Merchant problem: receiving inventory updates quantity but not unit cost, creating double entry and margin distortion.
- Stocky cost continuity problem:
  - `https://community.shopify.com/t/why-stocky-should-remain-an-executive-position/587146`
  - Merchant problem: loss of cost continuity and silent margin distortion.

### Reddit

- `https://www.reddit.com/r/shopify/comments/1ni82un/api_for_total_cost_of_goods_on_all_products/`
  - User wants to pull products/variants, join costs, retail prices, and calculate margins in a sheet/dashboard.
- `https://www.reddit.com/r/shopify/comments/1loc3tn/the_nightmare_of_tracking_material_costs_stock/`
  - Material costs, stock, and profit tracking pain.
- `https://www.reddit.com/r/shopify/comments/1bqdclw/app_recommendation_cost_of_goods/`
  - App recommendations for COGS.
- `https://www.reddit.com/r/shopify/comments/1r0afdl/aov_is_good_but_margins_are_trash/`
  - Margin pressure discussion.
- `https://www.reddit.com/r/shopify/comments/1q5c6j3/business_expenses/`
  - Desire to see product cost and operating spend together.

## Public catalog lead research

Created a local probe:

- `scripts/research-catalog-leads.mjs`

It uses only public pages/endpoints:

- `https://{domain}/products.json?limit=250&page=N`
- common public contact paths

It does not log in, bypass access controls, solve CAPTCHAs, or scrape private data.

Seed domains:

- `marketing/lead-research/shopify_catalog_seed_domains.csv`

Output:

- `marketing/lead-research/catalog_probe_results.csv`

First probe result:

- A-grade public catalog signals:
  - `kith.com` - 2,000 products counted, 20,628 variants counted, capped at 8 pages.
  - `gymshark.com` - 2,000 products counted, 12,603 variants counted, capped at 8 pages.
  - `fashionnova.com` - 2,000 products counted, 11,100 variants counted, capped at 8 pages.
  - `bulbamerica.com` - 2,000 products counted, 2,000 variants counted, capped at 8 pages.
- B-grade public catalog signals:
  - `decathlon.com` - 501 products counted, 2,667 variants counted.
  - `polyandbark.com` - 900 products counted, 2,550 variants counted.
  - `colourpop.com` - 1,054 products counted, 1,054 variants counted.

Interpretation:

- The best direct outreach targets are not necessarily the biggest brands. Huge apparel brands prove that large variant catalogs exist on Shopify, but they likely have internal tooling.
- Better first direct merchant targets are supplier-heavy or inventory-heavy catalogs where the app value is easier to explain:
  - lighting
  - auto parts
  - furniture
  - beauty

## Best immediate angles

### 1. Stocky transition angle

Message:

> If Stocky/native receiving does not keep cost, price, and margin visible, use Margin Sentinel as a read-only margin guardrail after supplier cost or receiving changes.

Why it works:

- Time-bound pain: Stocky changes/discontinuation are being discussed now.
- Merchants already articulate "margin distortion" and "unit cost" risk.

### 2. Supplier CSV angle

Message:

> Before importing supplier CSV changes, scan which variants become low-margin, loss-making, or missing cost data.

Why it works:

- Directly tied to manual pain.
- Easy to explain with a resource page.

### 3. Large catalog angle

Message:

> If a store has hundreds or thousands of variants, a manual product-by-product margin check is not realistic.

Why it works:

- Public product endpoints can reveal rough product/variant scale.
- Large catalog means higher chance of stale costs and variant mismatches.

## Next action queue

1. Wait for Shopify Community moderation on the first post.
2. If rejected, use a no-link reply from `SAFE_COMMUNITY_DRAFTS_2026-06-25.md`.
3. Build a merchant lead list from public catalog probes.
4. On 2026-06-29, send agency follow-ups only if no replies.
5. Start direct merchant outreach only after preparing highly specific one-to-one messages from the catalog probe results.

Prepared merchant outreach drafts:

- `MERCHANT_OUTREACH_DRAFTS_2026-06-25.md`
