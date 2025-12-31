const express = require('express');
const router = express.Router();
const subscriptionController = require('../controllers/subscriptionController');
const { verifyToken } = require('../middleware/auth');

// Public routes
router.get('/plans', subscriptionController.getPlans);

// Protected routes (require authentication)
router.use(verifyToken);

router.get('/active', subscriptionController.getActiveSubscription);
router.get('/history', subscriptionController.getSubscriptionHistory);
router.post('/create', subscriptionController.createSubscription);
router.post('/cancel', subscriptionController.cancelSubscription);
router.get('/payments', subscriptionController.getPaymentHistory);

module.exports = router;
