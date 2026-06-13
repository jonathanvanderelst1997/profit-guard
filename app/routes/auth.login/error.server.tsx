import type { LoginError } from "@shopify/shopify-app-react-router/server";
import { LoginErrorType } from "@shopify/shopify-app-react-router/server";

interface LoginErrorMessage {
  shop?: string;
}

export function loginErrorMessage(loginErrors: LoginError): LoginErrorMessage {
  if (loginErrors?.shop === LoginErrorType.MissingShop) {
    return { shop: "Open Margin Sentinel from Shopify Admin or the Shopify App Store to continue." };
  } else if (loginErrors?.shop === LoginErrorType.InvalidShop) {
    return { shop: "Shopify could not validate this install URL. Open Margin Sentinel from Shopify Admin or try the install link again." };
  }

  return {};
}
