const bcrypt = require('bcrypt');
const { UserModel } = require('../../models/UserModel');
const asyncHandler = require('../../middlewares/asyncHandler');

const changePassword = asyncHandler(async (req, res) => {
    const userId = req.user.id;
    const { currentPassword, newPassword } = req.body;

    const user = await UserModel.findById(userId);
    if (!user || !user.password) {
        res.status(404);
        throw new Error('User not found');
    }

    const isCurrentValid = await bcrypt.compare(currentPassword, user.password);
    if (!isCurrentValid) {
        res.status(400);
        throw new Error('Current password is incorrect');
    }

    const isSameAsOld = await bcrypt.compare(newPassword, user.password);
    if (isSameAsOld) {
        res.status(400);
        throw new Error('New password must be different from current password');
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    await UserModel.update(userId, { password: hashedPassword });

    res.json({ message: 'Password updated successfully' });
});

module.exports = { changePassword };
