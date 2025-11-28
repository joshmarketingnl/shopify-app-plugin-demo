const { OpenAI } = require('openai');
const secretService = require('./secretService');

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

async function getChatResponse({ shopConfig, userMessage, conversationContext = [] }) {
  const { apiKey, model } = secretService.getOpenAiConfig();
  if (!apiKey) {
    return {
      blocks: [
        { type: 'notice', text: 'Assistant is not configured yet. Please add an OpenAI key.' },
      ],
    };
  }

  const client = new OpenAI({ apiKey });

  const messages = [
    { role: 'system', content: buildSystemPrompt(shopConfig) },
    ...conversationContext,
    { role: 'user', content: userMessage },
  ];

  let completion;
  try {
    completion = await client.chat.completions.create({
      model: 'o4',
      messages,
      response_format: { type: 'json_object' },
      temperature: 0.4,
    });
  } catch (err) {
    console.error('OpenAI call failed', err);
    return {
      blocks: [
        {
          type: 'notice',
          text: 'We could not reach the assistant right now. Please try again shortly.',
        },
      ],
    };
  }

  const content = completion?.choices?.[0]?.message?.content || '';
  try {
    const parsed = JSON.parse(content);
    if (!parsed.blocks || !Array.isArray(parsed.blocks)) {
      throw new Error('Missing blocks array');
    }
    return { blocks: parsed.blocks };
  } catch (err) {
    console.error('AI response parse failed', err, content);
    return {
      blocks: [
        {
          type: 'notice',
          text: 'The assistant sent an unexpected response. Please try asking again.',
        },
      ],
    };
  }
}

module.exports = {
  getChatResponse,
};
