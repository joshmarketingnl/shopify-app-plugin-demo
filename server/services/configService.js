const { randomUUID } = require('crypto');

const clients = [];
const shops = [];
const shopConfigs = {};

function newId(prefix) {
  return `${prefix}_${randomUUID()}`;
}

function buildDefaultShopConfig(shop) {
  return {
    shopId: shop.id,
    ai: {
      baseSystemPrompt: '',
      extraContext: '',
      language: 'en',
      tone: 'friendly',
    },
    branding: {
      primaryColor: '#0c6dfd',
      accentColor: '#f97316',
      widgetPosition: 'bottom-right',
    },
    integration: {
      shopDomain: shop.shopDomain,
      storefrontToken: '',
      mcpConfig: null,
    },
    capabilities: {
      canModifyCart: true,
      showProductImages: true,
      enableQuantityButtons: true,
    },
  };
}

function seedDemo() {
  if (clients.length > 0) return;
  const clientId = newId('client');
  const shopId = newId('shop');
  const client = { id: clientId, name: 'Demo Client', contactEmail: 'demo@example.com' };
  const shop = {
    id: shopId,
    clientId,
    shopDomain: 'demo-shop.myshopify.com',
    publicId: 'demo-shop',
    status: 'active',
  };
  clients.push(client);
  shops.push(shop);
  shopConfigs[shopId] = buildDefaultShopConfig(shop);
}

seedDemo();

function getClients() {
  return [...clients];
}

function createClient(data) {
  const { name, contactEmail } = data || {};
  if (!name) return null;
  const client = { id: newId('client'), name, contactEmail: contactEmail || '' };
  clients.push(client);
  return client;
}

function getShopsByClient(clientId) {
  return shops.filter((shop) => shop.clientId === clientId);
}

function getShopById(id) {
  return shops.find((shop) => shop.id === id) || null;
}

function createShop(clientId, data) {
  const clientExists = clients.some((c) => c.id === clientId);
  if (!clientExists) return null;

  const { shopDomain, publicId, status } = data || {};
  if (!shopDomain || !publicId) return null;

  const shop = {
    id: newId('shop'),
    clientId,
    shopDomain,
    publicId,
    status: status || 'active',
  };

  shops.push(shop);
  shopConfigs[shop.id] = buildDefaultShopConfig(shop);
  return shop;
}

function getShopByPublicId(publicId) {
  return shops.find((shop) => shop.publicId === publicId) || null;
}

function getShopConfig(shopId) {
  return shopConfigs[shopId] || null;
}

function updateShopConfig(shopId, data) {
  const shop = getShopById(shopId);
  if (!shop) return null;

  const existing = shopConfigs[shopId] || buildDefaultShopConfig(shop);
  shopConfigs[shopId] = {
    ...existing,
    ai: { ...existing.ai, ...(data.ai || {}) },
    branding: { ...existing.branding, ...(data.branding || {}) },
    integration: { ...existing.integration, ...(data.integration || {}) },
    capabilities: { ...existing.capabilities, ...(data.capabilities || {}) },
  };

  return shopConfigs[shopId];
}

module.exports = {
  getClients,
  createClient,
  getShopsByClient,
  createShop,
  getShopByPublicId,
  getShopById,
  getShopConfig,
  updateShopConfig,
};
