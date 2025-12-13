const express = require('express');
const router = express.Router();
const { verifyToken: authenticateToken } = require('../middlewares/authMiddleware');
const commentController = require('../controllers/comment.controller');

/**
 * @swagger
 * tags:
 *   name: Comments
 *   description: Comment management
 */

router.use(authenticateToken);

/**
 * @swagger
 * /api/comments/{id}/like:
 *   post:
 *     summary: Like/Unlike a comment
 *     tags: [Comments]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Comment liked/unliked
 */
router.post('/:id/like', commentController.toggleLike);

/**
 * @swagger
 * /api/comments/{id}/repost:
 *   post:
 *     summary: Repost a comment
 *     tags: [Comments]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Comment reposted
 */
router.post('/:id/repost', commentController.toggleRepost);

/**
 * @swagger
 * /api/comments/{id}/save:
 *   post:
 *     summary: Save/Unsave a comment
 *     tags: [Comments]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Comment saved/unsaved
 */
router.post('/:id/save', commentController.toggleSave);

/**
 * @swagger
 * /api/comments/{id}/reply:
 *   post:
 *     summary: Reply to a comment
 *     tags: [Comments]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               content:
 *                 type: string
 *     responses:
 *       201:
 *         description: Reply created
 */
router.post('/:id/reply', commentController.replyToComment);

/**
 * @swagger
 * /api/comments/{id}/replies:
 *   get:
 *     summary: Get replies for a comment
 *     tags: [Comments]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: List of replies
 */
router.get('/:id/replies', commentController.getCommentReplies);

module.exports = router;
