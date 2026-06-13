# Reviewer demo script

Use this script for Shopify review, beta calls, or a short launch screencast.

## Store setup

The current development store includes sample snowboard products. To make the first scan meaningful, keep a mix of unit costs:

- Red Snowboard: price below cost so it appears as a loss.
- Green Snowboard: price above cost but below the target margin.
- The Collection Snowboard: Liquid: healthy margin.
- Several variants with no unit cost so missing-cost findings remain visible.

The bundled CSV `mock/supplier-costs.csv` uses SKUs from the development store.

## Demo path

1. Open Margin Sentinel from Shopify Admin.
2. Open **Dashboard** and run a profit scan.
3. Point out the Action Center: loss count, low-margin count, missing-cost count, and margin gap.
4. Open the prioritized findings table.
5. Show suggested minimum price and next action.
6. Open **Import costs**.
7. Upload `mock/supplier-costs.csv`.
8. Preview matched SKUs and margin impact.
9. Save imported costs only if the reviewer wants to test persistence.
10. Return to **Dashboard** and run another scan.
11. Open **What-if** and run supplier cost +8%.
12. Export CSV findings.
13. Open **Alerts** and show weekly alert settings.
14. Open **Pricing** and show the plan limits.
15. Open public Privacy, Terms, Refunds, and Support pages.

## Reviewer message

Margin Sentinel is read-only for Shopify product data. It never changes product prices automatically. Imported supplier costs are stored inside Margin Sentinel so merchants can compare Shopify unit costs against supplier files before taking action.
