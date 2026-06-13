# Shopify self-review notes

Review date: 2026-06-13.

This is a local pre-review against Shopify's public App Store requirements and AI self-review guidance. It does not replace Shopify's official review.

## Likely passing from code

- **Minimal scopes:** app requests `read_products` and `read_inventory` only.
- **GraphQL Admin API:** product and inventory data are read with GraphQL; no REST Admin API dependency was found.
- **No manual shop-domain install prompt:** public and auth routes no longer ask merchants to type a `myshopify.com` domain.
- **OAuth-first install path:** `/auth/login?shop=...` redirects into Shopify OAuth through the Shopify app framework.
- **Latest App Bridge script:** root document loads `https://cdn.shopify.com/shopifycloud/app-bridge.js` with `shopify-api-key` metadata in Shopify app context.
- **Read-only product behavior:** the app scans products, imports internal supplier costs, exports findings, and does not automatically edit prices, inventory, orders, themes, checkout, or customer records.
- **Privacy webhooks:** uninstall, shop redact, customer data request, and customer redact routes exist and authenticate Shopify webhooks.
- **Billing path:** paid plan fallback uses Shopify Billing API mutation `appSubscriptionCreate`; no external payment processor was found.

## Needs account/dashboard review

- **Hosted URL and TLS:** requires final hosted `https://` URL from Render or another host.
- **Partner Dashboard URLs:** update app URL and redirect URLs after deployment.
- **Support contact:** set `SUPPORT_EMAIL` or final listing support contact before public review.
- **Managed pricing vs Billing API:** choose Shopify App Pricing for public listing or keep Billing API fallback aligned with final plan names.
- **Real embedded screenshots:** mock screenshots exist, but final review should include real embedded Shopify Admin screenshots.
- **Reviewer screencast:** still needs to be recorded from the installed production app.

## Not applicable in current code

- Checkout, post-purchase, payment gateway, sales channel, POS, donation, marketplace, theme app extension, and mobile app builder requirements were not triggered by the codebase.

## Final review posture

Profit Guard is strongest as a focused catalog margin scanner. The review story should emphasize: minimal scopes, read-only scanning, no automatic price changes, clear uninstall cleanup, Shopify billing, and merchant-controlled action.
