const { OpenAI } = require('openai');
const secretService = require('./secretService');
const logger = require('./logger');
const errorCodes = require('./errorCodes');

function buildSystemPrompt(shopConfig = {}) {
  const brand = shopConfig.brandDescription || 'This Shopify store';
  const tone = shopConfig.tone || 'clear, concise, helpful retail assistant';
  const language = shopConfig.language || 'en';
  const policies = shopConfig.extraContext || '';

  return [
    `You are an AI shopping assistant for a Shopify storefront. Respond in ${language}.`,
    `Tone: ${tone}. Brand: ${brand}.`,
    `Follow store policies and do not invent discounts or prices not provided.`,
    `Always respond with a JSON object: {"blocks": [...]}.`,
    `Block types:`,
    `- text: { "type": "text", "role": "assistant", "text": "..." }`,
    `- product_list: { "type": "product_list", "items": [{ "title": "...", "subtitle": "...", "description": "...", "image": "https://...", "price": "...", "variantId": "...", "quantity": 1, "productUrl": "https://..." }] }`,
    `- action_buttons: { "type": "action_buttons", "actions": [{ "type": "checkout"|"show_more"|"custom", "label": "...", "payload": { "message": "..." } }] }`,
    `- notice: { "type": "notice", "text": "..." }`,
    `Keep responses brief. Prefer product_list when recommending items.`,
    policies ? `Additional context: ${policies}` : '',
  ]
    .filter(Boolean)
    .join('\n');
}

async function getChatResponse({
  shopConfig,
  userMessage,
  conversationContext = [],
  productContext = [],
}) {
  const { apiKey } = secretService.getOpenAiConfig();
  if (!apiKey) {
    return {
      blocks: [
        { type: 'notice', text: 'Assistant is not configured yet. Please add an OpenAI key.' },
      ],
      error: errorCodes.ERR_OPENAI_CALL_FAILED,
    };
  }

  const client = new OpenAI({ apiKey });

  const input = [
    { role: 'system', content: buildSystemPrompt(shopConfig) },
    productContext.length
      ? {
          role: 'system',
          content: `Product context (JSON): ${JSON.stringify(productContext).slice(0, 6000)}`,
        }
      : null,
    ...conversationContext,
    { role: 'user', content: userMessage },
  ].filter(Boolean);

  let response;
  try {
    response = await client.responses.create({
      model: 'gpt-4o',
      input,
      temperature: 0.4,
    });
  } catch (err) {
    logger.error(
      errorCodes.ERR_OPENAI_CALL_FAILED,
      'OpenAI call failed',
      { shopId: shopConfig.id, message: userMessage },
      err
    );
    return {
      blocks: [
        {
          type: 'notice',
          text: 'We could not reach the assistant right now. Please try again shortly.',
        },
      ],
      error: errorCodes.ERR_OPENAI_CALL_FAILED,
    };
  }

  const content =
    response?.output_text ||
    response?.output?.[0]?.content?.[0]?.text ||
    response?.output?.[0]?.content?.[0]?.text?.value ||
    '';

  try {
    const parsed = JSON.parse(content);
    if (!parsed.blocks || !Array.isArray(parsed.blocks)) {
      throw new Error('Missing blocks array');
    }
    return { blocks: parsed.blocks };
  } catch (err) {
    logger.error(
      errorCodes.ERR_OPENAI_RESPONSE_INVALID,
      'AI response parse failed',
      { shopId: shopConfig.id },
      err
    );
    return {
      blocks: [
        {
          type: 'notice',
          text: 'The assistant sent an unexpected response. Please try asking again.',
        },
      ],
      error: errorCodes.ERR_OPENAI_RESPONSE_INVALID,
    };
  }
}

module.exports = {
  getChatResponse,
};
