const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const { getIo } = require('./socketService');

const userSelectFields = {
    id: true,
    username: true,
    full_name: true,
    avatar: true
};

/**
 * Create a new notification and emit a socket event
 */
const createNotification = async (data) => {
    try {
        const notification = await prisma.notification.create({
            data,
            include: {
                actor: { select: userSelectFields },
                post: {
                    select: {
                        id: true,
                        content: true
                    }
                },

            }
        });

        // Format for socket
        const formattedNotification = {
            ...notification,
            preview: notification.post ? notification.post.content?.substring(0, 50) : ''
        };

        // Emit real-time event
        const io = getIo();
        console.log(`[DEBUG] Emitting notification to user_${data.recipientId}:`, formattedNotification.type);
        io.to(`user_${data.recipientId}`).emit('newNotification', formattedNotification);

        return notification;
    } catch (error) {
        console.error('Error creating notification:', error);
        // Don't throw, just log. Notifications shouldn't break the main flow.
        return null;
    }
};

/**
 * Get notifications for a user
 */
const getUserNotifications = async (userId, page = 1, limit = 20) => {
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

            }
        }),
        prisma.notification.count({ where: { recipientId: userId } })
    ]);

    // Format notifications
    const formattedNotifications = notifications.map(n => ({
        ...n,
        // Add a preview text based on type
        preview: n.post ? n.post.content?.substring(0, 50) : ''
    }));

    return {
        notifications: formattedNotifications,
        pagination: {
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit)
        }
    };
};

/**
 * Mark a notification as read
 */
const markAsRead = async (notificationId, userId) => {
    const notification = await prisma.notification.findUnique({
        where: { id: notificationId }
    });

    if (!notification) throw { status: 404, message: 'Notification not found' };
    if (notification.recipientId !== userId) throw { status: 403, message: 'Unauthorized' };

    return await prisma.notification.update({
        where: { id: notificationId },
        data: { read: true }
    });
};

/**
 * Mark all notifications as read
 */
const markAllAsRead = async (userId) => {
    return await prisma.notification.updateMany({
        where: { recipientId: userId, read: false },
        data: { read: true }
    });
};

/**
 * Create multiple notifications (e.g. for mentions)
 */
const createNotifications = async (notificationsData) => {
    return Promise.all(notificationsData.map(data => createNotification(data)));
};

/**
 * Delete a notification
 */
const deleteNotification = async (notificationId, userId) => {
    const notification = await prisma.notification.findUnique({
        where: { id: notificationId }
    });

    if (!notification) throw { status: 404, message: 'Notification not found' };
    if (notification.recipientId !== userId) throw { status: 403, message: 'Unauthorized' };

    await prisma.notification.delete({
        where: { id: notificationId }
    });

    return { message: 'Notification deleted' };
};

module.exports = {
    createNotification,
    createNotifications,
    getUserNotifications,
    markAsRead,
    markAllAsRead,
    deleteNotification
};
