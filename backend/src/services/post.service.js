const { PrismaClient } = require('@prisma/client');
const {
    userSelectFields,
    buildPostInclude,
    buildCommentInclude,
    formatPost,
    formatComment,
    checkReplyPermission
} = require('../controllers/helpers/post.helpers');

const prisma = new PrismaClient();

const createPost = async (userId, content, replyPermission) => {
    const post = await prisma.post.create({
        data: {
            content,
            userId,
            replyPermission: replyPermission || 'EVERYONE'
        },
        include: { user: { select: userSelectFields } }
    });
    return post;
};

const getAllPosts = async (currentUserId, page = 1, limit = 20) => {
    const skip = (page - 1) * limit;
    const take = Math.min(Math.max(limit, 1), 50);

    const [posts, total] = await Promise.all([
        prisma.post.findMany({
            take,
            skip,
            orderBy: { createdAt: 'desc' },
            include: buildPostInclude(currentUserId)
        }),
        prisma.post.count()
    ]);

    return {
        data: posts.map(formatPost),
        meta: {
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit)
        }
    };
};

const getClassPosts = async (currentUserId) => {
    const user = await prisma.user.findUnique({ where: { id: currentUserId } });

    if (!user || !user.filiere || !user.year || !user.studentClass) {
        return [];
    }

    const posts = await prisma.post.findMany({
        where: {
            user: {
                filiere: user.filiere,
                year: user.year,
                studentClass: user.studentClass
            }
        },
        orderBy: { createdAt: 'desc' },
        include: buildPostInclude(currentUserId)
    });

    return posts.map(formatPost);
};

const getPostById = async (postId, currentUserId) => {
    const post = await prisma.post.findUnique({
        where: { id: postId },
        include: buildPostInclude(currentUserId)
    });

    if (!post) return null;
    return formatPost(post);
};

const toggleLikePost = async (postId, userId) => {
    const whereClause = { postId_userId: { postId, userId } };
    const existingLike = await prisma.like.findUnique({ where: whereClause });

    if (existingLike) {
        await prisma.like.delete({ where: whereClause });
        return { liked: false };
    }

    await prisma.like.create({ data: { postId, userId } });
    return { liked: true };
};

const toggleRepostPost = async (postId, userId) => {
    const whereClause = { postId_userId: { postId, userId } };
    const existingRepost = await prisma.repost.findUnique({ where: whereClause });

    if (existingRepost) {
        await prisma.repost.delete({ where: whereClause });
        return { reposted: false };
    }

    await prisma.repost.create({ data: { postId, userId } });
    return { reposted: true };
};

const createComment = async (postId, userId, content) => {
    const post = await prisma.post.findUnique({ where: { id: postId } });
    if (!post) throw { status: 404, message: 'Post not found' };

    if (post.userId === userId) {
        throw { status: 403, message: 'You cannot comment on your own post' };
    }

    const permissionCheck = await checkReplyPermission(postId, userId);
    if (!permissionCheck.allowed) {
        const status = permissionCheck.error === 'Post not found' ? 404 : 403;
        throw { status, message: permissionCheck.error };
    }

    const comment = await prisma.comment.create({
        data: { content, postId, userId },
        include: { user: { select: userSelectFields } }
    });

    return comment;
};

const getPostComments = async (postId, currentUserId, page = 1, limit = 20) => {
    const skip = (page - 1) * limit;

    const [comments, total] = await Promise.all([
        prisma.comment.findMany({
            where: { postId, parentCommentId: null },
            take: limit,
            skip,
            include: buildCommentInclude(currentUserId),
            orderBy: { createdAt: 'asc' }
        }),
        prisma.comment.count({ where: { postId, parentCommentId: null } })
    ]);

    return {
        data: comments.map(formatComment),
        meta: {
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit)
        }
    };
};

const getUserTimeline = async (username, currentUserId, limit = 20, offset = 0) => {
    const user = await prisma.user.findUnique({ where: { username } });
    if (!user) throw { status: 404, message: 'User not found' };

    const timeline = await prisma.$queryRaw`
        SELECT 
            id, 
            createdAt, 
            'post' as type, 
            id as originalPostId 
        FROM posts 
        WHERE userId = ${user.id}
        
        UNION ALL
        
        SELECT 
            id, 
            createdAt, 
            'repost' as type, 
            postId as originalPostId 
        FROM reposts 
        WHERE userId = ${user.id}
        
        ORDER BY createdAt desc
        LIMIT ${limit} OFFSET ${offset}
    `;

    if (timeline.length === 0) return [];

    const postIds = timeline.map(item => item.originalPostId);

    const postsMap = await prisma.post.findMany({
        where: { id: { in: postIds } },
        include: buildPostInclude(currentUserId)
    }).then(posts => new Map(posts.map(p => [p.id, p])));

    const result = timeline.map(item => {
        const post = postsMap.get(item.originalPostId);
        if (!post) return null;

        if (item.type === 'repost') {
            return {
                ...post,
                isRepostContext: true,
                repostedAt: item.createdAt
            };
        }
        return post;
    }).filter(Boolean);

    return result.map(formatPost);
};

const deletePost = async (postId, userId) => {
    const post = await prisma.post.findUnique({ where: { id: postId } });

    if (!post) throw { status: 404, message: 'Post not found' };
    if (post.userId !== userId) throw { status: 403, message: 'Unauthorized' };

    await Promise.all([
        prisma.comment.deleteMany({ where: { postId } }),
        prisma.like.deleteMany({ where: { postId } }),
        prisma.repost.deleteMany({ where: { postId } })
    ]);

    await prisma.post.delete({ where: { id: postId } });
    return { message: 'Post deleted successfully' };
};

module.exports = {
    createPost,
    getAllPosts,
    getClassPosts,
    getPostById,
    toggleLikePost,
    toggleRepostPost,
    createComment,
    getPostComments,
    getUserTimeline,
    deletePost
};
