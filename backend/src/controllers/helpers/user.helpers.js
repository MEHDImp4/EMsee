const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const profileSelectFields = {
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
            followedBy: true,
            following: true
        }
    }
};

const userSearchSelectFields = {
    id: true,
    username: true,
    full_name: true,
    avatar: true,
    role: true
};

const checkIsFollowing = async (currentUserId, targetUserId) => {
    if (!currentUserId || currentUserId === targetUserId) {
        return false;
    }

    const follow = await prisma.follow.findUnique({
        where: {
            followerId_followingId: {
                followerId: currentUserId,
                followingId: targetUserId
            }
        }
    });

    return !!follow;
};

const formatProfile = (user, currentUserId, isFollowing) => ({
    ...user,
    isOwner: user.id === currentUserId,
    isFollowing,
    followersCount: user._count.followedBy,
    followingCount: user._count.following,
    _count: undefined
});

module.exports = {
    profileSelectFields,
    userSearchSelectFields,
    checkIsFollowing,
    formatProfile
};
