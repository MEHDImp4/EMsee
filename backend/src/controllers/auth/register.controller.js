const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { UserModel } = require('../../models/UserModel');

const register = async (req, res) => {
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

module.exports = { register };
