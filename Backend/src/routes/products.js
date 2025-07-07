const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');
const { verifyToken, getUserProfile, requireCompanyOrAdmin, optionalAuth } = require('../middleware/auth');
const { productValidation, sanitizeInput } = require('../utils/validation');
const multer = require('multer');
const upload = multer({ storage: multer.memoryStorage() });
// Public routes
router.get('/', optionalAuth, sanitizeInput, productController.getProducts);
router.get('/:id', optionalAuth, productController.getProduct);
router.get('/categories', productController.getCategories);

// Protected routes
//router.post('/', verifyToken, getUserProfile, requireCompanyOrAdmin, sanitizeInput, productValidation, productController.createProduct);
router.post(
  '/',
  verifyToken,
  getUserProfile,
  requireCompanyOrAdmin,
  upload.single('thumbnail'), // 'thumbnail' matches frontend
  sanitizeInput,
  productValidation,
  productController.createProduct
);


router.put(
  '/:id',
  verifyToken,
  getUserProfile,
  requireCompanyOrAdmin,
  upload.single('thumbnail'),
  productController.updateProduct
);
router.delete('/:id', verifyToken, getUserProfile, requireCompanyOrAdmin, productController.deleteProduct);

// Engagement tracking
router.post('/:id/engagement', optionalAuth, productController.trackEngagement);

module.exports = router; 