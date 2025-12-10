const express = require('express');
const router = express.Router();
const userController = require('../controllers/user.controller');
const { verifyToken: authenticateToken } = require('../middlewares/authMiddleware');

// Public profile does not technically need auth, but we might want to know *who* is viewing (for isOwner check)
// So we use auth middleware but maybe flexible? For now strict auth is fine as app is protected.
router.get('/search', authenticateToken, userController.searchUsers);
router.get('/suggestions', authenticateToken, userController.getSuggestions);
router.get('/:username', authenticateToken, userController.getProfile);

module.exports = router;
