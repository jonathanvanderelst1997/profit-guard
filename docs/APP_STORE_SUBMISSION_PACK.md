# Shopify App Store submission pack

## Required before submission
- Final app name everywhere: Margin Sentinel.
- Do not submit under the old Profit Guard name because another Shopify App Store app already uses that exact name.
- Hosted Privacy Policy URL: `https://YOUR_DOMAIN/privacy`.
- Hosted Terms of Service URL: `https://YOUR_DOMAIN/terms`.
- Hosted Refund Policy URL: `https://YOUR_DOMAIN/refund`.
- Hosted Support URL: `https://YOUR_DOMAIN/support`.
- Support email configured with `SUPPORT_EMAIL`.
- 3-5 screenshots from real embedded app UI.
- 1 short screencast for Shopify reviewer.
- Reviewer instructions: install app, run scan, import CSV, run what-if, export CSV, test pricing.
- Local self-review notes: `docs/SHOPIFY_SELF_REVIEW_2026-06-13.md`.
- Reviewer/demo script: `docs/REVIEWER_DEMO_SCRIPT.md`.

## Review-safe positioning
Margin Sentinel is a SKU-level margin leak scanner. It finds missing cost variants, low-margin SKUs, inventory risk, and what-if margin scenarios. It is read-only and does not automatically change prices.

## Avoid these claims
- Guaranteed profit increase.
- Exact savings without proof.
- Full net-profit accounting unless ad spend, fees, refunds, and orders are implemented.

## Suggested tagline
Find missing costs, low-margin SKUs, and margin leaks before they eat profit.

## ASO keywords
Shopify profit tracker, COGS tracker, margin calculator, SKU profit, product margin, missing costs, discount margin, supplier cost, inventory risk.

## App Store copy direction
Do not position Margin Sentinel as another profit dashboard. Position it as an exception list for SKU-level margin leaks: missing costs, low-margin SKUs, inventory risk, and what-if margin scenarios.

## Reviewer instructions draft
Use `docs/REVIEWER_DEMO_SCRIPT.md` as the canonical reviewer walkthrough.

Short version:

1. Install Margin Sentinel on the review store.
2. Open the embedded app from Shopify Admin.
3. Run a profit scan from the dashboard.
4. Open Import costs, download the variant cost template, then upload a cost CSV.
5. Tick save imported costs, then submit.
6. Return to the dashboard and run the scan again.
7. Review Action Center, findings, inventory risk, suggested minimum prices, and export CSV.
8. Open What-if and run supplier cost +8%.
9. Open Alerts and save a test alert email. If email provider keys are not configured in review mode, the app shows a clear skipped-provider message.
10. Open Pricing and confirm plan gates are visible.

## Screenshot plan
1. Missing cost variants.
2. Low-margin SKUs.
3. Inventory risk.
4. What-if margin scenarios.
5. Top 5 margin leaks weekly email.

No-cost marketing mockups are available in `marketing/screenshots/`. Replace or supplement them with real embedded Shopify Admin screenshots before final App Store submission.
