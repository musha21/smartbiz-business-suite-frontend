import React, { createContext, useContext, useState, useEffect } from 'react';
import { isTokenExpired } from '../utils/auth';

const AuthContext = createContext(undefined);

export const AuthProvider = ({ children }) => {
    const [state, setState] = useState({
        user: null,
        business: null,
        token: null,
        isAuthenticated: false,
        isLoading: true,
    });

    useEffect(() => {
        const initializeAuth = () => {
            const token = localStorage.getItem('token');
            const storedUser = localStorage.getItem('user');
            const storedBusiness = localStorage.getItem('business');

            if (token && storedUser) {
                // Validate token expiration
                if (isTokenExpired(token)) {
                    console.log('Session expired. Logging out.');
                    logout();
                    return;
                }

                try {
                    setState({
                        token,
                        user: JSON.parse(storedUser),
                        business: storedBusiness ? JSON.parse(storedBusiness) : null,
                        isAuthenticated: true,
                        isLoading: false,
                    });
                } catch (e) {
                    console.error('Auth state corrupted:', e);
                    logout();
                }
            } else {
                setState(prev => ({ ...prev, isLoading: false }));
            }
        };

        initializeAuth();
    }, []);

    const login = (data) => {
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        if (data.business) {
            localStorage.setItem('business', JSON.stringify(data.business));
        }
        setState({
            token: data.token,
            user: data.user,
            business: data.business || null,
            isAuthenticated: true,
            isLoading: false,
        });
    };

    const logout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        localStorage.removeItem('business');
        setState({
            token: null,
            user: null,
            business: null,
            isAuthenticated: false,
            isLoading: false,
        });
    };

    return (
        <AuthContext.Provider value={{ ...state, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
