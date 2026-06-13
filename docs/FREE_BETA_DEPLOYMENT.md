# Free beta deployment

Research date: 2026-06-13.

Best no-cost beta path:

- Database: Neon Free Postgres.
- Web app: Render Free web service.
- Shopify: existing dev app / Partner Dashboard app.

This is suitable for a closed beta, not serious production traffic. Render states that free instances have limitations and should not be used for production apps. Neon Free is currently listed as $0 with monthly compute/storage limits and no credit card requirement.

Sources:

- Render free docs: https://render.com/docs/free
- Render pricing: https://render.com/pricing
- Neon pricing: https://neon.com/pricing
- Railway pricing, for comparison: https://railway.com/pricing
- Fly.io pricing, for comparison: https://fly.io/docs/about/pricing/

## 1. Create a free Postgres database

1. Create a Neon project.
2. Copy the pooled or regular connection string.
3. Use it as `DATABASE_URL`.
4. Confirm the URL starts with `postgresql://`.

## 2. Create the Render web service

Use the `render.yaml` blueprint in the repository root.

Render environment variables to fill manually:

- `DATABASE_URL`
- `SHOPIFY_API_KEY`
- `SHOPIFY_API_SECRET`
- `SHOPIFY_APP_URL`
- `SUPPORT_EMAIL`
- `BETA_SIGNUP_URL` if you want `/beta` to link to a form instead of email
- `RESEND_API_KEY` if weekly emails are enabled
- `ALERTS_FROM_EMAIL` if weekly emails are enabled

The blueprint sets:

- `buildCommand`: `npm ci && npm run build:prod`
- `startCommand`: `npm run start:prod`
- `healthCheckPath`: `/healthz`

## 3. Update Shopify app URLs

After Render gives you a hosted URL:

1. Set `SHOPIFY_APP_URL` to that URL.
2. In Shopify app config, set the app URL to the same URL.
3. Add redirect URLs:
   - `https://YOUR_RENDER_URL/auth/callback`
   - `https://YOUR_RENDER_URL/auth/shopify/callback`
   - `https://YOUR_RENDER_URL/api/auth/callback`
4. Update webhook endpoints if Shopify does not infer them from app config.

## 4. Verify public review URLs

Open:

- `https://YOUR_RENDER_URL/healthz`
- `https://YOUR_RENDER_URL/beta`
- `https://YOUR_RENDER_URL/privacy`
- `https://YOUR_RENDER_URL/terms`
- `https://YOUR_RENDER_URL/refund`
- `https://YOUR_RENDER_URL/support`

## 5. Verify Shopify flow

1. Install app on the dev store.
2. Open embedded app in Shopify Admin.
3. Run scan.
4. Import `mock/supplier-costs.csv`.
5. Save imported costs.
6. Run scan again.
7. Export findings.
8. Save alert settings.
9. Open pricing.

## 6. Beta warning

Render Free web services may sleep, so the first app load can be slow. That is acceptable for closed beta validation, but upgrade compute before public launch or serious merchant use.
