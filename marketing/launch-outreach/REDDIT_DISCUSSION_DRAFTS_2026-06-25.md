# Reddit discussion drafts - 2026-06-25

Reddit should be handled as research and discussion first. Do not post app links in the opening post.

Do not post without exact approval and subreddit rule check.

## Discussion Draft A

Potential subreddits:

- `r/shopify`
- `r/ecommerce`

Title:

```text
How do you check supplier cost changes before bulk-updating Shopify prices?
```

Body:

```text
Curious how other Shopify merchants handle this.

When suppliers send updated CSVs, the import itself is only part of the problem. The bigger issue is knowing which SKUs became margin risks before changing product data in bulk.

The workflow I would use is:

1. Export Shopify variants with SKU, barcode, variant ID, price, inventory, and unit cost.
2. Normalize supplier files into one CSV.
3. Match supplier rows to Shopify variants.
4. Calculate current margin and target margin gap.
5. Prioritize items where there is inventory on hand.
6. Only then decide which costs or prices to update.

For stores with a few hundred or a few thousand variants, are you doing this in spreadsheets, inventory tools, accounting tools, or a Shopify app?

The thing I am most interested in: how do you avoid missing products where cost data is blank or supplier cost changed quietly?
```

If someone asks for a tool:

```text
Full disclosure: I built a read-only Shopify app for this called Margin Sentinel. It scans Shopify prices, unit costs, imported supplier costs, target margin, and inventory quantity, then exports a fix list. It does not change prices automatically.
```

Approval phrase:

`Approve Reddit Discussion Draft A.`

