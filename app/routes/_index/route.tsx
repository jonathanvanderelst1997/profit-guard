import type { LoaderFunctionArgs } from "react-router";
import { redirect } from "react-router";

import styles from "./styles.module.css";

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
          <span>Profit Guard</span>
        </a>
        <nav className={styles.nav}>
          <a href="/beta">Beta</a>
          <a href="/privacy">Privacy</a>
          <a href="/terms">Terms</a>
          <a href="/refund">Refunds</a>
          <a href="/support">Support</a>
        </nav>
      </header>
      <div className={styles.content}>
        <p className={styles.eyebrow}>Shopify catalog margin scanner</p>
        <h1 className={styles.heading}>Find products quietly leaking profit.</h1>
        <p className={styles.text}>Profit Guard scans Shopify variants for missing costs, negative gross margin, and prices below your target margin. It gives merchants a prioritized fix list without changing prices automatically.</p>
        <div className={styles.actions}>
          <a className={styles.primaryAction} href="/beta">Join beta</a>
          <a className={styles.secondaryAction} href="/support">Contact support</a>
        </div>
        <ul className={styles.list}>
          <li>
            <strong>Margin leak scan.</strong> Catch loss-making, low-margin, and missing-cost variants from Shopify product data.
          </li>
          <li>
            <strong>Supplier cost import.</strong> Upload CSV costs by SKU and preview the impact before saving.
          </li>
          <li>
            <strong>Actionable export.</strong> Download findings with margin gap, next action, and suggested minimum price.
          </li>
        </ul>
      </div>
    </div>
  );
}
