const { PrismaClient } = require('@prisma/client');
const asyncHandler = require('../middlewares/asyncHandler');

const prisma = new PrismaClient();

/**
 * Get trending posts based on engagement metrics
 * Algorithm: (likes * 2 + reposts * 3 + comments * 1.5) * time_decay
 * @route GET /api/trending/posts
 */
const getTrendingPosts = asyncHandler(async (req, res) => {
    const limit = parseInt(req.query.limit) || 10;
    const days = parseInt(req.query.days) || 7; // lookback window
    const currentUserId = req.user?.id;
    const halfLifeHours = 24; // posts lose half their score after 24h

    const since = new Date();
    since.setDate(since.getDate() - days);

    // Fetch posts from the last X days with engagement counts
    const posts = await prisma.post.findMany({
        where: {
            createdAt: { gte: since }
        },
        include: {
            user: {
                select: {
                    id: true,
                    username: true,
                    full_name: true,
                    avatar: true,
                    role: true
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
                    reposts: true,
                    comments: true
                }
            }
        },
        orderBy: {
            createdAt: 'desc'
        },
        take: 100 // Get more posts to calculate scores
    });

    const now = new Date();
    const LN2 = Math.log(2);

    // Calculate trending score for each post
    const scoredPosts = posts.map(post => {
        const likesCount = post._count.likes;
        const repostsCount = post._count.reposts;
        const commentsCount = post._count.comments;

        // Engagement score: likes * 2 + reposts * 3 + comments * 1.5
        const engagementScore = (likesCount * 2) + (repostsCount * 3) + (commentsCount * 1.5);

        // Time decay: exponential decay based on age
        const ageHours = (now.getTime() - new Date(post.createdAt).getTime()) / (1000 * 60 * 60);
        const timeDecay = Math.exp(-LN2 * (ageHours / halfLifeHours));

        // Final trending score
        const trendingScore = engagementScore * timeDecay;

        return {
            ...post,
            likeCount: likesCount,
            repostCount: repostsCount,
            commentCount: commentsCount,
            liked: post.likes?.length > 0,
            reposted: post.reposts?.length > 0,
            trendingScore,
            engagementScore
        };
    });

    // Sort by trending score and take top N
    const trendingPosts = scoredPosts
        .sort((a, b) => b.trendingScore - a.trendingScore)
        .slice(0, limit)
        .map(({ trendingScore, engagementScore, ...post }) => post); // Remove score from response

    res.json({
        data: trendingPosts,
        meta: {
            total: trendingPosts.length,
            limit,
            days,
            algorithm: 'engagement_weighted'
        }
    });
});

/**
 * Get trending topics/hashtags with most engagement
 * @route GET /api/trending/topics
 */
const getTrendingTopics = asyncHandler(async (req, res) => {
    const limit = parseInt(req.query.limit) || 10;
    const days = parseInt(req.query.days) || 7;

    const since = new Date();
    since.setDate(since.getDate() - days);

    // Get hashtags with post counts and engagement metrics
    const hashtags = await prisma.hashtag.findMany({
        include: {
            posts: {
                where: {
                    createdAt: { gte: since }
                },
                include: {
                    post: {
                        include: {
                            _count: {
                                select: {
                                    likes: true,
                                    reposts: true,
                                    comments: true
                                }
                            }
                        }
                    }
                }
            },
            _count: {
                select: {
                    posts: true,
                    comments: true
                }
            }
        }
    });

    // Calculate engagement score for each hashtag
    const scoredHashtags = hashtags.map(hashtag => {
        const recentPosts = hashtag.posts.filter(p => 
            new Date(p.createdAt) >= since
        );

        const totalLikes = recentPosts.reduce((sum, p) => 
            sum + (p.post._count.likes || 0), 0
        );
        const totalReposts = recentPosts.reduce((sum, p) => 
            sum + (p.post._count.reposts || 0), 0
        );
        const totalComments = recentPosts.reduce((sum, p) => 
            sum + (p.post._count.comments || 0), 0
        );

        const engagementScore = (totalLikes * 2) + (totalReposts * 3) + (totalComments * 1.5);
        const postCount = recentPosts.length;

        return {
            name: hashtag.name,
            postCount,
            totalLikes,
            totalReposts,
            totalComments,
            engagementScore,
            score: engagementScore + (postCount * 5) // Boost for volume
        };
    });

    // Sort by score and filter out low-activity hashtags
    const trendingTopics = scoredHashtags
        .filter(t => t.postCount > 0)
        .sort((a, b) => b.score - a.score)
        .slice(0, limit)
        .map(({ score, ...topic }) => topic);

    res.json({
        data: trendingTopics,
        meta: {
            total: trendingTopics.length,
            limit,
            days
        }
    });
});

module.exports = {
    getTrendingPosts,
    getTrendingTopics
};
