const express = require('express');
const router = express.Router();
const { createCheckoutSession, handleStripeWebhook } = require('../controllers/paymentController');
const { protect } = require('../middleware/auth');

router.post('/create-session', protect, createCheckoutSession);
router.post('/webhook', express.raw({type: 'application/json'}), handleStripeWebhook);

module.exports = router;
