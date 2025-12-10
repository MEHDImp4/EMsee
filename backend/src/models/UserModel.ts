import prisma from '../config/db';
import { User } from '@prisma/client';

export class UserModel {
    static async create(userData: any): Promise<number> {
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

    static async update(id: number, userData: Partial<User>): Promise<void> {
        const { id: _, ...dataToUpdate } = userData;
        await prisma.user.update({
            where: { id },
            data: dataToUpdate as any,
        });
    }

    static async findByEmail(email: string): Promise<User | null> {
        return await prisma.user.findUnique({
            where: { email },
        });
    }

    static async findByUsername(username: string): Promise<User | null> {
        return await prisma.user.findUnique({
            where: { username },
        });
    }

    static async findById(id: number): Promise<User | null> {
        return await prisma.user.findUnique({
            where: { id },
        });
    }
}

export { User };
