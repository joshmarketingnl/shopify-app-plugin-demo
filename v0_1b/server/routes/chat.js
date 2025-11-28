const express = require('express');
const configService = require('../services/configService');
const aiService = require('../services/aiService');
const shopifyService = require('../services/shopifyService');

const router = express.Router();

router.post('/', async (req, res) => {
  const { message, shopPublicId, sessionId, cartSnapshot } = req.body || {};
  if (!message || !shopPublicId) {
    return res.status(400).json({
      blocks: [{ type: 'notice', text: 'Missing message or shop identifier.' }],
    });
  }

  const shop = configService.getShopByPublicId(shopPublicId);
  if (!shop) {
    return res.status(404).json({
      blocks: [{ type: 'notice', text: 'Shop not found for this widget.' }],
    });
  }

  const shopConfig = { id: shop.id, ...configService.getShopConfig(shop.id), shopDomain: shop.shopDomain };

  const conversationContext = []; // Placeholder for future memory/summary

  let productContext = [];
  try {
    productContext = await shopifyService.searchProducts({
      shopConfig,
      query: message,
      limit: 3,
    });
  } catch (err) {
    console.error('Product search failed', err);
  }

  try {
    const result = await aiService.getChatResponse({
      shopConfig,
      userMessage: message,
      conversationContext,
      cartSnapshot,
      sessionId,
      productContext,
    });
    res.json({ blocks: result.blocks || [] });
  } catch (err) {
    console.error('Chat route failed', err);
    res.status(500).json({
      blocks: [{ type: 'notice', text: 'Assistant is unavailable right now.' }],
    });
  }
});

module.exports = router;
