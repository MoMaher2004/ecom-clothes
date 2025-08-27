const express = require('express');
const router = express.Router();
const { createPayment, handleCallback } = require('../controllers/poymobController');
const { verifyToken } = require('../controllers/userController');

// Parse JSON payloads for webhook
const rawBodyMiddleware = (req, res, next) => {
  if (req.path === '/webhook') {
    let data = '';
    req.setEncoding('utf8');
    req.on('data', (chunk) => {
      data += chunk;
    });
    req.on('end', () => {
      req.rawBody = data;
      next();
    });
  } else {
    next();
  }
};

// Apply middleware
router.use(express.json({
  verify: (req, res, buf) => {
    if (req.path === '/webhook') {
      req.rawBody = buf.toString();
    }
  }
}));

// Routes
router.post('/create-payment', verifyToken, createPayment);

// Webhook endpoint - no authentication required as it's called by Paymob
router.post('/webhook', express.raw({ type: 'application/json' }), handleCallback);

// Error handling middleware
router.use((err, req, res, next) => {
  console.error('Paymob route error:', err);
  res.status(500).json({
    success: false,
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

module.exports = router;
module.exports = router;