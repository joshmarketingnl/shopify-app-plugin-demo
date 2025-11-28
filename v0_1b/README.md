# Shopify AI Assistant v0.1b

Namespaced demo that runs alongside the legacy v0.1 without conflicts. Backend, admin UI, widget, and tests all live under `/v0_1b`.

## Getting started
1) `cd v0_1b`
2) `npm install`
3) Copy `.env.example` → `.env` and fill values (keep secrets local).
4) `npm start` (or `npm run dev` with nodemon) to launch on `PORT` (default 3000).

## Routes (scaffold)
- `/v0_1b/health` — health check JSON.
- `/v0_1b/admin` — admin static assets (UI stub for now).
- `/v0_1b/widget` — widget SDK/static assets.
- `/v0_1b/test` — local test harness.
- `/v0_1b/api/chat` — chat API (stub; will integrate OpenAI o4 + Shopify).
- `/v0_1b/api/admin` — admin API (now supports clients, shops, configs, and AI settings).

## Notes
- All code and data for v0.1b stay inside `v0_1b/` so the legacy demo remains untouched.
- Do not commit real secrets or tokens; they belong in local `.env` or the gitignored `server/data/secrets.local.json`.

## Config
- Copy `.env.example` → `.env` and set:
  - `PORT` (default 3000)
  - `HOST_BASE_URL` (e.g., http://localhost:3000)
  - `ADMIN_DASH_SECRET` (required; used via `x-admin-secret` header)
- Admin auth:
  - All `/v0_1b/admin` and `/v0_1b/api/admin/*` routes require `x-admin-secret: <ADMIN_DASH_SECRET>`.
- OpenAI key:
  - Set via Admin UI (AI Settings) or manually in `server/data/secrets.local.json` (gitignored).
- Shopify Storefront token:
  - Provide per shop in config or `secrets.local.json` (`shopify[shopId].storefrontToken`).

## Known limitations
- Minimal file-based storage; no database yet.
- MCP/Storefront AI tools are simulated via Storefront API search.
- No production-grade auth/session model; a shared admin secret protects the dashboard and admin API.
