# Live and marketing plan

## Current state

Margin Sentinel is close to beta-ready. The core product now has:

- read-only catalog margin scan;
- Shopify unit cost and supplier CSV cost support;
- missing-cost, loss, and low-margin detection;
- suggested minimum price;
- cost source labels;
- supplier import history;
- inventory dollars at risk;
- supplier cost-change what-if scenarios;
- CSV export;
- weekly alert infrastructure;
- privacy, terms, refund, support, pricing, and onboarding pages;
- automated tests, typecheck, production build, Prisma migrations, and Shopify config validation.

## What Codex can do end-to-end

- Build remaining product features.
- Update code, migrations, tests, and docs.
- Prepare App Store copy, screenshot captions, reviewer script, support macros, launch emails, and outreach lists.
- Run local release checks.
- Commit and push to GitHub.
- Prepare production environment instructions for the chosen host.
- Draft marketing posts, help articles, cold emails, agency pitches, and launch announcements.

## What still needs Jonathan/account action

- Choose and pay for production hosting if no free tier is enough.
- Create or connect the production PostgreSQL database.
- Set production secrets in the hosting dashboard.
- Set the real Shopify production app URL in the Partner Dashboard.
- Run/approve Shopify app deploy from the logged-in Partner account.
- Verify email sending domain if weekly alerts are enabled.
- Capture real embedded Shopify Admin screenshots from the production install.
- Submit the Shopify App Store listing from the Partner Dashboard.
- Approve any paid ads or paid outreach tools.

## Cheapest live path

1. Use a free or low-cost host that supports Node.js and scheduled jobs.
2. Use hosted PostgreSQL with a free starter tier where possible.
3. Set production env vars:
   - `SHOPIFY_API_KEY`
   - `SHOPIFY_API_SECRET`
   - `SHOPIFY_APP_URL`
   - `SCOPES=read_products,read_inventory`
   - `DATABASE_URL`
   - `SUPPORT_EMAIL`
   - `RESEND_API_KEY`
   - `ALERTS_FROM_EMAIL`
4. Deploy with:

```bash
npm install
npm run setup:prod
npm run build:prod
npm run start:prod
```

5. Run:

```bash
npx shopify app config validate
shopify app deploy
```

6. Install on the dev store, run a scan, import costs, export CSV, and trigger one test alert.
7. Capture screenshots and submit to Shopify review.

## Marketing launch sequence

1. Beta outreach first: 20 Shopify stores or agencies with physical catalogs.
2. Offer: "Free Growth plan for 60 days if you run one margin scan and give feedback."
3. Lead message: "Find which SKUs are below target margin and how much inventory money is at risk."
4. First content pieces:
   - "How to find Shopify products selling below your target margin."
   - "Supplier cost changed? Check inventory dollars at risk before your next promo."
   - "Why clean product costs matter before full profit analytics."
5. App Store screenshots:
   - Action Center with inventory risk.
   - Findings table sorted by inventory risk.
   - Supplier CSV preview and import history.
   - Weekly alert summary.
   - Read-only trust cue.

## Next feature with the highest paid upside

Resolved/ignored finding states: merchants need a workflow for recurring issues after the first scan. This makes the product stickier for teams and agencies because it turns Margin Sentinel from a one-time scanner into a weekly margin operations queue.
