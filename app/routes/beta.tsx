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
  const contactUrl = betaSignupUrl || (supportEmail ? `mailto:${supportEmail}?subject=Margin%20Sentinel%20launch%20audit` : "");

  return (
    <PublicInfoPage title="Get a launch margin audit" eyebrow="Launch offer">
      <p>Margin Sentinel is live on the Shopify App Store. For early merchants and Shopify agencies, we are offering a hands-on review of the first scan so teams can see where margin leaks, missing costs, and inventory risk show up.</p>

      <h2>Who it is for</h2>
      <ul>
        <li>Shopify stores with 100+ product variants.</li>
        <li>Teams that import supplier price lists or edit products in bulk.</li>
        <li>Stores that want to find missing costs, negative margin, and low-margin variants before they grow into expensive mistakes.</li>
      </ul>

      <h2>What launch merchants get</h2>
      <ul>
        <li>A guided margin leak scan.</li>
        <li>Supplier CSV import review.</li>
        <li>A prioritized findings export with suggested minimum prices.</li>
        <li>A short checklist for what to fix before the next reorder, promo, or supplier price update.</li>
      </ul>

      <h2>What we ask for</h2>
      <p>One short feedback call or written notes after the first scan. The most important question is whether Margin Sentinel found something useful that would otherwise have been missed.</p>

      <p><a href="https://apps.shopify.com/margin-sentinel">Install Margin Sentinel from the Shopify App Store</a></p>

      {contactUrl ? (
        <p><a href={contactUrl}>Request a launch audit</a></p>
      ) : (
        <p>Install the app from the Shopify App Store, run your first scan, then contact support with your store domain if you want a guided review.</p>
      )}
    </PublicInfoPage>
  );
}
