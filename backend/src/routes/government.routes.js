const express = require('express');
const router = express.Router();
const controller = require('../controllers/government.controller');
const { verifyToken, requireRole } = require('../middleware/auth');

router.use(verifyToken);
router.use(requireRole('government'));

router.get('/dashboard/stats', controller.getDashboardStats);
router.get('/companies', controller.getCompanies);
router.get('/analytics', controller.getAnalyticsData);
router.get('/monitoring-analytics', controller.getMonitoringAnalytics);

router.get('/reports', controller.getAllReports);
router.get('/reports/:id', controller.getReportById);
router.post('/reports/:id/review', controller.reviewReport);
router.post('/anomalies/:id/review', controller.reviewAnomaly);

// Credits Management
router.post('/credits/issue', controller.issueCredits);

// Verification Management
router.get('/verifications/requests', controller.getVerificationRequests);
router.post('/verifications/industry/:id', controller.verifyIndustry);
router.post('/verifications/auditor/:id', controller.verifyAuditor);
router.post('/verifications/auditor/:id/suspend', controller.suspendAuditor);
router.post('/verifications/industry/:id/suspend', controller.suspendIndustry);

// Credit Registry
router.get('/registry/records', controller.getRegistryRecords);

// Compliance Monitoring
router.get('/compliance/data', controller.getComplianceData);
router.post('/compliance/penalty', controller.issuePenalty);
router.post('/compliance/penalty/batch', controller.issueBatchPenalties);
router.patch('/compliance/penalty', controller.modifyPenalty);
router.delete('/compliance/penalty/:companyId', controller.clearPenalty);

module.exports = router;
