import type { MetaFunction } from "react-router";
import { PublicInfoPage } from "../components/PublicInfoPage";

export const meta: MetaFunction = () => {
  return [
    { title: "Find low-margin Shopify products | Margin Sentinel" },
    {
      name: "description",
      content:
        "Learn how to find low-margin Shopify products by combining price, cost, target margin, inventory quantity, and suggested minimum price.",
    },
  ];
};

export default function FindLowMarginProductsShopify() {
  return (
    <PublicInfoPage title="How to find low-margin Shopify products before they hurt profit" eyebrow="Shopify margin workflow">
      <p>
        Revenue dashboards can hide weak SKUs. The products that need attention are not always the ones with the lowest margin percentage; they are often the products where a margin gap is multiplied by current inventory.
      </p>

      <h2>Core calculation</h2>
      <p>
        For each variant, compare selling price against the best available cost source. Then calculate profit, gross margin, margin gap to target, and suggested minimum price.
      </p>

      <h2>Prioritize by business risk</h2>
      <ol>
        <li>Loss-making variants: cost is higher than price.</li>
        <li>Low-margin variants with inventory on hand.</li>
        <li>High-volume products below the target margin.</li>
        <li>Products with missing costs that prevent reliable margin checks.</li>
        <li>Products affected by recent supplier cost increases.</li>
      </ol>

      <h2>Suggested minimum price</h2>
      <p>
        A suggested minimum price is not a command to raise prices. It is a guardrail: the price required to hit the target gross margin using the current cost. Merchants should still review competition, demand, discount rules, and brand positioning before changing prices.
      </p>

      <h2>How Margin Sentinel helps</h2>
      <p>
        Margin Sentinel gives Shopify merchants a prioritized list of loss-making, low-margin, and missing-cost variants. It includes margin gap, inventory risk, and suggested minimum margin guidance without automatically changing product data.
      </p>

      <p>
        <a href="https://apps.shopify.com/margin-sentinel">Install Margin Sentinel from the Shopify App Store</a>
      </p>
    </PublicInfoPage>
  );
}
