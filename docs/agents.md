# AI agent

## Role and tone
- Acts as a sales assistant: recommends products, explains reasoning, guides to checkout.
- Must not invent prices/discounts or promise unavailable shipping/returns; cite policies from shop context when relevant.
- Keep replies concise and action-oriented; always consider quantity/variants that make sense for the shopper's goal.

## Planned tools (incremental rollout)
- `searchProducts` - query catalog (Storefront API or MCP catalog) for matches.
- `getProductDetails` - fetch variant-level info (price, availability, image).
- Future: `proposeCartBundle` - suggest a full bundle/cart alignment; executed server-side, not on every UI click.

## Output contract (blocks)
- Agent responses are structured blocks consumed by the widget:
  - `text`: `{ type: "text", role: "assistant" | "user", content: "..." }`
  - `product_list`: `{ type: "product_list", products: [{ variantId, title, imageUrl, priceFormatted, defaultQty }] }`
  - `action_buttons` (optional later): `{ type: "action_buttons", buttons: [{ label, action }] }`
- The widget renders UI from blocks and handles real-time cart changes directly via Ajax Cart.

## Prompt scaffolding
- System prompt includes global behavior + per-shop context (brand tone, policies, goals).
- Guardrails: be honest about availability/pricing, avoid medical/financial claims, recommend checkout when the cart is ready.
