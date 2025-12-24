const express = require('express');
const router = express.Router();
const notificationController = require('../controllers/notification.controller');
const { verifyToken } = require('../middlewares/authMiddleware');

router.use(verifyToken);

router.get('/', notificationController.getUserNotifications);
router.patch('/:id/read', notificationController.markAsRead);
router.post('/mark-all-read', notificationController.markAllAsRead);
router.delete('/:id', notificationController.deleteNotification);
router.post('/debug', notificationController.createTestNotification);
router.get('/status', notificationController.checkSocketStatus);

module.exports = router;
