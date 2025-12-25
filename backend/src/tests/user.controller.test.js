const request = require('supertest');

// Define mockPrisma BEFORE requiring app
const mockPrisma = {
    user: {
        findUnique: jest.fn(),
        findMany: jest.fn(),
    },
    follow: {
        findUnique: jest.fn(),
        create: jest.fn(),
        delete: jest.fn(),
    },
    $connect: jest.fn(),
    $disconnect: jest.fn(),
};

// Mock Auth Middleware
jest.mock('../middlewares/authMiddleware', () => ({
    verifyToken: (req, res, next) => {
        req.user = { id: 1 };
        next();
    }
}));

// Mock Prisma Client
jest.mock('@prisma/client', () => {
    return {
        PrismaClient: jest.fn(() => mockPrisma)
    };
});

// Mock notification service
jest.mock('../services/notification.service', () => ({
    createNotification: jest.fn().mockResolvedValue({ id: 1 })
}));

const { app } = require('../app');

describe('User Controller Tests', () => {

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('GET /api/users/:username (getProfile)', () => {
        it('should return user profile when user exists', async () => {
            const mockUser = {
                id: 2,
                username: 'testuser',
                full_name: 'Test User',
                avatar: null,
                bio: 'Test bio',
                created_at: new Date(),
                _count: {
                    posts: 5,
                    followedBy: 10,
                    following: 8
                }
            };

            mockPrisma.user.findUnique.mockResolvedValue(mockUser);
            mockPrisma.follow.findUnique.mockResolvedValue(null);

            const res = await request(app).get('/api/users/testuser');

            expect(res.statusCode).toEqual(200);
            expect(res.body).toHaveProperty('username', 'testuser');
            expect(mockPrisma.user.findUnique).toHaveBeenCalledWith(
                expect.objectContaining({
                    where: { username: 'testuser' }
                })
            );
        });

        it('should return 404 when user does not exist', async () => {
            mockPrisma.user.findUnique.mockResolvedValue(null);

            const res = await request(app).get('/api/users/nonexistent');

            expect(res.statusCode).toEqual(404);
            expect(res.body).toHaveProperty('error', 'User not found');
        });
    });

    describe('POST /api/users/:id/follow (followUser)', () => {
        it('should follow a user successfully', async () => {
            const targetUser = { id: 2, username: 'target' };

            mockPrisma.user.findUnique.mockResolvedValue(targetUser);
            mockPrisma.follow.findUnique.mockResolvedValue(null);
            mockPrisma.follow.create.mockResolvedValue({
                followerId: 1,
                followingId: 2
            });

            const res = await request(app).post('/api/users/2/follow');

            expect(res.statusCode).toEqual(200);
            expect(res.body).toHaveProperty('following', true);
        });

        it('should unfollow when already following', async () => {
            const targetUser = { id: 2, username: 'target' };
            const existingFollow = { followerId: 1, followingId: 2 };

            mockPrisma.user.findUnique.mockResolvedValue(targetUser);
            mockPrisma.follow.findUnique.mockResolvedValue(existingFollow);
            mockPrisma.follow.delete.mockResolvedValue(existingFollow);

            const res = await request(app).post('/api/users/2/follow');

            expect(res.statusCode).toEqual(200);
            expect(res.body).toHaveProperty('following', false);
        });

        it('should return 400 when trying to follow yourself', async () => {
            const res = await request(app).post('/api/users/1/follow');

            expect(res.statusCode).toEqual(400);
            expect(res.body).toHaveProperty('error', 'Cannot follow yourself');
        });

        it('should return 404 when target user does not exist', async () => {
            mockPrisma.user.findUnique.mockResolvedValue(null);

            const res = await request(app).post('/api/users/999/follow');

            expect(res.statusCode).toEqual(404);
            expect(res.body).toHaveProperty('error', 'User not found');
        });
    });

    describe('GET /api/users/search (searchUsers)', () => {
        it('should return matching users', async () => {
            const mockUsers = [
                { id: 1, username: 'john', full_name: 'John Doe' },
                { id: 2, username: 'johnny', full_name: 'Johnny Test' }
            ];

            mockPrisma.user.findMany.mockResolvedValue(mockUsers);

            const res = await request(app).get('/api/users/search?q=john');

            expect(res.statusCode).toEqual(200);
            expect(res.body).toHaveLength(2);
        });

        it('should return empty array for empty query', async () => {
            const res = await request(app).get('/api/users/search?q=');

            expect(res.statusCode).toEqual(200);
            expect(res.body).toEqual([]);
        });
    });

    describe('GET /api/users/suggestions (getSuggestions)', () => {
        it('should return user suggestions', async () => {
            const mockSuggestions = [
                { id: 2, username: 'user1', full_name: 'User 1', avatar: null, followedBy: [] },
                { id: 3, username: 'user2', full_name: 'User 2', avatar: null, followedBy: [] }
            ];

            mockPrisma.user.findMany.mockResolvedValue(mockSuggestions);

            const res = await request(app).get('/api/users/suggestions');

            expect(res.statusCode).toEqual(200);
            expect(res.body).toHaveLength(2);
            expect(res.body[0]).toHaveProperty('isFollowing', false);
        });
    });

    describe('GET /api/users/recent (getRecentUsers)', () => {
        it('should return recent users', async () => {
            const mockUsers = [
                { id: 2, username: 'newuser1', full_name: 'New User 1' },
                { id: 3, username: 'newuser2', full_name: 'New User 2' }
            ];

            mockPrisma.user.findMany.mockResolvedValue(mockUsers);

            const res = await request(app).get('/api/users/recent');

            expect(res.statusCode).toEqual(200);
            expect(res.body).toHaveLength(2);
        });

        it('should respect limit parameter', async () => {
            mockPrisma.user.findMany.mockResolvedValue([]);

            await request(app).get('/api/users/recent?limit=5');

            expect(mockPrisma.user.findMany).toHaveBeenCalledWith(
                expect.objectContaining({
                    take: 5
                })
            );
        });
    });
});
