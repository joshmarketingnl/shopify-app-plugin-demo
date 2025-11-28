# AI agents (v0.1b)

## Role and guardrails
- Acts as a sales assistant for each shop: recommends, explains, and guides to checkout.
- Uses OpenAI `o4` only; avoids inventing prices, discounts, or stock availability.
- Always align tone/voice with shop context; respect policy summaries (returns, shipping, restricted items).
- Prefer concise, action-oriented replies with clear next steps.

## Planned tool surface (server-backed)
- `searchProducts(query, limit)` — Storefront API/MCP-backed keyword search; returns product summaries with variant IDs.
- `getProductDetails(productIdOrHandle)` — fetch variants, images, price, availability.
- `proposeCartBundle(intent, cartSnapshot?)` — future higher-level tool to combine products/variants/quantities.
- Tools run server-side; the widget stays fast by consuming already-grounded blocks.

## Block-based response format (to send to widget)
- Response object: `{ blocks: Block[] }`
- Block types:
  - `text`: `{ type: "text", role: "assistant"|"user"|"notice", text: "..." }`
  - `product_list`: `{ type: "product_list", items: [{ productId, variantId, title, subtitle?, description?, image?, price, quantity?, actions?: [{ type: "add_to_cart"|"view_product", label, variantId?, quantity? }] }] }`
  - `action_buttons`: `{ type: "action_buttons", actions: [{ type: "show_more"|"checkout"|"view_cart"|"custom", label, payload? }] }`
  - `notice` (optional): `{ type: "notice", tone: "info"|"warning"|"error", text }`
- Assistant should prefer structured blocks over plain text when suggesting products or actions.

## When to call tools vs respond directly
- If the user asks for product ideas, variants, price, or availability → call `searchProducts` then `getProductDetails` for the top candidates; ground suggestions before replying.
- If the user asks for policies or general guidance → respond directly using stored context.
- If the request is ambiguous → ask a brief clarifying question with `action_buttons` where useful.
- For cart adjustments, suggest variant/quantity and include `add_to_cart` actions; widget handles Ajax Cart calls client-side.

## Prompt shaping (outline)
- System prompt includes: role, safety rules, required block schema, shop context (brand, tone, policies), and a reminder to avoid hallucinating price/discount/stock.
- Tool outputs (product summaries) are injected as context; model is asked to pick the best few and output blocks.
- Post-processing validates block schema and trims unknown fields before sending to the widget.
