import type { MetaFunction } from "react-router";
import { PublicInfoPage } from "../components/PublicInfoPage";

export const meta: MetaFunction = () => {
  return [
    { title: "Shopify unit cost missing: cleanup workflow | Margin Sentinel" },
    {
      name: "description",
      content:
        "A practical workflow for Shopify merchants who need to find missing unit costs, supplier cost gaps, and products that cannot be trusted for margin reporting.",
    },
  ];
};

export default function ShopifyUnitCostMissing() {
  return (
    <PublicInfoPage title="What to do when Shopify unit cost is missing" eyebrow="Shopify cost cleanup">
      <p>
        Missing unit cost data makes every margin report weaker. A product can look healthy in revenue reports while the team has no reliable answer for whether it is profitable.
      </p>

      <h2>Why missing cost data happens</h2>
      <ul>
        <li>Products were created before the team tracked cost per item.</li>
        <li>Supplier price lists changed, but Shopify variant costs were not updated.</li>
        <li>Variants have no SKU or barcode, so supplier files cannot be matched safely.</li>
        <li>Bundles, custom products, and old variants were never cleaned up.</li>
      </ul>

      <h2>Cleanup workflow</h2>
      <ol>
        <li>Export all Shopify variants with variant ID, SKU, barcode, price, inventory quantity, and unit cost.</li>
        <li>Split rows into three groups: has cost, missing cost with SKU/barcode, and missing cost without a reliable identifier.</li>
        <li>Match supplier files to SKU, barcode, or variant ID before trusting the result.</li>
        <li>Review duplicate SKU or barcode matches manually.</li>
        <li>Update the smallest verified cost batch first, then rescan the catalog.</li>
      </ol>

      <h2>What to fix first</h2>
      <p>
        Start with in-stock products and best sellers. A missing cost on an archived product is a data hygiene issue. A missing cost on an in-stock SKU that sells every week is a margin risk.
      </p>

      <h2>How Margin Sentinel helps</h2>
      <p>
        Margin Sentinel scans Shopify variants for missing Shopify unit costs and unmatched supplier costs. It shows which SKUs need attention first and exports a fix list so the team can clean up data without changing prices automatically.
      </p>

      <p>
        <a href="https://apps.shopify.com/margin-sentinel">Install Margin Sentinel from the Shopify App Store</a>
      </p>
    </PublicInfoPage>
  );
}
