const { PrismaClient } = require('@prisma/client');
const { getIo } = require('../services/socketService');
const {
    userSelectFields,
    buildPostInclude,
    buildCommentInclude,
    formatPost,
    formatComment,
    checkReplyPermission,
    buildCommentPath
} = require('./helpers/post.helpers');
const prisma = new PrismaClient();

/**
 * Creates a new post.
 * @param {Object} req - The request object
 * @param {Object} req.body - The request body
 * @param {string} req.body.content - The content of the post
 * @param {string} [req.body.replyPermission] - Reply permission setting
 * @param {Object} res - The response object
 * @returns {Promise<void>}
 */
const asyncHandler = require('../middlewares/asyncHandler');

/**
 * Creates a new post.
 * @param {Object} req - The request object
 * @param {Object} req.body - The request body
 * @param {string} req.body.content - The content of the post
 * @param {string} [req.body.replyPermission] - Reply permission setting
 * @param {Object} res - The response object
 * @returns {Promise<void>}
 */
const createPost = asyncHandler(async (req, res) => {
    const { content, replyPermission } = req.body;
    const userId = req.user.id;

    const post = await prisma.post.create({
        data: {
            content,
            userId,
            replyPermission: replyPermission || 'EVERYONE'
        },
        include: { user: { select: userSelectFields } }
    });

    res.status(201).json(post);
});

/**
 * Retrieves all posts with optional pagination.
 * @param {Object} req - The request object
 * @param {number} [req.query.limit] - Max number of posts
 * @param {number} [req.query.cursor] - Cursor for pagination
 * @param {Object} res - The response object
 * @returns {Promise<void>}
 */
const getAllPosts = async (req, res) => {
    try {
        const currentUserId = req.user?.id;
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 20;
        const skip = (page - 1) * limit;

        // Validation simple du limit pour éviter l'abus
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

        res.json({
            data: posts.map(formatPost),
            meta: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit)
            }
        });
    } catch (error) {
        console.error('Error fetching posts:', error);
        res.status(500).json({ error: 'Server error' });
    }
};

const getClassPosts = async (req, res) => {
    try {
        const currentUserId = req.user.id;
        const user = await prisma.user.findUnique({ where: { id: currentUserId } });

        if (!user || !user.filiere || !user.year || !user.studentClass) {
            return res.json([]);
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

        res.json(posts.map(formatPost));
    } catch (error) {
        console.error('Error fetching class posts:', error);
        res.status(500).json({ error: 'Server error' });
    }
};

const likePost = async (req, res) => {
    try {
        const postId = parseInt(req.params.id);
        const userId = req.user.id;
        const whereClause = { postId_userId: { postId, userId } };

        const existingLike = await prisma.like.findUnique({ where: whereClause });

        if (existingLike) {
            await prisma.like.delete({ where: whereClause });
            return res.json({ liked: false });
        }

        await prisma.like.create({ data: { postId, userId } });
        return res.json({ liked: true });
    } catch (error) {
        console.error('Error liking post:', error);
        res.status(500).json({ error: 'Server error' });
    }
};

const repostPost = async (req, res) => {
    try {
        const postId = parseInt(req.params.id);
        const userId = req.user.id;
        const whereClause = { postId_userId: { postId, userId } };

        const existingRepost = await prisma.repost.findUnique({ where: whereClause });

        if (existingRepost) {
            await prisma.repost.delete({ where: whereClause });
            return res.json({ reposted: false });
        }

        await prisma.repost.create({ data: { postId, userId } });
        return res.json({ reposted: true });
    } catch (error) {
        console.error('Error reposting:', error);
        res.status(500).json({ error: 'Server error' });
    }
};

const commentPost = async (req, res) => {
    try {
        const postId = parseInt(req.params.id);
        const userId = req.user.id;
        const { content } = req.body;

        if (!content) return res.status(400).json({ error: 'Content required' });

        const post = await prisma.post.findUnique({ where: { id: postId } });
        if (!post) return res.status(404).json({ error: 'Post not found' });

        if (post.userId === userId) {
            return res.status(403).json({ error: 'You cannot comment on your own post' });
        }

        const permissionCheck = await checkReplyPermission(postId, userId);
        if (!permissionCheck.allowed) {
            const status = permissionCheck.error === 'Post not found' ? 404 : 403;
            return res.status(status).json({ error: permissionCheck.error });
        }

        const comment = await prisma.comment.create({
            data: { content, postId, userId },
            include: { user: { select: userSelectFields } }
        });

        try {
            getIo().emit('new_comment', comment);
        } catch (socketError) {
            console.error('Socket emission failed:', socketError);
        }

        res.status(201).json(comment);
    } catch (error) {
        console.error('Error commenting:', error);
        res.status(500).json({ error: 'Server error' });
    }
};

const getPostComments = async (req, res) => {
    try {
        const postId = parseInt(req.params.id);
        const currentUserId = req.user?.id;
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 20;
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

        res.json({
            data: comments.map(formatComment),
            meta: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit)
            }
        });
    } catch (error) {
        console.error('Error fetching comments:', error);
        res.status(500).json({ error: 'Server error' });
    }
};

