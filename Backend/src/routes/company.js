const express = require('express');
const { verifyToken, requireCompany } = require('../middleware/auth');
const companyController = require('../controllers/companyController');

const router = express.Router();

// All routes after this middleware are protected and require a company role
router.use(verifyToken,requireCompany );

router.get('/analytics', companyController.getCompanyAnalytics);

module.exports = router;