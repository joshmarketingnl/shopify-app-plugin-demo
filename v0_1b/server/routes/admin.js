const express = require('express');

const router = express.Router();

// Basic sanity endpoint; full admin CRUD will be added in Phase 3+.
router.get('/', (req, res) => {
  res.json({ status: 'admin api stub', version: '0.1b' });
});

module.exports = router;
