const express = require('express');
const configService = require('../services/configService');

const router = express.Router();

router.get('/clients', (_req, res) => {
  res.json(configService.getClients());
});

router.post('/clients', (req, res) => {
  const client = configService.createClient(req.body);
  if (!client) return res.status(400).json({ error: 'name is required' });
  return res.status(201).json(client);
});

router.get('/clients/:id/shops', (req, res) => {
  const { id } = req.params;
  res.json(configService.getShopsByClient(id));
});

router.post('/clients/:id/shops', (req, res) => {
  const { id } = req.params;
  const shop = configService.createShop(id, req.body);
  if (!shop) return res.status(400).json({ error: 'invalid client or missing shopDomain/publicId' });
  return res.status(201).json(shop);
});

router.get('/shops/:id/config', (req, res) => {
  const { id } = req.params;
  const config = configService.getShopConfig(id);
  if (!config) return res.status(404).json({ error: 'shop or config not found' });
  return res.json(config);
});

router.put('/shops/:id/config', (req, res) => {
  const { id } = req.params;
  const updated = configService.updateShopConfig(id, req.body || {});
  if (!updated) return res.status(404).json({ error: 'shop not found' });
  return res.json(updated);
});

module.exports = router;
