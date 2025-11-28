# Shopify AI Shopping Assistant (v0.1 scaffold)

Minimal Express + vanilla JS scaffold for a multi-tenant AI shopping assistant widget for Shopify storefronts.

## Getting started (local)
1) Install dependencies: `npm install`
2) Copy `.env.example` to `.env` and fill in values.
3) Run the server: `npm run dev` (or `npm start`).
4) Health check: `http://localhost:3000/health`.
5) Admin UI: `http://localhost:3000/admin` (manage clients/shops/config and copy embed snippet).
6) Widget test page: `http://localhost:3000/test/test-widget.html` (loads the SDK and uses the seeded `demo-shop`).

## Project layout
- `server/` Express app, routes (health/chat/admin/public shop-config), services (config, AI, Shopify helper stub).
- `admin/` Admin UI to manage clients/shops/config and generate embed snippet.
- `widget/` Embeddable widget SDK + styles (chat UI, product cards, Ajax Cart).
- `docs/` Product and Shopify reference notes + progress log.
- `test/` Local test harness for the widget.

## Deployment (VPS)
- Requirements: Node.js 18+, npm, optional pm2.
- Steps:
  1. `git clone https://github.com/joshmarketingnl/shopify-app-plugin-demo.git`
  2. `cd shopify-app-plugin-demo && npm install`
  3. Copy `.env.example` to `.env` and set `PORT`, `OPENAI_API_KEY`, `HOST_BASE_URL` (public domain of this server).
  4. Run `node server/index.js` or `pm2 start server/index.js --name shopify-assistant`.
  5. Ensure the public domain serves `/widget/sdk.js` and `/api/*` for storefront usage.

## Known issues / v0.1 limitations
- Config storage is in-memory only (restart will reset clients/shops/configs).
- AI uses a simple prompt with fallback stub products (no real product catalog yet).
- No authentication on admin/public APIs; restrict access at the network layer for now.
- Ajax Cart behavior has been tested locally; validate on a real Shopify theme for production.

## Docs
Design and Shopify-specific decisions live in `docs/` (see `docs/architecture.md`, `docs/shopify.md`, `docs/vision.md`, `docs/agents.md`, `docs/context.md`).
