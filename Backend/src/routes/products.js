const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');
const { verifyToken, getUserProfile, requireCompanyOrAdmin, optionalAuth } = require('../middleware/auth');
const { productValidation, sanitizeInput } = require('../utils/validation');

// Public routes
router.get('/', optionalAuth, sanitizeInput, productController.getProducts);
router.get('/:id', optionalAuth, productController.getProduct);
router.get('/categories', productController.getCategories);

// Protected routes
router.post('/', verifyToken, getUserProfile, requireCompanyOrAdmin, sanitizeInput, productValidation, productController.createProduct);
router.put('/:id', verifyToken, getUserProfile, requireCompanyOrAdmin, sanitizeInput, productValidation, productController.updateProduct);
router.delete('/:id', verifyToken, getUserProfile, requireCompanyOrAdmin, productController.deleteProduct);

// Engagement tracking
router.post('/:id/engagement', optionalAuth, productController.trackEngagement);

module.exports = router; 