
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
    }
};

export default UserService;
