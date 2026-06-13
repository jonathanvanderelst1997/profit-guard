# Margin Sentinel v7 release notes

Release-readiness pass after v6.

## Added / improved
- Added a real Prisma migration for Margin Sentinel tables so fresh deploys create the app schema through `prisma migrate deploy`.
- Added `migration_lock.toml` and changed `npm run setup` to exercise migrations instead of `db push`.
- Kept billing state in sync when Shopify has no active subscription and cleared stale subscription IDs on downgrade.
- Matched supplier CSV import preview to the current plan's variant limit.
- Pulled shop currency from Shopify so findings with missing unit cost still display money in the store currency.
- Hardened minimum-margin input against invalid values.
- Switched merchant-facing form actions to explicit Shopify submit buttons.
- Removed the leftover template “Additional page” route.

## Still requires account actions
- Replace production app URL/API placeholders in `shopify.app.toml`.
- Choose the production database provider and generate matching migrations if moving from SQLite to PostgreSQL.
- Host privacy, terms, refund, and support pages.
- Capture Shopify App Store screenshots and reviewer screencast.
