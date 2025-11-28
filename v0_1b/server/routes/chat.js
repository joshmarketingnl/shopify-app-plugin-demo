const express = require('express');

const router = express.Router();

// Placeholder chat endpoint; will be wired to AI + Shopify in later phases.
router.post('/', (req, res) => {
  res.status(501).json({
    message: 'Chat endpoint not implemented yet for v0.1b. Stay tuned.',
  });
});

module.exports = router;
