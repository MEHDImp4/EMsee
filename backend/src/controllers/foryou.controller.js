const { PrismaClient } = require('@prisma/client');
const asyncHandler = require('../middlewares/asyncHandler');

const prisma = new PrismaClient();

/**
 * Get personalized "For You" hashtag suggestions
 * Combines: user interests (likes/reposts), followed users, class/filiere, and trending
 * @route GET /api/hashtags/for-you
 */
const getForYouHashtags = asyncHandler(async (req, res) => {
    const userId = req.user?.id;
    const limit = parseInt(req.query.limit) || 10;
    const days = parseInt(req.query.days) || 7;

    if (!userId) {
        return res.status(401).json({ error: 'Authentication required' });
    }

    const since = new Date();
    since.setDate(since.getDate() - days);

    // 1. Get user context
    const user = await prisma.user.findUnique({
        where: { id: userId },
        select: {
            id: true,
            filiere: true,
            year: true,
            studentClass: true,
            role: true
        }
    });

    // 2. Get hashtags from posts user interacted with (likes, reposts)
    const [likedPosts, repostedPosts] = await Promise.all([
        prisma.like.findMany({
            where: { userId, createdAt: { gte: since } },
            include: {
                post: {
                    include: {
                        hashtags: {
                            include: { hashtag: true }
                        }
                    }
                }
            },
            take: 50
        }),
        prisma.repost.findMany({
            where: { userId, createdAt: { gte: since } },
            include: {
                post: {
                    include: {
                        hashtags: {
                            include: { hashtag: true }
                        }
                    }
                }
            },
            take: 50
        })
    ]);

    const interactionHashtags = new Set();
    [...likedPosts, ...repostedPosts].forEach(item => {
        item.post?.hashtags?.forEach(ph => {
            if (ph.hashtag?.name) interactionHashtags.add(ph.hashtag.name);
        });
    });

    // 3. Get hashtags from followed users' posts
    const following = await prisma.follow.findMany({
        where: { followerId: userId },
        select: { followingId: true }
    });
    const followingIds = following.map(f => f.followingId);

    let followedHashtags = [];
    if (followingIds.length > 0) {
        const followedPosts = await prisma.post.findMany({
            where: {
                userId: { in: followingIds },
                createdAt: { gte: since }
            },
            include: {
                hashtags: {
                    include: { hashtag: true }
                }
            },
            take: 100
        });
        followedHashtags = followedPosts.flatMap(p => p.hashtags.map(ph => ph.hashtag?.name)).filter(Boolean);
    }

    // 4. Get hashtags from same class/filiere (students only)
    let classHashtags = [];
    if (user.role === 'student' && user.filiere && user.year && user.studentClass) {
        const classPosts = await prisma.post.findMany({
            where: {
                user: {
                    filiere: user.filiere,
                    year: user.year,
                    studentClass: user.studentClass
                },
                createdAt: { gte: since }
            },
            include: {
                hashtags: {
                    include: { hashtag: true }
                }
            },
            take: 100
        });
        classHashtags = classPosts.flatMap(p => p.hashtags.map(ph => ph.hashtag?.name)).filter(Boolean);
    }

    // 5. Get trending hashtags (fallback/boost)
    const [postAgg, commentAgg] = await Promise.all([
        prisma.postHashtag.groupBy({
            by: ['hashtagId'],
            where: { createdAt: { gte: since } },
            _count: { _all: true }
        }),
        prisma.commentHashtag.groupBy({
            by: ['hashtagId'],
            where: { createdAt: { gte: since } },
            _count: { _all: true }
        })
    ]);

    const trendingMap = new Map();
    for (const row of postAgg) {
        trendingMap.set(row.hashtagId, (trendingMap.get(row.hashtagId) || 0) + row._count._all);
    }
    for (const row of commentAgg) {
        trendingMap.set(row.hashtagId, (trendingMap.get(row.hashtagId) || 0) + row._count._all * 0.6);
    }

    const trendingIds = Array.from(trendingMap.entries())
        .sort((a, b) => b[1] - a[1])
        .slice(0, 20)
        .map(e => e[0]);

    const trendingHashtagRows = await prisma.hashtag.findMany({
        where: { id: { in: trendingIds } },
        select: { name: true }
    });
    const trendingNames = trendingHashtagRows.map(h => h.name);

    // 6. Score and rank hashtags
    const scoreMap = new Map();
    
    // Weight: user interactions = 5, followed = 3, class = 2, trending = 1
    Array.from(interactionHashtags).forEach(name => {
        scoreMap.set(name, (scoreMap.get(name) || 0) + 5);
    });
    followedHashtags.forEach(name => {
        scoreMap.set(name, (scoreMap.get(name) || 0) + 3);
    });
    classHashtags.forEach(name => {
        scoreMap.set(name, (scoreMap.get(name) || 0) + 2);
    });
    trendingNames.forEach(name => {
        scoreMap.set(name, (scoreMap.get(name) || 0) + 1);
    });

    // Get full data for scored hashtags
    const scoredNames = Array.from(scoreMap.keys());
    if (scoredNames.length === 0) {
        // Fallback to pure trending if no personalization data
        const fallback = await prisma.hashtag.findMany({
            where: { id: { in: trendingIds } },
            select: {
                name: true,
                _count: {
                    select: {
                        posts: true,
                        comments: true
                    }
                }
            },
            take: limit
        });
        return res.json(fallback.map(h => ({
            name: h.name,
            totalCount: h._count.posts + h._count.comments,
            category: 'trending'
        })));
    }

    const hashtagData = await prisma.hashtag.findMany({
        where: { name: { in: scoredNames } },
        select: {
            name: true,
            _count: {
                select: {
                    posts: true,
                    comments: true
                }
            }
        }
    });

    const results = hashtagData.map(h => ({
        name: h.name,
        totalCount: h._count.posts + h._count.comments,
        score: scoreMap.get(h.name) || 0,
        category: determineCategory(h.name, {
            interactions: interactionHashtags,
            followed: new Set(followedHashtags),
            class: new Set(classHashtags),
            trending: new Set(trendingNames)
        })
    }))
    .sort((a, b) => b.score - a.score || b.totalCount - a.totalCount)
    .slice(0, limit);

    res.json(results);
});

function determineCategory(name, sources) {
    if (sources.interactions.has(name)) return 'your_activity';
    if (sources.followed.has(name)) return 'following';
    if (sources.class.has(name)) return 'your_class';
    if (sources.trending.has(name)) return 'trending';
    return 'popular';
}

module.exports = {
    getForYouHashtags
};
