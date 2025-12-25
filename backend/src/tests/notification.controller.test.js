const request = require('supertest');

// Define mocks BEFORE requiring app
const mockNotificationService = {
    getUserNotifications: jest.fn(),
    markAsRead: jest.fn(),
    markAllAsRead: jest.fn(),
    createNotification: jest.fn(),
    deleteNotification: jest.fn(),
};

// Mock Auth Middleware
jest.mock('../middlewares/authMiddleware', () => ({
    verifyToken: (req, res, next) => {
        req.user = { id: 1 };
        next();
    }
}));

// Mock notification service
jest.mock('../services/notification.service', () => mockNotificationService);

// Mock socket service
jest.mock('../services/socketService', () => ({
    getIo: () => ({
        sockets: {
            adapter: {
                rooms: new Map([['user_1', new Set([1])]])
            }
        },
        to: jest.fn().mockReturnThis(),
        emit: jest.fn()
    })
}));

// Mock Prisma Client
jest.mock('@prisma/client', () => {
    return {
        PrismaClient: jest.fn(() => ({
            $connect: jest.fn(),
            $disconnect: jest.fn(),
        }))
    };
});

const { app } = require('../app');

describe('Notification Controller Tests', () => {

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('GET /api/notifications (getUserNotifications)', () => {
        it('should return user notifications with pagination', async () => {
            const mockResult = {
                notifications: [
                    {
                        id: 1,
                        type: 'LIKE',
                        read: false,
                        actor: { username: 'user2' },
                        post: { id: 1 }
                    },
                    {
                        id: 2,
                        type: 'FOLLOW',
                        read: true,
                        actor: { username: 'user3' }
                    }
                ],
                pagination: { page: 1, limit: 20, total: 2 }
            };

            mockNotificationService.getUserNotifications.mockResolvedValue(mockResult);

            const res = await request(app).get('/api/notifications');

            expect(res.statusCode).toEqual(200);
            expect(res.body.data).toHaveLength(2);
            expect(res.body.meta).toBeDefined();
        });

        it('should respect pagination parameters', async () => {
            mockNotificationService.getUserNotifications.mockResolvedValue({
                notifications: [],
                pagination: { page: 2, limit: 10, total: 0 }
            });

            await request(app).get('/api/notifications?page=2&limit=10');

            expect(mockNotificationService.getUserNotifications).toHaveBeenCalledWith(1, 2, 10);
        });
    });

    describe('PATCH /api/notifications/:id/read (markAsRead)', () => {
        it('should mark notification as read', async () => {
            const mockUpdated = {
                id: 1,
                read: true
            };

            mockNotificationService.markAsRead.mockResolvedValue(mockUpdated);

            const res = await request(app).patch('/api/notifications/1/read');

            expect(res.statusCode).toEqual(200);
            expect(res.body).toHaveProperty('read', true);
            expect(mockNotificationService.markAsRead).toHaveBeenCalledWith(1, 1);
        });
    });

    describe('PATCH /api/notifications/read-all (markAllAsRead)', () => {
        it('should mark all notifications as read', async () => {
            mockNotificationService.markAllAsRead.mockResolvedValue({});

            const res = await request(app).patch('/api/notifications/read-all');

            expect(res.statusCode).toEqual(200);
            expect(res.body).toHaveProperty('message', 'All notifications marked as read');
            expect(mockNotificationService.markAllAsRead).toHaveBeenCalledWith(1);
        });
    });

    describe('DELETE /api/notifications/:id (deleteNotification)', () => {
        it('should delete notification', async () => {
            mockNotificationService.deleteNotification.mockResolvedValue({
                message: 'Notification deleted'
            });

            const res = await request(app).delete('/api/notifications/1');

            expect(res.statusCode).toEqual(200);
            expect(mockNotificationService.deleteNotification).toHaveBeenCalledWith(1, 1);
        });
    });

    describe('POST /api/notifications/test (createTestNotification)', () => {
        it('should create test notification', async () => {
            mockNotificationService.createNotification.mockResolvedValue({
                id: 1,
                type: 'SYSTEM'
            });

            const res = await request(app)
                .post('/api/notifications/test')
                .send({ recipientId: 2, type: 'SYSTEM' });

            expect(res.statusCode).toEqual(200);
            expect(mockNotificationService.createNotification).toHaveBeenCalledWith({
                recipientId: 2,
                actorId: 1,
                type: 'SYSTEM'
            });
        });
    });

    describe('GET /api/notifications/socket-status (checkSocketStatus)', () => {
        it('should return socket connection status', async () => {
            const res = await request(app).get('/api/notifications/socket-status');

            expect(res.statusCode).toEqual(200);
            expect(res.body).toHaveProperty('userId', 1);
            expect(res.body).toHaveProperty('isConnected');
        });
    });
});
