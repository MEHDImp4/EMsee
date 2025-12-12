const express = require('express');
const router = express.Router();
const { verifyToken: authenticateToken } = require('../middlewares/authMiddleware');
const commentController = require('../controllers/comment.controller');

router.use(authenticateToken);

router.post('/:id/like', commentController.toggleLike);
router.post('/:id/repost', commentController.toggleRepost);
router.post('/:id/save', commentController.toggleSave);
router.post('/:id/reply', commentController.replyToComment);
router.get('/:id/replies', commentController.getCommentReplies);

module.exports = router;
