const express = require('express');
const router = express.Router();
const supportController = require('../controllers/supportController');
const { verifyToken, getUserProfile, requireAdmin } = require('../middleware/auth');
const { supportTicketValidation, sanitizeInput } = require('../utils/validation');

// All routes require authentication
router.use(verifyToken, getUserProfile, sanitizeInput);

// User routes
router.post('/tickets', supportTicketValidation, supportController.createTicket);
router.get('/tickets', supportController.getUserTickets);
router.get('/tickets/:ticketId', supportController.getTicket);
router.post('/tickets/:ticketId/respond', supportController.addResponse);

// Admin routes
router.get('/admin/tickets', requireAdmin, supportController.getAllTickets);
router.get('/admin/tickets/stats', requireAdmin, supportController.getTicketStats);
router.put('/admin/tickets/:ticketId/status', requireAdmin, supportController.updateTicketStatus);

module.exports = router; 