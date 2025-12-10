
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

        // Check if user exists (email)
        const existingEmail = await UserModel.findByEmail(email);
        if (existingEmail) {
            res.status(400).json({ error: 'Email already in use' });
            return;
        }

        // Check if user exists (username)
        const existingUsername = await UserModel.findByUsername(username);
        if (existingUsername) {
            res.status(400).json({ error: 'Username already in use' });
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

export const checkAvailability = async (req: Request, res: Response) => {
    try {
        const { email, username } = req.body;

        if (email) {
            const user = await UserModel.findByEmail(email);
            if (user) {
                res.status(400).json({ error: 'Email already in use', field: 'email' });
                return;
            }
        }

        if (username) {
            const user = await UserModel.findByUsername(username);
            if (user) {
                res.status(400).json({ error: 'Username already in use', field: 'username' });
                return;
            }
        }

        res.json({ available: true });
    } catch (error) {
        console.error('Check availability error:', error);
        res.status(500).json({ error: 'Server error' });
    }
};

export const updateProfile = async (req: any, res: Response) => {
    try {
        const userId = req.user.id;
        const { full_name, bio, location, filiere, year } = req.body;
        const updates: Partial<User> = {};

        if (full_name) updates.full_name = full_name;
        if (bio) updates.bio = bio;
        if (location) updates.location = location;
        if (filiere) updates.filiere = filiere;
        if (year) updates.year = year;

        if (req.file) {
            // Normalize path to use forward slashes for URLs
            updates.avatar = `/uploads/${req.file.filename}`;
        }

        await UserModel.update(userId, updates);

        const updatedUser = await UserModel.findById(userId);
        if (updatedUser) {
            const { password, ...userWithoutPassword } = updatedUser;
            res.json(userWithoutPassword);
        } else {
            res.status(404).json({ error: 'User not found' });
        }

    } catch (error) {
        console.error('Update profile error:', error);
        res.status(500).json({ error: 'Server error' });
    }
};
