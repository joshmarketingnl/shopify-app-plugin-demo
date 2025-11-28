const express = require('express');
const aiService = require('../services/aiService');
const configService = require('../services/configService');

const router = express.Router();

router.post('/', async (req, res) => {
  try {
    const { message, shopPublicId, sessionId } = req.body || {};

    if (!message) {
      return res.status(400).json({ error: 'message is required' });
    }
    if (!shopPublicId) {
      return res.status(400).json({ error: 'shopPublicId is required' });
    }

    const shop = configService.getShopByPublicId(shopPublicId);
    if (!shop) {
      return res.status(404).json({ error: 'shop not found' });
    }

    const shopConfig = configService.getShopConfig(shop.id);

    const result = await aiService.getChatResponse({
      shopConfig,
      userMessage: message,
      conversationContext: { shopPublicId, sessionId },
    });

    return res.json(result);
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error('Error in /api/chat', err);
    return res.status(500).json({ error: 'Unexpected error' });
  }
});

module.exports = router;
