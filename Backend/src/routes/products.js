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
  upload.fields([
    { name: 'thumbnail', maxCount: 1 },
    { name: 'modelFile', maxCount: 1 },
  ]),
  sanitizeInput,
  productValidation,
  productController.createProduct
);


router.put(
  '/:id',
  verifyToken,
  getUserProfile,
  requireCompanyOrAdmin,
  upload.fields([
    { name: 'thumbnail', maxCount: 1 },
    { name: 'modelFile', maxCount: 1 },
  ]),
  productController.updateProduct
);
router.delete('/:id', verifyToken, getUserProfile, requireCompanyOrAdmin, productController.deleteProduct);

// Engagement tracking
router.post('/:id/engagement', verifyToken, productController.trackEngagement);

module.exports = router; 