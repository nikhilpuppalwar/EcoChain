const express = require('express');
const router = express.Router();
const controller = require('../controllers/marketplace.controller');
const { verifyToken, requireRole } = require('../middleware/auth');

router.use(verifyToken);

// Public (within platform) to both industries and government
router.get('/listings', controller.getAllListings);

// Industry-only routes
router.use(requireRole('industry'));

router.get('/listings/mine', controller.getMyListings);
router.post('/list', controller.createListing);
router.post('/buy/:id', controller.buyCredits);
router.delete('/listings/:id', controller.cancelListing);

module.exports = router;
