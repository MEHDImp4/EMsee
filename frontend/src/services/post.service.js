
import api from './api';

const PostService = {
    /**
     * Get feed posts
     * @param {number} page 
     * @param {number} limit 
     */
    getFeed: async (page = 1, limit = 10) => {
        return await api.get(`/posts?page=${page}&limit=${limit}`);
    },

    /**
     * Create a new post
     * @param {string} content 
     * @param {string} type 
     */
    createPost: async (content, type = 'text') => {
        return await api.post('/posts', { content, type });
    },

    /**
     * Like a post
     * @param {string} postId 
     */
    likePost: async (postId) => {
        return await api.post(`/posts/${postId}/like`);
    },

    /**
     * Reply to a post
     * @param {string} postId 
     * @param {string} content 
     */
    replyToPost: async (postId, content) => {
        return await api.post(`/posts/${postId}/reply`, { content });
    }
};

export default PostService;
