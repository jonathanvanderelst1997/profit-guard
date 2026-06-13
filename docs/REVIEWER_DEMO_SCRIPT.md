# Reviewer demo script

Use this script for Shopify review, beta calls, or a short launch screencast.

## Store setup

The current development store includes sample snowboard products. To make the first scan meaningful, keep a mix of unit costs:

- Red Snowboard: price below cost so it appears as a loss.
- Green Snowboard: price above cost but below the target margin.
- The Multi-managed Snowboard: below target margin with inventory risk.
- The Collection Snowboard: Liquid: healthy margin.
- The remaining variants have unit costs so the reviewer sees a clean production-like scan with `Missing cost = 0`.

The import flow can use the generated cost template, Shopify variant IDs, inventory item IDs, or SKUs.

## Demo path

1. Open Margin Sentinel from Shopify Admin.
2. Open **Dashboard** and run a profit scan.
3. Point out the Action Center: loss count, low-margin count, margin gap, and inventory dollars at risk.
4. Open the prioritized findings table.
5. Show suggested minimum price and next action.
6. Open **Import costs**.
7. Download the variant cost template or upload a supplier cost CSV.
8. Preview matched rows and margin impact.
9. Save imported costs only if the reviewer wants to test persistence.
10. Return to **Dashboard** and run another scan.
11. Open **What-if** and run supplier cost +8%.
12. Export CSV findings.
13. Open **Alerts** and show weekly alert settings.
14. Open **Pricing** and show the plan limits.
15. Open public Privacy, Terms, Refunds, and Support pages.

## Reviewer message

Margin Sentinel is read-only for Shopify product data. It never changes product prices automatically. Imported supplier costs are stored inside Margin Sentinel so merchants can compare Shopify unit costs against supplier files before taking action.
