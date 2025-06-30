const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const { verifyToken, getUserProfile, requireAdmin } = require('../middleware/auth');

// All admin routes require admin role
router.use(verifyToken, getUserProfile, requireAdmin);

// Product management
router.get('/products/pending', adminController.getPendingProducts);
router.put('/products/:productId/approve', adminController.approveProduct);

// System statistics
router.get('/stats', adminController.getSystemStats);
router.get('/analytics', adminController.getProductAnalytics);

// User management
router.get('/users', adminController.getAllUsers);
router.put('/users/:userId/role', adminController.updateUserRole);

module.exports = router; 