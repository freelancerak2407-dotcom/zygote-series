const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const authValidators = require('../validators/authValidator');
const { verifyToken } = require('../middleware/auth');

// Public routes
router.post('/register', authValidators.register, authController.register);
router.post('/login', authValidators.login, authController.login);
router.post('/verify-otp', authValidators.verifyOTP, authController.verifyOTP);
router.post('/resend-otp', authValidators.resendOTP, authController.resendOTP);
router.post('/refresh-token', authValidators.refreshToken, authController.refreshToken);

// Protected routes
router.get('/me', verifyToken, authController.getCurrentUser);
router.post('/logout', verifyToken, authController.logout);

module.exports = router;
