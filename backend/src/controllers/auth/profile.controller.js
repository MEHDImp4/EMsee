const { UserModel } = require('../../models/UserModel');

const updateProfile = async (req, res) => {
    try {
        const userId = req.user.id;
        const { full_name, bio, location, filiere, year } = req.body;
        const updates = {};

        if (full_name) updates.full_name = full_name;
        if (bio) updates.bio = bio;
        if (location) updates.location = location;
        if (filiere) updates.filiere = filiere;
        if (year) updates.year = year;

        if (req.files) {
            if (req.files.avatar) {
                updates.avatar = `/uploads/${req.files.avatar[0].filename}`;
            }
            if (req.files.banner) {
                updates.banner = `/uploads/${req.files.banner[0].filename}`;
            }
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

module.exports = { updateProfile };
