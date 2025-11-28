# v0.1b Vision

## What we are building
- Multi-tenant AI shopping assistant for Shopify storefronts with a hosted backend, admin UI, and embeddable widget.
- Runs side-by-side with legacy v0.1; all new routes, assets, and data are namespaced under `/v0_1b`.
- Merchant-facing value: faster product discovery, upsell recommendations, and checkout guidance without leaving the page.
- Developer-facing value: minimal setup (script snippet), clear error codes, and predictable APIs.

## Personas
- **Merchant / marketer**: wants quick brand-fit AI that increases AOV and conversion without heavy config.
- **Implementing developer**: needs a drop-in script, clear admin endpoints, and reliable logging/debug data.
- **Shopper**: expects helpful, accurate answers, real-time cart controls, and a polished in-chat shopping flow.

## Experience principles
- **Minimal configuration**: sensible defaults; context + tone pulled from shop config.
- **Contextual intelligence**: AI (OpenAI `o4`) uses shop context, product data, and policies—no invented discounts or stock.
- **Real-time cart**: quantity buttons and “Add to cart” call Shopify Ajax Cart directly for zero-latency feedback.
- **Safety & trust**: avoid hallucinating price/discount; never expose secrets client-side; admin gated by `ADMIN_DASH_SECRET`.
- **Observability first**: consistent error codes and logs; widget shows user-friendly fallbacks.
- **Side-by-side comparability**: v0.1b is isolated so legacy demo keeps working unchanged.

## Scope for v0.1b
- Backend: Node + Express, file-based config/secrets (gitignored), OpenAI Node client with model `o4` only.
- Admin UI: vanilla HTML/JS/CSS served from `/v0_1b/admin`, protected via shared secret.
- Widget SDK: vanilla JS/CSS served from `/v0_1b/widget`, renders blocks and drives Ajax Cart.
- Optional test harness: simple HTML page under `/v0_1b/test` for local verification.

## Success criteria
- Merchant can configure shops/AI settings in admin, copy embed snippet, and see the widget on their theme.
- Shopper can chat, see product cards sourced from real Storefront API data, adjust quantities, and checkout inline.
- Errors are discoverable via logs and error codes; broken AI/cart flows degrade gracefully.
