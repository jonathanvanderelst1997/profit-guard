# Margin Sentinel Final App Store Ready Notes

Date: 2026-06-14

## Current verdict

Margin Sentinel is close, but I would not submit until the latest commit is deployed and the new media/video are uploaded.

Would Shopify approve today?

Probably not if submitted at this exact moment, because the listing still needs feature media, screenshots, and a screencast URL, and production needs one final deploy after the webhook config fix. After those are done, the app has a realistic approval path.

Score right now: 7/10.

Score after deploy, media upload, and one billing smoke test: 8/10.

## What I fixed/generated

- Added the required webhook subscriptions to `shopify.app.profit-guard.toml`, so the active Shopify config matches the main app config.
- Generated App Store-ready 1600x900 PNG media.
- Generated a 3:45 MP4 reviewer walkthrough.
- Generated YouTube upload instructions.
- Added a reusable asset generator script.

## Files ready for Shopify upload

Feature media:

`/Users/jonathanAP/Documents/profid-guard/marketing/app-store-assets/feature-media-1600x900.png`

Screenshots:

`/Users/jonathanAP/Documents/profid-guard/marketing/app-store-assets/screenshot-1-dashboard.png`

`/Users/jonathanAP/Documents/profid-guard/marketing/app-store-assets/screenshot-2-pricing.png`

`/Users/jonathanAP/Documents/profid-guard/marketing/app-store-assets/screenshot-3-import-what-if.png`

Screencast MP4:

`/Users/jonathanAP/Documents/profid-guard/marketing/app-store-assets/margin-sentinel-reviewer-screencast.mp4`

YouTube upload instructions:

`/Users/jonathanAP/Documents/profid-guard/marketing/app-store-assets/youtube-upload-instructions.md`

Note: Shopify best practices say screenshots should avoid pricing where possible. I generated the Pricing screenshot because it was requested and helps reviewers understand billing. If Shopify flags it, replace it with another product UI screenshot and keep Pricing in the screencast.

## Suggested alt text

Feature media:

`Margin Sentinel read-only margin leak dashboard`

Screenshot 1:

`Dashboard showing margin issues and suggested prices`

Screenshot 2:

`Pricing page with Free Starter and Growth plans`

Screenshot 3:

`Supplier import and cost change what-if workflow`

## YouTube upload

Use:

`/Users/jonathanAP/Documents/profid-guard/marketing/app-store-assets/margin-sentinel-reviewer-screencast.mp4`

Title:

`Margin Sentinel Shopify App Review Walkthrough`

Visibility:

`Unlisted`

Description:

```text
Margin Sentinel is a Shopify embedded app for catalog margin protection.

This reviewer walkthrough shows:
1. App install/open flow
2. Dashboard profit scan
3. Pricing and Shopify billing plans
4. Supplier cost import
5. Cost-change what-if
6. Suggested minimum prices
7. Findings CSV export
8. Weekly alerts and reviewer notes

The app is read-only for product pricing. It reads Shopify product and inventory data, Shopify unit cost, and merchant-imported supplier costs. It does not change prices automatically.
```

## Exact Shopify submission sequence

1. Deploy latest code on Render.

Open:

`https://dashboard.render.com`

Go to the Margin Sentinel web service, then click:

`Manual Deploy` -> `Deploy latest commit`

Wait until deploy is live.

2. Confirm production URLs.

Open:

`https://profit-guard-xzku.onrender.com/healthz`

Expected:

`ok`

Open:

`https://profit-guard-xzku.onrender.com/privacy`

Expected:

Privacy page loads.

3. Check Shopify app configuration.

Open:

`https://partners.shopify.com`

Go to:

`Apps` -> `Margin Sentinel` -> `Configuration`

Confirm:

```text
App URL:
https://profit-guard-xzku.onrender.com

Allowed redirection URLs:
https://profit-guard-xzku.onrender.com/auth/callback
https://profit-guard-xzku.onrender.com/auth/shopify/callback
https://profit-guard-xzku.onrender.com/api/auth/callback
```

4. Upload app listing media.

Go to:

`Apps` -> `Margin Sentinel` -> `Distribution` -> `App Store listing`

Upload in this order:

```text
Feature media:
/Users/jonathanAP/Documents/profid-guard/marketing/app-store-assets/feature-media-1600x900.png

Screenshot 1:
/Users/jonathanAP/Documents/profid-guard/marketing/app-store-assets/screenshot-1-dashboard.png

Screenshot 2:
/Users/jonathanAP/Documents/profid-guard/marketing/app-store-assets/screenshot-2-pricing.png

Screenshot 3:
/Users/jonathanAP/Documents/profid-guard/marketing/app-store-assets/screenshot-3-import-what-if.png
```

