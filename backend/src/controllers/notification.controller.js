const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const asyncHandler = require('../middlewares/asyncHandler');
const { userSelectFields } = require('./helpers/post.helpers');

/**
 * Get current user's notifications
 */
const getUserNotifications = asyncHandler(async (req, res) => {
    const userId = req.user.id;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const [notifications, total] = await Promise.all([
        prisma.notification.findMany({
            where: { recipientId: userId },
            take: limit,
            skip,
            orderBy: { createdAt: 'desc' },
            include: {
                actor: { select: userSelectFields },
                post: {
                    select: {
                        id: true,
                        content: true,
                        media: true
                    }
                },
                comment: {
                    select: {
                        id: true,
                        content: true
                    }
                }
            }
        }),
        prisma.notification.count({ where: { recipientId: userId } })
    ]);

    // Format notifications if needed
    const formattedNotifications = notifications.map(n => ({
        ...n,
        // Add a preview text based on type
        preview: n.post ? n.post.content?.substring(0, 50) : (n.comment ? n.comment.content?.substring(0, 50) : '')
    }));

    res.json({
        data: formattedNotifications,
        meta: {
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit)
        }
    });
});

/**
 * Mark notification as read
 */
const markAsRead = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const userId = req.user.id;

    // Verify ownership
    const notification = await prisma.notification.findUnique({
        where: { id: parseInt(id) }
    });

    if (!notification) {
        return res.status(404).json({ error: 'Notification not found' });
    }

    if (notification.recipientId !== userId) {
        return res.status(403).json({ error: 'Unauthorized' });
    }

    const updated = await prisma.notification.update({
        where: { id: parseInt(id) },
        data: { read: true }
    });

    res.json(updated);
});

/**
 * Mark all notifications as read
 */
const markAllAsRead = asyncHandler(async (req, res) => {
    const userId = req.user.id;

    await prisma.notification.updateMany({
        where: { recipientId: userId, read: false },
        data: { read: true }
    });

    res.json({ message: 'All notifications marked as read' });
});

module.exports = {
    getUserNotifications,
    markAsRead,
    markAllAsRead
};
