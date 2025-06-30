const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { verifyToken, getUserProfile, requireClient } = require('../middleware/auth');

// All routes require authentication
router.use(verifyToken, getUserProfile);

// Profile routes
router.get('/profile', userController.getUserProfile);
router.put('/profile', userController.updateUserProfile);

// Wishlist routes
router.post('/wishlist', requireClient, userController.addToWishlist);
router.get('/wishlist', requireClient, userController.getWishlist);
router.delete('/wishlist/:productId', requireClient, userController.removeFromWishlist);

// Saved scenes routes
router.post('/scenes', requireClient, userController.saveScene);
router.get('/scenes', requireClient, userController.getSavedScenes);
router.get('/scenes/:sceneId', requireClient, userController.getSavedScene);
router.put('/scenes/:sceneId', requireClient, userController.updateSavedScene);
router.delete('/scenes/:sceneId', requireClient, userController.deleteSavedScene);

module.exports = router; 