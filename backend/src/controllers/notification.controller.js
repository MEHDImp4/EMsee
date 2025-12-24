const notificationService = require('../services/notification.service');
const asyncHandler = require('../middlewares/asyncHandler');

/**
 * Get current user's notifications
 */
const getUserNotifications = asyncHandler(async (req, res) => {
    const userId = req.user.id;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;

    const result = await notificationService.getUserNotifications(userId, page, limit);

    res.json({
        data: result.notifications,
        meta: result.pagination
    });
});

/**
 * Mark notification as read
 */
const markAsRead = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const userId = req.user.id;

    const updated = await notificationService.markAsRead(parseInt(id), userId);

    res.json(updated);
});

/**
 * Mark all notifications as read
 */
const markAllAsRead = asyncHandler(async (req, res) => {
    const userId = req.user.id;

    await notificationService.markAllAsRead(userId);

    res.json({ message: 'All notifications marked as read' });
});

const createTestNotification = asyncHandler(async (req, res) => {
    try {
        const { recipientId, type } = req.body;
        const result = await notificationService.createNotification({
            recipientId,
            actorId: req.user.id,
            type: type || 'SYSTEM'
        });
        res.json(result);
    } catch (error) {
        console.error('Test notification failed:', error);
        res.status(500).json({ error: error.message });
    }
});

const checkSocketStatus = asyncHandler(async (req, res) => {
    const userId = req.user.id;
    const io = require('../services/socketService').getIo();

    // Find socket for user
    const rooms = io.sockets.adapter.rooms;
    const userRoom = rooms.get(`user_${userId}`);
    const isConnected = !!userRoom;

    res.json({
        userId,
        isConnected,
        roomSize: userRoom ? userRoom.size : 0,
        allRooms: [...rooms.keys()].filter(r => r.startsWith('user_'))
    });
});

/**
 * Delete a notification
 */
const deleteNotification = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const userId = req.user.id;

    const result = await notificationService.deleteNotification(parseInt(id), userId);

    res.json(result);
});

module.exports = {
    getUserNotifications,
    markAsRead,
    markAllAsRead,
    createTestNotification,
    checkSocketStatus,
    deleteNotification
};