5. Upload screencast.

Open YouTube Studio:

`https://studio.youtube.com`

Upload:

`/Users/jonathanAP/Documents/profid-guard/marketing/app-store-assets/margin-sentinel-reviewer-screencast.mp4`

Set visibility to:

`Unlisted`

Copy the YouTube link and paste it in the Shopify screencast URL field.

6. Paste reviewer instructions.

Use this:

```text
Install Margin Sentinel on a development store with products and variants.

1. Open Apps > Margin Sentinel.
2. Click Run profit scan.
3. Review the Action center, issues, inventory risk, and suggested minimum prices.
4. Open Pricing and confirm the Free, Starter, and Growth plan options.
5. Open Import costs. Download the variant cost template or upload a supplier cost CSV using variant_id, inventory_item_id, or sku plus cost.
6. Open What-if and run an 8% supplier cost increase scenario.
7. Open Export to download the saved findings CSV.
8. Open Alerts to review weekly alert settings.

No external credentials are required. The app is read-only for product pricing and does not change Shopify product prices automatically.
```

7. Submit.

After the listing says all required fields are complete, click:

`Submit your app`

## Audit answers

### A. Would Shopify approve this app today?

Not today, because media and screencast are still account-upload tasks, and production should be redeployed after the webhook config update.

After upload/deploy, likely yes if billing approval works in a real install/reinstall test.

### B. What would likely cause rejection?

1. Missing feature media, screenshots, or screencast URL.
2. Production not matching the latest local code.
3. Billing flow not handling approve, decline, downgrade, reinstall, and subscription update cleanly.
4. Weekly alerts being advertised if no email provider/scheduler is configured in production.
5. Support email not configured in Render and Partner Dashboard.
6. Any old tunnel URL left in Shopify Partner Dashboard.

### C. Critical fixes still needed

I fixed the active TOML webhook gap. The remaining critical items require account access:

1. Deploy latest commit on Render.
2. Upload PNG media.
3. Upload MP4 to YouTube and paste the unlisted URL.
4. Smoke-test Starter billing with Shopify billing.
5. Set `SUPPORT_EMAIL` in Render.
6. If weekly alerts are listed as live, configure the email provider and scheduler. Otherwise phrase alerts as available only after setup.

### D. Missing features before merchants realistically pay $15/month

Merchants can pay for this if they have enough SKUs and cost cleanup pain, but the product needs sharper retention features:

1. Fresh scheduled weekly scan before sending weekly alerts.
2. Resolve/snooze states for findings.
3. Product admin deep links from each finding.
4. Scan history and trend line.
5. Cost management table for imported supplier costs.
6. Better first-run onboarding with sample CSV download and success checklist.
7. Optional agency/export workflow for teams.

Do not build full net-profit analytics first. Competitors already own that. Win the narrow job: catalog margin leak detection.

### E. Score

Approval readiness: 7/10 now, 8/10 after deploy/media/billing smoke test.

Commercial readiness: 6.5/10 now. Strong enough for beta and early paid users, not yet broad self-serve scale.

## Competitor comparison

Lifetimely, BeProfit, TrueProfit, and Profit Calc are much broader profit analytics suites. They include order-level net profit, ad spend integrations, P&L, LTV/cohorts, attribution, custom reports, and larger reporting workflows.

Margin Sentinel is narrower:

- Better for merchants who want a fast SKU margin cleanup tool.
- Weaker for merchants expecting full accounting, ad spend sync, LTV, tax, shipping, transaction fees, and P&L.
- The $15 price is credible because the app is simpler and cheaper than full profit suites.

Positioning:

`Find product margin leaks before they become a reporting problem.`

Do not position as:

`Full profit analytics replacement.`

## Brutally honest final answer

Can Margin Sentinel realistically acquire paying merchants at $15/month today?

Yes, but only in a narrow segment: merchants with 100+ variants, messy supplier costs, manual spreadsheets, or low-margin catalog risk. It is not yet strong enough to convince merchants who want a complete net-profit dashboard like TrueProfit, Lifetimely, BeProfit, or Profit Calc.

The fastest path to money is not adding every competitor feature. The fastest path is:

1. Launch with the current narrow promise.
2. Get 5-10 beta stores.
3. Add resolve/snooze, fresh weekly scans, and product admin links.
4. Sell it as a margin operations queue, not an accounting suite.

I believe in it as a small paid Shopify app if it stays focused.
