const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller');
const { authLimiter } = require('../middleware/rateLimiter');
const upload = require('../middleware/upload');

router.post('/register/industry', authLimiter, authController.registerIndustry);
router.post('/register/government', authLimiter, upload.single('identityDocument'), authController.registerGovernment);
router.post('/register/auditor', authLimiter, upload.single('licenseDocument'), authController.registerAuditor);
router.post('/login', authLimiter, authController.login);
router.post('/refresh', authController.refresh);
router.post('/logout', authController.logout);

module.exports = router;
