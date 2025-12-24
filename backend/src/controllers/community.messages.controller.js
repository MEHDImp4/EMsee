const { PrismaClient } = require('@prisma/client');
const asyncHandler = require('../middlewares/asyncHandler');
const prisma = new PrismaClient();

// @desc    Get community messages
// @route   GET /api/communities/:id/messages
// @access  Private (Member only)
const getCommunityMessages = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const userId = req.user.id;
    const { cursor } = req.query; // For pagination

    // Check membership
    const membership = await prisma.communityMember.findUnique({
        where: { communityId_userId: { communityId: parseInt(id), userId } }
    });

    if (!membership || membership.status !== 'ACTIVE') {
        res.status(403);
        throw new Error('Not authorized to view messages');
    }

    const messages = await prisma.communityMessage.findMany({
        where: { communityId: parseInt(id) },
        take: 50,
        skip: cursor ? 1 : 0,
        cursor: cursor ? { id: parseInt(cursor) } : undefined,
        orderBy: { createdAt: 'desc' },
        include: {
            sender: {
                select: {
                    id: true,
                    username: true,
                    full_name: true,
                    avatar: true,
                    role: true
                }
            },
            reactions: true
        }
    });

    res.json(messages.reverse()); // Return oldest to newest for chat UI
});

// @desc    Send message to community
// @route   POST /api/communities/:id/messages
// @access  Private (Member only, check write access)
const sendCommunityMessage = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { content, mediaUrl, mediaType } = req.body;
    const userId = req.user.id;

    const community = await prisma.community.findUnique({ where: { id: parseInt(id) } });

    // Check membership
    const membership = await prisma.communityMember.findUnique({
        where: { communityId_userId: { communityId: parseInt(id), userId } }
    });

    if (!membership || membership.status !== 'ACTIVE') {
        res.status(403);
        throw new Error('Not authorized');
    }

    // Check write access
    if (community.writeAccess === 'ADMINS_ONLY' && !['OWNER', 'ADMIN'].includes(membership.role)) {
        res.status(403);
        throw new Error('Only admins can post in this community');
    }

    const message = await prisma.communityMessage.create({
        data: {
            communityId: parseInt(id),
            senderId: userId,
            content,
            mediaUrl,
            mediaType
        },
        include: {
            sender: {
                select: {
                    id: true,
                    username: true,
                    full_name: true,
                    avatar: true,
                    role: true
                }
            }
        }
    });

    // Handle @everyone
    if (content && content.includes('@everyone')) {
        // Create notifications for all ACTIVE members except sender
        // This can be heavy, should be a background job in production
        const members = await prisma.communityMember.findMany({
            where: {
                communityId: parseInt(id),
                userId: { not: userId },
                status: 'ACTIVE'
            },
            select: { userId: true }
        });

        // Use a transaction or raw query for bulk insert if Notification model supports basic message notifications
        // Assuming we need to extend Notification model or utilize 'SYSTEM' type
        // For now, let's assume we can create SYSTEM notifications or add a COMMUNITY_MENTION type
        // Since we didn't add COMMUNITY_MENTION enum yet, we might fallback to SYSTEM or MENTION with extra data

        // Skipping actual notification insert for now to avoid schema complexity bloat in this step, 
        // but logic is here.
        // TODO: Implement notification creation
    }

    res.status(201).json(message);
});

// @desc    Toggle message reaction
// @route   POST /api/communities/:id/messages/:messageId/react
// @access  Private
const toggleMessageReaction = asyncHandler(async (req, res) => {
    const { id, messageId } = req.params;
    const { emoji } = req.body;
    const userId = req.user.id;

    // Check membership
    const membership = await prisma.communityMember.findUnique({
        where: { communityId_userId: { communityId: parseInt(id), userId } }
    });

    if (!membership || membership.status !== 'ACTIVE') {
        res.status(403);
        throw new Error('Not authorized');
    }

    const message = await prisma.communityMessage.findUnique({
        where: { id: parseInt(messageId) }
    });

    if (!message) {
        res.status(404);
        throw new Error('Message not found');
    }

    const existing = await prisma.communityMessageReaction.findUnique({
        where: {
            messageId_userId_emoji: {
                messageId: parseInt(messageId),
                userId,
                emoji
            }
        }
    });

    if (existing) {
        await prisma.communityMessageReaction.delete({
            where: { id: existing.id }
        });
        res.json({ message: 'Reaction removed', added: false });
    } else {
        await prisma.communityMessageReaction.create({
            data: {
                messageId: parseInt(messageId),
                userId,
                emoji
            }
        });
        res.json({ message: 'Reaction added', added: true });
    }
});

module.exports = {
    getCommunityMessages,
    sendCommunityMessage,
    toggleMessageReaction
};
