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
    reposts: true
};



const buildPostInclude = (currentUserId) => {
    const include = {
        user: { select: userSelectFields },
        _count: { select: postCountFields },
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
    };

    if (currentUserId) {
        include.likes = { where: { userId: currentUserId }, select: { userId: true } };
        include.reposts = { where: { userId: currentUserId }, select: { userId: true } };
        include.bookmarks = { where: { userId: currentUserId }, select: { userId: true } };
    }

    return include;
};



// Formatting helpers
const formatPost = (post) => ({
    ...post,
    isLiked: post.likes?.length > 0,
    isReposted: post.reposts?.length > 0,
    isBookmarked: post.bookmarks?.length > 0,
    likes: undefined,
    reposts: undefined,
    bookmarks: undefined
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



const postSelectFields = {
    id: true,
    content: true,
    user: { select: userSelectFields }
};

module.exports = {
    userSelectFields,
    postCountFields,
    postCountFields,
    buildPostInclude,
    formatPost,
    checkReplyPermission,
    postSelectFields // Export new helper
};
