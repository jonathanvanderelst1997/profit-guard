# Margin Sentinel v6 release notes

Built after launch-readiness research.

## Added / improved
- Billing sync now checks Shopify active subscriptions on the Pricing page.
- Added `APP_SUBSCRIPTIONS_UPDATE` webhook handler to keep app plan state in sync after subscription changes.
- Added webhook subscription for `app_subscriptions/update` in `shopify.app.toml`.
- Added alert delivery logging via new `AlertLog` Prisma model.
- Weekly alert runner now skips demo-mode audits and records sent/skipped/failed status.
- Added Dockerfile for production-style deployment.
- Improved `.env.example` with production PostgreSQL guidance.
- Added production deployment checklist and App Store submission checklist.

## Still requires merchant/account actions
- Create/confirm Shopify Partner app and replace placeholder app URL/API values.
- Decide whether public launch uses Shopify App Pricing or the Billing API fallback.
- Host privacy, terms, refund, and support pages.
- Create Shopify App Store screenshots and review screencast.
