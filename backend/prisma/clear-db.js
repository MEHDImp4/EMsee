const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function clearDatabase() {
    console.log('🗑️  Clearing all data from database...\n');

    try {
        // Delete in correct order to respect foreign key constraints
        console.log('   Deleting community message reactions...');
        await prisma.communityMessageReaction.deleteMany();

        console.log('   Deleting community messages...');
        await prisma.communityMessage.deleteMany();

        console.log('   Deleting community members...');
        await prisma.communityMember.deleteMany();

        console.log('   Deleting communities...');
        await prisma.community.deleteMany();

        console.log('   Deleting messages...');
        await prisma.message.deleteMany();

        console.log('   Deleting conversation participants...');
        await prisma.conversationParticipant.deleteMany();

        console.log('   Deleting conversations...');
        await prisma.conversation.deleteMany();

        console.log('   Deleting post views...');
        await prisma.postView.deleteMany();

        console.log('   Deleting poll votes...');
        await prisma.pollVote.deleteMany();

        console.log('   Deleting poll options...');
        await prisma.pollOption.deleteMany();

        console.log('   Deleting polls...');
        await prisma.poll.deleteMany();

        console.log('   Deleting media...');
        await prisma.media.deleteMany();

        console.log('   Deleting post hashtags...');
        await prisma.postHashtag.deleteMany();

        console.log('   Deleting hashtags...');
        await prisma.hashtag.deleteMany();

        console.log('   Deleting follows...');
        await prisma.follow.deleteMany();

        console.log('   Deleting bookmarks...');
        await prisma.bookmark.deleteMany();

        console.log('   Deleting likes...');
        await prisma.like.deleteMany();

        console.log('   Deleting reposts...');
        await prisma.repost.deleteMany();

        console.log('   Deleting notifications...');
        await prisma.notification.deleteMany();

        console.log('   Deleting posts (including comments)...');
        await prisma.post.deleteMany();

        console.log('   Deleting users...');
        await prisma.user.deleteMany();

        console.log('\n✅ Database cleared successfully!\n');

    } catch (error) {
        console.error('❌ Error clearing database:', error);
        throw error;
    }
}

clearDatabase()
    .then(() => {
        console.log('✨ Database is now empty and ready for seeding.');
        console.log('   Run: node prisma/seed.js\n');
    })
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
