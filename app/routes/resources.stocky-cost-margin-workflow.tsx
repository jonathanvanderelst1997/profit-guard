import type { MetaFunction } from "react-router";
import { PublicInfoPage } from "../components/PublicInfoPage";

export const meta: MetaFunction = () => {
  return [
    { title: "Shopify Stocky cost and margin workflow | Margin Sentinel" },
    {
      name: "description",
      content:
        "A practical margin workflow for Shopify merchants reviewing purchase orders, supplier costs, inventory receiving, and Stocky-related process changes.",
    },
  ];
};

export default function StockyCostMarginWorkflow() {
  return (
    <PublicInfoPage title="Protect cost and margin visibility during the Stocky transition" eyebrow="Shopify inventory workflow">
      <p>
        Merchants who rely on Stocky-style purchasing workflows often care about more than quantity. They need to know whether the cost they are receiving still supports the selling price and target margin.
      </p>

      <h2>Operational risk</h2>
      <p>
        If receiving inventory only updates quantity, margin problems can stay hidden until products are already available to sell. A supplier cost increase, a stale selling price, or missing unit cost can quietly turn a normal purchase order into a profit leak.
      </p>

      <h2>Recommended control layer</h2>
      <ol>
        <li>Export or collect received SKUs with current supplier cost.</li>
        <li>Compare the latest cost against Shopify selling price and target margin.</li>
        <li>Flag loss-making or below-target SKUs before the team restocks heavily.</li>
        <li>Prioritize by inventory quantity and margin gap.</li>
        <li>Review the fix list before changing prices, costs, or purchase quantities.</li>
      </ol>

      <h2>What a lightweight margin check should show</h2>
      <ul>
        <li>Shopify price and latest cost source.</li>
        <li>Gross profit and gross margin per variant.</li>
        <li>Missing cost data and unmatched supplier rows.</li>
        <li>Inventory risk based on target margin gap.</li>
        <li>Suggested minimum price for review.</li>
      </ul>

      <h2>How Margin Sentinel helps</h2>
      <p>
        Margin Sentinel is not a purchasing suite or warehouse system. It is a focused read-only margin guardrail for Shopify catalogs. Use it beside your receiving or supplier-cost workflow to catch margin issues before they become expensive.
      </p>

      <p>
        <a href="https://apps.shopify.com/margin-sentinel">Install Margin Sentinel from the Shopify App Store</a>
      </p>
    </PublicInfoPage>
  );
}
