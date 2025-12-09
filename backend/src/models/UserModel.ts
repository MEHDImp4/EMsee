
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
    created_at?: Date;
}

export class UserModel {
    static async create(user: User): Promise<number> {
        const query = `
      INSERT INTO users (username, email, password, full_name, role, filiere, year, subjects)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
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
            subjectsJson
        ]);
        return result.insertId;
    }

    static async findByEmail(email: string): Promise<User | null> {
        const query = 'SELECT * FROM users WHERE email = ?';
        const [rows] = await pool.execute<RowDataPacket[]>(query, [email]);
        return (rows.length > 0 ? rows[0] : null) as User | null;
    }

    static async findById(id: number): Promise<User | null> {
        const query = 'SELECT * FROM users WHERE id = ?';
        const [rows] = await pool.execute<RowDataPacket[]>(query, [id]);
        return (rows.length > 0 ? rows[0] : null) as User | null;
    }
}
