# Profit Guard v4

Shopify embedded app MVP for finding products that quietly destroy gross margin.

## What v4 does

- Runs an automatic profit scan from Shopify product variants.
- Reads Shopify selling price and `InventoryItem.unitCost`.
- Applies imported supplier costs by SKU when Shopify costs are missing or need override.
- Flags:
  - loss products
  - low-margin products
  - missing-cost products
- Shows direct loss found and gap to target margin.
- Exports findings as CSV.
- Imports supplier costs from CSV.
- Stores imported costs for future scans.
- Stores latest scan and findings in Prisma/SQLite.
- Has weekly alert settings and scheduler structure.
- Has Shopify billing fallback page.
- Has onboarding/setup page for merchants.
- Has demo mode for empty dev stores.

## Quick start

```bash
npm install
npm run setup
npm run dev
```

Then open the Shopify dev preview.

## Main routes

- `/app` dashboard + Run profit scan
- `/app/import` supplier cost import
- `/app/csv` alias for import
- `/app/export` CSV findings download
- `/app/alerts` weekly alert settings
- `/app/pricing` Shopify billing fallback
- `/app/settings` margin settings
- `/app/onboarding` merchant setup guide

## CSV import format

```csv
SKU,COST
ABC123,12.50
XYZ999,8.40
```

## Tests

```bash
npm test
```

Current local tests included:

- margin logic
- CSV parsing
- demo cost generation
- export CSV format

## Important

This app never changes product prices automatically. It only reads product data, calculates gross margin, stores findings, and helps merchants act on problems.
