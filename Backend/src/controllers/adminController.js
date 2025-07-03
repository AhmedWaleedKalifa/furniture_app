const { getFirestore } = require('../config/firebase');
const { getAuth } = require('firebase-admin/auth');

// Get pending products for approval
const getPendingProducts = async (req, res) => {
  try {
    const db = getFirestore();
    const { limit = 20, offset = 0 } = req.query;
    
    const snapshot = await db.collection('products')
      .where('isApproved', '==', false)
      .orderBy('createdAt', 'desc')
      .limit(parseInt(limit))
      .offset(parseInt(offset))
      .get();

    const products = [];
    
    for (const doc of snapshot.docs) {
      const product = { id: doc.id, ...doc.data() };
      
      // Get company info
      const companyDoc = await db.collection('users').doc(product.companyId).get();
      if (companyDoc.exists) {
        product.company = companyDoc.data();
      }
      
      products.push(product);
    }

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
    console.error('Get pending products error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching pending products'
    });
  }
};

// Approve or reject product
const approveProduct = async (req, res) => {
  try {
    const { productId } = req.params;
    const { action, reason } = req.body; // action: 'approve' or 'reject'
    const db = getFirestore();
    
    const productDoc = await db.collection('products').doc(productId).get();
    
    if (!productDoc.exists) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    const product = productDoc.data();
    
    if (action === 'approve') {
      await db.collection('products').doc(productId).update({
        isApproved: true,
        approvedAt: new Date(),
        approvedBy: req.user.uid
      });
    } else if (action === 'reject') {
      await db.collection('products').doc(productId).update({
        isApproved: false,
        rejectedAt: new Date(),
        rejectedBy: req.user.uid,
        rejectionReason: reason
      });
    } else if (action === 'delete') {
      await db.collection('products').doc(productId).delete();
    } else {
      return res.status(400).json({
        success: false,
        message: 'Invalid action. Use approve, reject, or delete'
      });
    }

    res.status(200).json({
      success: true,
      message: `Product ${action}d successfully`
    });
  } catch (error) {
    console.error('Approve product error:', error);
    res.status(500).json({
      success: false,
      message: 'Error processing product approval'
    });
  }
};

// Get system statistics
const getSystemStats = async (req, res) => {
  try {
    const db = getFirestore();
    
    // Get user counts by role
    const usersSnapshot = await db.collection('users').get();
    const userStats = { total: 0, client: 0, company: 0, admin: 0 };
    
    usersSnapshot.forEach(doc => {
      const user = doc.data();
      userStats.total++;
      userStats[user.role] = (userStats[user.role] || 0) + 1;
    });

    // Get product counts
    const productsSnapshot = await db.collection('products').get();
    const productStats = { total: 0, approved: 0, pending: 0 };
    
    productsSnapshot.forEach(doc => {
      const product = doc.data();
      productStats.total++;
      if (product.isApproved) {
        productStats.approved++;
      } else {
        productStats.pending++;
      }
    });

    // Get engagement stats
    const engagementStats = { totalViews: 0, totalPlacements: 0, totalWishlists: 0 };
    
    productsSnapshot.forEach(doc => {
      const product = doc.data();
      engagementStats.totalViews += product.views || 0;
      engagementStats.totalPlacements += product.placements || 0;
      engagementStats.totalWishlists += product.wishlistCount || 0;
    });

    // Get recent activity (last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    
    const recentProductsSnapshot = await db.collection('products')
      .where('createdAt', '>=', sevenDaysAgo)
      .get();
    
    const recentUsersSnapshot = await db.collection('users')
      .where('createdAt', '>=', sevenDaysAgo)
      .get();

    res.status(200).json({
      success: true,
      data: {
        users: userStats,
        products: productStats,
        engagement: engagementStats,
        recentActivity: {
          newProducts: recentProductsSnapshot.size,
          newUsers: recentUsersSnapshot.size
        }
      }
    });
  } catch (error) {
    console.error('Get system stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching system statistics'
    });
  }
};

