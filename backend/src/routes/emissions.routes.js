const express = require('express');
const router = express.Router();
const controller = require('../controllers/emissions.controller');
const { verifyToken, requireRole } = require('../middleware/auth');
const upload = require('../middleware/upload');

// Apply middleware to all emission routes
router.use(verifyToken);
router.use(requireRole('industry'));

router.post('/calculate', controller.calculateEmissions);
router.post('/ai-estimate', controller.estimateEmissionAI);
router.get('/my-compliance', controller.getMyCompliance);

router.route('/')
    .get(controller.getEmissions)
    .post(upload.single('evidenceDocument'), controller.createEmission);

// Timeline route BEFORE /:id so it's not caught as an id param
router.get('/:id/timeline', controller.getSubmissionTimeline);
router.patch('/:id/resubmit', controller.resubmitEmission);

router.route('/:id')
    .get(controller.getEmissionById)
    .patch(upload.single('evidenceDocument'), controller.updateEmission)
    .delete(controller.deleteEmission);

module.exports = router;
