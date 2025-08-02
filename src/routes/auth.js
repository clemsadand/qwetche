
// src/routes/auth.js - Routes d'authentification
const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { authenticateToken } = require('../middleware/auth');
const { validateRegister, validateLogin } = require('../middleware/validation');

router.post('/register', validateRegister, authController.register);
router.post('/login', validateLogin, authController.login);
router.post('/logout', authenticateToken, authController.logout);
router.post('/refresh', authController.refreshToken);
router.post('/forgot-password', authController.forgotPassword);
router.post('/reset-password', authController.resetPassword);
router.post('/verify-email', authController.verifyEmail);
router.post('/resend-verification', authController.resendVerification);

// 2FA
router.post('/enable-2fa', authenticateToken, authController.enable2FA);
router.post('/disable-2fa', authenticateToken, authController.disable2FA);
router.post('/verify-2fa', authController.verify2FA);

module.exports = router;

