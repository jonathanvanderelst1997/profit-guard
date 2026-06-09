# Production deployment checklist

## 1. Shopify app config
- Replace `YOUR_SHOPIFY_CLIENT_ID` in `shopify.app.toml`.
- Replace `https://your-production-app.example.com` with your real hosted URL.
- Run `shopify app config link`.
- Run `shopify app deploy` after the production URL is correct.

## 2. Database
- Use PostgreSQL for production.
- Update `prisma/schema.prisma` provider from `sqlite` to `postgresql` before public deploy.
- Set `DATABASE_URL` in hosting environment.
- Run `npx prisma generate` and `npx prisma db push` or migrations.

## 3. Secrets
Set these environment variables:
- `SHOPIFY_API_KEY`
- `SHOPIFY_API_SECRET`
- `SHOPIFY_APP_URL`
- `SCOPES=read_products,read_inventory`
- `DATABASE_URL`
- `RESEND_API_KEY` if alerts are enabled
- `ALERTS_FROM_EMAIL`

## 4. Webhooks
Verify these are configured and return 200:
- `app/uninstalled`
- `shop/redact`
- `customers/data_request`
- `customers/redact`
- `app_subscriptions/update`

## 5. Billing
- For closed beta: Billing API fallback can be used.
- For public App Store: configure Shopify App Pricing, then keep in-app feature gating.
- Test upgrade, downgrade, cancel, reinstall.

## 6. QA commands
Run:
```bash
npm install
npm run setup
npm test
npm run typecheck
npm run build
```

## 7. Alert cron
Run weekly through your host scheduler:
```bash
npx tsx scripts/run-weekly-alerts.ts
```
