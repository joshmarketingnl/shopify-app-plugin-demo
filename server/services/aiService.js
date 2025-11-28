// Stub AI service for phase 2. Will be expanded with real OpenAI calls and structured blocks.

async function getChatResponse({ userMessage }) {
  return {
    blocks: [
      { type: 'text', role: 'assistant', content: 'This is a placeholder response.' },
      {
        type: 'product_list',
        products: [
          {
            variantId: 'placeholder-variant',
            title: 'Sample product',
            imageUrl: '',
            priceFormatted: '$0.00',
            defaultQty: 1,
          },
        ],
      },
    ],
    echo: userMessage,
  };
}

module.exports = {
  getChatResponse,
};
