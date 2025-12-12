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

const createPost = async (req, res) => {
    try {
        const { content, replyPermission } = req.body;
        const userId = req.user.id;

        if (!content) {
            return res.status(400).json({ error: 'Content is required' });
        }

        const post = await prisma.post.create({
            data: {
                content,
                userId,
                replyPermission: replyPermission || 'EVERYONE'
            },
            include: { user: { select: userSelectFields } }
        });

        res.status(201).json(post);
    } catch (error) {
        console.error('Error creating post:', error);
        res.status(500).json({ error: 'Server error' });
    }
};

const getAllPosts = async (req, res) => {
    try {
        const currentUserId = req.user?.id;

        const posts = await prisma.post.findMany({
            orderBy: { createdAt: 'desc' },
            include: buildPostInclude(currentUserId)
        });

        res.json(posts.map(formatPost));
    } catch (error) {
        console.error('Error fetching posts:', error);
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

        const comments = await prisma.comment.findMany({
            where: { postId, parentCommentId: null },
            include: buildCommentInclude(currentUserId),
            orderBy: { createdAt: 'asc' }
        });

        res.json(comments.map(formatComment));
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

const getUserPosts = async (req, res) => {
    try {
        const username = req.params.username;
        const currentUserId = req.user?.id;

        const user = await prisma.user.findUnique({ where: { username } });
        if (!user) return res.status(404).json({ error: 'User not found' });

        const postInclude = buildPostInclude(currentUserId);

        const [posts, reposts] = await Promise.all([
            prisma.post.findMany({
                where: { userId: user.id },
                include: postInclude
            }),
            prisma.repost.findMany({
                where: { userId: user.id },
                include: { post: { include: postInclude } }
            })
        ]);

        const formattedReposts = reposts.map(r => ({
            ...r.post,
            isRepostContext: true,
            repostedAt: r.createdAt
        }));

        const allPosts = [...posts, ...formattedReposts].sort((a, b) => {
            const dateA = new Date(a.repostedAt || a.createdAt);
            const dateB = new Date(b.repostedAt || b.createdAt);
            return dateB - dateA;
        });

        res.json(allPosts.map(formatPost));
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
    getCommentPath
};
