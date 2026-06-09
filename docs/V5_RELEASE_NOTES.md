# Profit Guard v5 release notes

This version implements the most urgent launch-readiness fixes from the v4 assessment.

## What changed

- Added plan limits and server-side scan limits: Free 100 variants, Starter 5,000, Growth 25,000.
- Reworked the Shopify scan so it is variant-limit based instead of product-limit based.
- Added pagination for products and for product variants beyond the first page.
- Removed hidden audit truncation: all findings are now saved and CSV export loads all latest findings.
- Added `scanLimitReached` on audit runs so the UI can clearly warn merchants when a plan cap is reached.
- Added mandatory Shopify compliance webhook routes:
  - `/webhooks/customers/data_request`
  - `/webhooks/customers/redact`
  - `/webhooks/shop/redact`
- Improved uninstall data deletion so imported supplier costs are deleted too.
- Added webhook subscriptions to `shopify.app.toml`.
- Added `.env.example` for deployment setup.
- Added basic plan persistence fields to `ShopSettings`.
- Hardened CSV export against spreadsheet formula injection.
- Escaped merchant-controlled data in weekly alert emails.
- Replaced hardcoded `$` formatting in key dashboard cards with currency-aware formatting.
- Expanded pricing page from placeholder cards into a real beta entitlement page.

## Still not finished before public App Store launch

- Shopify App Pricing should be configured in the Partner dashboard for the public listing.
- Billing API fallback still needs full subscription status reconciliation for production.
- Weekly alerts still need a real hosted scheduler/cron.
- Hosted Privacy Policy, Terms, Refund Policy, Support URL, screenshots, and reviewer screencast still need to be created.
- Run full `npm install`, `npm run typecheck`, and `npm run build` in the real project environment.
