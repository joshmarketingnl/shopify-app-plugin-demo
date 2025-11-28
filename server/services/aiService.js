const OpenAI = require('openai');

const openaiApiKey = process.env.OPENAI_API_KEY;
const openaiClient = openaiApiKey ? new OpenAI({ apiKey: openaiApiKey }) : null;

function buildSystemPrompt(shopConfig) {
  const parts = [
    'You are a concise, friendly Shopify sales assistant. Recommend relevant products, suggest sensible quantities, and guide shoppers to checkout.',
    'Be honest: do not invent discounts, prices, or shipping details. Keep replies short and action-oriented.',
    shopConfig?.ai?.baseSystemPrompt || '',
    shopConfig?.ai?.extraContext || '',
    shopConfig?.ai?.language ? `Respond in language: ${shopConfig.ai.language}.` : '',
    shopConfig?.ai?.tone ? `Tone: ${shopConfig.ai.tone}.` : '',
    shopConfig?.integration?.shopDomain
      ? `Shop domain: ${shopConfig.integration.shopDomain}.`
      : '',
  ];
  return parts.filter(Boolean).join('\n');
}

function buildFallbackProducts(shopConfig) {
  const shopDomain = shopConfig?.integration?.shopDomain || 'shop.example.com';
  return [
    {
      variantId: 'demo-variant-1',
      title: 'Featured pick',
      imageUrl: `https://${shopDomain}/placeholder.png`,
      priceFormatted: '$29.00',
      defaultQty: 1,
    },
    {
      variantId: 'demo-variant-2',
      title: 'Bundle helper',
      imageUrl: `https://${shopDomain}/placeholder.png`,
      priceFormatted: '$49.00',
      defaultQty: 1,
    },
  ];
}

async function callOpenAI(systemPrompt, userMessage) {
  if (!openaiClient) return null;
  try {
    const completion = await openaiClient.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userMessage },
      ],
      temperature: 0.7,
    });
    const content = completion.choices?.[0]?.message?.content?.trim() || '';
    return content;
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error('OpenAI error', err);
    return null;
  }
}

async function getChatResponse({ shopConfig, userMessage }) {
  const systemPrompt = buildSystemPrompt(shopConfig);
  const aiText = (await callOpenAI(systemPrompt, userMessage)) || 'Here are some products that match your request.';
  const products = buildFallbackProducts(shopConfig);

  const blocks = [
    {
      type: 'text',
      role: 'assistant',
      content: aiText,
    },
    {
      type: 'product_list',
      products,
    },
  ];

  return { blocks };
}

module.exports = {
  getChatResponse,
};
