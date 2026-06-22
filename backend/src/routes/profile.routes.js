const express = require('express');
const router = express.Router();
const controller = require('../controllers/profile.controller');
const { verifyToken, requireRole } = require('../middleware/auth');

// All profile routes require authentication
router.use(verifyToken);

// ── Shared routes (all roles) ────────────────────────────────
router.get('/me',              controller.getProfile);
router.get('/stats',           controller.getProfileStats);
router.patch('/change-password', controller.changePassword);
router.patch('/wallet',          controller.linkWallet);

// ── Role-specific profile update routes ─────────────────────
router.patch('/industry',   requireRole('industry'),   controller.updateIndustryProfile);
router.patch('/government', requireRole('government'), controller.updateGovernmentProfile);
router.patch('/auditor',    requireRole('auditor'),    controller.updateAuditorProfile);
router.patch('/admin',      requireRole('admin'),      controller.updateAdminProfile);

router.patch('/resubmit-industry', requireRole('industry'), controller.resubmitIndustryRegistration);
router.patch('/resubmit-auditor',  requireRole('auditor'),  controller.resubmitAuditorApplication);

module.exports = router;
