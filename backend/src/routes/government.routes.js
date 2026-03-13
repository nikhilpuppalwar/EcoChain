const express = require('express');
const router = express.Router();
const controller = require('../controllers/government.controller');
const { verifyToken, requireRole } = require('../middleware/auth');

router.use(verifyToken);
router.use(requireRole('government'));

router.get('/dashboard/stats', controller.getDashboardStats);
router.get('/companies', controller.getCompanies);

router.get('/reports', controller.getAllReports);
router.get('/reports/:id', controller.getReportById);
router.post('/reports/:id/review', controller.reviewReport);
router.post('/anomalies/:id/review', controller.reviewAnomaly);

// Credits Management
router.post('/credits/issue', controller.issueCredits);

module.exports = router;
