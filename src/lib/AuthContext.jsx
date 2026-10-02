'use client';

import React, { createContext, useState, useContext, useEffect } from 'react';
import { authApi } from '@/api/base44Client';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [isLoadingAuth, setIsLoadingAuth] = useState(true);
    const [isLoadingPublicSettings, setIsLoadingPublicSettings] = useState(false);
    const [authError, setAuthError] = useState(null);
    const [authChecked, setAuthChecked] = useState(false);

    useEffect(() => {
        checkUserAuth();
    }, []);

    const checkUserAuth = async () => {
        try {
            setIsLoadingAuth(true);
            setAuthError(null);

            const token = authApi.getToken();
            if (!token) {
                setIsLoadingAuth(false);
                setIsAuthenticated(false);
                setAuthChecked(true);
                return;
            }

            const data = await authApi.me();
            setUser(data.user);
            setIsAuthenticated(true);
            setIsLoadingAuth(false);
            setAuthChecked(true);
        } catch (error) {
            console.error('User auth check failed:', error);
            setIsLoadingAuth(false);
            setIsAuthenticated(false);
            setAuthChecked(true);

            if (error.status === 401 || error.status === 403) {
                authApi.removeToken();
            }
        }
    };

    const logout = async (shouldRedirect = true) => {
        await authApi.logout();
        setUser(null);
        setIsAuthenticated(false);

        if (shouldRedirect && typeof window !== 'undefined') {
            window.location.href = '/login';
        }
    };

    const navigateToLogin = () => {
        if (typeof window !== 'undefined') {
            window.location.href = '/login';
        }
    };

    const checkAppState = checkUserAuth;

    return (
        <AuthContext.Provider value={{
            user,
            isAuthenticated,
            isLoadingAuth,
            isLoadingPublicSettings,
            authError,
            authChecked,
            logout,
            navigateToLogin,
            checkUserAuth,
            checkAppState,
        }}>
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
