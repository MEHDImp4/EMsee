const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const getProfile = async (req, res) => {
    try {
        const { username } = req.params;
        const currentUserId = req.user?.id;

        const user = await prisma.user.findUnique({
            where: { username },
            select: {
                id: true,
                username: true,
                email: true,
                full_name: true,
                role: true,
                avatar: true,
                bio: true,
                location: true,
                year: true,
                filiere: true,
                created_at: true,
                _count: {
                    select: {
                        posts: true,
                        followedBy: true, // followers
                        following: true   // following
                    }
                }
            }
        });

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        let isFollowing = false;
        if (currentUserId && currentUserId !== user.id) {
            const follow = await prisma.follow.findUnique({
                where: {
                    followerId_followingId: {
                        followerId: currentUserId,
                        followingId: user.id
                    }
                }
            });
            isFollowing = !!follow;
        }

        const profile = {
            ...user,
            isOwner: user.id === currentUserId,
            isFollowing,
            followersCount: user._count.followedBy,
            followingCount: user._count.following,
            _count: undefined // Clean up
        };

        res.json(profile);
    } catch (error) {
        console.error('Error fetching profile:', error);
        res.status(500).json({ error: 'Server error' });
    }
};

const followUser = async (req, res) => {
    try {
        const targetUserId = parseInt(req.params.id);
        const currentUserId = req.user.id;

        if (targetUserId === currentUserId) {
            return res.status(400).json({ error: 'Cannot follow yourself' });
        }

        const targetUser = await prisma.user.findUnique({ where: { id: targetUserId } });
        if (!targetUser) return res.status(404).json({ error: 'User not found' });

        const existingFollow = await prisma.follow.findUnique({
            where: {
                followerId_followingId: {
                    followerId: currentUserId,
                    followingId: targetUserId
                }
            }
        });

        if (existingFollow) {
            // Unfollow
            await prisma.follow.delete({
                where: {
                    followerId_followingId: {
                        followerId: currentUserId,
                        followingId: targetUserId
                    }
                }
            });
            return res.json({ following: false });
        } else {
            // Follow
            await prisma.follow.create({
                data: {
                    followerId: currentUserId,
                    followingId: targetUserId
                }
            });
            return res.json({ following: true });
        }
    } catch (error) {
        console.error('Error toggling follow:', error);
        res.status(500).json({ error: 'Server error' });
    }
};

const searchUsers = async (req, res) => {
    try {
        const { q } = req.query;
        if (!q || q.trim() === '') {
            return res.json([]);
        }

        const users = await prisma.user.findMany({
            where: {
                OR: [
                    { username: { contains: q } }, // Remove mode: 'insensitive' for compatibility if needed, or keep if DB supports it (MySQL usually case insensitive by default for some collations, but let's stick to simple contains)
                    { full_name: { contains: q } }
                ]
            },
            select: {
                id: true,
                username: true,
                full_name: true,
                avatar: true,
                role: true
            },
            take: 10
        });

        res.json(users);
    } catch (error) {
        console.error('Error searching users:', error);
        res.status(500).json({ error: 'Server error' });
    }
};

const getSuggestions = async (req, res) => {
    try {
        const currentUserId = req.user.id;

        const suggestions = await prisma.user.findMany({
            where: {
                id: { not: currentUserId }
            },
            take: 3, // In future, maybe take more and shuffle
            orderBy: {
                created_at: 'desc'
            },
            select: {
                id: true,
                username: true,
                full_name: true,
                avatar: true,
                followedBy: {
                    where: { followerId: currentUserId },
                    select: { followerId: true }
                }
            }
        });

        // Format to include isFollowing boolean
        const formattedSuggestions = suggestions.map(user => ({
            id: user.id,
            username: user.username,
            full_name: user.full_name,
            avatar: user.avatar,
            isFollowing: user.followedBy.length > 0
        }));

        res.json(formattedSuggestions);
    } catch (error) {
        console.error('Error fetching suggestions:', error);
        res.status(500).json({ error: 'Server error' });
    }
};

module.exports = {
    getProfile,
    searchUsers,
    getSuggestions,
    followUser
};
