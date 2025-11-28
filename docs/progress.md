# Progress log

## Phase 2 – Express skeleton & project structure
- Initialized Node project, added Express/dotenv/OpenAI dependencies.
- Created core structure: `server/` with routes/services stubs, `admin/`, `widget/`, `test/`, and `.env.example`.
- Added static serving for `/admin` and `/widget`, health and chat endpoints (stub), and placeholder admin/widget UIs.
- Added README with run instructions and linked docs.

Next: Phase 3 will implement the multi-tenant config service and admin API routes with real in-memory storage and JSON examples in `docs/architecture.md`.

## Phase 3 – Multi-tenant config & admin API
- Added in-memory config service with seeded demo client/shop and default ShopConfig structure.
- Implemented admin API routes for clients, shops, and shop configs; chat route now validates shopPublicId using config service.
- Documented JSON shapes for Client, Shop, and ShopConfig in `docs/architecture.md`.

Next: Phase 4 will build the admin UI to manage clients/shops/configs and display the embed snippet.
