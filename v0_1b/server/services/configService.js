const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

const CONFIG_PATH = path.join(__dirname, '..', 'data', 'config.json');

function ensureConfig() {
  if (!fs.existsSync(CONFIG_PATH)) {
    const initial = { clients: [], shops: [], shopConfigs: {} };
    fs.writeFileSync(CONFIG_PATH, JSON.stringify(initial, null, 2));
    return initial;
  }
  const raw = fs.readFileSync(CONFIG_PATH, 'utf8');
  try {
    const parsed = JSON.parse(raw || '{}');
    // Normalize shape in case fields are missing.
    return {
      clients: parsed.clients || [],
      shops: parsed.shops || [],
      shopConfigs: parsed.shopConfigs || {},
    };
  } catch (err) {
    throw new Error(`Failed to parse config.json: ${err.message}`);
  }
}

function saveConfig(config) {
  fs.writeFileSync(CONFIG_PATH, JSON.stringify(config, null, 2));
}

function getClients() {
  const config = ensureConfig();
  return config.clients;
}

function createClient(data) {
  const config = ensureConfig();
  const client = {
    id: uuidv4(),
    name: data.name || 'New client',
    contactEmail: data.contactEmail || '',
  };
  config.clients.push(client);
  saveConfig(config);
  return client;
}

function getShopsByClient(clientId) {
  const config = ensureConfig();
  return config.shops.filter((shop) => shop.clientId === clientId);
}

function createShop(clientId, data) {
  const config = ensureConfig();
  const shop = {
    id: uuidv4(),
    clientId,
    shopDomain: data.shopDomain || '',
    publicId: data.publicId || uuidv4().slice(0, 8),
    status: data.status || 'active',
    name: data.name || '',
  };
  config.shops.push(shop);
  // Seed an empty config entry for this shop.
  config.shopConfigs[shop.id] = config.shopConfigs[shop.id] || {};
  saveConfig(config);
  return shop;
}

function getShopById(id) {
  const config = ensureConfig();
  return config.shops.find((shop) => shop.id === id) || null;
}

function getShopByPublicId(publicId) {
  const config = ensureConfig();
  return config.shops.find((shop) => shop.publicId === publicId) || null;
}

function getShopConfig(shopId) {
  const config = ensureConfig();
  return config.shopConfigs[shopId] || {};
}

function updateShopConfig(shopId, patch = {}) {
  const config = ensureConfig();
  const existing = config.shopConfigs[shopId] || {};
  const updated = { ...existing, ...patch };
  config.shopConfigs[shopId] = updated;
  saveConfig(config);
  return updated;
}

module.exports = {
  getClients,
  createClient,
  getShopsByClient,
  createShop,
  getShopById,
  getShopByPublicId,
  getShopConfig,
  updateShopConfig,
};
