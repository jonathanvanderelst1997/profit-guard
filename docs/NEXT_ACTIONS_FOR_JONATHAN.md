# Exact next actions for Jonathan

These are the account-dependent steps Codex cannot safely complete without the final accounts, production URL, support contact, and approved plugin/account connections. The fuller checklist is `docs/FINAL_OWNER_STEPS.md`.

## 1. Choose production basics

- Choose the final production domain.
- Choose the support email and set `SUPPORT_EMAIL`.
- Choose hosting and managed PostgreSQL.
- Set `SHOPIFY_APP_URL` to the hosted app URL.

## 2. Configure Shopify

1. Replace `YOUR_SHOPIFY_CLIENT_ID` in `shopify.app.toml`.
2. Replace the placeholder production URL in `shopify.app.toml`.
3. Run `shopify app config link`.
4. Configure Shopify App Pricing for Free, Starter, and Growth.
5. Run `shopify app deploy`.

## 3. Verify public URLs

After deploy, open:

- `/privacy`
- `/terms`
- `/refund`
- `/support`

Use those hosted links in the Shopify App Store submission.

## 4. Review flow in Shopify Admin

1. Open Margin Sentinel.
2. Click **Run profit scan**.
3. Open **Import supplier costs**, download the template, and upload a cost CSV.
4. Tick **Save imported costs for future scans**.
5. Go back to dashboard and run scan again.
6. Open **Download findings CSV**.
7. Open **Alerts**.
8. Open **Pricing**.
9. Open **What-if** and run supplier cost +8%.
10. Open **Setup**.

## 5. Submit when ready

Submit only after:

- production install works;
- privacy/support URLs work;
- billing works;
- screenshots and screencast are ready;
- reviewer instructions are included.
