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
- App-owned metrics after deployment: public page views, UTM source, app opens, scans, imports, template downloads, exports, what-if runs, alert actions, billing actions, and lifecycle webhooks.
- Shopify-authenticated in-app monitoring at `/app/metrics` for the current installed shop.
- Local dev database only unless a production `DATABASE_URL` or `METRICS_TOKEN` is available.

What Codex cannot see directly right now:

- Shopify App Store listing views.
- App Store install-button clicks.
- Shopify Partner Dashboard app analytics.
- GA4 or Meta Pixel events for listing views and installs.
- Render production database counts across all shops, unless the production `DATABASE_URL` is available in the local environment, through a connected Render/DB tool, or through the secured `/internal/metrics` route.

Required tracking setup:

1. In Shopify Partner Dashboard, add GA4 or Meta Pixel tracking to the app listing.
2. In GA4, configure the Measurement Protocol API secret so Shopify can send server-side install events.
3. Set `METRICS_TOKEN` in production so `/internal/metrics?days=30` can be read securely.
4. Check Partner Dashboard app analytics daily for installs, uninstalls, revenue, and reviews.
5. Open `/app/metrics` from the embedded app after install to see shop-scoped activation.
6. Use `npm run metrics:launch -- 30` locally when connected to the target database, or call `/internal/metrics` with the bearer token, to measure install-to-activation across all shops.

## Reading app-owned metrics

Production HTTP:

```bash
curl -H "Authorization: Bearer $METRICS_TOKEN" "https://profit-guard-xzku.onrender.com/internal/metrics?days=30"
```

Embedded app:

```text
https://profit-guard-xzku.onrender.com/app/metrics?days=30
```

Local/DB script:

```bash
npm run metrics:launch -- 30
```

Current interpretation:

- If there are no Partner Dashboard installs and the app is still limited visibility, the pace problem is traffic, not necessarily product demand.
- If there are installs but no `AuditRun` rows, the pace problem is activation/onboarding.
- If there are scans but no replies or conversions, the pace problem is offer, trust, pricing, or follow-up.

## Production read - 2026-07-02

Source: `npm run metrics:internal -- 30` against `https://profit-guard-xzku.onrender.com/internal/metrics?days=30`.

Production health:

- Status: green.
- Commit: `d949576894159e13ca175170561bfdcb9d6f2331`.

App-owned 30-day metrics:

| Metric | Count |
| --- | ---: |
| Public page views | 128 |
| App opens | 3 |
| Scan started | 1 |
| Scan completed | 1 |
| Scan failed | 0 |
| Billing approval requests | 0 |
| Active subscriptions | 0 |
| App uninstalls | 0 |
| Cost template downloads | 0 |
| Findings exports | 0 |
| Active findings | 36 |
| Resolved findings | 0 |

Installed-session shops:

- `profit-guard-putjxynn.myshopify.com`: test/dev-style shop with scans.
- `xbbf0y-vp.myshopify.com`: installed-session record, no scan in the latest audit list.

Interpretation:

- Do not count the 2 installed-session shops as proven buyer traction yet. There is no billing approval request, active subscription, review, export, or merchant reply tied to them.
- The app is receiving public traffic, but the current leak is `public_page_view -> install/app_open -> billing/trial`.
- The first product proof exists: one recent scan checked 29 variants and found 1 loss item, 3 low-margin items, and $5,904 inventory risk.
- No UTM attribution is appearing in app-owned events yet. That means App Store listing click/install attribution still depends on Shopify Partner Dashboard + GA4/Meta, not the internal app endpoint.

Meta Events Manager read - 2026-07-02:

- Dataset: `Margin Sentinel`.
- Website: `apps.shopify.com`.
- Integrations: Meta Pixel + Conversions API.
- Events visible:
  - `ViewContent`: 3, Meta Pixel, last received about 1 hour ago.
  - `PageView`: 3, Meta Pixel, last received about 1 hour ago.
  - `AddToCart`: 2, Conversions API, event match quality 4.4/10, last received about 17 hours ago.

Tracking gaps to close:

1. Mark key GA4/Meta events around App Store listing view, Add App click, app open, first scan completed, and trial started.
2. Improve Meta event match quality where allowed by Shopify listing tracking. Do not add personal data manually; rely on Shopify/Meta-supported matching.
3. Keep outbound UTM links consistent, but do not expect UTM values inside app-owned events unless the App Store preserves them through install.
4. Add a daily row to the metrics checklist before outreach: category page rank, Meta `AddToCart`, app opens, scan completed, billing approval requests, replies.
