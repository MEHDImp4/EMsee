const request = require('supertest');

// Define mockPrisma BEFORE requiring app
const mockPrisma = {
    post: {
        findMany: jest.fn(),
        findUnique: jest.fn(),
        create: jest.fn(),
        count: jest.fn(),
        delete: jest.fn(),
    },
    user: {
        findUnique: jest.fn(),
    },
    repost: {
        findMany: jest.fn(),
        findUnique: jest.fn(),
        create: jest.fn(),
        delete: jest.fn(),
    },
    like: {
        findUnique: jest.fn(),
        create: jest.fn(),
        delete: jest.fn(),
    },
    comment: {
        findUnique: jest.fn(),
        create: jest.fn(),
        deleteMany: jest.fn(),
        findMany: jest.fn(),
    },
    $queryRaw: jest.fn(),
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

jest.mock('@prisma/client', () => {
    return {
        PrismaClient: jest.fn(() => mockPrisma)
    };
});

const { app } = require('../app');

describe('Post API Integration Tests', () => {

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('GET /api/posts (Pagination)', () => {
        it('should return posts with default limit of 20', async () => {
            mockPrisma.post.findMany.mockResolvedValue([
                { id: 1, content: 'Test Post', user: { username: 'testuser' } }
            ]);

            const res = await request(app).get('/api/posts');

            expect(res.statusCode).toEqual(200);
            expect(mockPrisma.post.findMany).toHaveBeenCalledWith(expect.objectContaining({
                take: 20
            }));
            expect(res.body).toHaveLength(1);
        });

        it('should respect custom limit', async () => {
            mockPrisma.post.findMany.mockResolvedValue([]);

            await request(app).get('/api/posts?limit=5');

            expect(mockPrisma.post.findMany).toHaveBeenCalledWith(expect.objectContaining({
                take: 5
            }));
        });

        it('should use cursor when provided', async () => {
            mockPrisma.post.findMany.mockResolvedValue([]);

            await request(app).get('/api/posts?cursor=100');

            expect(mockPrisma.post.findMany).toHaveBeenCalledWith(expect.objectContaining({
                cursor: { id: 100 },
                skip: 1
            }));
        });
    });

    describe('GET /api/users/:username/posts (Optimization)', () => {
        it.skip('should use raw SQL for user timeline optimization', async () => {
            mockPrisma.user.findUnique.mockResolvedValue({ id: 99, username: 'optimizedUser' });
            mockPrisma.$queryRaw.mockResolvedValue([
                { id: 101, originalPostId: 101, type: 'post', createdAt: new Date() },
                { id: 102, originalPostId: 202, type: 'repost', createdAt: new Date() }
            ]);
            mockPrisma.post.findMany.mockResolvedValue([
                { id: 101, content: 'Post 101', user: { id: 99 } },
                { id: 202, content: 'Post 202', user: { id: 50 }, replyPermission: 'EVERYONE' }
            ]);

            const res = await request(app).get('/api/users/optimizedUser/posts');

            expect(res.statusCode).toEqual(200);
            expect(mockPrisma.user.findUnique).toHaveBeenCalled();
            expect(mockPrisma.$queryRaw).toHaveBeenCalled();
            // Basic assertions
            expect(res.body).toHaveLength(2);
            // Ensure it returns objects
            expect(res.body[0]).toHaveProperty('id');
        });
    });
});
