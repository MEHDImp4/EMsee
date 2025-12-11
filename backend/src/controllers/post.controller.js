const { PrismaClient } = require('@prisma/client');
const { getIo } = require('../services/socketService');
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
            include: {
                user: {
                    select: {
                        id: true,
                        username: true,
                        full_name: true,
                        avatar: true
                    }
                }
            }
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
            include: {
                user: {
                    select: {
                        id: true,
                        username: true,
                        full_name: true,
                        avatar: true
                    }
                },
                _count: {
                    select: {
                        likes: true,
                        comments: true,
                        reposts: true
                    }
                },
                likes: {
                    where: { userId: currentUserId },
                    select: { userId: true }
                },
                reposts: {
                    where: { userId: currentUserId },
                    select: { userId: true }
                }
            }
        });

        const formattedPosts = posts.map(post => ({
            ...post,
            isLiked: post.likes.length > 0,
            isReposted: post.reposts.length > 0,
            likes: undefined, // Create clean structure
            reposts: undefined
        }));

        res.json(formattedPosts);
    } catch (error) {
        console.error('Error fetching posts:', error);
        res.status(500).json({ error: 'Server error' });
    }
};

const likePost = async (req, res) => {
    try {
        const postId = parseInt(req.params.id);
        const userId = req.user.id;

        const existingLike = await prisma.like.findUnique({
            where: {
                postId_userId: {
                    postId,
                    userId
                }
            }
        });

        if (existingLike) {
            await prisma.like.delete({
                where: {
                    postId_userId: {
                        postId,
                        userId
                    }
                }
            });
            return res.json({ liked: false });
        } else {
            await prisma.like.create({
                data: {
                    postId,
                    userId
                }
            });
            return res.json({ liked: true });
        }
    } catch (error) {
        console.error('Error liking post:', error);
        res.status(500).json({ error: 'Server error' });
    }
};

const repostPost = async (req, res) => {
    try {
        const postId = parseInt(req.params.id);
        const userId = req.user.id;

        const existingRepost = await prisma.repost.findUnique({
            where: {
                postId_userId: {
                    postId,
                    userId
                }
            }
        });

        if (existingRepost) {
            await prisma.repost.delete({
                where: {
                    postId_userId: {
                        postId,
                        userId
                    }
                }
            });
            return res.json({ reposted: false });
        } else {
            await prisma.repost.create({
                data: {
                    postId,
                    userId
                }
            });
            return res.json({ reposted: true });
        }
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

        // Check Reply Permission
        const post = await prisma.post.findUnique({ where: { id: postId } });
        if (!post) return res.status(404).json({ error: 'Post not found' });

        if (post.replyPermission === 'NO_ONE' && post.userId !== userId) {
            return res.status(403).json({ error: 'Replies are disabled for this post' });
        }

        if (post.replyPermission === 'FOLLOWERS' && post.userId !== userId) {
            // Check if current user follows the post author
            const isFollowing = await prisma.follow.findUnique({
                where: {
                    followerId_followingId: {
                        followerId: userId,
                        followingId: post.userId
                    }
                }
            });

            if (!isFollowing) {
                return res.status(403).json({ error: 'Only followers can reply to this post' });
            }
        }

        const comment = await prisma.comment.create({
            data: {
                content,
                postId,
                userId
            },
            include: {
                user: {
                    select: {
                        id: true,
                        username: true,
                        full_name: true,
                        avatar: true
                    }
                }
            }
        });

        // Emit socket event
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

        const comments = await prisma.comment.findMany({
            where: { postId },
            include: {
                user: {
                    select: {
                        id: true,
                        username: true,
                        full_name: true,
                        avatar: true
                    }
                }
            },
            orderBy: { createdAt: 'asc' }
        });

        res.json(comments);
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
            include: {
                user: {
                    select: {
                        id: true,
                        username: true,
                        full_name: true,
                        avatar: true
                    }
                },
                _count: {
                    select: {
                        likes: true,
                        comments: true,
                        reposts: true
                    }
                },
                likes: {
                    where: { userId: currentUserId },
                    select: { userId: true }
                },
                reposts: {
                    where: { userId: currentUserId },
                    select: { userId: true }
                }
            }
        });

        if (!post) {
            return res.status(404).json({ error: 'Post not found' });
        }

        const formattedPost = {
            ...post,
            isLiked: post.likes.length > 0,
            isReposted: post.reposts.length > 0,
            likes: undefined,
            reposts: undefined
        };

        res.json(formattedPost);
    } catch (error) {
        console.error('Error fetching post:', error);
        res.status(500).json({ error: 'Server error' });
    }
};

