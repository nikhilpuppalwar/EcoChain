const express = require('express');
const router = express.Router();
const controller = require('../controllers/notifications.controller');
const { verifyToken } = require('../middleware/auth');

router.use(verifyToken);

router.get('/', controller.getMyNotifications);
router.patch('/read-all', controller.markAllAsRead);
router.patch('/:id/read', controller.markAsRead);

module.exports = router;
