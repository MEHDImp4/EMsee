const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function quickCheck() {
    const counts = {
        users: await prisma.user.count(),
        posts: await prisma.post.count(),
        likes: await prisma.like.count(),
        reposts: await prisma.repost.count(),
        bookmarks: await prisma.bookmark.count(),
        follows: await prisma.follow.count()
    };

    console.log(JSON.stringify(counts, null, 2));
}

quickCheck()
    .finally(async () => {
        await prisma.$disconnect();
    });
