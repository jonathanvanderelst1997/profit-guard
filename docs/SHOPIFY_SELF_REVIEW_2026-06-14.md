# Shopify App Store self-review - 2026-06-14

Source checked: https://shopify.dev/docs/apps/launch/app-store-review/app-store-ai-self-review-requirements

## Summary

- Likely passing locally: 22
- Needs review before submission: 4
- Likely failing locally: 0
- Groups skipped as not applicable: Online store theme apps, payment apps, payment facilitator, purchase options, product sourcing, checkout customization, sales channel, post-purchase, mobile app builders, donation apps.

## Likely passing signals

- Embedded Shopify app with Shopify app framework authentication and App Bridge script in `app/root.tsx`.
- Uses Shopify Admin GraphQL through authenticated app routes.
- Minimal scopes: `read_products,read_inventory`.
- No external checkout, payment gateway, lending, marketplace, POS, theme install, buyer charge, shipping, or refund-processing logic.
- Billing path uses Shopify Billing API mutation `appSubscriptionCreate`.
- Plan changes can be initiated in-app from `/app/pricing`.
- Public privacy, terms, refund, and support pages exist.
- Mandatory privacy/uninstall webhooks exist and authenticate Shopify webhooks.
- App is read-only for merchant product pricing: it calculates and exports, but does not automatically change product prices.

## Needs review before submission

### Billing approval flow

The app uses Shopify Billing API, but the real production approval/decline/reinstall loop must be tested in Shopify Admin after Render deploy. Verify Starter and Growth subscriptions can be approved, declined, cancelled, and reselected without manual support.

### Production deploy freshness

Render is healthy, but it has not yet deployed the latest GitHub commit at the time of this review. The new `/app/import/template` route still returns 404 on production until a Render deploy is triggered.

### Real App Store screenshots

Marketing mockups exist, but Shopify submission should use real embedded Shopify Admin screenshots from the production app after the latest deploy.

### Support/contact details

Set the final `SUPPORT_EMAIL`, App Store support email, privacy contact, and billing contact before submission. The public Support page will show the configured support email when the production environment variable exists.

## Submission positioning

Submit as **Margin Sentinel**, not Profit Guard. Position it as a catalog gross-margin guardrail:

- finds losing and low-margin variants;
- shows inventory dollars at risk;
- imports supplier costs by variant ID, inventory item ID, or SKU;
- exports a fix list;
- never changes prices automatically.

Avoid claims about true net profit, ad spend, shipping, fees, taxes, refunds, accounting, or automated pricing until those features exist.

