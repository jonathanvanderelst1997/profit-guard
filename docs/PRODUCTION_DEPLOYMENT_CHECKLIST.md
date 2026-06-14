# Production deployment checklist

## 1. Shopify app config
- Replace `YOUR_SHOPIFY_CLIENT_ID` in `shopify.app.toml`.
- Replace `https://your-production-app.example.com` with your real hosted URL.
- Run `shopify app config link`.
- Run `shopify app deploy` after the production URL is correct.

## 2. Database
- Use PostgreSQL for production.
- Use `prisma/postgres/schema.prisma` for beta/production deploys.
- Set `DATABASE_URL` in hosting environment.
- Run `npm run setup:prod` during production setup, or use `npm run start:prod` as the deploy start command.
- Keep `prisma db push` for local throwaway databases only.

## 3. Secrets
Set these environment variables:
- `SHOPIFY_API_KEY`
- `SHOPIFY_API_SECRET`
- `SHOPIFY_APP_URL`
- `SCOPES=read_products,read_inventory`
- `DATABASE_URL`
- `SHOPIFY_BILLING_TEST=false` for paid public launch. Use `true` only while approving test charges on a development store.
- `SUPPORT_EMAIL`
- `RESEND_API_KEY` if alerts are enabled
- `ALERTS_FROM_EMAIL`

## 4. Public review URLs
After deployment, use these hosted URLs in Shopify App Store review:
- `https://YOUR_DOMAIN/privacy`
- `https://YOUR_DOMAIN/terms`
- `https://YOUR_DOMAIN/refund`
- `https://YOUR_DOMAIN/support`

Before submission, review these pages for final legal/business entity wording and confirm `SUPPORT_EMAIL` is set.

## 5. Webhooks
Verify these are configured and return 200:
- `app/uninstalled`
- `shop/redact`
- `customers/data_request`
- `customers/redact`
- `app_subscriptions/update`

## 6. Billing
- For paid public launch: verify Shopify Billing API or Shopify App Pricing approval flow before submission.
- For public App Store: configure Shopify App Pricing, then keep in-app feature gating.
- For development-store approval testing on a production host, temporarily set `SHOPIFY_BILLING_TEST=true`.
- Test upgrade, downgrade, cancel, reinstall.

## 7. QA commands
Run:
```bash
npm install
npm run setup
npx prisma migrate status
npm test
npm run typecheck
npm run build
```

## 8. Alert cron
Run weekly through your host scheduler:
```bash
npx tsx scripts/run-weekly-alerts.ts
```
