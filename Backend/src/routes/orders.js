const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');
const { verifyToken, getUserProfile, requireClient, requireCompanyOrAdmin } = require('../middleware/auth');
const { orderValidation, sanitizeInput } = require('../utils/validation');

// All routes require authentication
router.use(verifyToken, getUserProfile, sanitizeInput);

// Client routes
router.post('/', requireClient, orderValidation, orderController.createOrder);
router.get('/my-orders', requireClient, orderController.getUserOrders);
router.get('/my-orders/:orderId', requireClient, orderController.getOrder);
router.put('/my-orders/:orderId/cancel', requireClient, orderController.cancelOrder);

// Company routes
router.get('/company', requireCompanyOrAdmin, orderController.getCompanyOrders);

// Admin routes
router.get('/:orderId', requireCompanyOrAdmin, orderController.getOrder);
router.put('/:orderId/status', requireCompanyOrAdmin, orderController.updateOrderStatus);

module.exports = router; 