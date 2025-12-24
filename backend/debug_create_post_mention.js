const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const postService = require('./src/services/post.service');

async function main() {
    try {
        // 1. Get two users
        const users = await prisma.user.findMany({ take: 2 });
        if (users.length < 2) {
            console.error('Not enough users to test mention');
            return;
        }

        const actor = users[0];
        const recipient = users[1];

        console.log(`Testing mention: ${actor.username} (@${actor.username}) mentions ${recipient.username} (@${recipient.username})`);

        // 2. Create Post with mention
        const content = `Hello @${recipient.username}, this is a debug post.`;
        console.log(`Creating post with content: "${content}"`);

        const post = await postService.createPost(actor.id, content);
        console.log('Post created:', post.id);

        // 3. Check Notifications
        console.log('Waiting 2 seconds for async processing...');
        await new Promise(r => setTimeout(r, 2000));

        const notifications = await prisma.notification.findMany({
            where: {
                recipientId: recipient.id,
                type: 'MENTION',
                postId: post.id
            }
        });

        if (notifications.length > 0) {
            console.log('SUCCESS: Notification created!', notifications[0]);
        } else {
            console.error('FAILURE: No notification found for this post.');
            // Debug regex manually
            const mentionRegex = /@([\w.-]+)/g;
            const matches = [...content.matchAll(mentionRegex)];
            console.log('Regex matches in content:', matches.map(m => m[1]));
        }

    } catch (e) {
        console.error('Error:', e);
    } finally {
        await prisma.$disconnect();
    }
}

main();
