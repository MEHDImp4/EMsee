const express = require('express');
const router = express.Router();
const hashtagController = require('../controllers/hashtag.controller');
const { verifyToken: authenticateToken } = require('../middlewares/authMiddleware');

/**
 * @swagger
 * tags:
 *   name: Hashtags
 *   description: Hashtag management and discovery
 */

/**
 * @swagger
 * /api/hashtags/top:
 *   get:
 *     summary: Get top hashtags by total post count
 *     tags: [Hashtags]
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Number of hashtags to return
 *     responses:
 *       200:
 *         description: List of top hashtags with counts
 */
router.get('/top', hashtagController.getTopHashtags);

/**
 * @swagger
 * /api/hashtags/trending:
 *   get:
 *     summary: Get trending hashtags
 *     tags: [Hashtags]
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Number of hashtags to return
 *       - in: query
 *         name: days
 *         schema:
 *           type: integer
 *           default: 7
 *         description: Time period in days
 *     responses:
 *       200:
 *         description: List of trending hashtags with counts
 */
// Trending with algorithm options: algorithm=weighted|volume|recent, days, halfLifeHours
router.get('/trending', hashtagController.getTrendingHashtags);

/**
 * @swagger
 * /api/hashtags/search:
 *   get:
 *     summary: Search hashtags by name
 *     tags: [Hashtags]
 *     parameters:
 *       - in: query
 *         name: q
 *         required: true
 *         schema:
 *           type: string
 *         description: Search query
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *     responses:
 *       200:
 *         description: List of matching hashtags
 */
router.get('/search', hashtagController.searchHashtags);

/**
 * @swagger
 * /api/hashtags/{name}/posts:
 *   get:
 *     summary: Get posts by hashtag
 *     tags: [Hashtags]
 *     parameters:
 *       - in: path
 *         name: name
 *         required: true
 *         schema:
 *           type: string
 *         description: Hashtag name (without #)
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 20
 *     responses:
 *       200:
 *         description: Paginated list of posts
 *       404:
 *         description: Hashtag not found
 */
router.get('/:name/posts', hashtagController.getPostsByHashtag);



module.exports = router;
