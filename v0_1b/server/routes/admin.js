const express = require('express');
const configService = require('../services/configService');
const secretService = require('../services/secretService');

const router = express.Router();

// Clients
router.get('/clients', (req, res) => {
  try {
    const clients = configService.getClients();
    res.json({ clients });
  } catch (err) {
    res.status(500).json({ error: 'Failed to load clients' });
  }
});

router.post('/clients', (req, res) => {
  const { name, contactEmail } = req.body || {};
  if (!name) {
    return res.status(400).json({ error: 'Client name is required' });
  }
  try {
    const client = configService.createClient({ name, contactEmail });
    res.status(201).json({ client });
  } catch (err) {
    res.status(500).json({ error: 'Failed to create client' });
  }
});

// Shops per client
router.get('/clients/:id/shops', (req, res) => {
  try {
    const shops = configService.getShopsByClient(req.params.id);
    res.json({ shops });
  } catch (err) {
    res.status(500).json({ error: 'Failed to load shops' });
  }
});

router.post('/clients/:id/shops', (req, res) => {
  const { shopDomain, publicId, status, name } = req.body || {};
  if (!shopDomain) {
    return res.status(400).json({ error: 'shopDomain is required' });
  }
  try {
    const shop = configService.createShop(req.params.id, {
      shopDomain,
      publicId,
      status,
      name,
    });
    res.status(201).json({ shop });
  } catch (err) {
    res.status(500).json({ error: 'Failed to create shop' });
  }
});

// Shop config
router.get('/shops/:id/config', (req, res) => {
  const shop = configService.getShopById(req.params.id);
  if (!shop) {
    return res.status(404).json({ error: 'Shop not found' });
  }
  try {
    const config = configService.getShopConfig(req.params.id);
    res.json({ shopId: req.params.id, config });
  } catch (err) {
    res.status(500).json({ error: 'Failed to load shop config' });
  }
});

router.put('/shops/:id/config', (req, res) => {
  const shop = configService.getShopById(req.params.id);
  if (!shop) {
    return res.status(404).json({ error: 'Shop not found' });
  }
  try {
    const updated = configService.updateShopConfig(req.params.id, req.body || {});
    res.json({ shopId: req.params.id, config: updated });
  } catch (err) {
    res.status(500).json({ error: 'Failed to update shop config' });
  }
});

// AI settings
router.get('/settings/ai', (req, res) => {
  try {
    const settings = secretService.getOpenAiConfig();
    res.json(settings);
  } catch (err) {
    res.status(500).json({ error: 'Failed to load AI settings' });
  }
});

router.put('/settings/ai', (req, res) => {
  const { apiKey, debugLogging } = req.body || {};
  try {
    const settings = secretService.setOpenAiConfig({ apiKey, debugLogging });
    res.json(settings);
  } catch (err) {
    res.status(500).json({ error: 'Failed to update AI settings' });
  }
});

module.exports = router;