// Get all users (admin only)
const getAllUsers = async (req, res) => {
  try {
    const db = getFirestore();
    const { limit = 50, offset = 0, role } = req.query;
    
    let query = db.collection('users').orderBy('createdAt', 'desc');
    
    if (role) {
      query = query.where('role', '==', role);
    }
    
    const snapshot = await query
      .limit(parseInt(limit))
      .offset(parseInt(offset))
      .get();

    const users = [];
    snapshot.forEach(doc => {
      const user = { id: doc.id, ...doc.data() };
      // Remove sensitive data
      delete user.email;
      users.push(user);
    });

    res.status(200).json({
      success: true,
      data: users,
      pagination: {
        limit: parseInt(limit),
        offset: parseInt(offset),
        total: users.length
      }
    });
  } catch (error) {
    console.error('Get all users error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching users'
    });
  }
};

// Update user role
const updateUserRole = async (req, res) => {
  try {
    const { userId } = req.params;
    const { role } = req.body;
    
    if (!['client', 'company', 'admin'].includes(role)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid role. Must be client, company, or admin'
      });
    }

    const db = getFirestore();
    await db.collection('users').doc(userId).update({
      role,
      updatedAt: new Date()
    });

    res.status(200).json({
      success: true,
      message: 'User role updated successfully'
    });
  } catch (error) {
    console.error('Update user role error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating user role'
    });
  }
};

// Get product analytics
const getProductAnalytics = async (req, res) => {
  try {
    const db = getFirestore();
    const { days = 30 } = req.query;
    
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - parseInt(days));
    
    // Get top products by views
    const topProductsSnapshot = await db.collection('products')
      .where('isApproved', '==', true)
      .orderBy('views', 'desc')
      .limit(10)
      .get();

    const topProducts = [];
    topProductsSnapshot.forEach(doc => {
      topProducts.push({ id: doc.id, ...doc.data() });
    });

    // Get engagement trends
    const engagementSnapshot = await db.collection('products')
      .where('isApproved', '==', true)
      .get();

    const engagementTrends = {
      totalViews: 0,
      totalPlacements: 0,
      totalWishlists: 0,
      averageViews: 0,
      averagePlacements: 0,
      averageWishlists: 0
    };

    let productCount = 0;
    engagementSnapshot.forEach(doc => {
      const product = doc.data();
      engagementTrends.totalViews += product.views || 0;
      engagementTrends.totalPlacements += product.placements || 0;
      engagementTrends.totalWishlists += product.wishlistCount || 0;
      productCount++;
    });

    if (productCount > 0) {
      engagementTrends.averageViews = Math.round(engagementTrends.totalViews / productCount);
      engagementTrends.averagePlacements = Math.round(engagementTrends.totalPlacements / productCount);
      engagementTrends.averageWishlists = Math.round(engagementTrends.totalWishlists / productCount);
    }

    res.status(200).json({
      success: true,
      data: {
        topProducts,
        engagementTrends,
        period: `${days} days`
      }
    });
  } catch (error) {
    console.error('Get product analytics error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching product analytics'
    });
  }
};
const deleteProduct = async (req, res) => {
  try {
    const { productId } = req.params;
    const db = getFirestore();
    
    // First check if product exists
    const productDoc = await db.collection('products').doc(productId).get();
    if (!productDoc.exists) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    // Delete product
    await db.collection('products').doc(productId).delete();
    
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

const deleteUser = async (req, res) => {
  try {
    const { userId } = req.params;
    const auth = getAuth();
    const db = getFirestore();

    // Get user document
    const userDoc = await db.collection('users').doc(userId).get();
    if (!userDoc.exists) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Prevent deleting admin users
    const userData = userDoc.data();
    if (userData.role === 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Cannot delete admin users'
      });
    }

    // Delete from Firebase Auth
    await auth.deleteUser(userId);

    // Delete from Firestore
    await db.collection('users').doc(userId).delete();

    res.status(200).json({
      success: true,
      message: 'User deleted successfully'
    });
  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting user'
    });
  }
};

module.exports = {
  getPendingProducts,
  approveProduct,
  getSystemStats,
  getAllUsers,
  updateUserRole,
  getProductAnalytics,
  deleteProduct,
  deleteUser
}; 