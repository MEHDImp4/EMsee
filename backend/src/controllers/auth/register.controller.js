const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { UserModel } = require('../../models/UserModel');
const asyncHandler = require('../../middlewares/asyncHandler');

const register = asyncHandler(async (req, res) => {
    const { username, email: rawEmail, password, full_name, role, filiere, year, studentClass, subjects } = req.body;
    const email = rawEmail?.toLowerCase();

    // Check if user exists (email)
    const existingEmail = await UserModel.findByEmail(email);
    if (existingEmail) {
        res.status(400);
        throw new Error('Email already in use');
    }

    // Check if user exists (username)
    const existingUsername = await UserModel.findByUsername(username);
    if (existingUsername) {
        res.status(400);
        throw new Error('Username already in use');
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
        studentClass,
        subjects,
        location: 'Rabat, Maroc'
    });

    // Generate token
    const token = jwt.sign({ id: userId, role: role || 'student' }, process.env.JWT_SECRET, {
        expiresIn: '7d'
    });

    res.status(201).json({
        token,
        user: { id: userId, username, email, full_name, role, filiere, year, studentClass, subjects }
    });
});

module.exports = { register };
