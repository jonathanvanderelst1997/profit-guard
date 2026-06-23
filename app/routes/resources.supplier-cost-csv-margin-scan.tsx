import type { MetaFunction } from "react-router";
import { PublicInfoPage } from "../components/PublicInfoPage";

export const meta: MetaFunction = () => {
  return [
    { title: "Shopify supplier cost CSV margin scan | Margin Sentinel" },
    {
      name: "description",
      content:
        "A practical workflow for Shopify merchants who receive supplier CSVs and want to find margin risk before updating prices.",
    },
  ];
};

export default function SupplierCostCsvMarginScan() {
  return (
    <PublicInfoPage title="How to check Shopify supplier CSV changes for margin risk" eyebrow="Shopify margin workflow">
      <p>
        Supplier price lists are useful, but importing them straight into Shopify can hide the real question: which SKUs are now below target margin, missing cost data, or exposed because there is inventory on hand?
      </p>

      <h2>Recommended workflow</h2>
      <ol>
        <li>Export Shopify products and variants so every row has a stable SKU, barcode, or variant ID.</li>
        <li>Normalize supplier files into one CSV with SKU or barcode, supplier cost, and any new suggested selling price.</li>
        <li>Match supplier rows to Shopify variants before changing prices.</li>
        <li>Calculate gross margin per variant using the latest cost and current selling price.</li>
        <li>Sort by the biggest margin gap and by inventory quantity, not just by the lowest margin percentage.</li>
        <li>Review the short fix list before making any bulk product updates.</li>
      </ol>

      <h2>What to check before a bulk update</h2>
      <ul>
        <li>Variants that would lose money after the supplier cost change.</li>
        <li>Variants below the target gross margin.</li>
        <li>Products with missing Shopify unit cost or unmatched supplier rows.</li>
        <li>High-inventory SKUs where a small margin gap creates a bigger business risk.</li>
        <li>CSV rows that match multiple variants or do not match anything.</li>
      </ul>

      <h2>Why inventory matters</h2>
      <p>
        A low-margin SKU with no stock may be less urgent than a slightly-below-target SKU with a lot of units available. A useful scan should combine price, cost, target margin, and inventory quantity so the team knows what to fix first.
      </p>

      <h2>How Margin Sentinel helps</h2>
      <p>
        Margin Sentinel is a read-only Shopify app for this workflow. It scans variants for missing costs, loss-making prices, low margin, supplier CSV changes, suggested minimum prices, and inventory risk. It exports a fix list and never changes prices automatically.
      </p>

      <p>
        <a href="https://apps.shopify.com/margin-sentinel">Install Margin Sentinel from the Shopify App Store</a>
      </p>
    </PublicInfoPage>
  );
}
