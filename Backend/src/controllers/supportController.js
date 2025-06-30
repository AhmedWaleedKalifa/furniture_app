const { getFirestore } = require('../config/firebase');

// Create support ticket
const createTicket = async (req, res) => {
  try {
    const { subject, message, category, priority = 'medium' } = req.body;
    const db = getFirestore();
    
    const ticketData = {
      userId: req.user.uid,
      userEmail: req.user.email,
      subject,
      message,
      category,
      priority,
      status: 'open',
      createdAt: new Date(),
      updatedAt: new Date(),
      responses: []
    };
    
    const ticketRef = await db.collection('supportTickets').add(ticketData);
    
    res.status(201).json({
      success: true,
      message: 'Support ticket created successfully',
      data: {
        ticketId: ticketRef.id,
        ...ticketData
      }
    });
  } catch (error) {
    console.error('Create ticket error:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating support ticket'
    });
  }
};

// Get user's tickets
const getUserTickets = async (req, res) => {
  try {
    const db = getFirestore();
    const { limit = 20, offset = 0, status } = req.query;
    
    let query = db.collection('supportTickets')
      .where('userId', '==', req.user.uid)
      .orderBy('createdAt', 'desc');
    
    if (status) {
      query = query.where('status', '==', status);
    }
    
    const snapshot = await query
      .limit(parseInt(limit))
      .offset(parseInt(offset))
      .get();
    
    const tickets = [];
    snapshot.forEach(doc => {
      tickets.push({
        id: doc.id,
        ...doc.data()
      });
    });
    
    res.status(200).json({
      success: true,
      data: tickets,
      pagination: {
        limit: parseInt(limit),
        offset: parseInt(offset),
        total: tickets.length
      }
    });
  } catch (error) {
    console.error('Get user tickets error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching support tickets'
    });
  }
};

// Get single ticket
const getTicket = async (req, res) => {
  try {
    const { ticketId } = req.params;
    const db = getFirestore();
    
    const ticketDoc = await db.collection('supportTickets').doc(ticketId).get();
    
    if (!ticketDoc.exists) {
      return res.status(404).json({
        success: false,
        message: 'Support ticket not found'
      });
    }
    
    const ticket = ticketDoc.data();
    
    // Check if user owns this ticket or is admin
    if (ticket.userId !== req.user.uid && req.userProfile.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }
    
    res.status(200).json({
      success: true,
      data: {
        id: ticketDoc.id,
        ...ticket
      }
    });
  } catch (error) {
    console.error('Get ticket error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching support ticket'
    });
  }
};

// Add response to ticket
const addResponse = async (req, res) => {
  try {
    const { ticketId } = req.params;
    const { message } = req.body;
    const db = getFirestore();
    
    const ticketDoc = await db.collection('supportTickets').doc(ticketId).get();
    
    if (!ticketDoc.exists) {
      return res.status(404).json({
        success: false,
        message: 'Support ticket not found'
      });
    }
    
    const ticket = ticketDoc.data();
    
    // Check if user owns this ticket or is admin
    if (ticket.userId !== req.user.uid && req.userProfile.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }
    
    const response = {
      userId: req.user.uid,
      userEmail: req.user.email,
      userRole: req.userProfile.role,
      message,
      createdAt: new Date()
    };
    
    await db.collection('supportTickets').doc(ticketId).update({
      responses: [...ticket.responses, response],
      updatedAt: new Date(),
      status: req.userProfile.role === 'admin' ? 'in_progress' : ticket.status
    });
    
    res.status(200).json({
      success: true,
      message: 'Response added successfully',
      data: response
    });
  } catch (error) {
    console.error('Add response error:', error);
    res.status(500).json({
      success: false,
      message: 'Error adding response'
    });
  }
};

// Update ticket status (admin only)
const updateTicketStatus = async (req, res) => {
  try {
    const { ticketId } = req.params;
    const { status, priority } = req.body;
    const db = getFirestore();
    
    const ticketDoc = await db.collection('supportTickets').doc(ticketId).get();
    
    if (!ticketDoc.exists) {
      return res.status(404).json({
        success: false,
        message: 'Support ticket not found'
      });
    }
    
    const updateData = {
      updatedAt: new Date()
    };
    
    if (status) updateData.status = status;
    if (priority) updateData.priority = priority;
    
    await db.collection('supportTickets').doc(ticketId).update(updateData);
    
    res.status(200).json({
      success: true,
      message: 'Ticket status updated successfully',
      data: updateData
    });
  } catch (error) {
    console.error('Update ticket status error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating ticket status'
    });
  }
};

// Get all tickets (admin only)
const getAllTickets = async (req, res) => {
  try {
    const db = getFirestore();
    const { limit = 50, offset = 0, status, category, priority } = req.query;
    
    let query = db.collection('supportTickets').orderBy('createdAt', 'desc');
    
    if (status) {
      query = query.where('status', '==', status);
    }
    
    if (category) {
      query = query.where('category', '==', category);
    }
    
    if (priority) {
      query = query.where('priority', '==', priority);
    }
    
    const snapshot = await query
      .limit(parseInt(limit))
      .offset(parseInt(offset))
      .get();
    
    const tickets = [];
    snapshot.forEach(doc => {
      tickets.push({
        id: doc.id,
        ...doc.data()
      });
    });
    
    res.status(200).json({
      success: true,
      data: tickets,
      pagination: {
        limit: parseInt(limit),
        offset: parseInt(offset),
        total: tickets.length
      }
    });
  } catch (error) {
    console.error('Get all tickets error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching support tickets'
    });
  }
};

// Get ticket statistics (admin only)
const getTicketStats = async (req, res) => {
  try {
    const db = getFirestore();
    
    const snapshot = await db.collection('supportTickets').get();
    
    const stats = {
      total: 0,
      open: 0,
      in_progress: 0,
      resolved: 0,
      closed: 0,
      byCategory: {},
      byPriority: {}
    };
    
    snapshot.forEach(doc => {
      const ticket = doc.data();
      stats.total++;
      
      // Count by status
      stats[ticket.status] = (stats[ticket.status] || 0) + 1;
      
      // Count by category
      stats.byCategory[ticket.category] = (stats.byCategory[ticket.category] || 0) + 1;
      
      // Count by priority
      stats.byPriority[ticket.priority] = (stats.byPriority[ticket.priority] || 0) + 1;
    });
    
    res.status(200).json({
      success: true,
      data: stats
    });
  } catch (error) {
    console.error('Get ticket stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching ticket statistics'
    });
  }
};

module.exports = {
  createTicket,
  getUserTickets,
  getTicket,
  addResponse,
  updateTicketStatus,
  getAllTickets,
  getTicketStats
}; 