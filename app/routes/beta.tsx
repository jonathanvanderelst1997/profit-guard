import { useLoaderData } from "react-router";
import { PublicInfoPage } from "../components/PublicInfoPage";

export const loader = async () => {
  return {
    betaSignupUrl: process.env.BETA_SIGNUP_URL || "",
    supportEmail: process.env.SUPPORT_EMAIL || "",
  };
};

export default function Beta() {
  const { betaSignupUrl, supportEmail } = useLoaderData<typeof loader>();
  const contactUrl = betaSignupUrl || (supportEmail ? `mailto:${supportEmail}?subject=Profit%20Guard%20beta` : "");

  return (
    <PublicInfoPage title="Join the Profit Guard beta" eyebrow="Closed beta">
      <p>Profit Guard is looking for Shopify merchants and agencies with physical products, supplier cost changes, or large SKU catalogs.</p>

      <h2>Who it is for</h2>
      <ul>
        <li>Shopify stores with 100+ product variants.</li>
        <li>Teams that import supplier price lists or edit products in bulk.</li>
        <li>Stores that want to find missing costs, negative margin, and low-margin variants before they grow into expensive mistakes.</li>
      </ul>

      <h2>What beta merchants get</h2>
      <ul>
        <li>A guided margin leak scan.</li>
        <li>Supplier CSV import review.</li>
        <li>A prioritized findings export with suggested minimum prices.</li>
        <li>Early access pricing during the beta period.</li>
      </ul>

      <h2>What we ask for</h2>
      <p>One short feedback call or written notes after the first scan. The most important question is whether Profit Guard found something useful that would otherwise have been missed.</p>

      {contactUrl ? (
        <p><a href={contactUrl}>Request beta access</a></p>
      ) : (
        <p><strong>Before public beta:</strong> set `BETA_SIGNUP_URL` or `SUPPORT_EMAIL` so this page has a working contact link.</p>
      )}
    </PublicInfoPage>
  );
}
