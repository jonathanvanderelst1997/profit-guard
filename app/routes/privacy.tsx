import { PublicInfoPage } from "../components/PublicInfoPage";

export default function PrivacyPolicy() {
  return (
    <PublicInfoPage title="Privacy Policy" eyebrow="Last updated: June 13, 2026">
      <p>Margin Sentinel helps Shopify merchants identify product-level gross margin risks. This policy explains what data the app accesses, stores, and deletes.</p>

      <h2>Data we access</h2>
      <p>Margin Sentinel requests access to product and inventory data needed to calculate gross product margin, including shop domain, product titles, variant titles, SKUs, variant prices, inventory item unit costs, app settings, imported supplier costs, scan summaries, and margin findings.</p>

      <h2>Data we do not need</h2>
      <p>Margin Sentinel does not require customer profiles, payment details, marketing lists, order history, or ad account data for its current catalog margin scan workflow.</p>

      <h2>How data is used</h2>
      <p>Data is used to calculate product-level gross margin, identify variants with missing costs, negative margin, or margin below the merchant target, generate exports, and send optional margin alert emails when configured.</p>

      <h2>Data storage</h2>
      <p>Margin Sentinel stores app sessions, merchant settings, imported supplier costs, audit runs, and audit findings so merchants can review their latest scans and exports. Production storage uses the application database configured for the deployed app.</p>

      <h2>Data deletion</h2>
      <p>When a merchant uninstalls Margin Sentinel, the app handles the Shopify uninstall webhook and deletes stored shop data, including scan findings, imported costs, settings, and sessions.</p>

      <h2>Contact</h2>
      <p>For privacy questions, use the support contact published on the Support page.</p>
    </PublicInfoPage>
  );
}
