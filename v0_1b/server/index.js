const path = require('path');
const express = require('express');
const dotenv = require('dotenv');

const chatRouter = require('./routes/chat');
const adminRouter = require('./routes/admin');
const { requireAdminSecret } = require('./services/securityService');
const logger = require('./services/logger');

const rootDir = path.resolve(__dirname, '..');
dotenv.config({ path: path.join(rootDir, '.env') });

const app = express();

// Basic CORS for local dev and widget usage; tighten later per host configuration.
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', process.env.HOST_BASE_URL || '*');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
  res.header('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS');
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  next();
});

app.use(express.json());

// Static assets for admin, widget, and test harness.
app.use('/v0_1b/admin', requireAdminSecret, express.static(path.join(rootDir, 'admin')));
app.use('/v0_1b/widget', express.static(path.join(rootDir, 'widget')));
app.use('/v0_1b/test', express.static(path.join(rootDir, 'test')));

// Health check
app.get('/v0_1b/health', (req, res) => {
  res.json({ status: 'ok', version: '0.1b' });
});

// API routes
app.use('/v0_1b/api/chat', chatRouter);
app.use('/v0_1b/api/admin', requireAdminSecret, adminRouter);

// Global error handler
app.use((err, req, res, next) => {
  logger.error(err.code || 'ERR_UNHANDLED', err.message || 'Unhandled error', { path: req.originalUrl }, err);
  res.status(err.status || 500).json({
    error: 'Something went wrong',
    code: err.code || 'ERR_UNHANDLED',
  });
});

// Not found handler
app.use((req, res) => {
  res.status(404).json({ error: 'Not found', path: req.originalUrl });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  // Simple startup log for quick verification.
  console.log(`v0.1b server running on port ${PORT}`);
});
