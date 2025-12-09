
import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { UserModel, User } from '../models/UserModel';

export const register = async (req: Request, res: Response) => {
    try {
        const { username, email, password, full_name, role, filiere, year, subjects } = req.body;

        // Basic validation
        if (!username || !email || !password || !full_name) {
            res.status(400).json({ error: 'Missing required fields' });
            return;
        }

        // Check if user exists
        const existingUser = await UserModel.findByEmail(email);
        if (existingUser) {
            res.status(400).json({ error: 'Email already in use' });
            return;
        }

        // Hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Create user
        const userId = await UserModel.create({
            username,
            email,
            password: hashedPassword,
            full_name,
            role,
            filiere,
            year,
            subjects
        });

        // Generate token
        const token = jwt.sign({ id: userId, role: role || 'student' }, process.env.JWT_SECRET || 'secret', {
            expiresIn: '7d'
        });

        res.status(201).json({
            token,
            user: { id: userId, username, email, full_name, role, filiere, year, subjects }
        });
    } catch (error) {
        console.error('Register error:', error);
        res.status(500).json({ error: 'Server error' });
    }
};

export const login = async (req: Request, res: Response) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            res.status(400).json({ error: 'Please provide email and password' });
            return;
        }

        const user = await UserModel.findByEmail(email);
        if (!user || !user.password) {
            res.status(401).json({ error: 'Invalid credentials' });
            return;
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            res.status(401).json({ error: 'Invalid credentials' });
            return;
        }

        const token = jwt.sign({ id: user.id, role: user.role }, process.env.JWT_SECRET || 'secret', {
            expiresIn: '7d'
        });

        // Remove password from response
        const { password: _, ...userWithoutPassword } = user;

        res.json({
            token,
            user: userWithoutPassword
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ error: 'Server error' });
    }
};
