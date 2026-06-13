# Margin Sentinel v10 release notes

Release-readiness pass after v9.

## Added / improved

- Added a Cost-change What-if page at `/app/what-if`.
- Scenario runner fetches live Shopify catalog data, applies imported supplier costs, and models supplier cost increases.
- What-if results show affected variants, newly at-risk SKUs, added inventory risk, total inventory risk, added margin gap, and a prioritized findings table.
- Added What-if navigation and dashboard link.
- Added pure scenario tests for percent normalization, cost increase application, new at-risk counts, and added inventory risk.
- Updated landing page, App Store copy, reviewer script, outreach, beta tracker, and marketing execution docs around the new paid-value feature.

## Validation

- Shopify App Home component validation for the new What-if UI.
- `npm test`
- `npm run typecheck`
- `npm run build`
- `npx shopify app config validate`
