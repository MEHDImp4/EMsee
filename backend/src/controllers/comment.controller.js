const { PrismaClient } = require('@prisma/client');
const { getIo } = require('../services/socketService');
const prisma = new PrismaClient();

const formatComment = (comment, currentUserId) => {
    if (!comment) return null;

    const isLiked = comment.likes?.some(l => l.userId === currentUserId) || false;
    const isReposted = comment.reposts?.some(r => r.userId === currentUserId) || false;
    const isSaved = comment.saves?.some(s => s.userId === currentUserId) || false;

    const replies = comment.replies?.map(r => formatComment(r, currentUserId)) || [];

    const {_count = {}} = comment;

    return {
        ...comment,
        isLiked,
        isReposted,
        isSaved,
        _count: {
            likes: _count.likes || 0,
            replies: _count.replies || 0,
            reposts: _count.reposts || 0,
            saves: _count.saves || 0,
        },
        likes: undefined,
        reposts: undefined,
        saves: undefined,
        replies,
    };
};

const ensureCommentExists = async (commentId) => {
    return prisma.comment.findUnique({ where: { id: commentId } });
};

const toggleLike = async (req, res) => {
    try {
        const commentId = parseInt(req.params.id, 10);
        const userId = req.user.id;

        const existing = await prisma.commentLike.findUnique({
            where: { commentId_userId: { commentId, userId } }
        });

        if (existing) {
            await prisma.commentLike.delete({ where: { commentId_userId: { commentId, userId } } });
            return res.json({ liked: false });
        }

        await prisma.commentLike.create({ data: { commentId, userId } });
        return res.json({ liked: true });
    } catch (error) {
        console.error('Error toggling comment like:', error);
        res.status(500).json({ error: 'Server error' });
    }
};

const toggleRepost = async (req, res) => {
    try {
        const commentId = parseInt(req.params.id, 10);
        const userId = req.user.id;

        const existing = await prisma.commentRepost.findUnique({
            where: { commentId_userId: { commentId, userId } }
        });

        if (existing) {
            await prisma.commentRepost.delete({ where: { commentId_userId: { commentId, userId } } });
            return res.json({ reposted: false });
        }

        await prisma.commentRepost.create({ data: { commentId, userId } });
        return res.json({ reposted: true });
    } catch (error) {
        console.error('Error toggling comment repost:', error);
        res.status(500).json({ error: 'Server error' });
    }
};

const toggleSave = async (req, res) => {
    try {
        const commentId = parseInt(req.params.id, 10);
        const userId = req.user.id;

        const existing = await prisma.commentSave.findUnique({
            where: { commentId_userId: { commentId, userId } }
        });

        if (existing) {
            await prisma.commentSave.delete({ where: { commentId_userId: { commentId, userId } } });
            return res.json({ saved: false });
        }

        await prisma.commentSave.create({ data: { commentId, userId } });
        return res.json({ saved: true });
    } catch (error) {
        console.error('Error toggling comment save:', error);
        res.status(500).json({ error: 'Server error' });
    }
};

const replyToComment = async (req, res) => {
    try {
        const parentCommentId = parseInt(req.params.id, 10);
        const userId = req.user.id;
        const { content } = req.body;

        if (!content) return res.status(400).json({ error: 'Content required' });

        const parent = await prisma.comment.findUnique({ where: { id: parentCommentId } });
        if (!parent) return res.status(404).json({ error: 'Comment not found' });

        const reply = await prisma.comment.create({
            data: {
                content,
                postId: parent.postId,
                userId,
                parentCommentId,
            },
            include: {
                user: { select: { id: true, username: true, full_name: true, avatar: true, role: true } },
                _count: { select: { likes: true, replies: true, reposts: true, saves: true } },
                likes: { where: { userId } },
                reposts: { where: { userId } },
                saves: { where: { userId } },
                replies: true,
            }
        });

        const formatted = formatComment(reply, userId);

        try { getIo().emit('new_comment', formatted); } catch (err) { console.error('Socket emission failed:', err); }

        res.status(201).json(formatted);
    } catch (error) {
        console.error('Error replying to comment:', error);
        res.status(500).json({ error: 'Server error' });
    }
};

const getCommentReplies = async (req, res) => {
    try {
        const commentId = parseInt(req.params.id, 10);
        const currentUserId = req.user?.id;

        const replies = await prisma.comment.findMany({
            where: { parentCommentId: commentId },
            include: {
                user: { select: { id: true, username: true, full_name: true, avatar: true, role: true } },
                _count: { select: { likes: true, replies: true, reposts: true, saves: true } },
                likes: { where: { userId: currentUserId }, select: { userId: true } },
                reposts: { where: { userId: currentUserId }, select: { userId: true } },
                saves: { where: { userId: currentUserId }, select: { userId: true } },
                replies: {
                    include: {
                        user: { select: { id: true, username: true, full_name: true, avatar: true, role: true } },
                        _count: { select: { likes: true, replies: true, reposts: true, saves: true } },
                        likes: { where: { userId: currentUserId }, select: { userId: true } },
                        reposts: { where: { userId: currentUserId }, select: { userId: true } },
                        saves: { where: { userId: currentUserId }, select: { userId: true } },
                    }
                }
            },
            orderBy: { createdAt: 'asc' }
        });

        res.json(replies.map(r => formatComment(r, currentUserId)));
    } catch (error) {
        console.error('Error fetching comment replies:', error);
        res.status(500).json({ error: 'Server error' });
    }
};

module.exports = {
    toggleLike,
    toggleRepost,
    toggleSave,
    replyToComment,
    getCommentReplies,
};
