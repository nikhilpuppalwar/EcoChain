const express = require('express');
const router = express.Router();
const controller = require('../controllers/emissions.controller');
const { verifyToken, requireRole } = require('../middleware/auth');
const upload = require('../middleware/upload');

// Apply middleware to all emission routes
router.use(verifyToken);
router.use(requireRole('industry'));

router.post('/calculate', controller.calculateEmissions);

router.route('/')
    .get(controller.getEmissions)
    .post(upload.single('evidenceDocument'), controller.createEmission);

router.route('/:id')
    .get(controller.getEmissionById)
    .patch(upload.single('evidenceDocument'), controller.updateEmission)
    .delete(controller.deleteEmission);

module.exports = router;
