const express = require('express');
const router = express.Router();
const publicController = require('../controllers/public.controller');

// ── Public routes ─────────────────────────────────────────

// Fetch public ledger activity (approved emissions/transactions)
router.get('/ledger', publicController.getPublicLedger);

module.exports = router;
