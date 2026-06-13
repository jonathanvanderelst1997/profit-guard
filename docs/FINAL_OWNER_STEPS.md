# Final owner steps

These are the remaining steps that require Jonathan's account access, billing approval, DNS access, or plugin connections. Codex can guide each click, prepare text, verify outputs, and continue after each step.

## 1. Pick hosting and database

1. Choose a Node.js host for the web app.
   - Shopify explains that `shopify app deploy` deploys app configuration, not the hosted web app: https://shopify.dev/docs/api/shopify-cli/app/app-deploy
   - Shopify deployment guide: https://shopify.dev/docs/apps/launch/deployment/deploy-to-hosting-service
   - Render Shopify guide option: https://render.com/docs/deploy-shopify-app
2. Create a production PostgreSQL database.
3. Copy the production `DATABASE_URL`.

## 2. Set production environment variables

Set these in the hosting dashboard:

- `SHOPIFY_API_KEY`
- `SHOPIFY_API_SECRET`
- `SHOPIFY_APP_URL`
- `SCOPES=read_products,read_inventory`
- `DATABASE_URL`
- `SUPPORT_EMAIL`
- `RESEND_API_KEY`
- `ALERTS_FROM_EMAIL`

## 3. Deploy the web app

Use these production commands on the host:

```bash
npm install
npm run setup:prod
npm run build:prod
npm run start:prod
```

## 4. Configure Shopify Partner app

1. Open Shopify Partners: https://partners.shopify.com/
2. Open the Margin Sentinel app.
3. Set the production app URL to `SHOPIFY_APP_URL`.
4. Confirm redirect/callback URLs match the hosted app.
5. Run locally:

```bash
npx shopify app config validate
shopify app deploy
```

Shopify CLI deploy docs: https://shopify.dev/docs/api/shopify-cli/app/app-deploy

## 5. Configure Shopify App Pricing

1. Open app pricing in Partner Dashboard.
2. Add Free, Starter, and Growth plans.
3. Match current pricing copy:
   - Free: scan up to 100 variants.
   - Starter: $15/month.
   - Growth: $39/month.
4. Official pricing docs: https://shopify.dev/docs/apps/launch/billing/shopify-app-pricing

## 6. Verify alert email

1. Open Resend domains: https://resend.com/docs/dashboard/domains/introduction
2. Add and verify the sending domain.
3. Add required DNS records.
4. Set `RESEND_API_KEY` and `ALERTS_FROM_EMAIL`.

## 7. QA production install

1. Install the production app on the dev store.
2. Open Dashboard.
3. Run profit scan.
4. Open Import costs and upload a supplier CSV.
5. Save imported costs.
6. Run scan again.
7. Open What-if and run supplier cost +8%.
8. Export CSV.
9. Save alert settings.
10. Check public pages:
    - `/privacy`
    - `/terms`
    - `/refund`
    - `/support`

## 8. Capture App Store assets

1. Capture 3-5 real embedded Shopify Admin screenshots.
2. Record a short reviewer screencast.
3. Use:
   - `docs/APP_STORE_LISTING.md`
   - `docs/APP_STORE_SUBMISSION_PACK.md`
   - `docs/REVIEWER_DEMO_SCRIPT.md`

## 9. Submit to Shopify App Store

1. Read requirements: https://shopify.dev/docs/apps/launch/shopify-app-store/app-store-requirements
2. Fill listing copy from `docs/APP_STORE_LISTING.md`.
3. Add privacy/terms/refund/support hosted URLs.
4. Add screenshots and reviewer instructions.
5. Submit review.

## 10. Connect marketing plugins for Codex execution

Connect the tools/accounts you want Codex to operate:

- email inbox/sending account for outreach;
- LinkedIn/X/social scheduler if available;
- Browser for production QA and screenshots;
- Shopify for Partner/App Store work where supported;
- GitHub for releases/issues;
- analytics/dashboard tools after launch.

After connection, Codex can prepare recipient lists, personalize messages, draft posts, send approved outreach, log replies, and update the beta tracker.
