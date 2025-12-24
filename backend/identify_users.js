const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    const notifications = await prisma.notification.findMany({
        where: { recipientId: 14, read: false },
        take: 5
    });
    console.log(`Unread for User 14: ${notifications.length}`);
    console.log(JSON.stringify(notifications, null, 2));
}

main().finally(() => prisma.$disconnect());
