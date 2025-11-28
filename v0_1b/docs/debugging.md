# Debugging playbook (v0.1b)

## Error codes (central list)
- `ERR_ADMIN_AUTH_FAILED`
- `ERR_SHOP_NOT_FOUND`
- `ERR_CONFIG_NOT_FOUND`
- `ERR_OPENAI_CALL_FAILED`
- `ERR_OPENAI_RESPONSE_INVALID`
- `ERR_MCP_PRODUCT_SEARCH_FAILED`
- `ERR_MCP_PRODUCT_DETAILS_FAILED`
- `ERR_STOREFRONT_API_FAILED`
- `ERR_BLOCK_SCHEMA_INVALID`
- `ERR_CART_ADD_FAILED`
- `ERR_CART_CHANGE_FAILED`
- `ERR_CART_AJAX_NETWORK`
- `ERR_AGENT_PARSING_FAILED`
- `ERR_WIDGET_RENDER_FAILED`

## Logging strategy
- Central logger outputs timestamp, level, error code, message, and stack (for server logs).
- Attach context: route, shopPublicId, clientId, payload shapes (sanitized), and upstream status codes.
- Debug flag (from secrets/config) can increase verbosity for development.

## Debug flows
- **OpenAI failures**: check key presence and model (`o4`), log request/response metadata (not full prompts if sensitive), retry/backoff, return friendly notice block.
- **Storefront API failures**: log token usage (masked), endpoint/query, shop domain, and GraphQL errors; surface `ERR_STOREFRONT_API_FAILED` to caller.
- **MCP/tool failures**: wrap in `ERR_MCP_*`, include tool name/params; fall back to Storefront API search where possible.
- **Ajax Cart issues**: capture network errors and Shopify response body; differentiate add vs change errors (`ERR_CART_ADD_FAILED`/`ERR_CART_CHANGE_FAILED`); if cart endpoints unavailable (non-storefront), show notice.
- **Block schema issues**: validate blocks before sending to widget; if invalid, log `ERR_BLOCK_SCHEMA_INVALID` and return a plain text fallback.
- **Widget rendering**: guard DOM operations; if a block cannot render, log `ERR_WIDGET_RENDER_FAILED` (console) and show a safe fallback bubble.

## Tips
- Keep secrets out of client logs; mask tokens/keys.
- Use test harness (`/v0_1b/test/test-widget.html`) to reproduce widget issues without touching a live store.
- When in doubt, compare against Shopify docs (Ajax Cart + Storefront API) to ensure payload shapes are correct.
