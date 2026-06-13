# Margin Sentinel v9 release notes

Release-readiness pass after v8.

## Added / improved

- Added Shopify inventory quantity to the catalog audit query.
- Added inventory dollars at risk: margin gap to target multiplied by current Shopify inventory quantity.
- Persisted inventory quantity and inventory risk on saved audit findings.
- Added total inventory risk on saved audit runs.
- Added inventory risk to dashboard metrics, finding sort, findings table, import preview, CSV export, and weekly alert emails.
- Updated launch, App Store, roadmap, and competitor docs around the new paid-value feature.

## Validation

- Shopify Admin GraphQL query validation for product and variant pagination queries.
- `npx prisma generate`
- `npx prisma migrate deploy`
- `npm test`
- `npm run typecheck`
- `npm run build`
- `npx shopify app config validate`
