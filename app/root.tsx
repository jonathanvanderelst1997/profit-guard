import type { LoaderFunctionArgs } from "react-router";
import { Links, Meta, Outlet, Scripts, ScrollRestoration, useLoaderData } from "react-router";

export const loader = ({ request }: LoaderFunctionArgs) => {
  const url = new URL(request.url);
  const isShopifyContext =
    url.pathname.startsWith("/app") ||
    url.searchParams.has("embedded") ||
    url.searchParams.has("host") ||
    url.searchParams.has("shop");

  return {
    loadAppBridge: isShopifyContext,
    shopifyApiKey: process.env.SHOPIFY_API_KEY || "",
  };
};

export default function App() {
  const { loadAppBridge, shopifyApiKey } = useLoaderData<typeof loader>();

  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width,initial-scale=1" />
        {loadAppBridge ? (
          <>
            <meta name="shopify-api-key" content={shopifyApiKey} />
            <script src="https://cdn.shopify.com/shopifycloud/app-bridge.js" />
          </>
        ) : null}
        <link rel="preconnect" href="https://cdn.shopify.com/" />
        <link
          rel="stylesheet"
          href="https://cdn.shopify.com/static/fonts/inter/v4/styles.css"
        />
        <Meta />
        <Links />
      </head>
      <body>
        <Outlet />
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}
