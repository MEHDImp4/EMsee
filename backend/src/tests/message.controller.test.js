const request = require('supertest');

// Define mocks BEFORE requiring app
const mockMessageService = {
    getUserConversations: jest.fn(),
    getOrCreateConversation: jest.fn(),
    getConversationById: jest.fn(),
    getConversationMessages: jest.fn(),
    sendMessage: jest.fn(),
    markConversationAsRead: jest.fn(),
};

// Mock Auth Middleware
jest.mock('../middlewares/authMiddleware', () => ({
    verifyToken: (req, res, next) => {
        req.user = { id: 1 };
        next();
    }
}));

// Mock message service
jest.mock('../services/message.service', () => mockMessageService);

// Mock socket service
jest.mock('../services/socketService', () => ({
    getIo: () => ({
        to: jest.fn().mockReturnThis(),
        emit: jest.fn()
    })
}));

// Mock Prisma Client (needed for other app dependencies)
jest.mock('@prisma/client', () => {
    return {
        PrismaClient: jest.fn(() => ({
            $connect: jest.fn(),
            $disconnect: jest.fn(),
        }))
    };
});

const { app } = require('../app');

describe('Message Controller Tests', () => {

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('GET /api/messages/conversations (getConversations)', () => {
        it('should return user conversations with pagination', async () => {
            const mockResult = {
                conversations: [
                    {
                        id: 1,
                        participants: [{ userId: 1 }, { userId: 2 }],
                        lastMessage: { content: 'Hello!' }
                    }
                ],
                pagination: { page: 1, limit: 20, total: 1 }
            };

            mockMessageService.getUserConversations.mockResolvedValue(mockResult);

            const res = await request(app).get('/api/messages/conversations');

            expect(res.statusCode).toEqual(200);
            expect(res.body.success).toBe(true);
            expect(res.body.data).toHaveLength(1);
            expect(res.body.pagination).toBeDefined();
        });

        it('should respect pagination parameters', async () => {
            mockMessageService.getUserConversations.mockResolvedValue({
                conversations: [],
                pagination: { page: 2, limit: 10, total: 0 }
            });

            await request(app).get('/api/messages/conversations?page=2&limit=10');

            expect(mockMessageService.getUserConversations).toHaveBeenCalledWith(1, 2, 10);
        });
    });

    describe('POST /api/messages/conversations (createConversation)', () => {
        it('should create or get conversation with another user', async () => {
            const mockConversation = {
                id: 1,
                participants: [{ userId: 1 }, { userId: 2 }]
            };

            mockMessageService.getOrCreateConversation.mockResolvedValue(mockConversation);

            const res = await request(app)
                .post('/api/messages/conversations')
                .send({ recipientId: 2 });

            expect(res.statusCode).toEqual(200);
            expect(res.body.success).toBe(true);
            expect(res.body.data).toHaveProperty('id', 1);
        });

        it('should return 400 when trying to message yourself', async () => {
            const res = await request(app)
                .post('/api/messages/conversations')
                .send({ recipientId: 1 }); // Same as current user

            expect(res.statusCode).toEqual(400);
            expect(res.body.success).toBe(false);
        });
    });

    describe('GET /api/messages/conversations/:id (getConversation)', () => {
        it('should return conversation details', async () => {
            const mockConversation = {
                id: 1,
                participants: [
                    { userId: 1, user: { username: 'user1' } },
                    { userId: 2, user: { username: 'user2' } }
                ]
            };

            mockMessageService.getConversationById.mockResolvedValue(mockConversation);

            const res = await request(app).get('/api/messages/conversations/1');

            expect(res.statusCode).toEqual(200);
            expect(res.body.success).toBe(true);
            expect(res.body.data.participants).toHaveLength(2);
        });
    });

    describe('GET /api/messages/conversations/:id/messages (getMessages)', () => {
        it('should return messages in conversation', async () => {
            const mockResult = {
                messages: [
                    { id: 1, content: 'Hello', senderId: 1 },
                    { id: 2, content: 'Hi there!', senderId: 2 }
                ],
                pagination: { page: 1, limit: 50, total: 2 }
            };

            mockMessageService.getConversationMessages.mockResolvedValue(mockResult);

            const res = await request(app).get('/api/messages/conversations/1/messages');

            expect(res.statusCode).toEqual(200);
            expect(res.body.success).toBe(true);
            expect(res.body.data).toHaveLength(2);
        });
    });

    describe('POST /api/messages/conversations/:id/messages (sendMessage)', () => {
        it('should send a message successfully', async () => {
            const mockMessage = {
                id: 1,
                content: 'Hello!',
                senderId: 1,
                createdAt: new Date()
            };

            mockMessageService.sendMessage.mockResolvedValue(mockMessage);
            mockMessageService.getConversationById.mockResolvedValue({
                participants: [{ userId: 1 }, { userId: 2 }]
            });

            const res = await request(app)
                .post('/api/messages/conversations/1/messages')
                .send({ content: 'Hello!' });

            expect(res.statusCode).toEqual(201);
            expect(res.body.success).toBe(true);
            expect(res.body.data).toHaveProperty('content', 'Hello!');
        });
    });

    describe('PATCH /api/messages/conversations/:id/read (markAsRead)', () => {
        it('should mark conversation as read', async () => {
            mockMessageService.markConversationAsRead.mockResolvedValue({});
            mockMessageService.getConversationById.mockResolvedValue({
                participants: [{ userId: 1 }, { userId: 2 }]
            });

            const res = await request(app).patch('/api/messages/conversations/1/read');

            expect(res.statusCode).toEqual(200);
            expect(res.body.success).toBe(true);
            expect(mockMessageService.markConversationAsRead).toHaveBeenCalledWith(1, 1);
        });
    });
});
