const express = require('express');
const configService = require('../services/configService');
const aiService = require('../services/aiService');

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

  const shopConfig = configService.getShopConfig(shop.id);

  const conversationContext = []; // Placeholder for future memory/summary
  try {
    const result = await aiService.getChatResponse({
      shopConfig,
      userMessage: message,
      conversationContext,
      cartSnapshot,
      sessionId,
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
