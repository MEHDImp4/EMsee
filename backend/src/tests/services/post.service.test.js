// Mock Prisma BEFORE importing the service
const mockPrisma = {
    post: {
        create: jest.fn(),
        findMany: jest.fn(),
        findUnique: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
        count: jest.fn(),
    },
    user: {
        findUnique: jest.fn(),
    },
    like: {
        findUnique: jest.fn(),
        create: jest.fn(),
        delete: jest.fn(),
    },
    repost: {
        findUnique: jest.fn(),
        create: jest.fn(),
        delete: jest.fn(),
    },
    bookmark: {
        findUnique: jest.fn(),
        create: jest.fn(),
        delete: jest.fn(),
        findMany: jest.fn(),
    },
    hashtag: {
        findUnique: jest.fn(),
        create: jest.fn(),
    },
    pollVote: {
        findUnique: jest.fn(),
        create: jest.fn(),
    },
    pollOption: {
        update: jest.fn(),
    },
    postView: {
        findUnique: jest.fn(),
        upsert: jest.fn(),
    },
    $connect: jest.fn(),
    $disconnect: jest.fn(),
    $queryRaw: jest.fn(),
};

jest.mock('@prisma/client', () => {
    return {
        PrismaClient: jest.fn(() => mockPrisma)
    };
});

// Mock notification service
jest.mock('../../services/notification.service', () => ({
    createNotification: jest.fn().mockResolvedValue({ id: 1 }),
    createNotifications: jest.fn().mockResolvedValue([])
}));

// Mock socket service
jest.mock('../../services/socketService', () => ({
    getIo: () => ({
        to: jest.fn().mockReturnThis(),
        emit: jest.fn()
    })
}));

// Now import the service
const postService = require('../../services/post.service');

