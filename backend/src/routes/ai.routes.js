const express = require('express');
const router = express.Router();
const controller = require('../controllers/ai.controller');
const { verifyToken, requireRole } = require('../middleware/auth');

router.use(verifyToken);

// ── Industry routes ─────────────────────────────────────────
router.get('/forecast', requireRole('industry'), controller.getForecast);
router.get('/history',  requireRole('industry'), controller.getForecastHistory);

// ── Government + Auditor routes ─────────────────────────────
router.get('/results/:submissionId',
    requireRole('government', 'auditor'),
    controller.getAIResult
);

// ── Government-only routes ──────────────────────────────────
router.post('/trigger-check/:submissionId',
    requireRole('government'),
    controller.triggerAICheck
);

router.get('/flagged',
    requireRole('government'),
    controller.getFlaggedSubmissions
);

router.get('/all',
    requireRole('government'),
    controller.getAllAIResults
);

router.patch('/anomaly/:id/review',
    requireRole('government'),
    controller.reviewAnomalyReport
);

router.get('/repeat-offenders',
    requireRole('government'),
    controller.getRepeatOffenders
);

module.exports = router;
