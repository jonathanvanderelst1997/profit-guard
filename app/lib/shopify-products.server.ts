import type { VariantMarginInput } from "./margin";

type AdminGraphqlClient = { graphql: (query: string, options?: { variables?: Record<string, unknown> }) => Promise<Response>; };
type ShopifyProductNode = {
  id: string;
  title: string;
  variants: {
    pageInfo: { hasNextPage: boolean; endCursor: string | null };
    nodes: Array<{ id: string; title: string; sku: string | null; price: string; inventoryQuantity: number | null; inventoryItem?: { id: string; unitCost?: { amount: string; currencyCode: string; } | null; } | null; }>;
  };
};

const PRODUCTS_FOR_AUDIT_QUERY = `#graphql
  query ProfitGuardProducts($first: Int!, $after: String, $variantFirst: Int!) {
    shop { currencyCode }
    products(first: $first, after: $after, sortKey: UPDATED_AT, reverse: true) {
      pageInfo { hasNextPage endCursor }
      nodes {
        id
        title
        variants(first: $variantFirst) {
          pageInfo { hasNextPage endCursor }
          nodes {
            id
            title
            sku
            price
            inventoryQuantity
            inventoryItem { id unitCost { amount currencyCode } }
          }
        }
      }
    }
  }
`;

const PRODUCT_VARIANTS_QUERY = `#graphql
  query ProfitGuardProductVariants($productId: ID!, $first: Int!, $after: String) {
    shop { currencyCode }
    product(id: $productId) {
      id
      title
      variants(first: $first, after: $after) {
        pageInfo { hasNextPage endCursor }
        nodes {
          id
          title
          sku
          price
          inventoryQuantity
          inventoryItem { id unitCost { amount currencyCode } }
        }
      }
    }
  }
`;

function moneyToNumber(value: string | null | undefined): number {
  const parsed = Number(value ?? 0);
  return Number.isFinite(parsed) ? parsed : 0;
}

function variantToInput(productTitle: string, variant: ShopifyProductNode["variants"]["nodes"][number], fallbackCurrencyCode?: string | null): VariantMarginInput {
  return {
    variantId: variant.id,
    inventoryItemId: variant.inventoryItem?.id ?? null,
    productTitle,
    variantTitle: variant.title,
    sku: variant.sku,
    priceAmount: moneyToNumber(variant.price),
    costAmount: variant.inventoryItem?.unitCost?.amount ? moneyToNumber(variant.inventoryItem.unitCost.amount) : null,
    costSource: variant.inventoryItem?.unitCost?.amount ? "SHOPIFY_UNIT_COST" : "MISSING",
    inventoryQuantity: variant.inventoryQuantity,
    currencyCode: variant.inventoryItem?.unitCost?.currencyCode ?? fallbackCurrencyCode ?? null,
  };
}

async function fetchRemainingVariants(admin: AdminGraphqlClient, productId: string, productTitle: string, after: string | null, maxRemaining: number, fallbackCurrencyCode?: string | null) {
  const variants: VariantMarginInput[] = [];
  let cursor = after;
  while (cursor && variants.length < maxRemaining) {
    const response = await admin.graphql(PRODUCT_VARIANTS_QUERY, { variables: { productId, first: Math.min(100, maxRemaining - variants.length), after: cursor } });
    const json = await response.json();
    if (json.errors?.length) throw new Error(`Shopify GraphQL error: ${JSON.stringify(json.errors)}`);
    const currencyCode = json.data?.shop?.currencyCode ?? fallbackCurrencyCode ?? null;
    const product = json.data?.product;
    const page = product?.variants?.pageInfo;
    for (const variant of product?.variants?.nodes ?? []) variants.push(variantToInput(productTitle, variant, currencyCode));
    cursor = page?.hasNextPage ? page.endCursor : null;
  }
  return variants;
}

export async function fetchVariantsForAudit(admin: AdminGraphqlClient, options: { maxVariants?: number } = {}): Promise<{ variants: VariantMarginInput[]; limitReached: boolean }> {
  const maxVariants = options.maxVariants ?? 100;
  const variants: VariantMarginInput[] = [];
  let after: string | null = null;
  let limitReached = false;

  while (variants.length < maxVariants) {
    const response = await admin.graphql(PRODUCTS_FOR_AUDIT_QUERY, { variables: { first: 50, after, variantFirst: Math.min(100, maxVariants - variants.length) } });
    const json = await response.json();
    if (json.errors?.length) throw new Error(`Shopify GraphQL error: ${JSON.stringify(json.errors)}`);
    const currencyCode = json.data?.shop?.currencyCode ?? null;
    const products = json.data?.products;
    const nodes = (products?.nodes ?? []) as ShopifyProductNode[];

    for (const product of nodes) {
      if (variants.length >= maxVariants) { limitReached = true; break; }
      const remainingForPlan = maxVariants - variants.length;
      for (const variant of product.variants.nodes.slice(0, remainingForPlan)) variants.push(variantToInput(product.title, variant, currencyCode));

      const productHasMoreVariants = product.variants.pageInfo.hasNextPage;
      if (productHasMoreVariants && variants.length < maxVariants) {
        variants.push(...await fetchRemainingVariants(admin, product.id, product.title, product.variants.pageInfo.endCursor, maxVariants - variants.length, currencyCode));
      }
      if (productHasMoreVariants && variants.length >= maxVariants) limitReached = true;
    }

    after = products?.pageInfo?.hasNextPage ? products.pageInfo.endCursor : null;
    if (!after) break;
    if (variants.length >= maxVariants) limitReached = true;
  }

  return { variants, limitReached: limitReached || Boolean(after) };
}
