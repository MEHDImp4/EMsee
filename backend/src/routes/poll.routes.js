const express = require('express');
const router = express.Router();
const pollController = require('../controllers/poll.controller');
const { verifyToken: authenticateToken } = require('../middlewares/authMiddleware');

/**
 * @swagger
 * tags:
 *   name: Polls
 *   description: Poll management and voting
 */

/**
 * @swagger
 * /api/polls/{pollId}/vote:
 *   post:
 *     summary: Vote on a poll
 *     tags: [Polls]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: pollId
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               optionId:
 *                 type: integer
 *     responses:
 *       200:
 *         description: Vote recorded successfully
 *       400:
 *         description: Poll has ended or invalid option
 *       404:
 *         description: Poll not found
 */
router.post('/:pollId/vote', authenticateToken, pollController.votePoll);

/**
 * @swagger
 * /api/polls/{pollId}:
 *   get:
 *     summary: Get poll results
 *     tags: [Polls]
 *     parameters:
 *       - in: path
 *         name: pollId
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Poll results
 *       404:
 *         description: Poll not found
 */
router.get('/:pollId', pollController.getPollResults);

module.exports = router;
