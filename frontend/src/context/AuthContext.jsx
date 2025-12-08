
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

    const login = async (email, password) => {
        try {
            const response = await AuthService.login(email, password);
            // Assuming api returns token and maybe user info. 
            // Since it's a mock, we might need to rely on the service to set localStorage
            // In a real app, we'd set state here from response.

            // For now, let's assume successful login via service updates localStorage
            // and we update state manually or reload
            if (response.token) {
                localStorage.setItem('token', response.token);
                // In real app, extracting user from token or response
                const userData = { email, name: response.name || 'User' };
                setUser(userData);
                setIsAuthenticated(true);
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
        <AuthContext.Provider value={{ user, isAuthenticated, loading, login, register, logout }}>
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
