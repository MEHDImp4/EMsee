const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function verifyDatabase() {
    console.log('\n📊 Database Verification Report\n');
    console.log('='.repeat(60));

    try {
        const userCount = await prisma.user.count();
        const postCount = await prisma.post.count();
        const likeCount = await prisma.like.count();
        const repostCount = await prisma.repost.count();
        const bookmarkCount = await prisma.bookmark.count();
        const followCount = await prisma.follow.count();
        const hashtagCount = await prisma.hashtag.count();
        const hashtagLinkCount = await prisma.postHashtag.count();

        // Count comments (posts with parentId)
        const commentCount = await prisma.post.count({
            where: {
                parentId: {
                    not: null
                }
            }
        });

        const regularPostCount = postCount - commentCount;

        console.log('\n👥 Users:               ', userCount.toLocaleString());
        console.log('📝 Posts (regular):    ', regularPostCount.toLocaleString());
        console.log('💬 Comments (replies): ', commentCount.toLocaleString());
        console.log('❤️  Likes:              ', likeCount.toLocaleString());
        console.log('🔁 Reposts:            ', repostCount.toLocaleString());
        console.log('🔖 Bookmarks:          ', bookmarkCount.toLocaleString());
        console.log('👤 Follows:            ', followCount.toLocaleString());
        console.log('#️⃣  Hashtags:          ', hashtagCount.toLocaleString());
        console.log('🔗 Hashtag Links:      ', hashtagLinkCount.toLocaleString());
        console.log('─'.repeat(60));

        const totalItems = userCount + postCount + likeCount + repostCount +
            bookmarkCount + followCount + hashtagCount + hashtagLinkCount;
        console.log('📦 TOTAL ITEMS:        ', totalItems.toLocaleString());
        console.log('='.repeat(60));

        // Sample data checks
        console.log('\n🔍 Data Quality Checks:\n');

        const sampleUser = await prisma.user.findFirst({
            include: {
                posts: {
                    take: 1
                },
                _count: {
                    select: {
                        posts: true,
                        likes: true,
                        following: true
                    }
                }
            }
        });

        if (sampleUser) {
            console.log(`✅ Sample User: ${sampleUser.username}`);
            console.log(`   - Posts: ${sampleUser._count.posts}`);
            console.log(`   - Likes given: ${sampleUser._count.likes}`);
            console.log(`   - Following: ${sampleUser._count.following}`);
        }

        const samplePost = await prisma.post.findFirst({
            where: {
                parentId: null // Regular post, not a comment
            },
            include: {
                user: {
                    select: {
                        username: true
                    }
                },
                _count: {
                    select: {
                        likes: true,
                        reposts: true,
                        replies: true
                    }
                }
            }
        });

        if (samplePost) {
            console.log(`\n✅ Sample Post by @${samplePost.user.username}:`);
            console.log(`   - Likes: ${samplePost._count.likes}`);
            console.log(`   - Reposts: ${samplePost._count.reposts}`);
            console.log(`   - Replies: ${samplePost._count.replies}`);
        }

        console.log('\n✨ Database verification complete!');
        console.log('🎉 Your database is ready for use!\n');

    } catch (error) {
        console.error('❌ Error during verification:', error);
        throw error;
    }
}

verifyDatabase()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
