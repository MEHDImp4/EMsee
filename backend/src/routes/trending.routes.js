const express = require('express');
const router = express.Router();
const trendingController = require('../controllers/trending.controller');
const { verifyToken: authenticateToken } = require('../middlewares/authMiddleware');

/**
 * @swagger
 * tags:
 *   name: Trending
 *   description: Trending posts and topics
 */

/**
 * @swagger
 * /api/trending/posts:
 *   get:
 *     summary: Get trending posts based on engagement
 *     tags: [Trending]
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Number of posts to return
 *       - in: query
 *         name: days
 *         schema:
 *           type: integer
 *           default: 7
 *         description: Time period in days
 *     responses:
 *       200:
 *         description: List of trending posts
 */
router.get('/posts', authenticateToken, trendingController.getTrendingPosts);

/**
 * @swagger
 * /api/trending/topics:
 *   get:
 *     summary: Get trending topics/hashtags
 *     tags: [Trending]
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Number of topics to return
 *       - in: query
 *         name: days
 *         schema:
 *           type: integer
 *           default: 7
 *         description: Time period in days
 *     responses:
 *       200:
 *         description: List of trending topics with engagement metrics
 */
router.get('/topics', authenticateToken, trendingController.getTrendingTopics);

module.exports = router;