describe('Post Service Tests', () => {

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('createPost', () => {
        it('should create a simple text post', async () => {
            const mockPost = {
                id: 1,
                content: 'Hello world!',
                userId: 1,
                user: { id: 1, username: 'testuser' },
                _count: { likes: 0, reposts: 0, comments: 0, views: 0 }
            };

            mockPrisma.post.create.mockResolvedValue(mockPost);
            mockPrisma.post.findUnique.mockResolvedValue(mockPost);

            const result = await postService.createPost(1, 'Hello world!');

            expect(mockPrisma.post.create).toHaveBeenCalledWith(
                expect.objectContaining({
                    data: expect.objectContaining({
                        content: 'Hello world!',
                        userId: 1
                    })
                })
            );
            expect(result).toHaveProperty('id', 1);
        });

        it('should create a post with media', async () => {
            const mockPost = {
                id: 1,
                content: 'Check this image!',
                userId: 1,
                media: [{ url: '/uploads/image.jpg', type: 'image' }]
            };

            mockPrisma.post.create.mockResolvedValue(mockPost);
            mockPrisma.post.findUnique.mockResolvedValue(mockPost);

            const mediaData = [{ url: '/uploads/image.jpg', type: 'image' }];
            const result = await postService.createPost(1, 'Check this image!', 'EVERYONE', mediaData);

            expect(result.media).toHaveLength(1);
        });

        it('should create a reply to another post', async () => {
            const parentPost = {
                id: 1,
                replyPermission: 'EVERYONE',
                userId: 2
            };

            const reply = {
                id: 2,
                content: 'Nice post!',
                parentId: 1,
                userId: 1
            };

            mockPrisma.post.findUnique.mockResolvedValue(parentPost);
            mockPrisma.post.create.mockResolvedValue(reply);

            const result = await postService.createPost(1, 'Nice post!', 'EVERYONE', null, null, 1);

            expect(mockPrisma.post.create).toHaveBeenCalledWith(
                expect.objectContaining({
                    data: expect.objectContaining({
                        parentId: 1
                    })
                })
            );
        });
    });

    describe('getAllPosts', () => {
        it('should return paginated posts', async () => {
            const mockPosts = [
                { id: 1, content: 'Post 1', user: { username: 'user1' } },
                { id: 2, content: 'Post 2', user: { username: 'user2' } }
            ];

            mockPrisma.post.findMany.mockResolvedValue(mockPosts);
            mockPrisma.post.count.mockResolvedValue(100);

            const result = await postService.getAllPosts(1, 1, 20);

            expect(result).toHaveProperty('data');
            expect(result).toHaveProperty('pagination');
            expect(result.pagination.page).toBe(1);
            expect(result.pagination.limit).toBe(20);
        });

        it('should apply correct pagination offset', async () => {
            mockPrisma.post.findMany.mockResolvedValue([]);
            mockPrisma.post.count.mockResolvedValue(0);

            await postService.getAllPosts(1, 3, 10);

            expect(mockPrisma.post.findMany).toHaveBeenCalledWith(
                expect.objectContaining({
                    skip: 20, // (page 3 - 1) * 10
                    take: 10
                })
            );
        });
    });

    describe('toggleLikePost', () => {
        it('should like a post when not already liked', async () => {
            mockPrisma.like.findUnique.mockResolvedValue(null);
            mockPrisma.post.findUnique.mockResolvedValue({ id: 1, userId: 2 });
            mockPrisma.like.create.mockResolvedValue({ postId: 1, userId: 1 });

            const result = await postService.toggleLikePost(1, 1);

            expect(result).toHaveProperty('liked', true);
            expect(mockPrisma.like.create).toHaveBeenCalled();
        });

        it('should unlike a post when already liked', async () => {
            const existingLike = { postId: 1, userId: 1 };

            mockPrisma.like.findUnique.mockResolvedValue(existingLike);
            mockPrisma.like.delete.mockResolvedValue(existingLike);

            const result = await postService.toggleLikePost(1, 1);

            expect(result).toHaveProperty('liked', false);
            expect(mockPrisma.like.delete).toHaveBeenCalled();
        });
    });

    describe('toggleRepostPost', () => {
        it('should repost when not already reposted', async () => {
            mockPrisma.repost.findUnique.mockResolvedValue(null);
            mockPrisma.repost.create.mockResolvedValue({ postId: 1, userId: 1 });

            const result = await postService.toggleRepostPost(1, 1);

            expect(result).toHaveProperty('reposted', true);
        });

        it('should unrepost when already reposted', async () => {
            mockPrisma.repost.findUnique.mockResolvedValue({ postId: 1, userId: 1 });
            mockPrisma.repost.delete.mockResolvedValue({});

            const result = await postService.toggleRepostPost(1, 1);

            expect(result).toHaveProperty('reposted', false);
        });
    });

    describe('toggleBookmark', () => {
        it('should bookmark when not already bookmarked', async () => {
            mockPrisma.bookmark.findUnique.mockResolvedValue(null);
            mockPrisma.bookmark.create.mockResolvedValue({ postId: 1, userId: 1 });

            const result = await postService.toggleBookmark(1, 1);

            expect(result).toHaveProperty('bookmarked', true);
        });

        it('should unbookmark when already bookmarked', async () => {
            mockPrisma.bookmark.findUnique.mockResolvedValue({ postId: 1, userId: 1 });
            mockPrisma.bookmark.delete.mockResolvedValue({});

            const result = await postService.toggleBookmark(1, 1);

            expect(result).toHaveProperty('bookmarked', false);
        });
    });

    describe('deletePost', () => {
        it('should delete post when user is owner', async () => {
            mockPrisma.post.findUnique.mockResolvedValue({ id: 1, userId: 1 });
            mockPrisma.post.delete.mockResolvedValue({});

            const result = await postService.deletePost(1, 1);

            expect(result).toHaveProperty('message', 'Post deleted');
        });

        it('should throw error when user is not owner', async () => {
            mockPrisma.post.findUnique.mockResolvedValue({ id: 1, userId: 2 });

            await expect(postService.deletePost(1, 1)).rejects.toMatchObject({
                status: 403
            });
        });

        it('should throw error when post not found', async () => {
            mockPrisma.post.findUnique.mockResolvedValue(null);

            await expect(postService.deletePost(999, 1)).rejects.toMatchObject({
                status: 404
            });
        });
    });

    describe('getPostById', () => {
        it('should return post with formatted data', async () => {
            const mockPost = {
                id: 1,
                content: 'Test post',
                user: { id: 1, username: 'testuser' },
                _count: { likes: 5, reposts: 2, comments: 3, views: 100 },
                likes: [],
                reposts: [],
                bookmarks: []
            };

            mockPrisma.post.findUnique.mockResolvedValue(mockPost);

            const result = await postService.getPostById(1, 1);

            expect(result).toHaveProperty('id', 1);
        });

        it('should return null when post not found', async () => {
            mockPrisma.post.findUnique.mockResolvedValue(null);

            const result = await postService.getPostById(999, 1);

            expect(result).toBeNull();
        });
    });

    describe('incrementPostViews', () => {
        it('should increment view count', async () => {
            mockPrisma.post.update.mockResolvedValue({ id: 1, views: 1 });
            mockPrisma.postView.upsert.mockResolvedValue({});

            await postService.incrementPostViews(1, 1);

            expect(mockPrisma.post.update).toHaveBeenCalledWith(
                expect.objectContaining({
                    where: { id: 1 },
                    data: { views: { increment: 1 } }
                })
            );
        });
    });
});
