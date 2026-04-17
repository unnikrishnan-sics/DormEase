const express = require('express');
const router = express.Router();
const { 
  createCheckoutSession, 
  handleStripeWebhook, 
  getPayments, 
  recordManualPayment, 
  getFinanceStats,
  payInvoice,
  getExpiringSubscriptions,
  sendReminders,
  verifyPaymentSession
} = require('../controllers/paymentController');
const { protect, authorize } = require('../middleware/auth');

router.get('/', protect, getPayments);
router.get('/stats', protect, authorize('Admin'), getFinanceStats);
router.get('/expiring', protect, authorize('Admin'), getExpiringSubscriptions);
router.post('/remind-expiring', protect, authorize('Admin'), sendReminders);
router.post('/manual', protect, authorize('Admin'), recordManualPayment);
router.post('/create-session', protect, createCheckoutSession);
router.post('/:id/pay', protect, payInvoice);
router.get('/verify/:sessionId', protect, verifyPaymentSession);
router.post('/webhook', handleStripeWebhook);

module.exports = router;
