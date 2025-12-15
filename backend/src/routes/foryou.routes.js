const express = require('express');
const router = express.Router();
const foryouController = require('../controllers/foryou.controller');
const { verifyToken: authenticateToken } = require('../middlewares/authMiddleware');

/**
 * @swagger
 * tags:
 *   name: ForYou
 *   description: Personalized recommendations
 */

/**
 * @swagger
 * /api/for-you/hashtags:
 *   get:
 *     summary: Get personalized hashtag recommendations
 *     tags: [ForYou]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *       - in: query
 *         name: days
 *         schema:
 *           type: integer
 *           default: 7
 *     responses:
 *       200:
 *         description: Personalized hashtag list with scores
 *       401:
 *         description: Authentication required
 */
router.get('/hashtags', authenticateToken, foryouController.getForYouHashtags);

module.exports = router;
