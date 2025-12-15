const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Prisma include/select helpers to reduce nesting
const userSelectFields = {
    id: true,
    username: true,
    full_name: true,
    avatar: true,
    role: true
};

const postCountFields = {
    likes: true,
    comments: true,
    reposts: true
};

const commentCountFields = {
    likes: true,
    replies: true,
    reposts: true,
    saves: true
};

const buildPostInclude = (currentUserId) => ({
    user: { select: userSelectFields },
    _count: { select: postCountFields },
    likes: { where: { userId: currentUserId }, select: { userId: true } },
    reposts: { where: { userId: currentUserId }, select: { userId: true } },
    media: true,
    poll: {
        include: {
            options: {
                include: {
                    _count: { select: { votes: true } }
                }
            },
            votes: currentUserId ? { where: { userId: currentUserId } } : false
        }
    }
});

const buildCommentInclude = (currentUserId) => ({
    user: { select: userSelectFields },
    _count: { select: commentCountFields },
    likes: { where: { userId: currentUserId }, select: { userId: true } },
    reposts: { where: { userId: currentUserId }, select: { userId: true } },
    saves: { where: { userId: currentUserId }, select: { userId: true } }
});

// Formatting helpers
const formatPost = (post) => ({
    ...post,
    isLiked: post.likes?.length > 0,
    isReposted: post.reposts?.length > 0,
    likes: undefined,
    reposts: undefined
});

const formatComment = (comment) => ({
    ...comment,
    isLiked: comment.likes?.length > 0,
    isReposted: comment.reposts?.length > 0,
    isSaved: comment.saves?.length > 0,
    likes: undefined,
    reposts: undefined,
    saves: undefined
});

// Permission check helper
const checkReplyPermission = async (postId, userId) => {
    const post = await prisma.post.findUnique({ where: { id: postId } });
    if (!post) return { allowed: false, error: 'Post not found' };

    if (post.replyPermission === 'NO_ONE' && post.userId !== userId) {
        return { allowed: false, error: 'Replies are disabled for this post' };
    }

    if (post.replyPermission === 'FOLLOWERS' && post.userId !== userId) {
        const isFollowing = await prisma.follow.findUnique({
            where: {
                followerId_followingId: {
                    followerId: userId,
                    followingId: post.userId
                }
            }
        });

        if (!isFollowing) {
            return { allowed: false, error: 'Only followers can reply to this post' };
        }
    }

    return { allowed: true };
};

// Comment path builder
const buildCommentPath = async (parentCommentId) => {
    if (!parentCommentId) return [];

    // Fetch all comments in the chain with a single query
    const allComments = await prisma.comment.findMany({
        include: { user: { select: userSelectFields } }
    });

    // Build the path by traversing parent relationships
    const path = [];
    let currentId = parentCommentId;
    const commentMap = new Map(allComments.map(c => [c.id, c]));

    while (currentId) {
        const parent = commentMap.get(currentId);
        if (!parent) break;

        path.unshift(parent);
        currentId = parent.parentCommentId;
    }

    return path;
};

const postSelectFields = {
    id: true,
    content: true,
    user: { select: userSelectFields }
};

module.exports = {
    userSelectFields,
    postCountFields,
    commentCountFields,
    buildPostInclude,
    buildCommentInclude,
    formatPost,
    formatComment,
    checkReplyPermission,
    buildCommentPath,
    postSelectFields // Export new helper
};
