
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkUserAvatar() {
    try {
        const user = await prisma.user.findFirst({
            where: {
                OR: [
                    { username: 'dddehdi' }, // Based on screenshot
                    { full_name: 'Diouri' }
                ]
            },
            select: {
                id: true,
                username: true,
                full_name: true,
                avatar: true
            }
        });

        console.log('User found:', user);
    } catch (error) {
        console.error('Error:', error);
    } finally {
        await prisma.$disconnect();
    }
}

checkUserAvatar();
