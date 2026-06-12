import { useLoaderData } from "react-router";
import { PublicInfoPage } from "../components/PublicInfoPage";

export const loader = async () => {
  return {
    supportEmail: process.env.SUPPORT_EMAIL || "",
  };
};

export default function Support() {
  const { supportEmail } = useLoaderData<typeof loader>();
  const hasEmail = Boolean(supportEmail);

  return (
    <PublicInfoPage title="Support" eyebrow="Profit Guard help">
      <p>Need help with Profit Guard? Use this page for installation, scans, CSV imports, exports, alerts, billing questions, or privacy requests.</p>

      <h2>Contact</h2>
      {hasEmail ? (
        <p>Email <a href={`mailto:${supportEmail}`}>{supportEmail}</a> with your Shopify store domain and a short description of the issue.</p>
      ) : (
        <p><strong>Before public launch:</strong> set the <code>SUPPORT_EMAIL</code> environment variable so this page shows the real support contact.</p>
      )}

      <h2>Helpful details to include</h2>
      <ul>
        <li>Your Shopify store domain.</li>
        <li>Whether the issue happened on scan, import, export, alerts, or billing.</li>
        <li>The CSV header and one example row if the issue is import-related.</li>
        <li>A screenshot if the app showed an error message.</li>
      </ul>

      <h2>Expected response</h2>
      <p>Support should respond as soon as practical during normal business days. Public launch materials should state the final response target once support coverage is confirmed.</p>
    </PublicInfoPage>
  );
}
