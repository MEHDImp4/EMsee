const { PrismaClient } = require('@prisma/client');
const {
    userSelectFields,
    buildPostInclude,
    buildCommentInclude,
    formatPost,
    formatComment,
    checkReplyPermission
} = require('../controllers/helpers/post.helpers');
const { extractHashtags } = require('../utils/hashtagExtractor');

const prisma = new PrismaClient();

const createPost = async (userId, content = '', replyPermission = 'EVERYONE', mediaData = null, pollData = null) => {
    // Extract hashtags from content
    const hashtagNames = extractHashtags(content || '');
    
    const post = await prisma.post.create({
        data: {
            content: content || '',
            userId,
            replyPermission: replyPermission || 'EVERYONE'
        },
        include: { user: { select: userSelectFields } }
    });

    // Create or link hashtags
    if (hashtagNames.length > 0) {
        await linkHashtagsToPost(post.id, hashtagNames);
    }

    // Add media if provided
    if (mediaData && mediaData.length > 0) {
        await Promise.all(mediaData.map(media => 
            prisma.media.create({
                data: {
                    postId: post.id,
                    type: media.type,
                    url: media.url,
                    code: media.code,
                    language: media.language
                }
            })
        ));
    }

    // Create poll if provided
    if (pollData) {
        await prisma.poll.create({
            data: {
                postId: post.id,
                question: pollData.question,
                endsAt: pollData.endsAt ? new Date(pollData.endsAt) : null,
                options: {
                    create: pollData.options.map(opt => ({ text: opt }))
                }
            }
        });
    }

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

/**
 * Link hashtags to a post (create hashtags if they don't exist)
 */
const linkHashtagsToPost = async (postId, hashtagNames) => {
    for (const name of hashtagNames) {
        // Find or create hashtag
        let hashtag = await prisma.hashtag.findUnique({ where: { name } });
        
        if (!hashtag) {
            hashtag = await prisma.hashtag.create({ data: { name } });
        }

        // Create the link (skip if already exists)
        await prisma.postHashtag.upsert({
            where: {
                postId_hashtagId: {
                    postId,
                    hashtagId: hashtag.id
                }
            },
            update: {},
            create: {
                postId,
                hashtagId: hashtag.id
            }
        });
    }
};

const incrementPostViews = async (postId, userId = null) => {
    // If no userId provided, just increment (for backward compatibility)
    if (!userId) {
        await prisma.post.update({
            where: { id: postId },
            data: { views: { increment: 1 } }
        });
        return;
    }

    // Check how many times this user has viewed this post
    const viewCount = await prisma.postView.count({
        where: {
            postId,
            userId
        }
    });

    // Only increment if user has less than 4 views
    if (viewCount < 4) {
        // Create a view record
        await prisma.postView.create({
            data: {
                postId,
                userId
            }
        });

        // Increment the total view count
        await prisma.post.update({
            where: { id: postId },
            data: { views: { increment: 1 } }
        });
    }
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
    deletePost,
    linkHashtagsToPost,
    incrementPostViews
};

