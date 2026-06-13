import { PublicInfoPage } from "../components/PublicInfoPage";

export default function RefundPolicy() {
  return (
    <PublicInfoPage title="Refund Policy" eyebrow="Last updated: June 13, 2026">
      <p>Profit Guard subscriptions are billed through Shopify when charges apply. Refund handling follows Shopify billing records and the Profit Guard support process.</p>

      <h2>Trials and cancellations</h2>
      <p>If a trial is offered, merchants can cancel before the trial ends to avoid future subscription charges. Cancellations are handled through the Shopify app subscription flow.</p>

      <h2>Refund requests</h2>
      <p>Merchants may request a refund through the support contact published on the Support page. Include the Shopify store domain, billing date, and reason for the request.</p>

      <h2>Review process</h2>
      <p>Refund requests are reviewed based on app usage, billing timing, technical issues, and Shopify billing records. Approved refunds are processed through the supported Shopify billing path.</p>

      <h2>Non-refundable cases</h2>
      <p>Fees may be non-refundable when the billing period has already been used and the app operated as described, unless required by law or Shopify policy.</p>
    </PublicInfoPage>
  );
}
