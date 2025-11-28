const fs = require('fs');
const path = require('path');

const SECRETS_PATH = path.join(__dirname, '..', 'data', 'secrets.local.json');

function ensureSecrets() {
  if (!fs.existsSync(SECRETS_PATH)) {
    const initial = {
      openai: { apiKey: '', model: 'o4', debugLogging: false },
      shopify: {},
    };
    fs.writeFileSync(SECRETS_PATH, JSON.stringify(initial, null, 2));
    return initial;
  }
  const raw = fs.readFileSync(SECRETS_PATH, 'utf8');
  try {
    const parsed = JSON.parse(raw || '{}');
    return {
      openai: {
        apiKey: parsed.openai?.apiKey || '',
        model: parsed.openai?.model || 'o4',
        debugLogging: Boolean(parsed.openai?.debugLogging),
      },
      shopify: parsed.shopify || {},
    };
  } catch (err) {
    throw new Error(`Failed to parse secrets.local.json: ${err.message}`);
  }
}

function saveSecrets(secrets) {
  fs.writeFileSync(SECRETS_PATH, JSON.stringify(secrets, null, 2));
}

function getOpenAiConfig() {
  const secrets = ensureSecrets();
  const openai = secrets.openai || {};
  return {
    hasApiKey: Boolean(openai.apiKey),
    model: openai.model || 'o4',
    debugLogging: Boolean(openai.debugLogging),
  };
}

function setOpenAiConfig({ apiKey, debugLogging }) {
  const secrets = ensureSecrets();
  const next = {
    ...secrets,
    openai: {
      apiKey: typeof apiKey === 'string' ? apiKey : secrets.openai?.apiKey || '',
      model: 'o4',
      debugLogging:
        typeof debugLogging === 'boolean'
          ? debugLogging
          : Boolean(secrets.openai?.debugLogging),
    },
  };
  saveSecrets(next);
  return {
    hasApiKey: Boolean(next.openai.apiKey),
    model: 'o4',
    debugLogging: next.openai.debugLogging,
  };
}

module.exports = {
  getOpenAiConfig,
  setOpenAiConfig,
};
