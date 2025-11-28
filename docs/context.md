# Per-shop context

## What we store
- Brand description and key value props.
- Tone of voice (friendly, expert, playful, etc.).
- Goals (for example, "upsell bundles", "optimize AOV", "focus on vegan SKUs").
- Policies worth surfacing: shipping, returns, sizing/fit notes, allergy warnings.
- AI guidance: base system prompt overrides, extra examples, or taboo topics.
- Branding hints for the widget (colors, placement) managed alongside config.

## How it is applied
- Context is merged into the system prompt for the AI agent on each /api/chat call.
- Widget theming uses branding fields (colors, position) but still defaults to sensible styling.
- Policies and goals should be referenced by the agent when relevant to user intent (for example, shipping timelines when a user asks about delivery).
