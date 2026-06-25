import type { LoaderFunctionArgs, MetaFunction } from "react-router";
import { redirect } from "react-router";

import styles from "./styles.module.css";

export const meta: MetaFunction = () => {
  return [
    { title: "Margin Sentinel | Shopify margin leak scanner" },
    {
      name: "description",
      content:
        "Find loss-making Shopify variants, missing costs, low-margin products, supplier cost risk, and inventory dollars at risk before the next reorder or promotion.",
    },
  ];
};

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const url = new URL(request.url);

  if (url.searchParams.get("shop")) {
    throw redirect(`/app?${url.searchParams.toString()}`);
  }

  return null;
};

export default function App() {
  return (
    <div className={styles.index}>
      <header className={styles.header}>
        <a className={styles.brand} href="/">
          <span className={styles.mark}>P</span>
          <span>Margin Sentinel</span>
        </a>
        <nav className={styles.nav}>
          <a href="https://apps.shopify.com/margin-sentinel">Install</a>
          <a href="/beta">Launch offer</a>
          <a href="/resources">Resources</a>
          <a href="/resources/supplier-cost-csv-margin-scan">CSV workflow</a>
          <a href="/privacy">Privacy</a>
          <a href="/terms">Terms</a>
          <a href="/refund">Refunds</a>
          <a href="/support">Support</a>
        </nav>
      </header>
      <div className={styles.hero}>
        <div className={styles.content}>
          <p className={styles.eyebrow}>Shopify catalog margin scanner</p>
          <h1 className={styles.heading}>Find the SKUs that stop your store making money.</h1>
          <p className={styles.text}>Margin Sentinel is a read-only Shopify app for merchants with supplier costs, bulk price edits, and messy SKU catalogs. It finds loss-making variants, missing cost data, low-margin products, and inventory dollars at risk before the next reorder or promotion.</p>
          <div className={styles.actions}>
            <a className={styles.primaryAction} href="https://apps.shopify.com/margin-sentinel">Start 14-day trial</a>
            <a className={styles.secondaryAction} href="/beta">Request launch audit</a>
          </div>
          <div className={styles.proofStrip} aria-label="Margin Sentinel launch details">
            <span>Live on Shopify App Store</span>
            <span>$15/month Starter</span>
            <span>Read-only by design</span>
          </div>
        </div>
        <aside className={styles.preview} aria-label="Margin Sentinel product preview">
          <div className={styles.previewHeader}>
            <span>First scan</span>
            <strong>4 fixes found</strong>
          </div>
          <div className={styles.metricGrid}>
            <div><strong>$2,840</strong><span>Inventory risk</span></div>
            <div><strong>18</strong><span>Missing costs</span></div>
            <div><strong>3</strong><span>Below target</span></div>
          </div>
          <div className={styles.findingList}>
            <div>
              <span className={styles.badgeCritical}>Loss</span>
              <strong>Fuel filter housing</strong>
              <small>Raise price or reduce supplier cost</small>
            </div>
            <div>
              <span className={styles.badgeWarning}>Low margin</span>
              <strong>Replacement fan assembly</strong>
              <small>$920 inventory risk</small>
            </div>
            <div>
              <span className={styles.badgeNeutral}>Missing cost</span>
              <strong>SKU rows need cleanup</strong>
              <small>Export a fix list for the team</small>
            </div>
          </div>
        </aside>
      </div>
      <section className={styles.section}>
        <div>
          <p className={styles.sectionEyebrow}>Built for buyers with catalog risk</p>
          <h2>Best fit: stores where supplier costs move faster than product data.</h2>
          <p>Parts, equipment, furniture, lighting, beauty, hobby, sporting goods, and any catalog where a few wrong costs can hide inside hundreds of variants.</p>
        </div>
        <ul className={styles.list}>
          <li>
            <strong>Margin leak scan.</strong> Catch loss-making, low-margin, and missing-cost variants from Shopify product data.
          </li>
          <li>
            <strong>Supplier cost import.</strong> Upload costs by variant ID, inventory item ID, or SKU and preview the impact before saving.
          </li>
          <li>
            <strong>Inventory risk.</strong> Prioritize fixes by the margin gap and quantity sitting in stock.
          </li>
          <li>
            <strong>Cost-change what-if.</strong> Model supplier cost increases and see which SKUs become newly at risk.
          </li>
          <li>
            <strong>Actionable export.</strong> Download findings with margin gap, next action, and suggested minimum price.
          </li>
          <li>
            <strong>Weekly guardrail.</strong> Keep a recurring report ready for the team before margin leaks become normal.
          </li>
        </ul>
      </section>
    </div>
  );
}
