const express = require('express');
const router = express.Router();
const postController = require('../controllers/post.controller');
const commentController = require('../controllers/comment.controller');
const { verifyToken: authenticateToken } = require('../middlewares/authMiddleware');
const { createPostSchema } = require('../validators/post.schema');
const validateRequest = require('../middlewares/validateRequest');

/**
 * @swagger
 * tags:
 *   name: Posts
 *   description: Post management
 */

// All routes require authentication
router.use(authenticateToken);

/**
 * @swagger
 * /api/posts:
 *   post:
 *     summary: Create a new post
 *     tags: [Posts]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - content
 *             properties:
 *               content:
 *                 type: string
 *               mediaUrl:
 *                 type: string
 *     responses:
 *       201:
 *         description: Post created
 *   get:
 *     summary: Get all posts
 *     tags: [Posts]
 *     responses:
 *       200:
 *         description: List of posts
 */
router.post('/', validateRequest(createPostSchema), postController.createPost);
router.get('/', postController.getAllPosts);
router.post('/:id/view', postController.incrementViews);

/**
 * @swagger
 * /api/posts/class:
 *   get:
 *     summary: Get class posts
 *     tags: [Posts]
 *     responses:
 *       200:
 *         description: List of class posts
 */
router.get('/class', postController.getClassPosts);

/**
 * @swagger
 * /api/posts/{id}/like:
 *   post:
 *     summary: Like a post
 *     tags: [Posts]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Post liked/unliked
 */
router.post('/:id/like', postController.likePost);

/**
 * @swagger
 * /api/posts/{id}/vote:
 *   post:
 *     summary: Vote on a poll
 *     tags: [Posts]
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
 *             required:
 *               - optionId
 *             properties:
 *               optionId:
 *                 type: integer
 *     responses:
 *       200:
 *         description: Vote recorded
 */
router.post('/:id/vote', postController.votePoll);

/**
 * @swagger
 * /api/posts/{id}/repost:
 *   post:
 *     summary: Repost a post
 *     tags: [Posts]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Post reposted
 */
router.post('/:id/repost', postController.repostPost);

/**
 * @swagger
 * /api/posts/{id}/comment:
 *   post:
 *     summary: Comment on a post
 *     tags: [Posts]
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
 *         description: Comment created
 */
router.post('/:id/comment', postController.commentPost);

/**
 * @swagger
 * /api/posts/{id}:
 *   delete:
 *     summary: Delete a post
 *     tags: [Posts]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Post deleted
 */
router.delete('/:id', postController.deletePost);

/**
 * @swagger
 * /api/posts/{id}/comments:
 *   get:
 *     summary: Get comments for a post
 *     tags: [Posts]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: List of comments
 */
router.get('/:id/comments', postController.getPostComments);

/**
 * @swagger
 * /api/posts/user/{username}:
 *   get:
 *     summary: Get user posts
 *     tags: [Posts]
 *     parameters:
 *       - in: path
 *         name: username
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: List of user posts
 */
router.get('/user/:username', postController.getUserPosts);

router.get('/comments/:id/path', commentController.getCommentPath);
router.get('/comments/:id', commentController.getCommentById);

/**
 * @swagger
 * /api/posts/{id}:
 *   get:
 *     summary: Get a post by ID
 *     tags: [Posts]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Post details
 *       404:
 *         description: Post not found
 */
router.get('/:id', postController.getPostById);

module.exports = router;
