const { getOpenAiConfig } = require('./secretService');

function ts() {
  return new Date().toISOString();
}

function shouldDebug() {
  try {
    const cfg = getOpenAiConfig();
    return Boolean(cfg.debugLogging);
  } catch (err) {
    return false;
  }
}

function format(level, code, message, meta) {
  const base = `[${ts()}] [${level}]${code ? ` [${code}]` : ''} ${message}`;
  if (meta && shouldDebug()) {
    return `${base} | ${JSON.stringify(meta)}`;
  }
  return base;
}

function info(code, message, meta) {
  console.info(format('info', code, message, meta));
}

function warn(code, message, meta) {
  console.warn(format('warn', code, message, meta));
}

function error(code, message, meta, err) {
  const base = format('error', code, message, meta);
  if (err?.stack) {
    console.error(base, err.stack);
  } else {
    console.error(base);
  }
}

module.exports = {
  info,
  warn,
  error,
};
