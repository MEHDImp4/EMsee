
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
