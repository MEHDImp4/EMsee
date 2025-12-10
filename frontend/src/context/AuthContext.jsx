
import React, { createContext, useContext, useState, useEffect } from 'react';
import AuthService from '../services/auth.service';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const checkAuth = () => {
            if (AuthService.isAuthenticated()) {
                const currentUser = AuthService.getCurrentUser();
                setUser(currentUser);
                setIsAuthenticated(true);
            }
            setLoading(false);
        };
        checkAuth();
    }, []);

    const loginAction = (user, token) => {
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(user));

        setUser(user);
        setIsAuthenticated(true);
    };

    const login = async (email, password) => {
        try {
            const response = await AuthService.login(email, password);
            if (response.token) {
                // Use the new action to update state
                const userData = { ...response.user, email }; // Ensure user object is complete
                loginAction(userData, response.token);
                return true;
            }
            return false;
        } catch (error) {
            console.error("Login failed", error);
            throw error;
        }
    };

    const register = async (userData) => {
        try {
            await AuthService.register(userData);
            // Auto login after register? Or redirect?
            // For this mock flow, let's assume register doesn't auto-login or returns token
            return true;
        } catch (error) {
            throw error;
        }
    };

    const logout = () => {
        AuthService.logout();
        setUser(null);
        setIsAuthenticated(false);
    };

    return (
        <AuthContext.Provider value={{ user, isAuthenticated, loading, login, loginAction, register, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
