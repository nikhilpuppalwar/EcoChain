const express = require('express');
const { verifyToken, requireRole } = require('../middleware/auth');
const auditController = require('../controllers/audit.controller');

const router = express.Router();

router.use(verifyToken);

// Government assigning auditor
router.post('/assign', requireRole('government', 'admin'), auditController.assignAuditors);

// Auditor viewing their queue
router.get('/queue', requireRole('auditor', 'admin'), auditController.getAuditQueue);

// Auditor verifying submission
router.post('/verify', requireRole('auditor', 'admin'), auditController.verifySubmission);

module.exports = router;
