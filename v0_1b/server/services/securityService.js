const errorCodes = require('./errorCodes');
const logger = require('./logger');

function requireAdminSecret(req, res, next) {
  const expected = process.env.ADMIN_DASH_SECRET;
  if (!expected) {
    logger.warn(errorCodes.ERR_ADMIN_AUTH_FAILED, 'ADMIN_DASH_SECRET is not set');
    return res.status(500).json({ error: 'Admin secret not configured', code: errorCodes.ERR_ADMIN_AUTH_FAILED });
  }
  const provided = req.headers['x-admin-secret'];
  if (!provided || provided !== expected) {
    logger.warn(errorCodes.ERR_ADMIN_AUTH_FAILED, 'Admin secret mismatch', { path: req.originalUrl });
    return res.status(401).json({ error: 'Unauthorized', code: errorCodes.ERR_ADMIN_AUTH_FAILED });
  }
  next();
}

module.exports = {
  requireAdminSecret,
};
