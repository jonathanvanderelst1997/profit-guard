import type { MetaFunction } from "react-router";
import { PublicInfoPage } from "../components/PublicInfoPage";

export const meta: MetaFunction = () => {
  return [
    { title: "Sample Shopify SKU margin scan | Margin Sentinel" },
    {
      name: "description",
      content:
        "See a simple sample Shopify SKU margin scan: missing costs, low-margin products, loss-making SKUs, COGS gaps, margin gap, inventory risk, and next actions.",
    },
    {
      name: "keywords",
      content:
        "Shopify SKU margin scan, Shopify COGS, Shopify cost per item, missing costs, missing product costs, low-margin products, loss-making SKUs, supplier costs, supplier cost import, inventory risk, margin gap, product cost tracking",
    },
  ];
};

const boxStyle = {
  border: "1px solid #d7d9dc",
  borderRadius: 8,
  padding: 18,
} as const;

const mutedStyle = {
  color: "#5f6368",
} as const;

const tableStyle = {
  borderCollapse: "collapse",
  marginTop: 16,
  width: "100%",
} as const;

const cellStyle = {
  borderBottom: "1px solid #e3e5e7",
  padding: "12px 10px",
  textAlign: "left",
  verticalAlign: "top",
} as const;

export default function SampleMarginScan() {
  return (
    <PublicInfoPage title="Sample Shopify SKU margin scan" eyebrow="Sample proof">
      <p>
        This is the plain-English version of what Margin Sentinel is built to show: which products might be losing money, which SKUs have missing costs, and which fixes matter first because stock is still on hand.
      </p>

      <div style={{ display: "grid", gap: 14, gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", margin: "26px 0" }}>
        <div style={boxStyle}>
          <strong style={{ color: "#151515", display: "block", fontSize: 28 }}>29</strong>
          <span style={mutedStyle}>variants checked</span>
        </div>
        <div style={boxStyle}>
          <strong style={{ color: "#151515", display: "block", fontSize: 28 }}>1</strong>
          <span style={mutedStyle}>product losing money</span>
        </div>
        <div style={boxStyle}>
          <strong style={{ color: "#151515", display: "block", fontSize: 28 }}>3</strong>
          <span style={mutedStyle}>low-margin products</span>
        </div>
        <div style={boxStyle}>
          <strong style={{ color: "#151515", display: "block", fontSize: 28 }}>$5,904</strong>
          <span style={mutedStyle}>inventory dollars at risk</span>
        </div>
      </div>

      <h2>What this means in normal words</h2>
      <p>
        The scan does not say "change every price now." It says: start with the few products where cost, price, and inventory create the biggest risk. For a merchant, that is easier to act on than a full profit dashboard.
      </p>

      <h2>Sample findings</h2>
      <div style={{ overflowX: "auto" }}>
        <table style={tableStyle}>
          <thead>
            <tr>
              <th style={cellStyle}>Finding</th>
              <th style={cellStyle}>Plain meaning</th>
              <th style={cellStyle}>Technical signal</th>
              <th style={cellStyle}>Next action</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td style={cellStyle}>Losing money</td>
              <td style={cellStyle}>The product costs more than it sells for.</td>
              <td style={cellStyle}>Negative gross margin / loss-making SKU.</td>
              <td style={cellStyle}>Review price, supplier cost, discount rules, or remove it from campaigns.</td>
            </tr>
            <tr>
              <td style={cellStyle}>Low margin</td>
              <td style={cellStyle}>The product still makes money, but not enough to hit the target margin.</td>
              <td style={cellStyle}>Margin gap below target margin threshold.</td>
              <td style={cellStyle}>Check whether the SKU should be repriced, excluded from discounts, or watched weekly.</td>
            </tr>
            <tr>
              <td style={cellStyle}>Inventory risk</td>
              <td style={cellStyle}>There is stock on hand, so the margin issue can still cost real money.</td>
              <td style={cellStyle}>Margin gap multiplied by inventory quantity.</td>
              <td style={cellStyle}>Fix high-stock issues before low-stock cleanup rows.</td>
            </tr>
            <tr>
              <td style={cellStyle}>Missing cost</td>
              <td style={cellStyle}>Shopify does not have enough cost data to trust the margin number.</td>
              <td style={cellStyle}>Missing COGS, missing unit cost, or unmatched supplier cost.</td>
              <td style={cellStyle}>Import supplier costs by SKU, variant ID, or inventory item ID.</td>
            </tr>
          </tbody>
        </table>
      </div>

      <h2>Useful words to search for</h2>
      <p>
        Merchants often use simple words. Operators and agencies often use technical words. Margin Sentinel should be findable for both.
      </p>
      <div style={{ display: "grid", gap: 12, gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", marginTop: 16 }}>
        <div style={boxStyle}>
          <strong>Simple words</strong>
          <p style={{ marginBottom: 0 }}>Products losing money, missing product costs, Shopify costs missing, low profit products, supplier price increase, products to fix first.</p>
        </div>
        <div style={boxStyle}>
          <strong>Technical words</strong>
          <p style={{ marginBottom: 0 }}>SKU margin, Shopify cost per item, COGS tracker, gross margin, margin gap, unit cost, supplier cost import, inventory risk.</p>
        </div>
      </div>

      <h2>Quick glossary</h2>
      <ul>
        <li><strong>SKU:</strong> the product code used to identify a variant, such as a size, color, part, or model.</li>
        <li><strong>COGS:</strong> cost of goods sold. In simple words: what the product costs you before profit.</li>
        <li><strong>Gross margin:</strong> the percentage left after product cost is removed from selling price.</li>
        <li><strong>Margin gap:</strong> how far the product is below the target margin.</li>
        <li><strong>Inventory risk:</strong> the money tied up in stock that is attached to a margin issue.</li>
      </ul>

      <h2>How Margin Sentinel uses this</h2>
      <p>
        Margin Sentinel scans Shopify product variants, SKU data, Shopify unit costs, imported supplier costs, prices, and inventory quantity. It turns those rows into a short fix list: losing money, low margin, missing cost, inventory risk, and suggested minimum price. It is read-only and does not automatically change prices.
      </p>

      <p>
        <a href="https://apps.shopify.com/margin-sentinel">Install Margin Sentinel from the Shopify App Store</a>
      </p>
    </PublicInfoPage>
  );
}
