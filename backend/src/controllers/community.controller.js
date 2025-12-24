const { PrismaClient } = require('@prisma/client');
const asyncHandler = require('../middlewares/asyncHandler');
const prisma = new PrismaClient();

// @desc    Create a new community
// @route   POST /api/communities
// @access  Private
const createCommunity = asyncHandler(async (req, res) => {
    const { name, description, privacy, writeAccess, icon, banner } = req.body;
    const userId = req.user.id;

    // Check if name exists
    const existing = await prisma.community.findUnique({ where: { name } });
    if (existing) {
        res.status(400);
        throw new Error('Community name already exists');
    }

    const community = await prisma.community.create({
        data: {
            name,
            description,
            privacy: privacy || 'PUBLIC',
            writeAccess: writeAccess || 'EVERYONE',
            icon,
            banner,
            ownerId: userId,
            members: {
                create: {
                    userId,
                    role: 'OWNER',
                    status: 'ACTIVE'
                }
            }
        }
    });

    res.status(201).json(community);
});

// @desc    Get all communities (discovery) or my communities
// @route   GET /api/communities
// @access  Private
const getCommunities = asyncHandler(async (req, res) => {
    const userId = req.user.id;
    const tab = req.query.tab || 'discover'; // 'my' or 'discover'

    if (tab === 'my') {
        const memberships = await prisma.communityMember.findMany({
            where: { userId, status: 'ACTIVE' },
            include: { community: true }
        });
        return res.json(memberships.map(m => m.community));
    } else {
        // Discover: Public communities I'm not in
        const myCommunityIds = (await prisma.communityMember.findMany({
            where: { userId },
            select: { communityId: true }
        })).map(m => m.communityId);

        const communities = await prisma.community.findMany({
            where: {
                privacy: 'PUBLIC',
                id: { notIn: myCommunityIds }
            },
            take: 20,
            orderBy: { members: { _count: 'desc' } }, // Most popular
            include: {
                _count: { select: { members: true } }
            }
        });
        res.json(communities);
    }
});

// @desc    Get single community details
// @route   GET /api/communities/:id
// @access  Private
const getCommunity = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const userId = req.user.id;

    const community = await prisma.community.findUnique({
        where: { id: parseInt(id) },
        include: {
            _count: { select: { members: true } }
        }
    });

    if (!community) {
        res.status(404);
        throw new Error('Community not found');
    }

    // Check membership
    const membership = await prisma.communityMember.findUnique({
        where: {
            communityId_userId: {
                communityId: parseInt(id),
                userId
            }
        }
    });

    // If private and not member/pending, minimal info or hide?
    // We'll show basic info but content will be blocked in frontend
    res.json({ ...community, membership });
});


// @desc    Join community
// @route   POST /api/communities/:id/join
// @access  Private
const joinCommunity = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const userId = req.user.id;

    const community = await prisma.community.findUnique({ where: { id: parseInt(id) } });
    if (!community) {
        res.status(404);
        throw new Error('Community not found');
    }

    const existing = await prisma.communityMember.findUnique({
        where: { communityId_userId: { communityId: parseInt(id), userId } }
    });

    if (existing) {
        res.status(400);
        throw new Error('Already a member or request pending');
    }

    const status = community.privacy === 'PRIVATE' ? 'PENDING' : 'ACTIVE';

    const member = await prisma.communityMember.create({
        data: {
            communityId: parseInt(id),
            userId,
            role: 'MEMBER',
            status
        }
    });

    res.json(member);
});

// @desc    Leave community
// @route   DELETE /api/communities/:id/leave
// @access  Private
const leaveCommunity = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const userId = req.user.id;

    await prisma.communityMember.deleteMany({
        where: {
            communityId: parseInt(id),
            userId
        }
    });

    res.json({ message: 'Left community' });
});

