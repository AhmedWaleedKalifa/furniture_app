
const { getFirestore, admin } = require('../config/firebase');
const { v4: uuidv4 } = require('uuid');
const cloudinary = require('../config/cloudinary'); // Adjust path as needed
const streamUpload = (buffer) => {
  return new Promise((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
          { folder: 'product_thumbnails', resource_type: 'image' },
          (error, result) => {
              if (result) {
                  resolve(result);
              } else {
                  reject(error);
              }
          }
      );
      stream.end(buffer);
  });
};

const createProduct = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'Thumbnail image is required.' });
    }

    // 1. Upload image to Cloudinary
    const uploadResult = await streamUpload(req.file.buffer);
    const thumbnailUrl = uploadResult.secure_url;

    // 2. Parse fields (handle JSON-stringified fields)
    const { name, description, category, price, modelUrl } = req.body;
    let { tags, dimensions, customizable } = req.body;

    if (!name || !description || !category || !price || !modelUrl) {
      return res.status(400).json({ success: false, message: 'Missing required product fields.' });
    }

    // Parse JSON fields
    try {
      tags = tags ? JSON.parse(tags) : [];
      dimensions = dimensions ? JSON.parse(dimensions) : {};
      customizable = customizable ? JSON.parse(customizable) : {};
    } catch (e) {
      return res.status(400).json({ success: false, message: 'Invalid JSON in fields.' });
    }

    // 3. Construct product object (use thumbnailUrl for consistency)
    const newProduct = {
      name,
      description,
      category,
      price: parseFloat(price),
      modelUrl,
      thumbnailUrl, // Consistent with old data
      tags,
      dimensions,
      customizable,
      companyId: req.user.uid,
      companyName: req.user.name || '',
      isApproved: false,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      views: 0,
      placements: 0,
      wishlistCount: 0,
    };

    const db = getFirestore();
    const productRef = await db.collection('products').add(newProduct);

    res.status(201).json({
      success: true,
      message: 'Product submitted for approval successfully',
      data: { id: productRef.id, ...newProduct }
    });
  } catch (error) {
    console.error("Error creating product:", error);
    res.status(500).json({ success: false, message: 'Server error while creating product', error: error.message });
  }
};



// Get all products with filtering
const getProducts = async (req, res) => {
  try {
    const db = getFirestore();
    const {
      category,
      company,
      tags,
      minPrice,
      maxPrice,
      customizable,
      approved = true,
      limit = 20,
      offset = 0,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    let query = db.collection('products');

    // Apply filters
    // if (approved !== undefined) {
    //   query = query.where('isApproved', '==', approved === 'true' || approved === true);
    // }

    if (category) {
      query = query.where('category', '==', category);
    }

    if (company) {
      query = query.where('companyId', '==', company);
    }

    if (customizable !== undefined) {
      query = query.where('customizable.color', '==', customizable === 'true');
    }

    // Apply sorting
    query = query.orderBy(sortBy, sortOrder);

    // Apply pagination
    query = query.limit(parseInt(limit)).offset(parseInt(offset));

    const snapshot = await query.get();
    const products = [];

    snapshot.forEach(doc => {
      const product = { id: doc.id, ...doc.data() };
      
      // Apply additional filters that can't be done in Firestore query
      if (tags) {
        const tagArray = tags.split(',').map(tag => tag.trim());
        if (!tagArray.some(tag => product.tags && product.tags.includes(tag))) {
          return; // Skip this product
        }
      }

      if (minPrice && product.price < parseFloat(minPrice)) {
        return; // Skip this product
      }

      if (maxPrice && product.price > parseFloat(maxPrice)) {
        return; // Skip this product
      }

      products.push(product);
    });

    res.status(200).json({
      success: true,
      data: products,
      pagination: {
        limit: parseInt(limit),
        offset: parseInt(offset),
        total: products.length
      }
    });
  } catch (error) {
    console.error('Get products error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching products'
    });
  }
};

// Get single product by ID
const getProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const db = getFirestore();
    
    const productDoc = await db.collection('products').doc(id).get();
    
    if (!productDoc.exists) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    const product = { id: productDoc.id, ...productDoc.data() };

    // Increment view count if user is authenticated
    if (req.user) {
      await db.collection('products').doc(id).update({
        views: (product.views || 0) + 1
      });
    }

    res.status(200).json({
      success: true,
      data: product
    });
  } catch (error) {
    console.error('Get product error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching product'
    });
  }
};

// Update product
const updateProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const db = getFirestore();
    const productDoc = await db.collection('products').doc(id).get();
    if (!productDoc.exists) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }
    const product = productDoc.data();
    if (product.companyId !== req.user.uid && req.userProfile.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Access denied. You can only update your own products.' });
    }
    const updateData = { ...req.body, updatedAt: new Date() };
    await db.collection('products').doc(id).update(updateData);
    const updatedProduct = (await db.collection('products').doc(id).get()).data();
    res.status(200).json({ success: true, message: 'Product updated successfully', data: updatedProduct });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error updating product' });
  }
};
// Delete product
const deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const db = getFirestore();
    
    const productDoc = await db.collection('products').doc(id).get();
    
    if (!productDoc.exists) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    const product = productDoc.data();
    
    // Check if user owns this product or is admin
    if (product.companyId !== req.user.uid && req.userProfile.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. You can only delete your own products.'
      });
    }

    await db.collection('products').doc(id).delete();

    res.status(200).json({
      success: true,
      message: 'Product deleted successfully'
    });
  } catch (error) {
    console.error('Delete product error:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting product'
    });
  }
};

// Track product engagement
const trackEngagement = async (req, res) => {
  try {
    const { id } = req.params;
    const { type, metadata } = req.body;
    const db = getFirestore();
    
    const productDoc = await db.collection('products').doc(id).get();
    
    if (!productDoc.exists) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    const updateData = {};
    
    switch (type) {
      case 'view':
        updateData.views = (productDoc.data().views || 0) + 1;
        break;
      case 'placement':
        updateData.placements = (productDoc.data().placements || 0) + 1;
        break;
      case 'wishlist':
        updateData.wishlistCount = (productDoc.data().wishlistCount || 0) + 1;
        break;
      default:
        return res.status(400).json({
          success: false,
          message: 'Invalid engagement type'
        });
    }

    await db.collection('products').doc(id).update(updateData);

    // Store detailed engagement data
    if (req.user) {
      await db.collection('products').doc(id).collection('engagement').add({
        userId: req.user.uid,
        type,
        metadata,
        timestamp: new Date()
      });
    }

    res.status(200).json({
      success: true,
      message: 'Engagement tracked successfully'
    });
  } catch (error) {
    console.error('Track engagement error:', error);
    res.status(500).json({
      success: false,
      message: 'Error tracking engagement'
    });
  }
};

// Get product categories
const getCategories = async (req, res) => {
  try {
    const db = getFirestore();
    const snapshot = await db.collection('products')
      .where('isApproved', '==', true)
      .get();
    
    const categories = new Set();
    snapshot.forEach(doc => {
      const product = doc.data();
      if (product.category) {
        categories.add(product.category);
      }
    });

    res.status(200).json({
      success: true,
      data: Array.from(categories)
    });
  } catch (error) {
    console.error('Get categories error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching categories'
    });
  }
};

module.exports = {
  createProduct,
  getProducts,
  getProduct,
  updateProduct,
  deleteProduct,
  trackEngagement,
  getCategories
}; 