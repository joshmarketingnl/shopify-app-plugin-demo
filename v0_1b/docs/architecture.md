# Architecture (v0.1b)

## High-level layout
- Namespaced everything under `/v0_1b` so legacy v0.1 stays untouched.
- Components:
  - **Backend (Express)**: serves static admin/widget assets, exposes `/v0_1b/api/chat` and `/v0_1b/api/admin/*`, handles config/secrets, calls OpenAI and Shopify APIs.
  - **Admin UI**: static HTML/JS/CSS at `/v0_1b/admin`, protected by `ADMIN_DASH_SECRET`.
  - **Widget SDK**: JS/CSS at `/v0_1b/widget`, embedded via script tag; renders chat UI and calls Ajax Cart.
  - **Test harness**: `/v0_1b/test/test-widget.html` to exercise the widget locally.
  - **Data**: `config.json` (clients/shops/configs, non-secret), `secrets.local.json` (OpenAI key, Shopify tokens), both under `v0_1b/server/data/`.

## Text diagram
```
Admin UI ──(x-admin-secret)──> Admin API ──> config.json / secrets.local.json
                                 │
Widget SDK <── static ───────────┘
   │
   ├─> /v0_1b/api/chat (Express) ──> aiService (OpenAI o4) + shopifyService/mcpService
   │                                   │
   │                                   └─> Storefront API (read-only product data)
   │
   └─> Shopify Ajax Cart (browser) for add/change/fetch cart
```

## Data flows
- **Chat**: user message → widget POST `/v0_1b/api/chat` with `shopPublicId` → backend loads shop config + secrets → optional Storefront search → OpenAI `o4` with context → backend validates `blocks[]` → widget renders; cart actions go straight to Ajax Cart from the browser.
- **Admin config**: admin UI (with secret) → `/v0_1b/api/admin/*` → update `config.json` and `secrets.local.json` (for OpenAI key/Shopify tokens).
- **Embed**: merchant copies snippet pointing to `/v0_1b/widget/sdk.js` and calls `SmartScaleChat.init({ shopPublicId, shopDomain })`.

## Security
- Admin access: enforced via `ADMIN_DASH_SECRET` on `/v0_1b/admin` static and `/v0_1b/api/admin/*`; return `ERR_ADMIN_AUTH_FAILED` on failure.
- Secrets: OpenAI key + Shopify tokens stored server-side (`secrets.local.json` or env). Never sent to widget.
- CORS: public routes (`/v0_1b/widget/*`, `/v0_1b/api/chat`, `/v0_1b/test/*`) allow shop origins; admin routes require secret and stricter CORS if needed.
- Error handling: centralized error codes + logger; friendly messages to clients.

## Differences from v0.1 (legacy)
- Strict namespacing `/v0_1b/*`.
- File-based multi-tenant config/secrets under `v0_1b/server/data/`.
- Block-based chat responses and mandatory Ajax Cart integration for real-time cart updates.