// @desc    Update community details
// @route   PUT /api/communities/:id
// @access  Private (Owner/Admin)
const updateCommunity = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { name, description, privacy, writeAccess, icon, banner } = req.body;
    const userId = req.user.id;

    const community = await prisma.community.findUnique({ where: { id: parseInt(id) } });

    if (!community) {
        res.status(404);
        throw new Error('Community not found');
    }

    // Check permissions (Owner only for core settings, Admins maybe for description?)
    // For now, let's say OWNER only for safety, or check role
    const member = await prisma.communityMember.findUnique({
        where: { communityId_userId: { communityId: parseInt(id), userId } }
    });

    if (!member || member.role !== 'OWNER') {
        res.status(403);
        throw new Error('Only the owner can update community settings');
    }

    const updated = await prisma.community.update({
        where: { id: parseInt(id) },
        data: {
            name: name || undefined,
            description: description || undefined,
            privacy: privacy || undefined,
            writeAccess: writeAccess || undefined,
            icon: icon || undefined,
            banner: banner || undefined
        }
    });

    res.json(updated);
});

// @desc    Delete community
// @route   DELETE /api/communities/:id
// @access  Private (Owner only)
const deleteCommunity = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const userId = req.user.id;

    const community = await prisma.community.findUnique({ where: { id: parseInt(id) } });

    if (!community) {
        res.status(404);
        throw new Error('Community not found');
    }

    if (community.ownerId !== userId) {
        res.status(403);
        throw new Error('Only the owner can delete the community');
    }

    // Prisma cascade delete should handle members and messages if configured,
    // but schema has onDelete: Cascade for relations.
    // However, Community is the parent. We need to ensure relations are deleted.
    // In schema: `members CommunityMember[]` -> `community Community @relation(..., onDelete: Cascade)`
    // So deleting community deletes members and messages automatically.

    await prisma.community.delete({
        where: { id: parseInt(id) }
    });

    res.json({ message: 'Community deleted' });
});

// @desc    Get members (for admin approvals)
// @route   GET /api/communities/:id/members
// @access  Private (Admin only)
const getMembers = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const status = req.query.status; // 'PENDING' for approval list

    const members = await prisma.communityMember.findMany({
        where: {
            communityId: parseInt(id),
            status: status ? status : undefined
        },
        include: { user: { select: { id: true, username: true, full_name: true, avatar: true } } }
    });

    res.json(members);
});

// @desc    Manage member (approve, reject, kick)
// @route   PUT /api/communities/:id/members/:userId
// @access  Private (Admin only)
const manageMember = asyncHandler(async (req, res) => {
    const { id, userId } = req.params;
    const { action } = req.body; // 'approve', 'reject', 'kick', 'promote'
    const adminId = req.user.id;

    // Check admin rights
    const admin = await prisma.communityMember.findUnique({
        where: { communityId_userId: { communityId: parseInt(id), userId: adminId } }
    });

    if (!admin || !['OWNER', 'ADMIN'].includes(admin.role)) {
        res.status(403);
        throw new Error('Not authorized');
    }

    const targetId = parseInt(userId);

    if (action === 'approve') {
        const updated = await prisma.communityMember.update({
            where: { communityId_userId: { communityId: parseInt(id), userId: targetId } },
            data: { status: 'ACTIVE' }
        });
        return res.json(updated);
    }

    if (action === 'reject' || action === 'kick') {
        await prisma.communityMember.delete({
            where: { communityId_userId: { communityId: parseInt(id), userId: targetId } }
        });
        return res.json({ message: 'User removed' });
    }

    if (action === 'promote') {
        const updated = await prisma.communityMember.update({
            where: { communityId_userId: { communityId: parseInt(id), userId: targetId } },
            data: { role: 'ADMIN' }
        });
        return res.json(updated);
    }

    res.status(400);
    throw new Error('Invalid action');
});

module.exports = {
    createCommunity,
    getCommunities,
    getCommunity,
    joinCommunity,
    leaveCommunity,
    getMembers,
    manageMember,
    updateCommunity,
    deleteCommunity
};
