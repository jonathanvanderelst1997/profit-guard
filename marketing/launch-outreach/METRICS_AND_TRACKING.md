# Metrics and tracking setup

## App Store metrics to watch weekly
- App listing views
- Install clicks
- Installs
- Trials started
- Paid conversions
- Reviews
- Uninstalls

## Product metrics to track manually at first
- First app open
- First scan run
- Findings found
- CSV template downloaded
- Supplier import completed
- What-if scenario run
- Export downloaded
- Weekly alerts enabled

## Simple funnel
Listing view -> Install -> First scan -> Finding found -> Export/import/what-if -> Trial retained -> Review requested

## Manual weekly report format

Week of:

Traffic:
- Listing views:
- Installs:
- Trials:

Activation:
- Stores that ran scan:
- Stores with findings:
- Stores that exported:

Revenue:
- Active paid:
- MRR:
- Cancellations:

Learning:
- Top objection:
- Most confusing screen:
- Feature requests:
- Next action:

## UTM links
- LinkedIn: https://apps.shopify.com/margin-sentinel?utm_source=linkedin&utm_medium=social&utm_campaign=launch
- X: https://apps.shopify.com/margin-sentinel?utm_source=x&utm_medium=social&utm_campaign=launch
- Agency email: https://apps.shopify.com/margin-sentinel?utm_source=agency_outreach&utm_medium=email&utm_campaign=launch
- Merchant email: https://apps.shopify.com/margin-sentinel?utm_source=merchant_outreach&utm_medium=email&utm_campaign=launch
- Community: https://apps.shopify.com/margin-sentinel?utm_source=community&utm_medium=organic&utm_campaign=launch

## Data access status - 2026-06-26

What Codex can verify from this workspace right now:

- Outreach sends and follow-up dates from `marketing/launch-outreach/outreach_tracker.md`.
- Production health from `https://profit-guard-xzku.onrender.com/healthz`.
- Local dev database only. The local `dev.sqlite` file exists but is empty, so it does not show real installs, scans, or imports.

What Codex cannot see directly right now:

- Shopify App Store listing views.
- App Store install-button clicks.
- Shopify Partner Dashboard app analytics.
- GA4 or Meta Pixel events for listing views and installs.
- Render production database counts, unless the production `DATABASE_URL` is available in the local environment or through a connected Render/DB tool.

Required tracking setup:

1. In Shopify Partner Dashboard, add GA4 or Meta Pixel tracking to the app listing.
2. In GA4, configure the Measurement Protocol API secret so Shopify can send server-side install events.
3. Check Partner Dashboard app analytics daily for installs, uninstalls, revenue, and reviews.
4. If production database access is available, count `Session`, `ShopSettings`, `AuditRun`, `ImportRun`, and `AlertLog` daily to measure install-to-activation.

Current interpretation:

- If there are no Partner Dashboard installs and the app is still limited visibility, the pace problem is traffic, not necessarily product demand.
- If there are installs but no `AuditRun` rows, the pace problem is activation/onboarding.
- If there are scans but no replies or conversions, the pace problem is offer, trust, pricing, or follow-up.
