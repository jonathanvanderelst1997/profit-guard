# Shopify App Store submission pack

## Required before submission
- Final app name everywhere: Profit Guard or renamed brand.
- Hosted Privacy Policy URL: `https://YOUR_DOMAIN/privacy`.
- Hosted Terms of Service URL: `https://YOUR_DOMAIN/terms`.
- Hosted Refund Policy URL: `https://YOUR_DOMAIN/refund`.
- Hosted Support URL: `https://YOUR_DOMAIN/support`.
- Support email configured with `SUPPORT_EMAIL`.
- 3-5 screenshots from real embedded app UI.
- 1 short screencast for Shopify reviewer.
- Reviewer instructions: install app, run scan, import CSV, export CSV, test pricing.

## Review-safe positioning
Profit Guard scans product-level gross margin. It is read-only and does not automatically change prices.

## Avoid these claims
- Guaranteed profit increase.
- Exact savings without proof.
- Full net-profit accounting unless ad spend, fees, refunds, and orders are implemented.

## Suggested tagline
Find products with risky margins before they become expensive mistakes.

## Reviewer instructions draft
1. Install Profit Guard on the review store.
2. Open the embedded app from Shopify Admin.
3. Run a profit scan from the dashboard.
4. Open Import costs and upload the sample CSV from `mock/supplier-costs.csv`.
5. Tick save imported costs, then submit.
6. Return to the dashboard and run the scan again.
7. Review Action Center, findings, suggested minimum prices, and export CSV.
8. Open Alerts and save a test alert email. If email provider keys are not configured in review mode, the app should show a clear skipped-provider message.
9. Open Pricing and confirm plan gates are visible.

## Screenshot plan
1. Dashboard Action Center.
2. Findings table with suggested minimum price.
3. Supplier CSV import preview.
4. Alerts page.
5. Pricing page.

No-cost marketing mockups are available in `marketing/screenshots/`. Replace or supplement them with real embedded Shopify Admin screenshots before final App Store submission.
