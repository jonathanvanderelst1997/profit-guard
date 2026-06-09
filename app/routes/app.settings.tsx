import type { ActionFunctionArgs, HeadersFunction, LoaderFunctionArgs } from "react-router";
import { useFetcher, useLoaderData } from "react-router";
import { boundary } from "@shopify/shopify-app-react-router/server";
import { authenticate } from "../shopify.server";
import { getShopSettings, updateMinimumMargin } from "../lib/settings.server";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const { session } = await authenticate.admin(request);
  return { settings: await getShopSettings(session.shop) };
};

export const action = async ({ request }: ActionFunctionArgs) => {
  const { session } = await authenticate.admin(request);
  const form = await request.formData();
  const minimumMarginPercent = Number(form.get("minimumMarginPercent") ?? 30);
  const settings = await updateMinimumMargin(session.shop, minimumMarginPercent);
  return { ok: true, settings };
};

export default function Settings() {
  const { settings } = useLoaderData<typeof loader>();
  const fetcher = useFetcher<typeof action>();
  return (
    <s-page heading="Settings">
      <s-section heading="Margin rules">
        <fetcher.Form method="post">
          <s-stack direction="block" gap="base">
            <s-text-field label="Minimum margin %" name="minimumMarginPercent" defaultValue={String(settings.minimumMarginBps / 100)} />
            <s-button {...(fetcher.state !== "idle" ? { loading: true } : {})}>Save settings</s-button>
            {fetcher.data?.ok ? <s-banner tone="success">Settings saved.</s-banner> : null}
          </s-stack>
        </fetcher.Form>
      </s-section>
    </s-page>
  );
}

export const headers: HeadersFunction = (headersArgs) => boundary.headers(headersArgs);
