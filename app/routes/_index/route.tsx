import type { LoaderFunctionArgs, MetaFunction } from "react-router";
import { redirect } from "react-router";

import styles from "./styles.module.css";

export const meta: MetaFunction = () => {
  return [
    { title: "Free Shopify margin leak audit | Margin Sentinel" },
    {
      name: "description",
      content:
        "Request a free 20-SKU Shopify margin leak audit. Margin Sentinel finds missing costs, low-margin SKUs, supplier cost risk, and inventory dollars at risk.",
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
          <a href="mailto:jonathan.vanderelst@outlook.com?subject=Free%2020-SKU%20margin%20leak%20audit">Free audit</a>
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
          <p className={styles.eyebrow}>Free founder-led Shopify audit</p>
          <h1 className={styles.heading}>Want me to check 20 SKUs for hidden margin leaks?</h1>
          <p className={styles.text}>Margin Sentinel is a read-only Shopify app for catalog-heavy merchants. Send a store URL and I will review a 20-SKU sample for missing costs, low-margin variants, supplier cost issues, and inventory dollars at risk.</p>
          <div className={styles.actions}>
            <a className={styles.primaryAction} href="mailto:jonathan.vanderelst@outlook.com?subject=Free%2020-SKU%20margin%20leak%20audit&body=Hi%20Jonathan%2C%0A%0AI%20would%20like%20a%20free%2020-SKU%20margin%20leak%20audit.%0A%0AStore%20URL%3A%20%0ACatalog%20type%3A%20%0AWhat%20I%20want%20checked%3A%20missing%20costs%20%2F%20low-margin%20SKUs%20%2F%20supplier%20cost%20changes%20%2F%20inventory%20risk%0A">Request free audit</a>
            <a className={styles.secondaryAction} href="https://apps.shopify.com/margin-sentinel">Install from Shopify</a>
          </div>
          <p className={styles.microcopy}>Best fit: parts, equipment, furniture, beauty, home goods, and messy SKU catalogs. No order data needed. No prices changed automatically.</p>
          <div className={styles.proofStrip} aria-label="Margin Sentinel launch details">
            <span>Live on Shopify App Store</span>
            <span>Free 20-SKU audit offer</span>
            <span>Read-only by design</span>
          </div>
        </div>
        <aside className={styles.preview} aria-label="Free margin audit preview">
          <div className={styles.previewHeader}>
            <span>Audit sample</span>
            <strong>20 SKUs checked</strong>
          </div>
          <div className={styles.auditPanel}>
            <strong>What you get back</strong>
            <span>A short findings note with the SKUs to fix first, why they matter, and the next action for each one.</span>
          </div>
          <div className={styles.metricGrid}>
            <div><strong>$2,840</strong><span>Inventory risk</span></div>
            <div><strong>18</strong><span>Missing costs</span></div>
            <div><strong>3</strong><span>Below target</span></div>
          </div>
          <div className={styles.auditSteps}>
            <span>1. Share store URL</span>
            <span>2. I check 20 SKUs</span>
            <span>3. You get findings</span>
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
