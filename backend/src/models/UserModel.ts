
import pool from '../config/db';
import { RowDataPacket, ResultSetHeader } from 'mysql2';

export interface User {
    id?: number;
    username: string;
    email: string;
    password?: string;
    full_name: string;
    role?: 'student' | 'professor' | 'admin';
    filiere?: string;
    year?: string;
    subjects?: string[]; // JSON array
    avatar?: string;
    bio?: string;
    location?: string;
    created_at?: Date;
}

export class UserModel {
    static async create(user: User): Promise<number> {
        const query = `
      INSERT INTO users (username, email, password, full_name, role, filiere, year, subjects, avatar, bio, location)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
        const subjectsJson = user.subjects ? JSON.stringify(user.subjects) : null;
        const [result] = await pool.execute<ResultSetHeader>(query, [
            user.username,
            user.email,
            user.password,
            user.full_name,
            user.role || 'student',
            user.filiere || null,
            user.year || null,
            subjectsJson,
            user.avatar || null,
            user.bio || null,
            user.location || null
        ]);
        return result.insertId;
    }

    static async update(id: number, user: Partial<User>): Promise<void> {
        const fields: string[] = [];
        const values: any[] = [];

        if (user.full_name !== undefined) { fields.push('full_name = ?'); values.push(user.full_name); }
        if (user.bio !== undefined) { fields.push('bio = ?'); values.push(user.bio); }
        if (user.location !== undefined) { fields.push('location = ?'); values.push(user.location); }
        if (user.filiere !== undefined) { fields.push('filiere = ?'); values.push(user.filiere); }
        if (user.year !== undefined) { fields.push('year = ?'); values.push(user.year); }
        if (user.avatar !== undefined) { fields.push('avatar = ?'); values.push(user.avatar); }

        if (fields.length === 0) return;

        const query = `UPDATE users SET ${fields.join(', ')} WHERE id = ?`;
        values.push(id);

        await pool.execute(query, values);
    }

    static async findByEmail(email: string): Promise<User | null> {
        const query = 'SELECT * FROM users WHERE email = ?';
        const [rows] = await pool.execute<RowDataPacket[]>(query, [email]);
        return (rows.length > 0 ? rows[0] : null) as User | null;
    }

    static async findByUsername(username: string): Promise<User | null> {
        const query = 'SELECT * FROM users WHERE username = ?';
        const [rows] = await pool.execute<RowDataPacket[]>(query, [username]);
        return (rows.length > 0 ? rows[0] : null) as User | null;
    }

    static async findById(id: number): Promise<User | null> {
        const query = 'SELECT * FROM users WHERE id = ?';
        const [rows] = await pool.execute<RowDataPacket[]>(query, [id]);
        return (rows.length > 0 ? rows[0] : null) as User | null;
    }
}
