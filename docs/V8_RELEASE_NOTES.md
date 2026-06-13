# Margin Sentinel v8 release notes

Release-readiness pass after v7.

## Added / improved
- Added persisted supplier import history.
- Import history records file name, save/preview status, CSV rows, matched rows, unmatched rows, duplicate warnings, total warnings, and saved cost count.
- Added a recent imports table to the supplier import page using Shopify App Home table components.
- Added pure import metric tests for duplicate and unmatched SKU counts.
- Kept the roadmap and competitor benchmark aligned with shipped V1 features.

## Validation
- `npx prisma generate`
- `npx prisma migrate deploy`
- `npm test`
- `npm run typecheck`
- `npm run build`
- `npx shopify app config validate`
- Shopify App Home component validation for the new import history table
