
import api from './api';

const UserService = {
    /**
     * Get user profile
     */
    getProfile: async () => {
        return await api.get('/users/profile');
    },

    /**
     * Update user profile
     * @param {object} data 
     */
    updateProfile: async (data) => {
        return await api.put('/users/profile', data);
    },

    /**
     * Get public profile by handle
     * @param {string} handle 
     */
    getUserByHandle: async (handle) => {
        return await api.get(`/users/${handle}`);
    },

    searchUsers: async (query, page = 1, limit = 10) => {
        return await api.get(`/users/search?q=${encodeURIComponent(query)}&page=${page}&limit=${limit}`);
    },

    getRecentUsers: async (limit = 10, page = 1) => {
        return await api.get(`/users/recent?limit=${limit}&page=${page}`);
    },

    getSuggestions: async (limit = 3, page = 1) => {
        return await api.get(`/users/suggestions?limit=${limit}&page=${page}`);
    },

    followUser: async (userId) => {
        return await api.post(`/users/${userId}/follow`);
    }
};

export default UserService;
