const express = require('express');
const router = express.Router();
const controller = require('../controllers/wallet.controller');
const { verifyToken, requireRole } = require('../middleware/auth');

router.use(verifyToken);
router.use(requireRole('industry')); // Wallet actions are industry specific

router.get('/transactions', controller.getMyTransactions);
router.post('/retire', controller.retireCredits);

module.exports = router;
