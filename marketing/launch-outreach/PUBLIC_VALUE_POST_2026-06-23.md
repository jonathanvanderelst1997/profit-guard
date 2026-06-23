# Public value post - 2026-06-23

Use this on LinkedIn, Shopify Community, or Reddit. Do not post it as a drive-by ad. It should either be posted from Jonathan's own account or used as a helpful answer where margin/cost/pricing cleanup is already being discussed.

## LinkedIn version

```text
One practical Shopify catalog check I keep coming back to:

Do not only look at store-average margin.

Average margin can hide small SKUs that lose money or larger inventory positions that sit below target margin.

A better first pass:

1. Check whether every variant has a SKU.
2. Add Shopify unit cost where possible.
3. Keep supplier costs in a CSV if costs live outside Shopify.
4. Compare each variant against your target margin.
5. Multiply the margin gap by inventory quantity to see what matters first.

The useful output is not a giant report. It is a short fix list:
- this SKU is losing money
- this one is below target
- this one has no cost data
- this one has the biggest inventory risk

That is the workflow I built Margin Sentinel around:
https://apps.shopify.com/margin-sentinel
```

## Shopify Community / Reddit answer version

```text
One manual way to start is:

1. Export products/variants from Shopify.
2. Make sure variants have SKUs.
3. Add unit cost in Shopify where possible.
4. If supplier costs live outside Shopify, match them by SKU from a CSV.
5. Calculate margin at variant level, not only store average.
6. Prioritize issues by margin gap x inventory quantity.

That last step matters because a low-margin SKU with no inventory is less urgent than a slightly-below-target SKU with a lot of stock.

I built Margin Sentinel for this workflow. It scans Shopify variants, supplier CSV costs, missing costs, low margins, loss-making SKUs, and exports a fix list. It is read-only and does not change prices automatically:

https://apps.shopify.com/margin-sentinel
```
