const request = require('supertest');

// Define mockPrisma BEFORE requiring app
const mockPrisma = {
    community: {
        create: jest.fn(),
        findUnique: jest.fn(),
        findMany: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
    },
    communityMember: {
        findUnique: jest.fn(),
        findMany: jest.fn(),
        create: jest.fn(),
        delete: jest.fn(),
        update: jest.fn(),
    },
    communityMessage: {
        deleteMany: jest.fn(),
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

const { app } = require('../app');

describe('Community Controller Tests', () => {

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('POST /api/communities (createCommunity)', () => {
        it('should create a new community', async () => {
            const newCommunity = {
                id: 1,
                name: 'Test Community',
                description: 'A test community',
                privacy: 'PUBLIC',
                ownerId: 1
            };

            mockPrisma.community.create.mockResolvedValue(newCommunity);

            const res = await request(app)
                .post('/api/communities')
                .send({
                    name: 'Test Community',
                    description: 'A test community',
                    privacy: 'PUBLIC'
                });

            expect(res.statusCode).toEqual(201);
            expect(res.body).toHaveProperty('name', 'Test Community');
        });
    });

    describe('GET /api/communities (getCommunities)', () => {
        it('should return discover communities by default', async () => {
            const mockCommunities = [
                { id: 1, name: 'Community 1', _count: { members: 10 } },
                { id: 2, name: 'Community 2', _count: { members: 5 } }
            ];

            mockPrisma.community.findMany.mockResolvedValue(mockCommunities);

            const res = await request(app).get('/api/communities');

            expect(res.statusCode).toEqual(200);
            expect(res.body).toHaveLength(2);
        });

        it('should return user communities with tab=my', async () => {
            const mockMemberships = [
                { community: { id: 1, name: 'My Community', _count: { members: 10 } } }
            ];

            mockPrisma.communityMember.findMany.mockResolvedValue(mockMemberships);

            const res = await request(app).get('/api/communities?tab=my');

            expect(res.statusCode).toEqual(200);
            expect(res.body).toHaveLength(1);
        });
    });

    describe('GET /api/communities/:id (getCommunity)', () => {
        it('should return community details', async () => {
            const mockCommunity = {
                id: 1,
                name: 'Test Community',
                description: 'Description',
                privacy: 'PUBLIC',
                owner: { id: 1, username: 'owner' },
                _count: { members: 10 }
            };

            mockPrisma.community.findUnique.mockResolvedValue(mockCommunity);
            mockPrisma.communityMember.findUnique.mockResolvedValue({
                status: 'ACTIVE',
                role: 'MEMBER'
            });

            const res = await request(app).get('/api/communities/1');

            expect(res.statusCode).toEqual(200);
            expect(res.body).toHaveProperty('name', 'Test Community');
            expect(res.body).toHaveProperty('membership');
        });

        it('should return 404 for non-existent community', async () => {
            mockPrisma.community.findUnique.mockResolvedValue(null);

            const res = await request(app).get('/api/communities/999');

            expect(res.statusCode).toEqual(404);
        });
    });

    describe('POST /api/communities/:id/join (joinCommunity)', () => {
        it('should join a public community successfully', async () => {
            const mockCommunity = {
                id: 1,
                name: 'Public Community',
                privacy: 'PUBLIC'
            };

            mockPrisma.community.findUnique.mockResolvedValue(mockCommunity);
            mockPrisma.communityMember.findUnique.mockResolvedValue(null);
            mockPrisma.communityMember.create.mockResolvedValue({
                communityId: 1,
                userId: 1,
                status: 'ACTIVE',
                role: 'MEMBER'
            });

            const res = await request(app).post('/api/communities/1/join');

            expect(res.statusCode).toEqual(201);
            expect(res.body).toHaveProperty('status', 'ACTIVE');
        });

        it('should create pending membership for private community', async () => {
            const mockCommunity = {
                id: 1,
                name: 'Private Community',
                privacy: 'PRIVATE'
            };

            mockPrisma.community.findUnique.mockResolvedValue(mockCommunity);
            mockPrisma.communityMember.findUnique.mockResolvedValue(null);
            mockPrisma.communityMember.create.mockResolvedValue({
                communityId: 1,
                userId: 1,
                status: 'PENDING',
                role: 'MEMBER'
            });

            const res = await request(app).post('/api/communities/1/join');

            expect(res.statusCode).toEqual(201);
            expect(res.body).toHaveProperty('status', 'PENDING');
        });

        it('should return 400 if already a member', async () => {
            mockPrisma.community.findUnique.mockResolvedValue({ id: 1, privacy: 'PUBLIC' });
            mockPrisma.communityMember.findUnique.mockResolvedValue({
                communityId: 1,
                userId: 1,
                status: 'ACTIVE'
            });

            const res = await request(app).post('/api/communities/1/join');

            expect(res.statusCode).toEqual(400);
        });
    });

    describe('DELETE /api/communities/:id/leave (leaveCommunity)', () => {
        it('should leave community successfully', async () => {
            mockPrisma.communityMember.delete.mockResolvedValue({});

            const res = await request(app).delete('/api/communities/1/leave');

            expect(res.statusCode).toEqual(200);
            expect(res.body).toHaveProperty('message', 'Left community');
        });
    });

    describe('DELETE /api/communities/:id (deleteCommunity)', () => {
        it('should delete community when owner', async () => {
            const mockCommunity = {
                id: 1,
                ownerId: 1,
                name: 'My Community'
            };
            mockPrisma.community.findUnique.mockResolvedValue(mockCommunity);
            mockPrisma.communityMessage.deleteMany.mockResolvedValue({ count: 0 });
            mockPrisma.communityMember.deleteMany.mockResolvedValue({ count: 0 });
            mockPrisma.community.delete.mockResolvedValue({});

            const res = await request(app).delete('/api/communities/1');

            expect(res.statusCode).toEqual(200);
            expect(res.body).toHaveProperty('message', 'Community deleted');
        });

        it('should return 403 when not owner', async () => {
            mockPrisma.community.findUnique.mockResolvedValue({
                id: 1,
                ownerId: 2, // Different user
                name: 'Not My Community'
            });

            const res = await request(app).delete('/api/communities/1');

            expect(res.statusCode).toEqual(403);
        });
    });

    describe('PUT /api/communities/:id (updateCommunity)', () => {
        it('should update community when admin', async () => {
            mockPrisma.communityMember.findUnique.mockResolvedValue({
                role: 'ADMIN'
            });
            mockPrisma.community.update.mockResolvedValue({
                id: 1,
                name: 'Updated Name',
                description: 'Updated description'
            });

            const res = await request(app)
                .put('/api/communities/1')
                .send({ name: 'Updated Name', description: 'Updated description' });

            expect(res.statusCode).toEqual(200);
            expect(res.body).toHaveProperty('name', 'Updated Name');
        });

        it('should return 403 when not admin', async () => {
            mockPrisma.communityMember.findUnique.mockResolvedValue({
                role: 'MEMBER'
            });

            const res = await request(app)
                .put('/api/communities/1')
                .send({ name: 'Updated Name' });

            expect(res.statusCode).toEqual(403);
        });
    });
});
