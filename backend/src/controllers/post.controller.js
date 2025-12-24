const postService = require('../services/post.service');
const asyncHandler = require('../middlewares/asyncHandler');
const { getIo } = require('../services/socketService');

/**
 * Creates a new post.
 */
const createPost = asyncHandler(async (req, res) => {
    const { content, replyPermission, media, poll } = req.body;
    const userId = req.user.id;

    const post = await postService.createPost(userId, content, replyPermission, media, poll);

    // Emit real-time event
    try {
        getIo().emit('new_post', post);
    } catch (error) {
        console.error('Socket emission failed:', error);
    }

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
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 20;

        const result = await postService.getClassPosts(currentUserId, page, limit);
        res.json(result);
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

        // Increment view count (async, don't wait)
        postService.incrementPostViews(postId, userId).catch(err =>
            console.error('Error incrementing views:', err)
        );

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





const getPostById = async (req, res) => {
    try {
        const postId = parseInt(req.params.id);
        const currentUserId = req.user?.id;

        const post = await postService.getPostById(postId, currentUserId);

        if (!post) {
            return res.status(404).json({ error: 'Post not found' });
        }

        // Increment view count (async, don't wait)
        if (currentUserId) {
            postService.incrementPostViews(postId, currentUserId).catch(err =>
                console.error('Error incrementing views:', err)
            );
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
        const type = req.query.type || 'all';

        const posts = await postService.getUserTimeline(username, currentUserId, limit, offset, type);

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

const incrementViews = async (req, res) => {
    try {
        const postId = parseInt(req.params.id);
        const userId = req.user?.id;
        await postService.incrementPostViews(postId, userId);
        res.json({ success: true });
    } catch (error) {
        console.error('Error incrementing views:', error);
        res.status(500).json({ error: 'Server error' });
    }
};

const votePoll = async (req, res) => {
    try {
        const postId = parseInt(req.params.id);
        const { optionId } = req.body;
        const userId = req.user.id;

        await postService.votePoll(postId, userId, optionId);

        // Return updated poll data (re-using getPostById logic simplified, or just success).
        // Best to return the updated post structure to update UI.
        const updatedPost = await postService.getPostById(postId, userId);

        // Emit update via socket
        try {
            getIo().emit('post_updated', updatedPost); // Check if frontend listens to this or 'new_post' or separate event
        } catch (err) {
            console.error(err);
        }

        res.json(updatedPost);
    } catch (error) {
        if (error.status) {
            return res.status(error.status).json({ error: error.message });
        }
        console.error('Error voting:', error);
        res.status(500).json({ error: 'Server error' });
    }
};

const toggleBookmark = async (req, res) => {
    try {
        const postId = parseInt(req.params.id);
        const userId = req.user.id;

        const result = await postService.toggleBookmark(postId, userId);
        return res.json(result);
    } catch (error) {
        console.error('Error toggling bookmark:', error);
        res.status(500).json({ error: 'Server error' });
    }
};

const getBookmarkedPosts = async (req, res) => {
    try {
        const currentUserId = req.user.id;
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 20;

        const result = await postService.getBookmarkedPosts(currentUserId, page, limit);
        res.json(result);
    } catch (error) {
        console.error('Error fetching bookmarks:', error);
        res.status(500).json({ error: 'Server error' });
    }
};

module.exports = {
    createPost,
    getAllPosts,
    likePost,
    repostPost,

    getUserPosts,
    deletePost,
    getPostById,
    getClassPosts,
    incrementViews,
    votePoll,
    toggleBookmark,
    getBookmarkedPosts
};
