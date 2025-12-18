import api from './api';

const PostService = {
    getAllPosts: async (page = 1, limit = 20) => {
        try {
            const response = await api.get(`/posts?page=${page}&limit=${limit}`);
            return response;
        } catch (error) {
            console.error('Error fetching posts:', error);
            throw error;
        }
    },

    getClassPosts: async () => {
        try {
            const response = await api.get('/posts/class');
            return response;
        } catch (error) {
            console.error('Error fetching class posts:', error);
            throw error;
        }
    },

    getPostById: async (postId) => {
        try {
            const response = await api.get(`/posts/${postId}`);
            return response;
        } catch (error) {
            console.error('Error fetching post:', error);
            throw error;
        }
    },

    createPost: async (content, replyPermission = 'EVERYONE', media = null, poll = null) => {
        try {
            const payload = { content, replyPermission };

            if (media && media.length > 0) {
                payload.media = media;
            }

            if (poll) {
                payload.poll = poll;
            }

            const response = await api.post('/posts', payload);
            return response;
        } catch (error) {
            console.error('Error creating post:', error);
            throw error;
        }
    },

    likePost: async (postId) => {
        try {
            const response = await api.post(`/posts/${postId}/like`);
            return response;
        } catch (error) {
            console.error('Error liking post:', error);
            throw error;
        }
    },

    repostPost: async (postId) => {
        try {
            const response = await api.post(`/posts/${postId}/repost`);
            return response;
        } catch (error) {
            console.error('Error reposting:', error);
            throw error;
        }
    },

    commentPost: async (postId, content) => {
        try {
            const response = await api.post(`/posts/${postId}/comment`, { content });
            return response;
        } catch (error) {
            console.error('Error commenting:', error);
            throw error;
        }
    },

    getComments: async (postId, page = 1, limit = 20) => {
        try {
            const response = await api.get(`/posts/${postId}/comments?page=${page}&limit=${limit}`);
            return response;
        } catch (error) {
            console.error('Error fetching comments:', error);
            throw error;
        }
    },

    getUserPosts: async (username) => {
        try {
            const response = await api.get(`/posts/user/${username}`);
            return response;
        } catch (error) {
            console.error('Error fetching user posts:', error);
            throw error;
        }
    },

    deletePost: async (postId) => {
        try {
            const response = await api.delete(`/posts/${postId}`);
            return response;
        } catch (error) {
            console.error('Error deleting post:', error);
            throw error;
        }
    },

    votePoll: async (postId, optionId) => {
        try {
            const response = await api.post(`/posts/${postId}/vote`, { optionId });
            return response;
        } catch (error) {
            console.error('Error voting on poll:', error);
            throw error;
        }
    },

    incrementViews: async (postId) => {
        try {
            await api.post(`/posts/${postId}/view`);
        } catch (error) {
            // Silent fail - views are non-critical
            console.error('Error incrementing views:', error);
        }
    }
};

export default PostService;
