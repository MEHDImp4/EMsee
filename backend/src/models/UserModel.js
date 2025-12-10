const prisma = require('../config/db');

class UserModel {
    static async create(userData) {
        const user = await prisma.user.create({
            data: {
                username: userData.username,
                email: userData.email,
                password: userData.password,
                full_name: userData.full_name,
                role: userData.role || 'student',
                filiere: userData.filiere,
                year: userData.year,
                subjects: userData.subjects, // Prisma handles JSON automatically
                avatar: userData.avatar,
                bio: userData.bio,
                location: userData.location,
            }
        });
        return user.id;
    }

    static async update(id, userData) {
        const { id: _, ...dataToUpdate } = userData;
        await prisma.user.update({
            where: { id },
            data: dataToUpdate,
        });
    }

    static async findByEmail(email) {
        return await prisma.user.findUnique({
            where: { email },
        });
    }

    static async findByUsername(username) {
        return await prisma.user.findUnique({
            where: { username },
        });
    }

    static async findById(id) {
        return await prisma.user.findUnique({
            where: { id },
        });
    }
}

module.exports = { UserModel };
