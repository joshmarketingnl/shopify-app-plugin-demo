# Vision

## Product direction
- Build a multi-tenant AI shopping assistant that any Shopify merchant can drop into their storefront with a single script snippet.
- Target personas:
  - Merchant/marketer: wants higher conversion with minimal setup.
  - Implementing developer: wants a safe, copy-paste integration without heavy theme edits.
  - Shopper: expects fast answers, trustworthy pricing, and instant cart updates.

## Principles
- Favor smart defaults over dozens of toggles; only expose options that materially change behavior.
- Keep the bot honest: never invent prices/discounts; surface store policies when relevant.
- Real-time, snappy cart interactions via the Shopify Ajax Cart API (no slow round trips through the AI loop).
- Respect each shop's tone, brand colors, and policies while keeping the UX lightweight.
- Keep the stack minimal and debuggable (plain Express, vanilla JS/CSS, no build steps).
