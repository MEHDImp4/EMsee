const express = require('express');
const router = express.Router();
const messageController = require('../controllers/message.controller');
const { verifyToken } = require('../middlewares/authMiddleware');
const validateRequest = require('../middlewares/validateRequest');
const {
  createConversationSchema,
  sendMessageSchema,
  getMessagesSchema
} = require('../validators/message.schema');
const upload = require('../config/multer');

/**
 * @swagger
 * tags:
 *   name: Messages
 *   description: Direct messaging between users
 */

/**
 * @swagger
 * /api/messages/conversations:
 *   get:
 *     summary: Get all conversations for current user
 *     tags: [Messages]
 *     security:
 *       - bearerAuth: []
 *     parameters:
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
 *         description: List of conversations
 */
router.get('/conversations', verifyToken, messageController.getConversations);

/**
 * @swagger
 * /api/messages/conversations:
 *   post:
 *     summary: Create or get conversation with a user
 *     tags: [Messages]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               recipientId:
 *                 type: integer
 *     responses:
 *       200:
 *         description: Conversation created or retrieved
 */
router.post(
  '/conversations',
  verifyToken,
  validateRequest(createConversationSchema),
  messageController.createConversation
);

/**
 * @swagger
 * /api/messages/conversations/{id}:
 *   get:
 *     summary: Get conversation by ID
 *     tags: [Messages]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Conversation details
 */
router.get('/conversations/:id', verifyToken, messageController.getConversation);

/**
 * @swagger
 * /api/messages/conversations/{id}/messages:
 *   get:
 *     summary: Get messages in a conversation
 *     tags: [Messages]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 50
 *     responses:
 *       200:
 *         description: List of messages
 */
router.get(
  '/conversations/:id/messages',
  verifyToken,
  validateRequest(getMessagesSchema),
  messageController.getMessages
);

/**
 * @swagger
 * /api/messages/conversations/{id}/messages:
 *   post:
 *     summary: Send message in a conversation
 *     tags: [Messages]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
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
 *               content:
 *                 type: string
 *     responses:
 *       201:
 *         description: Message sent
 */
router.post(
  '/conversations/:id/messages',
  verifyToken,
  upload.single('image'),
  validateRequest(sendMessageSchema),
  messageController.sendMessage
);

/**
 * @swagger
 * /api/messages/conversations/{id}/read:
 *   patch:
 *     summary: Mark conversation as read
 *     tags: [Messages]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Conversation marked as read
 */
router.patch('/conversations/:id/read', verifyToken, messageController.markAsRead);

module.exports = router;
