const express = require('express');
const router = express.Router();
const userController = require('../controllers/user.controller');
const { verifyToken: authenticateToken } = require('../middlewares/authMiddleware');

/**
 * @swagger
 * tags:
 *   name: Users
 *   description: User management
 */

// Public profile does not technically need auth, but we might want to know *who* is viewing (for isOwner check)
// So we use auth middleware but maybe flexible? For now strict auth is fine as app is protected.

/**
 * @swagger
 * /api/users/search:
 *   get:
 *     summary: Search users
 *     tags: [Users]
 *     parameters:
 *       - in: query
 *         name: q
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: List of users matching query
 */
router.get('/search', authenticateToken, userController.searchUsers);

/**
 * @swagger
 * /api/users/suggestions:
 *   get:
 *     summary: Get user suggestions
 *     tags: [Users]
 *     responses:
 *       200:
 *         description: List of suggested users
 */
router.get('/suggestions', authenticateToken, userController.getSuggestions);

/**
 * @swagger
 * /api/users/{username}:
 *   get:
 *     summary: Get user profile
 *     tags: [Users]
 *     parameters:
 *       - in: path
 *         name: username
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: User profile
 *       404:
 *         description: User not found
 */
router.get('/:username', authenticateToken, userController.getProfile);

/**
 * @swagger
 * /api/users/{id}/follow:
 *   post:
 *     summary: Follow/Unfollow user
 *     tags: [Users]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Follow status updated
 */
router.post('/:id/follow', authenticateToken, userController.followUser);

module.exports = router;
