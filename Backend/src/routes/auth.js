const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { verifyToken, getUserProfile, requireAdmin } = require('../middleware/auth');
const { userProfileValidation, signupValidation, loginValidation, sanitizeInput } = require('../utils/validation');

// Public routes
router.post('/signup', sanitizeInput, signupValidation, authController.signUp);
router.post('/login', sanitizeInput, loginValidation, authController.login);
router.post('/first-admin', sanitizeInput, signupValidation, authController.createFirstAdmin);

// Protected routes
router.get('/me', verifyToken, getUserProfile, authController.getCurrentUser);
router.put('/profile', verifyToken, getUserProfile, sanitizeInput, userProfileValidation, authController.updateProfile);
router.delete('/account', verifyToken, getUserProfile, authController.deleteAccount);
router.get('/verify', verifyToken, authController.verifyToken);
router.post('/logout', verifyToken, getUserProfile, authController.logout);
router.post('/refresh', verifyToken, getUserProfile, authController.refreshToken);

// Admin-only routes
router.post('/admin/create', verifyToken, getUserProfile, requireAdmin, sanitizeInput, signupValidation, authController.createAdminUser);

module.exports = router; 