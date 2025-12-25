// Mock Prisma BEFORE importing the service
const mockPrisma = {
    notification: {
        create: jest.fn(),
        findUnique: jest.fn(),
        findMany: jest.fn(),
        update: jest.fn(),
        updateMany: jest.fn(),
        delete: jest.fn(),
        count: jest.fn(),
    },
    $connect: jest.fn(),
    $disconnect: jest.fn(),
};

jest.mock('@prisma/client', () => {
    return {
        PrismaClient: jest.fn(() => mockPrisma)
    };
});

// Mock socket service
jest.mock('../../services/socketService', () => ({
    getIo: () => ({
        to: jest.fn().mockReturnThis(),
        emit: jest.fn()
    })
}));

// Now import the service
const notificationService = require('../../services/notification.service');

describe('Notification Service Tests', () => {

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('createNotification', () => {
        it('should create a LIKE notification', async () => {
            const mockNotification = {
                id: 1,
                type: 'LIKE',
                recipientId: 2,
                actorId: 1,
                postId: 5,
                actor: { id: 1, username: 'liker' },
                post: { id: 5, content: 'Great post!' }
            };

            mockPrisma.notification.create.mockResolvedValue(mockNotification);

            const result = await notificationService.createNotification({
                type: 'LIKE',
                recipientId: 2,
                actorId: 1,
                postId: 5
            });

            expect(mockPrisma.notification.create).toHaveBeenCalledWith(
                expect.objectContaining({
                    data: expect.objectContaining({
                        type: 'LIKE',
                        recipientId: 2,
                        actorId: 1
                    })
                })
            );
            expect(result).toHaveProperty('type', 'LIKE');
        });

        it('should create a FOLLOW notification', async () => {
            const mockNotification = {
                id: 1,
                type: 'FOLLOW',
                recipientId: 2,
                actorId: 1,
                actor: { id: 1, username: 'follower' }
            };

            mockPrisma.notification.create.mockResolvedValue(mockNotification);

            const result = await notificationService.createNotification({
                type: 'FOLLOW',
                recipientId: 2,
                actorId: 1
            });

            expect(result).toHaveProperty('type', 'FOLLOW');
        });

        it('should create a COMMENT notification', async () => {
            const mockNotification = {
                id: 1,
                type: 'COMMENT',
                recipientId: 2,
                actorId: 1,
                postId: 10,
                actor: { id: 1, username: 'commenter' },
                post: { id: 10, content: 'Original post' }
            };

            mockPrisma.notification.create.mockResolvedValue(mockNotification);

            const result = await notificationService.createNotification({
                type: 'COMMENT',
                recipientId: 2,
                actorId: 1,
                postId: 10
            });

            expect(result).toHaveProperty('type', 'COMMENT');
        });

        it('should handle errors gracefully and return null', async () => {
            mockPrisma.notification.create.mockRejectedValue(new Error('Database error'));

            const result = await notificationService.createNotification({
                type: 'LIKE',
                recipientId: 2,
                actorId: 1
            });

            // Should not throw, but return null
            expect(result).toBeNull();
        });
    });

    describe('getUserNotifications', () => {
        it('should return paginated notifications', async () => {
            const mockNotifications = [
                {
                    id: 1,
                    type: 'LIKE',
                    read: false,
                    actor: { username: 'user1' },
                    post: { id: 1, content: 'Liked post' }
                },
                {
                    id: 2,
                    type: 'FOLLOW',
                    read: true,
                    actor: { username: 'user2' }
                }
            ];

            mockPrisma.notification.findMany.mockResolvedValue(mockNotifications);
            mockPrisma.notification.count.mockResolvedValue(50);

            const result = await notificationService.getUserNotifications(1, 1, 20);

            expect(result).toHaveProperty('notifications');
            expect(result).toHaveProperty('pagination');
            expect(result.notifications).toHaveLength(2);
            expect(result.pagination.total).toBe(50);
        });

        it('should apply correct pagination offset', async () => {
            mockPrisma.notification.findMany.mockResolvedValue([]);
            mockPrisma.notification.count.mockResolvedValue(0);

            await notificationService.getUserNotifications(1, 3, 10);

            expect(mockPrisma.notification.findMany).toHaveBeenCalledWith(
                expect.objectContaining({
                    skip: 20, // (page 3 - 1) * 10
                    take: 10
                })
            );
        });

        it('should format notifications with preview', async () => {
            const mockNotifications = [
                {
                    id: 1,
                    type: 'LIKE',
                    post: { id: 1, content: 'This is a very long post content that should be truncated' }
                }
            ];

            mockPrisma.notification.findMany.mockResolvedValue(mockNotifications);
            mockPrisma.notification.count.mockResolvedValue(1);

            const result = await notificationService.getUserNotifications(1, 1, 20);

            expect(result.notifications[0]).toHaveProperty('preview');
        });
    });

    describe('markAsRead', () => {
        it('should mark notification as read', async () => {
            mockPrisma.notification.findUnique.mockResolvedValue({
                id: 1,
                recipientId: 1,
                read: false
            });
            mockPrisma.notification.update.mockResolvedValue({
                id: 1,
                read: true
            });

            const result = await notificationService.markAsRead(1, 1);

            expect(mockPrisma.notification.update).toHaveBeenCalledWith({
                where: { id: 1 },
                data: { read: true }
            });
            expect(result.read).toBe(true);
        });

        it('should throw 404 when notification not found', async () => {
            mockPrisma.notification.findUnique.mockResolvedValue(null);

            await expect(notificationService.markAsRead(999, 1)).rejects.toMatchObject({
                status: 404
            });
        });

        it('should throw 403 when notification belongs to another user', async () => {
            mockPrisma.notification.findUnique.mockResolvedValue({
                id: 1,
                recipientId: 2 // Different user
            });

            await expect(notificationService.markAsRead(1, 1)).rejects.toMatchObject({
                status: 403
            });
        });
    });

    describe('markAllAsRead', () => {
        it('should mark all notifications as read', async () => {
            mockPrisma.notification.updateMany.mockResolvedValue({ count: 5 });

            await notificationService.markAllAsRead(1);

            expect(mockPrisma.notification.updateMany).toHaveBeenCalledWith({
                where: { recipientId: 1, read: false },
                data: { read: true }
            });
        });
    });

    describe('deleteNotification', () => {
        it('should delete notification when owner', async () => {
            mockPrisma.notification.findUnique.mockResolvedValue({
                id: 1,
                recipientId: 1
            });
            mockPrisma.notification.delete.mockResolvedValue({});

            const result = await notificationService.deleteNotification(1, 1);

            expect(result).toHaveProperty('message', 'Notification deleted');
        });

        it('should throw 404 when notification not found', async () => {
            mockPrisma.notification.findUnique.mockResolvedValue(null);

            await expect(notificationService.deleteNotification(999, 1)).rejects.toMatchObject({
                status: 404
            });
        });

        it('should throw 403 when not owner', async () => {
            mockPrisma.notification.findUnique.mockResolvedValue({
                id: 1,
                recipientId: 2
            });

            await expect(notificationService.deleteNotification(1, 1)).rejects.toMatchObject({
                status: 403
            });
        });
    });

    describe('createNotifications', () => {
        it('should create multiple notifications', async () => {
            const notificationsData = [
                { type: 'MENTION', recipientId: 2, actorId: 1, postId: 1 },
                { type: 'MENTION', recipientId: 3, actorId: 1, postId: 1 }
            ];

            mockPrisma.notification.create
                .mockResolvedValueOnce({ id: 1, type: 'MENTION' })
                .mockResolvedValueOnce({ id: 2, type: 'MENTION' });

            const result = await notificationService.createNotifications(notificationsData);

            expect(mockPrisma.notification.create).toHaveBeenCalledTimes(2);
            expect(result).toHaveLength(2);
        });
    });
});
