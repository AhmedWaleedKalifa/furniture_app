const { getFirestore } = require('../config/firebase');

// Create new order (checkout)
const createOrder = async (req, res) => {
  try {
    const db = getFirestore(); // Always get a fresh instance
      const { items, shippingAddress, paymentMethod } = req.body;
      const userId = req.user.uid;
      const userEmail = req.user.email;

      if (!items || !Array.isArray(items) || items.length === 0) {
          return res.status(400).json({ success: false, message: 'Order must contain at least one item.' });
      }

      let totalAmount = 0;
      const orderItems = [];

      // Use a transaction to ensure all-or-nothing
      await db.runTransaction(async (transaction) => {
          for (const item of items) {
              const productRef = db.collection('products').doc(item.productId);
              
              // FIX: The result of the 'get' operation must be assigned to the productDoc variable.
              const productDoc = await transaction.get(productRef);

              if (!productDoc.exists || !productDoc.data().isApproved) {
                  throw new Error(`Product with ID ${item.productId} not found or is not available.`);
              }
              
              const productData = productDoc.data();
              const itemTotal = productData.price * item.quantity;
              totalAmount += itemTotal;

              orderItems.push({
                  productId: item.productId,
                  productName: productData.name,
                  productImage: productData.thumbnailUrl,
                  quantity: item.quantity,
                  unitPrice: productData.price,
                  totalPrice: itemTotal,
              });
          }
      });

      const newOrderRef = db.collection('orders').doc();
      const newOrder = {
          id: newOrderRef.id,
          userId,
          userEmail,
          items: orderItems,
          totalAmount: parseFloat(totalAmount.toFixed(2)),
          totalPrice: parseFloat(totalAmount.toFixed(2)), // For consistency with frontend type
          shippingAddress,
          paymentMethod,
          paymentStatus: 'pending', // Default status
          orderStatus: 'processing', // Default status
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
      };

      await newOrderRef.set(newOrder);

      res.status(201).json({
          success: true,
          message: 'Order created successfully',
          data: newOrder
      });

  } catch (error) {
      console.error('Create order error:', error);
      res.status(500).json({ success: false, message: error.message || 'Server error while creating order' });
  }
};


/**
* @desc    Get orders for the logged-in user
* @route   GET /api/orders/my-orders
* @access  Private (Client)
*/
const getUserOrders = async (req, res) => {
  try {
    const db = getFirestore(); // Always get a fresh instance

      const userId = req.user.uid;
      const ordersSnapshot = await db.collection('orders').where('userId', '==', userId).orderBy('createdAt', 'desc').get();
      
      if (ordersSnapshot.empty) {
          return res.status(200).json({ success: true, data: [] });
      }
      
      const orders = ordersSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      
      res.status(200).json({ success: true, data: orders });
  } catch (error) {
      console.error('Get my orders error:', error);
      res.status(500).json({ success: false, message: 'Server error while fetching orders' });
  }
};

// Get single order
const getOrder = async (req, res) => {
  try {
    const { orderId } = req.params;
    const db = getFirestore(); // Always get a fresh instance
    
    const orderDoc = await db.collection('orders').doc(orderId).get();
    
    if (!orderDoc.exists) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }
    
    const order = orderDoc.data();
    
    // Check if user owns this order or is admin/company
    if (order.userId !== req.user.uid && 
        req.userProfile.role !== 'admin' && 
        req.userProfile.role !== 'company') {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }
    
    res.status(200).json({
      success: true,
      data: {
        id: orderDoc.id,
        ...order
      }
    });
  } catch (error) {
    console.error('Get order error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching order'
    });
  }
};

// Update order status (admin/company only)
const updateOrderStatus = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { orderStatus, paymentStatus, trackingNumber } = req.body;
    const db = getFirestore();
    
    const orderDoc = await db.collection('orders').doc(orderId).get();
    
    if (!orderDoc.exists) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }
    
    const updateData = {
      updatedAt: new Date()
    };
    
    if (orderStatus) updateData.orderStatus = orderStatus;
    if (paymentStatus) updateData.paymentStatus = paymentStatus;
    if (trackingNumber) updateData.trackingNumber = trackingNumber;
    
    await db.collection('orders').doc(orderId).update(updateData);
    
    res.status(200).json({
      success: true,
      message: 'Order updated successfully',
      data: updateData
    });
  } catch (error) {
    console.error('Update order error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating order'
    });
  }
};

// Cancel order
const cancelOrder = async (req, res) => {
  try {
    const { orderId } = req.params;
    const db = getFirestore();
    
    const orderDoc = await db.collection('orders').doc(orderId).get();
    
    if (!orderDoc.exists) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }
    
    const order = orderDoc.data();
    
    // Check if user owns this order
    if (order.userId !== req.user.uid) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }
    
    // Only allow cancellation if order is still processing
    if (order.orderStatus !== 'processing') {
      return res.status(400).json({
        success: false,
        message: 'Order cannot be cancelled at this stage'
      });
    }
    
    await db.collection('orders').doc(orderId).update({
      orderStatus: 'cancelled',
      updatedAt: new Date()
    });
    
    res.status(200).json({
      success: true,
      message: 'Order cancelled successfully'
    });
  } catch (error) {
    console.error('Cancel order error:', error);
    res.status(500).json({
      success: false,
      message: 'Error cancelling order'
    });
  }
};

// Get company orders (for companies to see their product orders)
const getCompanyOrders = async (req, res) => {
  try {
    const db = getFirestore();
    const { limit = 20, offset = 0, status } = req.query;
    
    // Get all products by this company
    const productsSnapshot = await db.collection('products')
      .where('companyId', '==', req.user.uid)
      .get();
    
    const productIds = [];
    productsSnapshot.forEach(doc => {
      productIds.push(doc.id);
    });
    
    if (productIds.length === 0) {
      return res.status(200).json({
        success: true,
        data: [],
        pagination: {
          limit: parseInt(limit),
          offset: parseInt(offset),
          total: 0
        }
      });
    }
    
    // Get orders containing company's products
    let query = db.collection('orders')
      .where('items', 'array-contains-any', productIds)
      .orderBy('createdAt', 'desc');
    
    if (status) {
      query = query.where('orderStatus', '==', status);
    }
    
    const snapshot = await query
      .limit(parseInt(limit))
      .offset(parseInt(offset))
      .get();
    
    const orders = [];
    snapshot.forEach(doc => {
      const order = doc.data();
      // Filter items to only show company's products
      order.items = order.items.filter(item => 
        productIds.includes(item.productId)
      );
      orders.push({
        id: doc.id,
        ...order
      });
    });
    
    res.status(200).json({
      success: true,
      data: orders,
      pagination: {
        limit: parseInt(limit),
        offset: parseInt(offset),
        total: orders.length
      }
    });
  } catch (error) {
    console.error('Get company orders error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching company orders'
    });
  }
};

module.exports = {
  createOrder,
  getUserOrders,
  getOrder,
  updateOrderStatus,
  cancelOrder,
  getCompanyOrders
}; 
