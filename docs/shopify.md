# Shopify references

This summary is based on official Shopify docs (shopify.dev) for Ajax Cart API, Storefront API, agentic commerce/Storefront MCP, theme app embeds, and OAuth. Key URLs are listed per section.

## Ajax Cart API (Online Store)
- Docs: https://shopify.dev/docs/api/ajax/reference/cart
- Client-side endpoints (JSON responses, locale-aware via `window.Shopify.routes.root`):
  - `POST /{locale}/cart/add.js` - add one or more variants via `items` array (`id`, `quantity`, optional `properties`/`selling_plan`). Returns JSON for the added line items (quantity reflects the new total if already in cart).
  - `POST /{locale}/cart/change.js` - change quantity for a line item (`id` line-item key or `line` index) with `quantity`. Returns updated cart JSON.
  - `POST /{locale}/cart/update.js` - update cart note, attributes, and optionally bulk line items.
  - `GET /{locale}/cart.js` - fetch full cart state (items, totals, attributes, currency).
  - `POST /{locale}/cart/clear.js` - empty cart.
- Errors: invalid variants or insufficient inventory return 422 JSON errors; requests must be same-origin with storefront cookies.
- Intended for Online Store themes. These endpoints run in the shopper's browser; no admin tokens needed.
- Our v0.1 behavior: widget calls Ajax Cart directly for +/- and add-to-cart to keep the UI instant; no detours through the AI/service layer for cart mutations.

## Storefront API (GraphQL)
- Docs: https://shopify.dev/docs/api/storefront
- Endpoint: `https://{shop}.myshopify.com/api/{version}/graphql.json` with `X-Shopify-Storefront-Access-Token`.
- Capabilities: read products/variants/collections, images, prices; customer data (with customer token); cart operations for headless builds (`cartCreate`, `cartLinesAdd`, `cartLinesUpdate`, `cartLinesRemove`, `cartQuery`).
- Constraints: Storefront token is scoped and read-focused; cannot mutate admin data. Cart mutations create storefront carts, not Admin carts.
- Our v0.1 plan: optionally query products server-side for AI context; leave real-time cart changes to the Ajax Cart API in the browser.

## Storefront MCP / "Agentic commerce"
- Docs: https://shopify.dev/docs/agents (early access)
- Provides MCP servers/tools for catalog search across shops and Universal Cart, plus web components for checkout/Universal Cart.
- Intended AI responsibilities: find relevant products, reason about bundles, and optionally coordinate carts; not for per-click cart updates in a theme.
- Our v0.1 stance: note the tools for future (searchProducts, getProductDetails, proposeCartBundle), but keep the critical UI path on Ajax Cart; MCP tools can be added later for discovery/high-level cart alignment.

## Theme App Extensions / App Embeds
- Docs: https://shopify.dev/docs/apps/online-store/theme-app-extensions
- App embed blocks are the recommended way to inject persistent scripts/HTML/CSS; merchants enable/disable via the theme editor with no code edits.
- Script tag in `theme.liquid` is a lighter alternative but less controllable.
- Our v0.1 approach: provide a copy-paste `<script>` snippet; later we can ship a theme app embed for managed injection.

## Shopify app OAuth (high level)
- Docs: https://shopify.dev/docs/apps/auth/oauth
- Flow: merchant hits `https://{shop}/admin/oauth/authorize` with `client_id`, `scopes`, `redirect_uri`, `state`; Shopify returns `code`, `hmac`, `state`. Exchange `code` at `https://{shop}/admin/oauth/access_token` with `client_id` + `client_secret` to obtain the access token.
- Validate `hmac` and `state`; store tokens per shop securely; scopes control access. Offline vs online tokens apply depending on use.
- Not used in v0.1, but architecture should leave room for adding OAuth-based per-shop configuration later.

## v0.1 usage summary
- Cart mutations: Ajax Cart API from the widget in the browser.
- Product intelligence: Server-side OpenAI + optional Storefront API/MCP for discovery (non-blocking for UI).
- Embedding: script snippet today; theme app embed later for a managed experience.
