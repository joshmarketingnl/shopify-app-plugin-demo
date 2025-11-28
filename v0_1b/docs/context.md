# Shop context model (v0.1b)

## What we store per shop
- **Brand description**: short story, value props, differentiators.
- **Tone/voice**: friendly, expert, playful, luxury, etc.
- **Target audience**: personas, intents, pain points.
- **Goals**: upsell rules, AOV targets, categories to highlight, bundles to promote.
- **Policies**: summarized shipping/returns/exchanges; any restrictions (e.g., age-gated items).
- **Catalog hints**: featured collections, hero products, best-sellers; optional tags/handles.
- **Capabilities**: can modify cart, show product images, enable quantity buttons.
- **Integration**: shop domain, storefront token, optional MCP config.

## How context is applied
- On each chat request:
  - Fetch `shopConfig` by `shopPublicId`.
  - Merge base system prompt + shop context + policy summaries + brand voice.
  - Include recent conversation (short) and optional cart snapshot.
  - Inject any pre-fetched product summaries to ground AI choices.
- The prompt reminds the model to stay within provided context and not invent prices/discounts/policies.

## Example prompt stitching (conceptual)
- System: role, safety, block schema.
- Shop section: brand story, tone, goals, policies, allowed/blocked claims.
- Tools/context section: list of product candidates (title, handle, variantId, price, image URL) from Storefront API.
- User: latest user message + minimal history.

## Persistence
- Non-secret context lives in `config.json` (client/shop/shopConfig nodes).
- Secrets (Storefront tokens, OpenAI key) live in `secrets.local.json` or environment variables; never shipped to the browser.

## Defaults and fallbacks
- If tone not provided → use clear, concise, helpful retail voice.
- If policies missing → avoid making promises; suggest checking store policies page.
- If catalog hints missing → rely on Storefront API search results.
