const express = require('express');
const router = express.Router();
const controller = require('../controllers/ai.controller');
const { verifyToken, requireRole } = require('../middleware/auth');

router.use(verifyToken);
router.use(requireRole('industry')); // AI Forecasts are currently industry-focused

router.get('/forecast', controller.getForecast);
router.get('/history', controller.getForecastHistory);

module.exports = router;
