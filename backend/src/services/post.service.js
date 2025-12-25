const { PrismaClient } = require('@prisma/client');
const notificationService = require('./notification.service');
const {
    userSelectFields,
    buildPostInclude,
    formatPost,
    checkReplyPermission
} = require('../controllers/helpers/post.helpers');
const { extractHashtags } = require('../utils/hashtagExtractor');

const prisma = new PrismaClient();

const createPost = async (userId, content = '', replyPermission = 'EVERYONE', mediaData = null, pollData = null, parentId = null) => {
    // Extract hashtags from content
    const hashtagNames = extractHashtags(content || '');

    const post = await prisma.post.create({
        data: {
            content: content || '',
            userId,
            replyPermission: replyPermission || 'EVERYONE',
            parentId: parentId ? parseInt(parentId) : undefined
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

    // Process mentions
    if (content) {
        processMentions(post.id, userId, content).catch(err => console.error('Error processing mentions:', err));
    }

    // Refetch the full post with relations to return complete data
    const fullPost = await prisma.post.findUnique({
        where: { id: post.id },
        include: buildPostInclude(userId)
    });

    return formatPost(fullPost);
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

const getClassPosts = async (currentUserId, page = 1, limit = 20) => {
    const user = await prisma.user.findUnique({ where: { id: currentUserId } });

    if (!user || !user.filiere || !user.year || !user.studentClass) {
        return { data: [], meta: { total: 0, page, limit, totalPages: 0 } };
    }

    const skip = (page - 1) * limit;

    const [posts, total] = await Promise.all([
        prisma.post.findMany({
            where: {
                user: {
                    filiere: user.filiere,
                    year: user.year,
                    studentClass: user.studentClass
                }
            },
            take: limit,
            skip,
            orderBy: { createdAt: 'desc' },
            include: buildPostInclude(currentUserId)
        }),
        prisma.post.count({
            where: {
                user: {
                    filiere: user.filiere,
                    year: user.year,
                    studentClass: user.studentClass
                }
            }
        })
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

const getPostById = async (postId, currentUserId) => {
    const include = buildPostInclude(currentUserId);
    // Include direct replies
    include.replies = {
        include: buildPostInclude(currentUserId),
        orderBy: { createdAt: 'desc' }
    };

    const post = await prisma.post.findUnique({
        where: { id: postId },
        include
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

    // Notify post owner
    const post = await prisma.post.findUnique({ where: { id: postId } });
    if (post && post.userId !== userId) {
        await notificationService.createNotification({
            recipientId: post.userId,
            actorId: userId,
            type: 'LIKE',
            postId: postId
        });
    }

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

    // Notify post owner
    const post = await prisma.post.findUnique({ where: { id: postId } });
    if (post && post.userId !== userId) {
        await notificationService.createNotification({
            recipientId: post.userId,
            actorId: userId,
            type: 'REPOST',
            postId: postId
        });
    }

    return { reposted: true };
};





const getUserTimeline = async (username, currentUserId, limit = 20, offset = 0, type = 'all') => {
    const user = await prisma.user.findUnique({ where: { username } });
    if (!user) throw { status: 404, message: 'User not found' };

    // Privacy check for likes
    if (type === 'likes') {
        if (!currentUserId || user.id !== currentUserId) {
            throw { status: 403, message: 'Access denied: Likes are private' };
        }
    }

    let posts = [];
    const include = buildPostInclude(currentUserId);

    if (type === 'posts') {
        // Fetch only original posts authored by the user
        posts = await prisma.post.findMany({
            where: { userId: user.id },
            take: limit,
            skip: offset,
            orderBy: { createdAt: 'desc' },
            include
        }).then(items => items.map(formatPost));

    } else if (type === 'reposts') {
        // Fetch reposts
        const reposts = await prisma.repost.findMany({
            where: { userId: user.id },
            take: limit,
            skip: offset,
            orderBy: { createdAt: 'desc' },
            include: { post: { include } }
        });

        posts = reposts.map(r => ({
            ...formatPost(r.post),
            isRepostContext: true,
            repostedAt: r.createdAt
        }));

    } else if (type === 'likes') {
        // Fetch liked posts
        const likes = await prisma.like.findMany({
            where: { userId: user.id },
            take: limit,
            skip: offset,
            orderBy: { createdAt: 'desc' },
            include: { post: { include } }
        });

        posts = likes.map(l => ({
            ...formatPost(l.post),
            likedAt: l.createdAt
        }));

    } else {
        // Default 'all' behavior: Combined timeline (Posts + Reposts)
        // Using existing raw query logic for 'all' or fallback
        const timeline = await prisma.$queryRaw`
            SELECT 
                "id", 
                "createdAt", 
                'post' as "type", 
                "id" as "originalPostId" 
            FROM "posts" 
            WHERE "userId" = ${user.id}
            
            UNION ALL
            
            SELECT 
                "id", 
                "createdAt", 
                'repost' as "type", 
                "postId" as "originalPostId" 
            FROM "reposts" 
            WHERE "userId" = ${user.id}
            
            ORDER BY "createdAt" desc
            LIMIT ${limit} OFFSET ${offset}
        `;

        if (timeline.length === 0) return [];

        const postIds = timeline.map(item => item.originalPostId);
        const postsMap = await prisma.post.findMany({
            where: { id: { in: postIds } },
            include
        }).then(posts => new Map(posts.map(p => [p.id, p])));

        posts = timeline.map(item => {
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
        }).filter(Boolean).map(formatPost);
    }

    return posts;
};

const deletePost = async (postId, userId) => {
    const post = await prisma.post.findUnique({ where: { id: postId } });

    if (!post) throw { status: 404, message: 'Post not found' };
    if (post.userId !== userId) throw { status: 403, message: 'Unauthorized' };

    await Promise.all([
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

const votePoll = async (postId, userId, optionId) => {
    // Check if poll exists
    const poll = await prisma.poll.findUnique({
        where: { postId }
    });
    if (!poll) throw { status: 404, message: 'Poll not found' };

    // Check if user already voted
    const existingVote = await prisma.pollVote.findFirst({
        where: {
            pollId: poll.id,
            userId
        }
    });

    if (existingVote) throw { status: 400, message: 'Already voted' };

    // Record vote
    await prisma.pollVote.create({
        data: {
            pollId: poll.id,
            optionId: parseInt(optionId),
            userId
        }
    });

    // We don't need to manually increment a counter if we count votes dynamically,
    // but often it's good to return the updated poll state.
    // For now, return success.
    return { message: 'Vote recorded' };
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

const processMentions = async (postId, actorId, content) => {
    const mentionRegex = /@([\w.-]+)/g;
    const matches = [...content.matchAll(mentionRegex)];
    const usernames = [...new Set(matches.map(m => m[1]))]; // Unique usernames

    if (usernames.length === 0) return;

    const users = await prisma.user.findMany({
        where: { username: { in: usernames } },
        select: { id: true, username: true }
    });

    const notifications = users
        .filter(user => user.id !== actorId) // Don't notify self
        .map(user => ({
            recipientId: user.id,
            actorId,
            type: 'MENTION',
            postId,
            read: false
        }));

    if (notifications.length > 0) {
        await notificationService.createNotifications(notifications);
    }
};

const toggleBookmark = async (postId, userId) => {
    const whereClause = { postId_userId: { postId, userId } };
    const existingBookmark = await prisma.bookmark.findUnique({ where: whereClause });

    if (existingBookmark) {
        await prisma.bookmark.delete({ where: whereClause });
        return { bookmarked: false };
    }

    await prisma.bookmark.create({ data: { postId, userId } });
    return { bookmarked: true };
};

const getBookmarkedPosts = async (currentUserId, page = 1, limit = 20) => {
    const skip = (page - 1) * limit;

    // Build a custom include that excludes bookmarks to avoid circular nesting
    // when querying from bookmark -> post -> bookmarks
    const postIncludeForBookmarks = {
        user: { select: userSelectFields },
        _count: { select: { likes: true, reposts: true } },
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
        },
        likes: currentUserId ? { where: { userId: currentUserId }, select: { userId: true } } : undefined,
        reposts: currentUserId ? { where: { userId: currentUserId }, select: { userId: true } } : undefined
        // Note: Intentionally NOT including bookmarks here since we're already querying from bookmarks
    };

    const [bookmarks, total] = await Promise.all([
        prisma.bookmark.findMany({
            where: { userId: currentUserId },
            take: limit,
            skip,
            orderBy: { createdAt: 'desc' },
            include: {
                post: {
                    include: postIncludeForBookmarks
                }
            }
        }),
        prisma.bookmark.count({ where: { userId: currentUserId } })
    ]);

    // Extract the post object from the bookmark relation and format it
    // Filter out any bookmarks where the post might have been deleted
    const posts = bookmarks
        .filter(b => b.post !== null)
        .map(b => {
            const post = b.post;
            return {
                ...formatPost(post),
                isBookmarked: true, // We know it's bookmarked since we're fetching from bookmarks
                bookmarkedAt: b.createdAt
            };
        });

    return {
        data: posts,
        meta: {
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit)
        }
    };
};

module.exports = {
    createPost,
    getAllPosts,
    getClassPosts,
    getPostById,
    toggleLikePost,
    toggleRepostPost,
    toggleBookmark,
    getBookmarkedPosts,

    getUserTimeline,
    deletePost,
    linkHashtagsToPost,
    incrementPostViews,
    votePoll
};

