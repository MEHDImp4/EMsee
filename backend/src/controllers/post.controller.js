const postService = require('../services/post.service');
const asyncHandler = require('../middlewares/asyncHandler');
const { getIo } = require('../services/socketService');

/**
 * Creates a new post.
 */
const createPost = asyncHandler(async (req, res) => {
    const { content, replyPermission } = req.body;
    const userId = req.user.id;

    const post = await postService.createPost(userId, content, replyPermission);

    res.status(201).json(post);
});

/**
 * Retrieves all posts with optional pagination.
 */
const getAllPosts = async (req, res) => {
    try {
        const currentUserId = req.user?.id;
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 20;

        const result = await postService.getAllPosts(currentUserId, page, limit);

        res.json(result);
    } catch (error) {
        console.error('Error fetching posts:', error);
        res.status(500).json({ error: 'Server error' });
    }
};

const getClassPosts = async (req, res) => {
    try {
        const currentUserId = req.user.id;
        const posts = await postService.getClassPosts(currentUserId);
        res.json(posts);
    } catch (error) {
        console.error('Error fetching class posts:', error);
        res.status(500).json({ error: 'Server error' });
    }
};

const likePost = async (req, res) => {
    try {
        const postId = parseInt(req.params.id);
        const userId = req.user.id;

        const result = await postService.toggleLikePost(postId, userId);
        return res.json(result);
    } catch (error) {
        console.error('Error liking post:', error);
        res.status(500).json({ error: 'Server error' });
    }
};

const repostPost = async (req, res) => {
    try {
        const postId = parseInt(req.params.id);
        const userId = req.user.id;

        const result = await postService.toggleRepostPost(postId, userId);
        return res.json(result);
    } catch (error) {
        console.error('Error reposting:', error);
        res.status(500).json({ error: 'Server error' });
    }
};

const commentPost = async (req, res) => {
    try {
        const postId = parseInt(req.params.id);
        const userId = req.user.id;
        const { content } = req.body;

        if (!content) return res.status(400).json({ error: 'Content required' });

        const comment = await postService.createComment(postId, userId, content);

        try {
            getIo().emit('new_comment', comment);
        } catch (socketError) {
            console.error('Socket emission failed:', socketError);
        }

        res.status(201).json(comment);
    } catch (error) {
        if (error.status) {
            return res.status(error.status).json({ error: error.message });
        }
        console.error('Error commenting:', error);
        res.status(500).json({ error: 'Server error' });
    }
};

const getPostComments = async (req, res) => {
    try {
        const postId = parseInt(req.params.id);
        const currentUserId = req.user?.id;
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 20;

        const result = await postService.getPostComments(postId, currentUserId, page, limit);

        res.json(result);
    } catch (error) {
        console.error('Error fetching comments:', error);
        res.status(500).json({ error: 'Server error' });
    }
};

const getPostById = async (req, res) => {
    try {
        const postId = parseInt(req.params.id);
        const currentUserId = req.user?.id;

        const post = await postService.getPostById(postId, currentUserId);

        if (!post) {
            return res.status(404).json({ error: 'Post not found' });
        }

        res.json(post);
    } catch (error) {
        console.error('Error fetching post:', error);
        res.status(500).json({ error: 'Server error' });
    }
};

const getUserPosts = async (req, res) => {
    try {
        const username = req.params.username;
        const currentUserId = req.user?.id;
        const limit = parseInt(req.query.limit) || 20;
        const offset = parseInt(req.query.offset) || 0;

        const posts = await postService.getUserTimeline(username, currentUserId, limit, offset);

        res.json(posts);
    } catch (error) {
        if (error.status) {
            return res.status(error.status).json({ error: error.message });
        }
        console.error('Error fetching user posts:', error);
        res.status(500).json({ error: 'Server error' });
    }
};

const deletePost = async (req, res) => {
    try {
        const postId = parseInt(req.params.id);
        const userId = req.user.id;

        const result = await postService.deletePost(postId, userId);

        res.json(result);
    } catch (error) {
        if (error.status) {
            return res.status(error.status).json({ error: error.message });
        }
        console.error('Error deleting post:', error);
        res.status(500).json({ error: 'Server error' });
    }
};

module.exports = {
    createPost,
    getAllPosts,
    likePost,
    repostPost,
    commentPost,
    getPostComments,
    getUserPosts,
    deletePost,
    getPostById,
    getClassPosts
};
