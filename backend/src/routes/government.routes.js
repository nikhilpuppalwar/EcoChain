const express = require('express');
const router = express.Router();
const controller = require('../controllers/government.controller');
const { verifyToken, requireRole } = require('../middleware/auth');

router.use(verifyToken);
router.use(requireRole('government'));

router.get('/dashboard/stats', controller.getDashboardStats);
router.get('/companies', controller.getCompanies);

router.route('/reports')
    .get(controller.getAllReports);

router.route('/reports/:id')
    .get(controller.getReportById);

router.post('/reports/:id/review', controller.reviewReport);

router.post('/credits/issue', controller.issueCredits);

module.exports = router;
