const { PrismaClient } = require('@prisma/client');
const asyncHandler = require('../middlewares/asyncHandler');

const prisma = new PrismaClient();

/**
 * Get top hashtags by total post count (all time)
 * @route GET /api/hashtags/top
 */
const getTopHashtags = asyncHandler(async (req, res) => {
    const limit = parseInt(req.query.limit) || 10;
    const page = parseInt(req.query.page) || 1;
    const skip = (page - 1) * limit;

    const hashtags = await prisma.hashtag.findMany({
        include: {
            _count: {
                select: {
                    posts: true
                }
            }
        },
        orderBy: {
            posts: {
                _count: 'desc'
            }
        },
        take: limit,
        skip: skip
    });

    const formatted = hashtags.map(h => ({
        name: h.name,
        postCount: h._count.posts,
        totalCount: h._count.posts
    }));

    res.json(formatted);
});

/**
 * Get trending hashtags
 * @route GET /api/hashtags/trending
 */
const getTrendingHashtags = asyncHandler(async (req, res) => {
    const limit = parseInt(req.query.limit) || 10;
    const days = parseInt(req.query.days) || 7; // lookback window
    const algorithm = (req.query.algorithm || 'weighted').toLowerCase(); // 'weighted' | 'volume' | 'recent'
    const halfLifeHours = parseInt(req.query.halfLifeHours) || 24; // for weighted decay

    const since = new Date();
    since.setDate(since.getDate() - days);

    // Aggregate post hashtag usage within window
    const postAgg = await prisma.postHashtag.groupBy({
        by: ['hashtagId'],
        where: { createdAt: { gte: since } },
        _count: { _all: true },
        _max: { createdAt: true }
    });

    // Merge counts per hashtagId
    const map = new Map();
    for (const row of postAgg) {
        const prev = map.get(row.hashtagId) || { postCount: 0, lastActivity: new Date(0) };
        prev.postCount += row._count._all;
        prev.lastActivity = new Date(Math.max(prev.lastActivity.getTime(), new Date(row._max.createdAt || 0).getTime()));
        map.set(row.hashtagId, prev);
    }

    if (map.size === 0) return res.json([]);

    const ids = Array.from(map.keys());
    const hashtagRows = await prisma.hashtag.findMany({
        where: { id: { in: ids } },
        select: { id: true, name: true }
    });
    const now = new Date();
    const LN2 = Math.log(2);

    const items = hashtagRows.map(h => {
        const stats = map.get(h.id);
        const total = stats.postCount;
        const ageHours = Math.max(0, (now.getTime() - (stats.lastActivity?.getTime() || now.getTime())) / 36e5);
        const decay = Math.exp(-LN2 * (ageHours / halfLifeHours));
        const weighted = stats.postCount * decay;
        return {
            name: h.name,
            postCount: stats.postCount,
            totalCount: total,
            lastActivity: stats.lastActivity,
            score: weighted
        };
    });

    let sorted;
    switch (algorithm) {
        case 'volume':
            sorted = items.sort((a, b) => b.totalCount - a.totalCount);
            break;
        case 'recent':
            sorted = items.sort((a, b) => (b.lastActivity?.getTime() || 0) - (a.lastActivity?.getTime() || 0));
            break;
        default: // weighted
            sorted = items.sort((a, b) => b.score - a.score);
            break;
    }

    res.json(sorted.slice(0, limit));
});

/**
 * Get posts by hashtag
 * @route GET /api/hashtags/:name/posts
 */
const getPostsByHashtag = asyncHandler(async (req, res) => {
    const { name } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = Math.min(parseInt(req.query.limit) || 20, 50);
    const skip = (page - 1) * limit;
    const currentUserId = req.user?.id;

    // Find hashtag
    const hashtag = await prisma.hashtag.findUnique({
        where: { name: name.toLowerCase() }
    });

    if (!hashtag) {
        return res.status(404).json({ error: 'Hashtag not found' });
    }

    // Get posts with this hashtag
    const [postHashtags, total] = await Promise.all([
        prisma.postHashtag.findMany({
            where: { hashtagId: hashtag.id },
            include: {
                post: {
                    include: {
                        user: {
                            select: {
                                id: true,
                                username: true,
                                full_name: true,
                                avatar: true
                            }
                        },
                        likes: currentUserId ? {
                            where: { userId: currentUserId }
                        } : false,
                        reposts: currentUserId ? {
                            where: { userId: currentUserId }
                        } : false,
                        _count: {
                            select: {
                                likes: true,
                                reposts: true
                            }
                        }
                    }
                }
            },
            orderBy: {
                createdAt: 'desc'
            },
            skip,
            take: limit
        }),
        prisma.postHashtag.count({
            where: { hashtagId: hashtag.id }
        })
    ]);

    const posts = postHashtags.map(ph => ({
        ...ph.post,
        likeCount: ph.post._count.likes,
        repostCount: ph.post._count.reposts,
        liked: ph.post.likes?.length > 0,
        reposted: ph.post.reposts?.length > 0
    }));

    res.json({
        data: posts,
        meta: {
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit),
            hashtag: hashtag.name
        }
    });
});



/**
 * Search hashtags by name
 * @route GET /api/hashtags/search
 */
const searchHashtags = asyncHandler(async (req, res) => {
    const { q } = req.query;
    const limit = Math.min(parseInt(req.query.limit) || 10, 50);

    if (!q || q.trim().length === 0) {
        return res.json([]);
    }

    const hashtags = await prisma.hashtag.findMany({
        where: {
            name: {
                contains: q.toLowerCase()
            }
        },
        select: {
            name: true,
            _count: {
                select: {
                    posts: true
                }
            }
        },
        orderBy: [
            {
                posts: {
                    _count: 'desc'
                }
            }
        ],
        take: limit
    });

    const formatted = hashtags.map(tag => ({
        name: tag.name,
        postCount: tag._count.posts,
        totalCount: tag._count.posts
    }));

    res.json(formatted);
});

module.exports = {
    getTopHashtags,
    getTrendingHashtags,
    getPostsByHashtag,
    searchHashtags
};
