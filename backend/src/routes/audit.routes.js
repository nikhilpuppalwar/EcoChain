const express = require('express');
const { verifyToken, requireRole } = require('../middleware/auth');
const auditController = require('../controllers/audit.controller');

const router = express.Router();

router.use(verifyToken);

// ── Government routes ─────────────────────────────────────────────────────────
router.post('/assign', requireRole('government', 'admin'), auditController.assignAuditors);
router.get('/pending-assignment', requireRole('government', 'admin'), auditController.getPendingAssignments);
router.get('/available', requireRole('government', 'admin'), auditController.getAvailableAuditors);

// ── Auditor routes ────────────────────────────────────────────────────────────

// A1 — Dashboard stats
router.get('/dashboard-stats', requireRole('auditor', 'admin'), auditController.getDashboardStats);

// A2 — Audit queue
router.get('/queue', requireRole('auditor', 'admin'), auditController.getAuditQueue);

// A3 — AI result for a submission
router.get('/:submissionId/ai-result', requireRole('auditor', 'admin'), auditController.getAIResult);

// A4 — Co-auditor decision (for dual audits)
router.get('/:submissionId/co-auditor-decision', requireRole('auditor', 'admin'), auditController.getCoAuditorDecision);

// A4 — Save document checklist state
router.patch('/checklist/:submissionId', requireRole('auditor', 'admin'), auditController.updateChecklist);

// A5 — Verify submission (approve / reject / request correction)
router.post('/verify', requireRole('auditor', 'admin'), auditController.verifySubmission);

// A6 — Flag submission for regulatory compliance review
router.post('/flag-compliance', requireRole('auditor', 'admin'), auditController.flagCompliance);

// A7 — Audit history
router.get('/history', requireRole('auditor', 'admin'), auditController.getAuditHistory);

module.exports = router;

