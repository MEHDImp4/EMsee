const { UserModel } = require('../../models/UserModel');

const checkAvailability = async (req, res) => {
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

module.exports = { checkAvailability };