const getPostById = async (req, res) => {
    try {
        const postId = parseInt(req.params.id);
        const currentUserId = req.user?.id;

        const post = await prisma.post.findUnique({
            where: { id: postId },
            include: buildPostInclude(currentUserId)
        });

        if (!post) {
            return res.status(404).json({ error: 'Post not found' });
        }

        res.json(formatPost(post));
    } catch (error) {
        console.error('Error fetching post:', error);
        res.status(500).json({ error: 'Server error' });
    }
};

/**
 * Retrieves posts and reposts for a specific user using a UNION query.
 * @param {Object} req - The request object
 * @param {string} req.params.username - Target username
 * @param {Object} res - The response object
 * @returns {Promise<void>}
 */
const getUserPosts = async (req, res) => {
    try {
        const username = req.params.username;
        const currentUserId = req.user?.id;
        const limit = parseInt(req.query.limit) || 20;
        const offset = parseInt(req.query.offset) || 0;

        const user = await prisma.user.findUnique({ where: { username } });
        if (!user) return res.status(404).json({ error: 'User not found' });

        // Optimisation: Utilisation d'une requête SQL brute pour unir et trier posts/reposts
        // sans tout charger en mémoire.
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
            
            ORDER BY createdAt DESC
            LIMIT ${limit} OFFSET ${offset}
        `;

        if (timeline.length === 0) {
            return res.json([]);
        }

        const postIds = timeline.map(item => item.originalPostId);

        // Charger les posts complets
        const postsMap = await prisma.post.findMany({
            where: { id: { in: postIds } },
            include: buildPostInclude(currentUserId)
        }).then(posts => new Map(posts.map(p => [p.id, p])));

        // Reconstruire la liste dans l'ordre du timeline
        const result = timeline.map(item => {
            const post = postsMap.get(item.originalPostId);
            if (!post) return null; // Should not happen ideally

            if (item.type === 'repost') {
                return {
                    ...post,
                    isRepostContext: true,
                    repostedAt: item.createdAt
                };
            }
            return post;
        }).filter(Boolean);

        res.json(result.map(formatPost));
    } catch (error) {
        console.error('Error fetching user posts:', error);
        res.status(500).json({ error: 'Server error' });
    }
};

const deletePost = async (req, res) => {
    try {
        const postId = parseInt(req.params.id);
        const userId = req.user.id;

        const post = await prisma.post.findUnique({ where: { id: postId } });

        if (!post) {
            return res.status(404).json({ error: 'Post not found' });
        }

        if (post.userId !== userId) {
            return res.status(403).json({ error: 'Unauthorized' });
        }

        await Promise.all([
            prisma.comment.deleteMany({ where: { postId } }),
            prisma.like.deleteMany({ where: { postId } }),
            prisma.repost.deleteMany({ where: { postId } })
        ]);

        await prisma.post.delete({ where: { id: postId } });

        res.json({ message: 'Post deleted successfully' });
    } catch (error) {
        console.error('Error deleting post:', error);
        res.status(500).json({ error: 'Server error' });
    }
};

const getCommentById = async (req, res) => {
    try {
        const commentId = parseInt(req.params.id);
        const currentUserId = req.user?.id;

        const comment = await prisma.comment.findUnique({
            where: { id: commentId },
            include: buildCommentInclude(currentUserId)
        });

        if (!comment) {
            return res.status(404).json({ error: 'Comment not found' });
        }

        res.json(formatComment(comment));
    } catch (error) {
        console.error('Error fetching comment:', error);
        res.status(500).json({ error: 'Server error' });
    }
};

const getCommentPath = async (req, res) => {
    try {
        const commentId = parseInt(req.params.id);

        const comment = await prisma.comment.findUnique({
            where: { id: commentId },
            include: {
                user: { select: userSelectFields },
                post: {
                    select: {
                        id: true,
                        content: true,
                        user: { select: userSelectFields }
                    }
                }
            }
        });

        if (!comment) {
            return res.status(404).json({ error: 'Comment not found' });
        }

        const path = await buildCommentPath(comment.parentCommentId);

        res.json({
            post: comment.post,
            path,
            comment: {
                id: comment.id,
                content: comment.content,
                user: comment.user,
                createdAt: comment.createdAt
            }
        });
    } catch (error) {
        console.error('Error fetching comment path:', error);
        res.status(500).json({ error: 'Server error' });
    }
};

module.exports = {
    createPost,
    getAllPosts,
    likePost,
    repostPost,
    commentPost,
    getPostComments,
    getUserPosts,
    deletePost,
    getPostById,
    getCommentById,
    getCommentPath,
    getClassPosts
};
