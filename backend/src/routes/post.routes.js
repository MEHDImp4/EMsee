const express = require('express');
const router = express.Router();
const postController = require('../controllers/post.controller');
const { verifyToken: authenticateToken } = require('../middlewares/authMiddleware');

// All routes require authentication
router.use(authenticateToken);

router.post('/', postController.createPost);
router.get('/', postController.getAllPosts);
router.post('/:id/like', postController.likePost);
router.post('/:id/repost', postController.repostPost);
router.post('/:id/comment', postController.commentPost);
router.delete('/:id', postController.deletePost);
router.get('/:id/comments', postController.getPostComments);
router.get('/user/:username', postController.getUserPosts);
router.get('/comments/:id/path', postController.getCommentPath);
router.get('/comments/:id', postController.getCommentById);
router.get('/:id', postController.getPostById);

module.exports = router;
