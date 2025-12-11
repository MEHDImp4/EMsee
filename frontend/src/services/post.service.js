import api from './api';

const PostService = {
    getAllPosts: async () => {
        try {
            const response = await api.get('/posts');
            return response;
        } catch (error) {
            console.error('Error fetching posts:', error);
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

    createPost: async (content, replyPermission = 'EVERYONE') => {
        try {
            const response = await api.post('/posts', { content, replyPermission });
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

    getComments: async (postId) => {
        try {
            const response = await api.get(`/posts/${postId}/comments`);
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
    }
};

export default PostService;
