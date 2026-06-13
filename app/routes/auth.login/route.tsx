import { AppProvider } from "@shopify/shopify-app-react-router/react";
import type { LoaderFunctionArgs } from "react-router";
import { Link, useLoaderData } from "react-router";

import { login } from "../../shopify.server";
import { loginErrorMessage } from "./error.server";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const errors = loginErrorMessage(await login(request));

  return { errors };
};

export default function Auth() {
  const loaderData = useLoaderData<typeof loader>();
  const { errors } = loaderData;

  return (
    <AppProvider embedded={false}>
      <s-page>
        <s-section heading="Log in">
          <s-paragraph>{errors.shop || "Open Profit Guard from Shopify Admin or install it from a Shopify-owned surface to continue."}</s-paragraph>
          <s-button href="/beta">Join beta</s-button>
          <Link to="/support">Contact support</Link>
        </s-section>
      </s-page>
    </AppProvider>
  );
}
