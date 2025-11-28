# Shopify integration notes (v0.1b)

## Ajax Cart API (storefront, client-side)
- Official docs: https://shopify.dev/docs/api/ajax/reference/cart
- Key endpoints (JSON):
  - `POST /cart/add.js` — body includes `items` or `id` + `quantity`; returns cart object with `items[]` (id, variant_id, title, quantity, price, line_price, image, key, etc.).
  - `POST /cart/change.js` — change quantity by `id` or `line` (line item index) or `properties`; returns updated cart.
  - `POST /cart/update.js` — bulk update quantities/properties.
  - `GET /cart.js` — fetch current cart state.
- Behavior:
  - Works from the storefront origin; uses the shopper’s session cookie. No extra auth but subject to theme/ajax availability.
  - Content-Type is usually `application/json`; Shopify returns 422 for invalid variants/quantities and 429 on limits.
  - Suitable for fast quantity buttons and “Add to cart” in the widget—no server hop required.

## Storefront API (GraphQL, typically server-side)
- Docs: https://shopify.dev/docs/api/storefront
- Auth: `X-Shopify-Storefront-Access-Token: <token>` header; token is shop-specific and read-only.
- Common queries:
  - Product search via `products(query:, first:)` supporting keywords, tags, collections.
  - Product details by handle or ID with variants (`id`, `title`, `priceRange`, `availableForSale`, `images`).
  - Inventory/availability is limited; Storefront is read-only (no cart mutations).
- Rate limits: GraphQL cost-based limit (1,000 points/second bucket); errors return cost + retry info.
- Use cases in v0.1b:
  - `searchProducts` to provide AI with grounded results.
  - `getProductDetails` to hydrate variant IDs, images, and prices before sending blocks to the widget.

## Storefront AI / MCP tools
- Shopify has announced “Storefront AI” / “MCP tools” for product intelligence inside ChatGPT; public HTTP access is unclear.
- Plan: encapsulate calls in `shopifyMcpService`; if no external endpoint exists, fall back to Storefront API search + detail queries.
- Document limitations in code and logs; avoid blocking UX while waiting for MCP-like calls.

## Embedding approaches
- Script tag snippet is the primary path for v0.1b: load `/v0_1b/widget/sdk.js` from our host.
- Theme app extensions / app embeds are an alternative long-term Shopify-native install path, but are out-of-scope for this demo. We will keep markup/CSS self-contained for easy migration into an app embed block later.

## Shopify app auth (high-level context)
- Shopify apps typically use OAuth with shop-scoped tokens and declared scopes.
- For this demo, we rely on manually provided tokens (Storefront token, admin secret) stored in config/secrets files; no OAuth flow yet.

## How we split responsibilities in v0.1b
- Widget (browser): calls Ajax Cart endpoints for quantity and add-to-cart; no secrets are exposed.
- Backend: calls Storefront API with stored token to fetch/search products; calls OpenAI `o4` for reasoning.
- Admin API/UI: gated by `ADMIN_DASH_SECRET`; manages client/shop configs and AI settings.

## Constraints and caveats
- Ajax Cart works only on Online Store pages (not headless environments without Shopify cart endpoints).
- CORS: Ajax Cart must run on the shop domain; our hosted test harness may need a dev store to fully exercise cart calls.
- Keep secrets server-side; never embed Storefront tokens or OpenAI keys in the widget.
