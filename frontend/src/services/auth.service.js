
import api from './api';

const AuthService = {
    /**
     * Login user
     * @param {string} email 
     * @param {string} password 
     */
    login: async (email, password) => {
        return await api.post('/auth/login', { email, password });
    },

    /**
     * Register new user
     * @param {object} userData 
     */
    register: async (userData) => {
        return await api.post('/auth/register', userData);
    },

    /**
     * Check availability of username/email
     * @param {object} payload { username } or { email }
     */
    checkAvailability: async (payload) => {
        return await api.post('/auth/check-availability', payload);
    },

    changePassword: async ({ currentPassword, newPassword, confirmPassword }) => {
        return await api.post('/auth/change-password', {
            currentPassword,
            newPassword,
            confirmPassword
        });
    },

    /**
     * Logout user
     */
    logout: () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user'); // Remove full user object
    },

    /**
     * Get current user info (from local storage)
     */
    getCurrentUser: () => {
        const userStr = localStorage.getItem('user');
        if (userStr) return JSON.parse(userStr);
        return null;
    },

    isAuthenticated: () => {
        return !!localStorage.getItem('token');
    }
};

export default AuthService;
