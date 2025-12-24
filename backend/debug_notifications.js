const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    console.log('--- Checking Last 10 Notifications ---');
    try {
        // Test Creation
        const user = await prisma.user.findFirst();
        if (user) {
            console.log('Creating test notification for user:', user.username);
            try {
                const created = await prisma.notification.create({
                    data: {
                        recipientId: 14, // Target the connected user
                        type: 'MESSAGES', // Or SYSTEM if supported
                        actorId: 1, // From admin
                        // type must be one of enum. NotificationType enum: MENTION, LIKE, REPOST, COMMENT, FOLLOW, SYSTEM
                        type: 'SYSTEM'
                    }
                });
                console.log('Created ID:', created.id);
            } catch (createErr) {
                console.error('Creation failed:', createErr);
            }
        }

        const notifications = await prisma.notification.findMany({
            take: 10,
            orderBy: {
                createdAt: 'desc'
            },
            include: {
                actor: {
                    select: { username: true }
                },
                recipient: {
                    select: { username: true }
                }
            }
        });

        if (notifications.length === 0) {
            console.log('No notifications found.');
        } else {
            console.log(JSON.stringify(notifications.map(n => ({
                id: n.id,
                type: n.type,
                actor: n.actor?.username || 'Unknown',
                recipient: n.recipient?.username || 'Unknown',
                read: n.read,
                createdAt: n.createdAt
            })), null, 2));
        }
    } catch (e) {
        console.error('Error querying notifications:', e);
    } finally {
        await prisma.$disconnect();
    }
}

main();
