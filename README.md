# Margin Sentinel

Shopify embedded app for finding products that quietly destroy gross margin.

## What it does

- Runs an automatic profit scan from Shopify product variants.
- Reads Shopify selling price and `InventoryItem.unitCost`.
- Applies imported supplier costs by Shopify variant ID, inventory item ID, or SKU when Shopify costs are missing or need override.
- Flags:
  - loss products
  - low-margin products
  - missing-cost products
- Shows direct loss found and gap to target margin.
- Exports findings as CSV.
- Imports supplier costs from CSV and provides a generated variant cost template.
- Stores imported costs for future scans.
- Stores latest scan and findings in Prisma/SQLite.
- Has weekly alert settings and scheduler structure.
- Has Shopify billing fallback page.
- Has onboarding/setup page for merchants.
- Has demo mode for empty dev stores.
- Uses Prisma migrations for release-style database setup.
- Includes public privacy, terms, refund, and support pages for Shopify review.

## Quick start

```bash
npm install
npm run setup
npm run dev
```

Then open the Shopify dev preview.

Use the in-app variant cost template when testing the import flow.

## Main routes

- `/app` dashboard + Run profit scan
- `/app/import` supplier cost import
- `/app/csv` alias for import
- `/app/export` CSV findings download
- `/app/alerts` weekly alert settings
- `/app/pricing` Shopify billing fallback
- `/app/settings` margin settings
- `/app/onboarding` merchant setup guide
- `/privacy` public privacy policy draft
- `/terms` public terms draft
- `/refund` public refund policy draft
- `/support` public support page

## Environment variables

Required for production:

- `SHOPIFY_API_KEY`
- `SHOPIFY_API_SECRET`
- `SHOPIFY_APP_URL`
- `SCOPES=read_products,read_inventory`
- `DATABASE_URL`
- `SUPPORT_EMAIL`
- `BETA_SIGNUP_URL`

Optional:

- `RESEND_API_KEY`
- `ALERTS_FROM_EMAIL`

## CSV import format

```csv
variant_id,inventory_item_id,sku,cost
gid://shopify/ProductVariant/123,,ABC123,12.50
,gid://shopify/InventoryItem/456,,8.40
```

Merchants can download a prefilled template from `/app/import/template`, add `new_cost`, and re-upload it. SKU is optional when the template includes Shopify variant or inventory item IDs.

## Tests

```bash
npm test
```

Current local tests included:

- margin logic
- CSV parsing
- demo cost generation
- export CSV format
- spreadsheet formula neutralization and HTML escaping

## Release checks

```bash
npm run setup
npm test
npm run typecheck
npm run build
```

## Free beta deployment

Use `render.yaml` with a Neon Postgres `DATABASE_URL` for a no-cost closed beta path. See `docs/FREE_BETA_DEPLOYMENT.md`.

Production-oriented scripts:

```bash
npm run build:prod
npm run setup:prod
npm run start:prod
```

## Important

This app never changes product prices automatically. It only reads product data, calculates gross margin, stores findings, and helps merchants act on problems.
