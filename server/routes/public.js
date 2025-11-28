const express = require('express');
const configService = require('../services/configService');

const router = express.Router();

router.get('/shop-config/:publicId', (req, res) => {
  const { publicId } = req.params;
  const shop = configService.getShopByPublicId(publicId);
  if (!shop) return res.status(404).json({ error: 'shop not found' });
  const config = configService.getShopConfig(shop.id);
  if (!config) return res.status(404).json({ error: 'config not found' });

  const sanitized = {
    shop: {
      id: shop.id,
      publicId: shop.publicId,
      shopDomain: shop.shopDomain,
      status: shop.status,
    },
    config: {
      branding: config.branding,
      capabilities: config.capabilities,
      integration: {
        shopDomain: config.integration.shopDomain,
      },
    },
  };

  return res.json(sanitized);
});

module.exports = router;
