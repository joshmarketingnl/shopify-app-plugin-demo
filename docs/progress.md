# Progress log

## Phase 2 - Express skeleton & project structure
- Initialized Node project, added Express/dotenv/OpenAI dependencies.
- Created core structure: `server/` with routes/services stubs, `admin/`, `widget/`, `test/`, and `.env.example`.
- Added static serving for `/admin` and `/widget`, health and chat endpoints (stub), and placeholder admin/widget UIs.
- Added README with run instructions and linked docs.

Next: Phase 3 will implement the multi-tenant config service and admin API routes with real in-memory storage and JSON examples in `docs/architecture.md`.

## Phase 3 - Multi-tenant config & admin API
- Added in-memory config service with seeded demo client/shop and default ShopConfig structure.
- Implemented admin API routes for clients, shops, and shop configs; chat route now validates `shopPublicId` using the config service.
- Documented JSON shapes for Client, Shop, and ShopConfig in `docs/architecture.md`.

Next: Phase 4 will build the admin UI to manage clients/shops/configs and display the embed snippet.

## Phase 4 - Admin web UI v0.1
- Built `/admin` single-page UI: clients list + add form, shops per client + add form, and editable shop config (AI prompt/context, branding, integration, capabilities).
- Added embed snippet generator that uses `shopPublicId` and `shopDomain` from the selected shop.
- Updated `docs/vision.md` and `docs/architecture.md` to capture the admin UX approach.

Next: Phase 5 will implement the widget SDK/chat UI with Ajax Cart hooks and styling.

## Phase 5 - Widget SDK, chat UI, Ajax Cart hooks
- Implemented widget UI with floating launcher, chat panel, text + product_list rendering, and checkout shortcut.
- Added Ajax Cart helpers (`/cart/add.js`, `/cart/change.js`) and respect `capabilities.canModifyCart/showProductImages/enableQuantityButtons`.
- Widget now loads branding/capabilities via a public `/api/public/shop-config/:publicId` route and injects its own CSS from the widget host.

Next: Phase 6 will wire the AI service and /api/chat to produce structured blocks.

## Phase 6 - AI agent service & /api/chat
- Implemented AI service with system prompt built from per-shop context (language, tone, base prompt, extra context) and OpenAI integration (fallback to stub blocks if not available).
- /api/chat now validates shop config and returns structured `blocks` with assistant text and product_list suggestions.
- Documented prompt behavior and fallback in `docs/agents.md`.

Next: Phase 7 will focus on local testing harness updates and README development steps.

## Phase 7 - Local testing harness
- Updated test harness to load the widget SDK from the running server and use the seeded `demo-shop`.
- Expanded README with local development steps (/health, /admin, /test/test-widget).

Next: Phase 8 will add deployment notes for VPS and final v0.1 summary.
