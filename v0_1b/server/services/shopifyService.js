const secretService = require('./secretService');

const STOREFRONT_API_VERSION = '2024-07';

function resolveShopAuth(shopConfig) {
  const domain = shopConfig.shopDomain;
  const token = shopConfig.storefrontToken || secretService.getShopifyToken(shopConfig.id);
  if (!domain || !token) {
    return null;
  }
  return { domain, token };
}

async function storefrontRequest({ domain, token, query, variables }) {
  const endpoint = `https://${domain}/api/${STOREFRONT_API_VERSION}/graphql.json`;
  const res = await fetch(endpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Shopify-Storefront-Access-Token': token,
    },
    body: JSON.stringify({ query, variables }),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Storefront API error (${res.status}): ${text}`);
  }
  const data = await res.json();
  if (data.errors) {
    throw new Error(`Storefront API GraphQL errors: ${JSON.stringify(data.errors)}`);
  }
  return data.data;
}

async function searchProducts({ shopConfig, query, limit = 3 }) {
  const auth = resolveShopAuth(shopConfig);
  if (!auth) return [];

  const gql = `
    query SearchProducts($query: String!, $limit: Int!) {
      products(first: $limit, query: $query) {
        edges {
          node {
            id
            title
            handle
            description(truncateAt: 140)
            featuredImage { url altText }
            variants(first: 1) {
              edges {
                node {
                  id
                  title
                  availableForSale
                  price: price {
                    amount
                    currencyCode
                  }
                }
              }
            }
          }
        }
      }
    }
  `;
  try {
    const data = await storefrontRequest({
      domain: auth.domain,
      token: auth.token,
      query: gql,
      variables: { query, limit },
    });
    const edges = data?.products?.edges || [];
    return edges.map(({ node }) => {
      const variant = node.variants?.edges?.[0]?.node;
      const price = variant?.price
        ? `${variant.price.amount} ${variant.price.currencyCode}`
        : '';
      return {
        productId: node.id,
        variantId: variant?.id,
        title: node.title,
        subtitle: variant?.title || '',
        description: node.description || '',
        image: node.featuredImage?.url,
        price,
        availableForSale: variant?.availableForSale,
        productUrl: `https://${auth.domain}/products/${node.handle}`,
      };
    });
  } catch (err) {
    console.error('ERR_STOREFRONT_API_FAILED searchProducts', err.message);
    return [];
  }
}

async function getProductDetails({ shopConfig, idOrHandle }) {
  const auth = resolveShopAuth(shopConfig);
  if (!auth) return null;

  const isGid = idOrHandle && idOrHandle.startsWith('gid://');
  const filter = isGid
    ? `node(id: $idOrHandle) { ... on Product { id title handle description featuredImage { url altText } variants(first: 10) { edges { node { id title availableForSale price: price { amount currencyCode } } } } } }`
    : `product(handle: $idOrHandle) { id title handle description featuredImage { url altText } variants(first: 10) { edges { node { id title availableForSale price: price { amount currencyCode } } } } }`;

  const gql = `
    query GetProduct($idOrHandle: String!) {
      ${filter}
    }
  `;

  try {
    const data = await storefrontRequest({
      domain: auth.domain,
      token: auth.token,
      query: gql,
      variables: { idOrHandle },
    });
    const product = isGid ? data?.node : data?.product;
    if (!product) return null;
    return {
      productId: product.id,
      title: product.title,
      description: product.description,
      image: product.featuredImage?.url,
      variants:
        product.variants?.edges?.map(({ node }) => ({
          variantId: node.id,
          title: node.title,
          price: node.price ? `${node.price.amount} ${node.price.currencyCode}` : '',
          availableForSale: node.availableForSale,
        })) || [],
    };
  } catch (err) {
    console.error('ERR_STOREFRONT_API_FAILED getProductDetails', err.message);
    return null;
  }
}

module.exports = {
  searchProducts,
  getProductDetails,
};
