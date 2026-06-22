# Community and PR pack

## Shopify Community answer pattern
Use only when the merchant asks about product costs, margin, supplier costs, inventory risk, or pricing cleanup.

Helpful answer first:
1. Explain the manual way to check the issue in Shopify.
2. Mention that cost data must be clean.
3. Suggest exporting products/variants or using Shopify unit costs.
4. Only then mention Margin Sentinel as an option.

Template:
One practical way to start is to check whether every variant has a reliable unit cost, then compare price minus cost against your minimum gross margin target. If supplier costs are in a separate spreadsheet, match them by SKU or variant ID before making pricing decisions.

I built Margin Sentinel for this exact workflow. It scans Shopify variants, flags missing costs, low margins, and loss-making SKUs, and exports a fix list. It is read-only and does not change prices automatically:
https://apps.shopify.com/margin-sentinel

## Reddit value-first post
Title: How do you catch Shopify SKUs that are quietly below target margin?

Post:
I recently launched a small Shopify app around this problem, but I am mostly curious how operators handle it today.

For stores with 100+ SKUs:
- do you trust Shopify unit cost?
- keep supplier costs in CSV/ERP?
- check margins before promos?
- model supplier increases before reorders?

The issue I keep seeing is that broad sales reports hide SKU-level problems. A few variants can be losing money while the blended margin looks fine.

What is your current workflow?

## Press release
Title: Margin Sentinel launches on the Shopify App Store to help merchants find SKU-level margin leaks

Margin Sentinel, a new Shopify app for catalog margin management, is now available on the Shopify App Store. The app helps merchants scan product variants for missing costs, low margins, loss-making products, and inventory value exposed to margin gaps.

Built for Shopify merchants with physical products and supplier cost changes, Margin Sentinel combines Shopify product data, unit costs, and supplier CSV imports into a prioritized fix list. Merchants can also run cost-change what-if scenarios and export findings for pricing or operations review.

Margin Sentinel is read-only and does not change product prices automatically.

App Store listing:
https://apps.shopify.com/margin-sentinel

## Short founder story
Margin Sentinel started from a simple operational pain: merchants often know revenue, but they do not always know which exact SKUs are leaking margin after supplier costs, missing unit costs, promos, or bulk price edits. The app is designed to make that first check fast and practical.
