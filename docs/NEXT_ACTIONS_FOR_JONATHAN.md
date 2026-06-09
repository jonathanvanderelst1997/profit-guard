# Exact next actions

Copy the v4 files over the current app folder, then run:

```bash
npm install
npm run setup
npm test
npm run dev
```

In Shopify Admin:

1. Open Profit Guard.
2. Click **Run profit scan**.
3. Open **Import supplier costs** and upload `mock/supplier-costs.csv`.
4. Tick **Save imported costs for future scans**.
5. Go back to dashboard and run scan again.
6. Open **Download findings CSV**.
7. Open **Set weekly alerts**.
8. Open **Pricing**.
9. Open **Merchant setup**.

If the old screen still appears, the old dev preview is still running. Stop the terminal and start `npm run dev` again from the v4 folder.
