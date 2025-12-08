
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
        localStorage.removeItem('userEmail');
        localStorage.removeItem('userName');
        localStorage.removeItem('userHandle');
        localStorage.removeItem('firstVisit');
        localStorage.removeItem('professorSubjects');
    },

    /**
     * Get current user info (from token or local storage for now)
     */
    getCurrentUser: () => {
        return {
            email: localStorage.getItem('userEmail'),
            name: localStorage.getItem('userName'),
            handle: localStorage.getItem('userHandle'),
        };
    },

    isAuthenticated: () => {
        return !!localStorage.getItem('token');
    }
};

export default AuthService;
