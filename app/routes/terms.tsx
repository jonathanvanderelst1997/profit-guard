import { PublicInfoPage } from "../components/PublicInfoPage";

export default function TermsOfService() {
  return (
    <PublicInfoPage title="Terms of Service" eyebrow="Last updated: June 13, 2026">
      <p>These terms describe how merchants may use Margin Sentinel to review product-level gross margin risk in Shopify.</p>

      <h2>Service</h2>
      <p>Margin Sentinel is a Shopify app that scans product and variant data to identify missing costs, negative gross margin, and prices below a merchant-defined target margin.</p>

      <h2>Merchant responsibilities</h2>
      <p>Merchants are responsible for reviewing all findings before taking action. Margin Sentinel provides gross product margin calculations based on available product cost and price data. It is not accounting, tax, legal, or financial advice.</p>

      <h2>No automatic price changes</h2>
      <p>Margin Sentinel does not automatically change product prices, supplier costs, inventory, orders, or customer records. Suggested minimum prices are informational and should be reviewed by the merchant.</p>

      <h2>Billing</h2>
      <p>Paid plans, trials, upgrades, downgrades, and cancellations are handled through Shopify billing or Shopify App Pricing when charges apply.</p>

      <h2>Availability</h2>
      <p>The app operator may update, pause, or discontinue features as needed to maintain the service, comply with Shopify requirements, or improve reliability.</p>

      <h2>Contact</h2>
      <p>Questions about these terms can be sent through the support contact published on the Support page.</p>
    </PublicInfoPage>
  );
}
