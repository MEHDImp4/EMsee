const { PrismaClient } = require('@prisma/client');
const notificationService = require('../services/notification.service');
const {
    profileSelectFields,
    userSearchSelectFields,
    checkIsFollowing,
    formatProfile
} = require('./helpers/user.helpers');
const prisma = new PrismaClient();

const getProfile = async (req, res) => {
    try {
        const { username } = req.params;
        const currentUserId = req.user?.id;

        const user = await prisma.user.findUnique({
            where: { username },
            select: profileSelectFields
        });

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        const isFollowing = await checkIsFollowing(currentUserId, user.id);
        const profile = formatProfile(user, currentUserId, isFollowing);

        res.json(profile);
    } catch (error) {
        console.error('Error fetching profile:', error);
        res.status(500).json({ error: 'Server error' });
    }
};

const followUser = async (req, res) => {
    try {
        const targetUserId = parseInt(req.params.id);
        const currentUserId = parseInt(req.user.id);

        console.log(`[DEBUG] Follow toggle: ${currentUserId} -> ${targetUserId}`);

        if (isNaN(targetUserId) || isNaN(currentUserId)) {
            return res.status(400).json({ error: 'Invalid user ID' });
        }

        if (targetUserId === currentUserId) {
            return res.status(400).json({ error: 'Cannot follow yourself' });
        }

        // Verify current user still exists (could be deleted during seed/reset)
        const currentUser = await prisma.user.findUnique({ where: { id: currentUserId } });
        if (!currentUser) {
            return res.status(401).json({ error: 'Your session has expired or your account was deleted. Please log out and log in again.' });
        }

        const targetUser = await prisma.user.findUnique({ where: { id: targetUserId } });
        if (!targetUser) return res.status(404).json({ error: 'User not found' });

        const whereClause = {
            followerId_followingId: {
                followerId: currentUserId,
                followingId: targetUserId
            }
        };

        const existingFollow = await prisma.follow.findUnique({ where: whereClause });

        if (existingFollow) {
            await prisma.follow.delete({ where: whereClause });
            return res.json({ following: false });
        }

        await prisma.follow.create({
            data: {
                followerId: currentUserId,
                followingId: targetUserId
            }
        });

        // Notify target user
        await notificationService.createNotification({
            recipientId: targetUserId,
            actorId: currentUserId,
            type: 'FOLLOW'
        });

        return res.json({ following: true });
    } catch (error) {
        console.error('Error toggling follow! Details:', {
            error: error.message,
            stack: error.stack,
            params: req.params,
            user: req.user
        });
        res.status(500).json({ error: 'Server error', details: error.message });
    }
};

const searchUsers = async (req, res) => {
    try {
        const { q } = req.query;
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;

        if (!q || q.trim() === '') {
            return res.json([]);
        }

        const users = await prisma.user.findMany({
            where: {
                OR: [
                    { username: { contains: q } },
                    { full_name: { contains: q } },
                    { username: { contains: q.toLowerCase() } },
                    { full_name: { contains: q.toLowerCase() } },
                    { username: { contains: q.toUpperCase() } },
                    { full_name: { contains: q.toUpperCase() } },
                    { username: { contains: q.charAt(0).toUpperCase() + q.slice(1).toLowerCase() } },
                    { full_name: { contains: q.charAt(0).toUpperCase() + q.slice(1).toLowerCase() } }
                ]
            },
            select: userSearchSelectFields,
            take: limit,
            skip: skip
        });

        res.json(users);
    } catch (error) {
        console.error('Error searching users:', error);
        res.status(500).json({ error: 'Server error' });
    }
};

const getRecentUsers = async (req, res) => {
    try {
        const limit = parseInt(req.query.limit) || 10;
        const page = parseInt(req.query.page) || 1;
        const skip = (page - 1) * limit;
        const currentUserId = req.user?.id;

        const users = await prisma.user.findMany({
            where: currentUserId ? {
                id: { not: currentUserId }
            } : undefined,
            orderBy: {
                created_at: 'desc'
            },
            take: limit,
            skip: skip,
            select: {
                id: true,
                username: true,
                full_name: true,
                avatar: true,
                bio: true,
                role: true
            }
        });

        res.json(users);
    } catch (error) {
        console.error('Error fetching recent users:', error);
        res.status(500).json({ error: 'Server error' });
    }
};

const getSuggestions = async (req, res) => {
    try {
        const currentUserId = req.user.id;
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 3;
        const skip = (page - 1) * limit;

        const suggestions = await prisma.user.findMany({
            where: {
                id: { not: currentUserId }
            },
            take: limit,
            skip: skip,
            orderBy: {
                created_at: 'desc' // Simplistic "suggestions" for now
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
    getRecentUsers,
    getSuggestions,
    followUser
};
