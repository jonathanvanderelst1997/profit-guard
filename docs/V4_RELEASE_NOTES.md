# Profit Guard v4 release notes

## Added

- Profit impact metrics:
  - direct loss found
  - margin gap to target
  - OK variant count
- Per-finding fields:
  - profit amount
  - target profit amount
  - gap to target amount
- Merchant onboarding route at `/app/onboarding`.
- Settings route at `/app/settings`.
- `/app/csv` now points to the supplier import workflow.
- Export CSV now includes profit, target profit, and gap to target.
- Extra export test.

## Why this matters

The product is now easier to sell because the dashboard no longer only says “this is low margin”. It also shows what the problem is worth in money, which is the reason merchants would pay for it.

## Next production tasks

1. Deploy v4 in the current Shopify dev app.
2. Run `npm run setup` so the new Prisma fields are pushed to SQLite.
3. Run `npm run dev`.
4. Click Run profit scan.
5. Test `/app/import`, `/app/export`, `/app/alerts`, `/app/pricing`, `/app/onboarding`.
6. Replace placeholder billing with the final Shopify-managed pricing configuration before App Store submission.
