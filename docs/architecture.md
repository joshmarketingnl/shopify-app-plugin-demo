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

## Notes for future phases
- Add theme app embed for managed injection.
- Add persistent storage + OAuth for per-shop tokens and Storefront API access tokens.
- Consider MCP universal cart/search when Shopify GA is available.
