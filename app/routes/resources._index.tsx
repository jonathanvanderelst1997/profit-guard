import type { MetaFunction } from "react-router";
import { PublicInfoPage } from "../components/PublicInfoPage";

export const meta: MetaFunction = () => {
  return [
    { title: "Shopify margin resources | Margin Sentinel" },
    {
      name: "description",
      content:
        "Practical Shopify workflows for supplier cost imports, missing unit costs, low-margin products, inventory risk, and bulk price updates.",
    },
  ];
};

const resources = [
  {
    href: "/resources/sample-margin-scan",
    title: "Sample Shopify SKU margin scan",
    text: "See a simple proof example with missing costs, low-margin products, COGS gaps, margin gap, and inventory risk.",
  },
  {
    href: "/resources/supplier-cost-csv-margin-scan",
    title: "Shopify supplier cost CSV margin scan",
    text: "Normalize supplier files, match variants, and find margin risk before changing prices.",
  },
  {
    href: "/resources/shopify-unit-cost-missing",
    title: "What to do when Shopify unit cost is missing",
    text: "A practical cleanup workflow for missing cost per item data and unmatched supplier rows.",
  },
  {
    href: "/resources/find-low-margin-products-shopify",
    title: "How to find low-margin Shopify products",
    text: "Prioritize loss-making and low-margin SKUs by margin gap and inventory exposure.",
  },
  {
    href: "/resources/bulk-price-update-margin-check",
    title: "Before a Shopify bulk price update, check margin impact",
    text: "Avoid turning supplier price updates into silent margin leaks.",
  },
  {
    href: "/resources/stocky-cost-margin-workflow",
    title: "Cost and margin checks during the Stocky transition",
    text: "Protect margin visibility when receiving inventory or moving purchasing workflows.",
  },
];

export default function ResourcesIndex() {
  return (
    <PublicInfoPage title="Shopify margin workflows for messy catalogs" eyebrow="Resources">
      <p>
        These guides are written for Shopify merchants and operators who work with supplier costs, bulk CSV files, changing prices, and product catalogs where a few wrong rows can quietly erase profit.
      </p>

      <div style={{ display: "grid", gap: 16, marginTop: 28 }}>
        {resources.map((resource) => (
          <a
            href={resource.href}
            key={resource.href}
            style={{
              border: "1px solid #d7d9dc",
              borderRadius: 8,
              color: "inherit",
              display: "block",
              padding: 18,
              textDecoration: "none",
            }}
          >
            <h2 style={{ fontSize: 22, margin: "0 0 8px" }}>{resource.title}</h2>
            <p style={{ margin: 0 }}>{resource.text}</p>
          </a>
        ))}
      </div>
    </PublicInfoPage>
  );
}
