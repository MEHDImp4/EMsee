const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { UserModel } = require('../../models/UserModel');
const asyncHandler = require('../../middlewares/asyncHandler');

const login = asyncHandler(async (req, res) => {
    const { email, password } = req.body;

    const user = await UserModel.findByEmail(email);
    if (!user || !user.password) {
        res.status(401);
        throw new Error('Invalid credentials');
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
        res.status(401);
        throw new Error('Invalid credentials');
    }

    const token = jwt.sign({ id: user.id, role: user.role }, process.env.JWT_SECRET, {
        expiresIn: '7d'
    });

    // Remove password from response
    const { password: _, ...userWithoutPassword } = user;

    res.json({
        token,
        user: userWithoutPassword
    });
});

module.exports = { login };
