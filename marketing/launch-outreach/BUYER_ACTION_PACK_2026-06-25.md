# Buyer action pack - 2026-06-25

Goal: get real installs, scan completions, and buyer conversations without fake reviews, bulk spam, or vague "check out my app" messages.

## What changed today

- Homepage copy now speaks directly to merchant pain: supplier costs, bulk price edits, messy SKU catalogs, loss-making variants, missing costs, low margin, and inventory dollars at risk.
- Homepage CTA now leads with the real buying step: `Start 14-day trial`.
- Homepage adds the key buyer proof points: live on Shopify App Store, $15/month Starter, read-only by design.
- Launch audit page now has a lower-friction email request with prefilled fields for store URL, SKU count, and main margin concern.
- Public info navigation now includes a direct Shopify App Store install link.
- `green.csv` is ignored as a local test CSV so it no longer dirties the repo.

## Buyer offer to use this week

Use this exact offer in one-to-one outreach:

```text
Free launch audit for your first Margin Sentinel scan.

Install the app, run one read-only scan, and I will help review the highest-risk SKUs: loss-making products, missing costs, low-margin variants, supplier cost impact, and inventory dollars at risk.
```

Important: this is a product feedback / onboarding offer, not a review incentive. Do not ask for a Shopify App Store review until a merchant has actually used the app and found value.

## Buyer segments to prioritize

1. Auto parts and equipment catalogs.
2. Lighting and electrical catalogs.
3. Furniture and home goods catalogs.
4. Beauty/supplement catalogs with frequent supplier or SKU updates.
5. Shopify agencies that manage migration, catalog cleanup, or ERP/PIM projects.

The best early buyer is not "any Shopify store." It is a merchant with a large enough physical-product catalog that margin cleanup is painful.

## Next two direct buyers to contact after approval

### 1. First Truck Parts

- Fit: truck parts catalog, SKU-heavy, supplier-cost risk likely.
- Recipient: `help@firsttruckparts.com`
- UTM link: `https://apps.shopify.com/margin-sentinel?utm_source=direct_outreach&utm_medium=email&utm_campaign=launch_audit&utm_content=first_truck_parts`
- Approval phrase: `Approve sending buyer draft to First Truck Parts.`

Subject:

```text
Read-only margin scan for Shopify truck parts catalogs
```

Body:

```text
Hi First Truck Parts team,

I was looking at Shopify stores with parts-heavy catalogs and noticed your truck parts catalog has a lot of SKU depth.

I built Margin Sentinel, a read-only Shopify app for catalog margin checks. It scans Shopify variants and helps flag:

- loss-making variants
- products below target margin
- missing Shopify unit cost or supplier cost data
- inventory risk tied to margin gaps
- suggested minimum prices for review

It does not change prices automatically. The output is a prioritized fix list your team can export and review before making cost or price updates.

For truck parts catalogs, the use case is usually supplier costs moving faster than retail prices or cost data cleanup across many SKUs.

If you install it and run one scan, I can help review the first findings as a free launch audit.

Would that be useful, or is margin/cost review already handled well internally?

https://apps.shopify.com/margin-sentinel?utm_source=direct_outreach&utm_medium=email&utm_campaign=launch_audit&utm_content=first_truck_parts

Best,
Jonathan
```

### 2. Automotive Service Equipment

- Fit: equipment catalog, many variants, supplier-cost and inventory exposure.
- Recipient: `contact@asedeals.com`
- UTM link: `https://apps.shopify.com/margin-sentinel?utm_source=direct_outreach&utm_medium=email&utm_campaign=launch_audit&utm_content=automotive_service_equipment`
- Approval phrase: `Approve sending buyer draft to Automotive Service Equipment.`

Subject:

```text
Read-only Shopify margin scan for equipment catalogs
```

Body:

```text
Hi Automotive Service Equipment team,

I built Margin Sentinel, a read-only Shopify app for catalog margin checks, and wanted to ask if it is relevant for your equipment catalog workflow.

For equipment and parts catalogs, supplier costs can change while product prices and variant data do not always move at the same time. Margin Sentinel scans Shopify variants and flags:

- products selling below cost
- products below target margin
- missing cost data
- inventory risk tied to margin gaps
- suggested minimum prices for review

It exports a fix list and does not change prices automatically.

If you install it and run one scan, I can help review the first findings as a free launch audit.

Would that be useful, or is margin/cost review already covered internally?

https://apps.shopify.com/margin-sentinel?utm_source=direct_outreach&utm_medium=email&utm_campaign=launch_audit&utm_content=automotive_service_equipment

Best,
Jonathan
```

## Daily buyer rhythm

- Check replies and installs once.
- Send at most 2 specific buyer messages after approval.
- Record every send in `marketing/launch-outreach/outreach_tracker.md`.
- Stop sending to a segment if replies are negative or the message feels generic.
- Follow up once after 7 days only if there was no reply and no bounce.

## Tracking setup Jonathan should do

- In Shopify Partner Dashboard, add GA4 or Meta tracking for App Store listing traffic if available.
- Use UTM links in direct outreach and community-safe resource links.
- Check app installs, uninstalls, billing events, and support messages daily while launch outreach is active.

Sources:

- Shopify review policy: `https://shopify.dev/docs/apps/launch/marketing/manage-app-reviews`
- Shopify listing traffic tracking: `https://shopify.dev/docs/apps/launch/marketing/track-listing-traffic`
- Shopify App Store best practices: `https://shopify.dev/docs/apps/launch/shopify-app-store/best-practices`
