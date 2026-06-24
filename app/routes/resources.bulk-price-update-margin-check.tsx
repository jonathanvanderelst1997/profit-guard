import type { MetaFunction } from "react-router";
import { PublicInfoPage } from "../components/PublicInfoPage";

export const meta: MetaFunction = () => {
  return [
    { title: "Shopify bulk price update margin check | Margin Sentinel" },
    {
      name: "description",
      content:
        "Before updating Shopify prices in bulk, check supplier costs, target margin, loss-making variants, and inventory risk.",
    },
  ];
};

export default function BulkPriceUpdateMarginCheck() {
  return (
    <PublicInfoPage title="Before a Shopify bulk price update, check margin impact" eyebrow="Shopify CSV workflow">
      <p>
        Bulk price updates are efficient, but they can also spread a mistake across hundreds or thousands of variants. The safest workflow is to calculate margin impact before importing changes.
      </p>

      <h2>Pre-update checklist</h2>
      <ul>
        <li>Confirm each row has a stable match field: variant ID, SKU, or barcode.</li>
        <li>Check whether the supplier cost changed since the last price update.</li>
        <li>Calculate margin after the proposed price change, not only before it.</li>
        <li>Flag products that would remain below the target margin.</li>
        <li>Export the risk list before making changes in Shopify.</li>
      </ul>

      <h2>Common failure modes</h2>
      <ul>
        <li>The CSV matches the wrong variant because SKUs are duplicated.</li>
        <li>Supplier cost increases are imported, but selling prices are not reviewed.</li>
        <li>Sale prices or discount rules make an otherwise healthy product unprofitable.</li>
        <li>Products with missing costs get skipped and remain invisible in margin reporting.</li>
      </ul>

      <h2>How Margin Sentinel helps</h2>
      <p>
        Margin Sentinel can scan Shopify selling prices, Shopify unit costs, and imported supplier costs before a team makes a bulk price decision. It turns the catalog into a short fix list: loss, low margin, missing cost, margin gap, inventory risk, and suggested minimum price.
      </p>

      <p>
        <a href="https://apps.shopify.com/margin-sentinel">Install Margin Sentinel from the Shopify App Store</a>
      </p>
    </PublicInfoPage>
  );
}
