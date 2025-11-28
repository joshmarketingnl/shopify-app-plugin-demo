# Architecture (v0.1 plan)

## High-level flow
- Admin UI (vanilla HTML/JS) -> Express backend (config + AI) -> Shopify APIs (Storefront/Ajax/MCP) -> Widget (vanilla JS/CSS on storefront).

## Text diagram
- Shopper browser (widget)  
  -> calls `/api/chat` with `shopPublicId`  
  -> receives structured `blocks[]`  
  -> renders chat and product cards  
  -> uses Ajax Cart (`/cart/add.js`, `/cart/change.js`, `/cart.js`) directly for real-time cart updates  
  -> redirects to `/checkout`.
- Admin/ops browser  
  -> visits `/admin`  
  -> creates clients/shops, edits per-shop context and branding  
  -> copies the embed snippet.
- Backend (Express)  
  -> serves admin and widget assets  
  -> stores config (in-memory/JSON for v0.1)  
  -> builds AI prompts from per-shop context  
  -> (future) calls Storefront API/MCP for product intelligence.

## Responsibilities
- Widget: UI rendering, chat interactions, immediate cart mutations via Ajax Cart, checkout redirect.
- Backend: multi-tenant config, prompt assembly, AI call orchestration, basic health endpoints.
- AI/service layer: generate product suggestions and reasoning; output structured blocks; never handle per-click cart changes.
- Shopify APIs: Ajax Cart for cart mutations in browser; Storefront API/MCP for catalog data when needed.

## Admin UX (v0.1)
- Single-page view: clients (left), shops (middle), shop configuration (full-width row).
- Config form edits AI prompt/context, branding colors, widget position, integration domain/token, and cart/product toggles.
- Embed snippet is generated per shop using `shopPublicId` and `shopDomain` for copy/paste.

## Widget config fetch
- Public endpoint: `GET /api/public/shop-config/:publicId` returns a sanitized config (branding, capabilities, shopDomain) for the widget to theme itself and decide whether cart buttons are enabled.

## Notes for future phases
- Add theme app embed for managed injection.
- Add persistent storage + OAuth for per-shop tokens and Storefront API access tokens.
- Consider MCP universal cart/search when Shopify GA is available.

## Data shapes (JSON examples)
- Client:
```json
{
  "id": "client_123",
  "name": "Demo Client",
  "contactEmail": "demo@example.com"
}
```
- Shop:
```json
{
  "id": "shop_123",
  "clientId": "client_123",
  "shopDomain": "demo-shop.myshopify.com",
  "publicId": "demo-shop",
  "status": "active"
}
```
- ShopConfig:
```json
{
  "shopId": "shop_123",
  "ai": {
    "baseSystemPrompt": "",
    "extraContext": "",
    "language": "en",
    "tone": "friendly"
  },
  "branding": {
    "primaryColor": "#0c6dfd",
    "accentColor": "#f97316",
    "widgetPosition": "bottom-right"
  },
  "integration": {
    "shopDomain": "demo-shop.myshopify.com",
    "storefrontToken": "",
    "mcpConfig": null
  },
  "capabilities": {
    "canModifyCart": true,
    "showProductImages": true,
    "enableQuantityButtons": true
  }
}
```
