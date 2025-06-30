const { getFirestore } = require('../config/firebase');

// Create new order (checkout)
const createOrder = async (req, res) => {
  try {
    const { items, shippingAddress, paymentMethod } = req.body;
    const db = getFirestore();
    
    // Validate items exist and calculate total
    let totalPrice = 0;
    const orderItems = [];
    
    for (const item of items) {
      const productDoc = await db.collection('products').doc(item.productId).get();
      
      if (!productDoc.exists) {
        return res.status(404).json({
          success: false,
          message: `Product ${item.productId} not found`
        });
      }
      
      const product = productDoc.data();
      if (!product.isApproved) {
        return res.status(400).json({
          success: false,
          message: `Product ${product.name} is not available for purchase`
        });
      }
      
      const itemTotal = product.price * item.quantity;
      totalPrice += itemTotal;
      
      orderItems.push({
        productId: item.productId,
        productName: product.name,
        productImage: product.thumbnailUrl,
        quantity: item.quantity,
        unitPrice: product.price,
        totalPrice: itemTotal
      });
    }
    
    // Create order
    const orderData = {
      userId: req.user.uid,
      items: orderItems,
      totalPrice,
      currency: 'USD',
      shippingAddress,
      paymentMethod: paymentMethod || 'pending',
      paymentStatus: 'pending',
      orderStatus: 'processing',
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    const orderRef = await db.collection('orders').add(orderData);
    
    // Update product analytics
    for (const item of items) {
      await db.collection('products').doc(item.productId).update({
        purchases: (productDoc.data().purchases || 0) + item.quantity
      });
    }
    
    res.status(201).json({
      success: true,
      message: 'Order created successfully',
      data: {
        orderId: orderRef.id,
        ...orderData
      }
    });
  } catch (error) {
    console.error('Create order error:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating order'
    });
  }
};

// Get user's orders
const getUserOrders = async (req, res) => {
  try {
    const db = getFirestore();
    const { limit = 20, offset = 0, status } = req.query;
    
    let query = db.collection('orders')
      .where('userId', '==', req.user.uid)
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
      orders.push({
        id: doc.id,
        ...doc.data()
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
    console.error('Get user orders error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching orders'
    });
  }
};

// Get single order
const getOrder = async (req, res) => {
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