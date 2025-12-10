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
                        // followers: true, // future
                        // following: true  // future
                    }
                }
            }
        });

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        // Add calculated stats or flags here if needed
        const profile = {
            ...user,
            isOwner: user.id === currentUserId
        };

        res.json(profile);
    } catch (error) {
        console.error('Error fetching profile:', error);
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
        const userId = req.user.userId;
        // Simple suggestion logic: Get 3 users that are NOT the current user
        // In a real app, we would exclude users already followed.
        // Since we don't have a Follow model yet, we just grab random users or recent ones.
        const suggestions = await prisma.user.findMany({
            where: {
                id: { not: userId }
            },
            take: 3,
            orderBy: {
                created_at: 'desc' // Newest users first
            },
            select: {
                id: true,
                username: true,
                full_name: true,
                avatar: true
            }
        });
        res.json(suggestions);
    } catch (error) {
        console.error('Error fetching suggestions:', error);
        res.status(500).json({ error: 'Server error' });
    }
};

module.exports = {
    getProfile,
    searchUsers,
    getSuggestions
};
