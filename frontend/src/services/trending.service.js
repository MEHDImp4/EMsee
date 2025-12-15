import api from './api';

const TrendingService = {
    /**
     * Get trending posts based on engagement
     */
    getTrendingPosts: async (limit = 10, days = 7) => {
        const response = await api.get(`/trending/posts?limit=${limit}&days=${days}`);
        return response;
    },

    /**
     * Get trending topics/hashtags
     */
    getTrendingTopics: async (limit = 10, days = 7) => {
        const response = await api.get(`/trending/topics?limit=${limit}&days=${days}`);
        return response;
    }
};

export default TrendingService;
