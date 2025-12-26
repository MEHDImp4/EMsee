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
                studentClass: userData.studentClass,
                subjects: (prisma.isSqliteLocal && userData.subjects && typeof userData.subjects === 'object')
                    ? JSON.stringify(userData.subjects)
                    : userData.subjects, // Prisma handles JSON automatically (in Postgres)
                avatar: userData.avatar,
                bio: userData.bio,
                location: userData.location,
            }
        });
        return user.id;
    }

    static async update(id, userData) {
        const { id: _, ...dataToUpdate } = userData;

        if (prisma.isSqliteLocal && dataToUpdate.subjects && typeof dataToUpdate.subjects === 'object') {
            dataToUpdate.subjects = JSON.stringify(dataToUpdate.subjects);
        }

        await prisma.user.update({
            where: { id },
            data: dataToUpdate,
        });
    }

    static async findByEmail(email) {
        const query = {
            email: {
                equals: email
            }
        };
        // SQLite does not support case-insensitive filtering for String in this configuration
        if (!prisma.isSqliteLocal) {
            query.email.mode = 'insensitive';
        }

        return await prisma.user.findFirst({
            where: query,
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
