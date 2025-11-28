# Shopify AI Shopping Assistant (v0.1 scaffold)

Minimal Express + vanilla JS scaffold for a multi-tenant AI shopping assistant widget for Shopify storefronts.

## Getting started
1) Install dependencies: `npm install`
2) Copy `.env.example` to `.env` and fill in values.
3) Run the server: `npm run dev` (or `npm start`) then open `http://localhost:3000/admin` or `http://localhost:3000/test/test-widget.html`.

## Project layout
- `server/` Express app, routes, services (stubs for now).
- `admin/` Admin UI (placeholder until later phases).
- `widget/` Embeddable widget SDK (placeholder UI until later phases).
- `docs/` Product and Shopify reference notes.
- `test/` Local test harness for the widget.

## Docs
Design and Shopify-specific decisions live in `docs/` (see `docs/architecture.md`, `docs/shopify.md`, `docs/vision.md`, `docs/agents.md`, `docs/context.md`).
