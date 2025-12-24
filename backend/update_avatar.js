
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function updateUserAvatar() {
    try {
        const user = await prisma.user.update({
            where: {
                id: 8 // User 'Diouri' based on previous check
            },
            data: {
                avatar: '/uploads/images/image-1766093848647-478908226.png'
            }
        });

        console.log('User updated:', user);
    } catch (error) {
        console.error('Error:', error);
    } finally {
        await prisma.$disconnect();
    }
}

updateUserAvatar();