const getUserPosts = async (req, res) => {
    try {
        const username = req.params.username;
        const currentUserId = req.user?.id;

        const user = await prisma.user.findUnique({
            where: { username }
        });

        if (!user) return res.status(404).json({ error: 'User not found' });

        // Fetch posts created by user
        const posts = await prisma.post.findMany({
            where: { userId: user.id },
            include: {
                user: {
                    select: { id: true, username: true, full_name: true, avatar: true }
                },
                _count: {
                    select: { likes: true, comments: true, reposts: true }
                },
                likes: { where: { userId: currentUserId }, select: { userId: true } },
                reposts: { where: { userId: currentUserId }, select: { userId: true } }
            }
        });

        // Fetch posts reposted by user
        const reposts = await prisma.repost.findMany({
            where: { userId: user.id },
            include: {
                post: {
                    include: {
                        user: {
                            select: { id: true, username: true, full_name: true, avatar: true }
                        },
                        _count: {
                            select: { likes: true, comments: true, reposts: true }
                        },
                        likes: { where: { userId: currentUserId }, select: { userId: true } },
                        reposts: { where: { userId: currentUserId }, select: { userId: true } }
                    }
                }
            }
        });

        // Flatten reposts to match post structure and add isRepost flag if needed
        const formattedReposts = reposts.map(r => ({
            ...r.post,
            isRepostContext: true, // Marker to show "Reposted by X"
            repostedAt: r.createdAt
        }));

        // Combine and sort
        const allPosts = [...posts, ...formattedReposts].sort((a, b) => {
            const dateA = new Date(a.repostedAt || a.createdAt);
            const dateB = new Date(b.repostedAt || b.createdAt);
            return dateB - dateA;
        });

        const finalPosts = allPosts.map(post => ({
            ...post,
            isLiked: post.likes.length > 0,
            isReposted: post.reposts.length > 0,
            likes: undefined,
            reposts: undefined
        }));

        res.json(finalPosts);
    } catch (error) {
        console.error('Error fetching user posts:', error);
        res.status(500).json({ error: 'Server error' });
    }
};

const deletePost = async (req, res) => {
    try {
        const postId = parseInt(req.params.id);
        const userId = req.user.id; // From auth middleware

        const post = await prisma.post.findUnique({
            where: { id: postId }
        });

        if (!post) {
            return res.status(404).json({ error: 'Post not found' });
        }

        if (post.userId !== userId) {
            return res.status(403).json({ error: 'Unauthorized' });
        }

        // Delete related data first (cascade should handle this but explicit is safer without cascade)
        // Prisma schema usually handles cascade delete if configured, assuming it is.
        // If not, we might need to delete likes/comments/reposts first.
        // Let's rely on Prisma relations or simple delete for now.
        // Assuming relations allow cascade or we need to delete manually.
        // Given previous simple setup, let's delete depedencies manually to be safe or wrap in transaction.
        // Actually, simple delete might trip foreign keys if not CASCADE.
        // Let's try simple delete, if it fails we add transaction.

        await prisma.comment.deleteMany({ where: { postId } });
        await prisma.like.deleteMany({ where: { postId } });
        await prisma.repost.deleteMany({ where: { postId } });

        await prisma.post.delete({
            where: { id: postId }
        });

        res.json({ message: 'Post deleted successfully' });
    } catch (error) {
        console.error('Error deleting post:', error);
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
    getPostById
};
