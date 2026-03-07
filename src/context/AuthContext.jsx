import React, { createContext, useContext, useState, useEffect } from 'react';
import { isTokenExpired } from '../utils/auth';
import { profileService } from '../api/profile.service';

const AuthContext = createContext(undefined);

export const AuthProvider = ({ children }) => {
    const [state, setState] = useState({
        user: null,
        business: null,
        profile: null,
        token: null,
        isAuthenticated: false,
        isLoading: true,
        hasProfile: false,
        completionPercentage: 0,
    });

    useEffect(() => {
        const calculateCompletion = (profile) => {
            if (!profile) return 0;
            const fields = [
                'businessName', 'ownerName', 'email', 'phone', 'address',
                'industry', 'country', 'currency', 'invoicePrefix',
                'logo', 'brandTone', 'brandTagline', 'paymentTerms', 'brandColor'
            ];
            const filled = fields.filter(f => !!profile[f]);
            return Math.round((filled.length / fields.length) * 100);
        };

        const initializeAuth = async () => {
            const token = localStorage.getItem('token');
            const storedUser = localStorage.getItem('user');

            if (token && storedUser) {
                if (isTokenExpired(token)) {
                    logout();
                    return;
                }

                try {
                    const user = JSON.parse(storedUser);

                    // ✅ Safe profile fetch - won't crash if fails
                    let profileData = null;
                    try {
                        profileData = await profileService.getProfile();
                    } catch (_) { }

                    const hasProfile = !!(profileData && profileData.businessName);
                    const completion = profileData ? calculateCompletion(profileData) : 0;

                    setState({
                        token,
                        user,
                        business: null,
                        profile: profileData,
                        isAuthenticated: true,
                        isLoading: false,
                        hasProfile,
                        completionPercentage: completion,
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

    const login = async (data) => {
        const userObj = data.user || data.owner || {
            username: data.username,
            name: data.name,
            fullName: data.fullName,
            email: data.email,
            role: data.role,
        };

        // ✅ Save to localStorage first (sync)
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(userObj));

        // ✅ Safe profile fetch - won't crash login if API fails
        let profileData = null;
        try {
            profileData = await profileService.getProfile();
        } catch (_) { }

        const hasProfile = !!(profileData && profileData.businessName);

        // ✅ setState completes BEFORE navigate() runs in LoginPage
        setState({
            token: data.token,
            user: userObj,
            profile: profileData,
            isAuthenticated: true,
            isLoading: false,
            hasProfile,
            completionPercentage: profileData ? 70 : 0,
        });

        return { hasProfile };
    };

    const updateProfileState = (newProfile) => {
        setState(prev => ({
            ...prev,
            profile: newProfile,
            hasProfile: !!(newProfile && newProfile.businessName),
            completionPercentage: newProfile ? 100 : 0,
        }));
    };

    const logout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        localStorage.removeItem('business');
        setState({
            token: null,
            user: null,
            business: null,
            profile: null,
            isAuthenticated: false,
            isLoading: false,
            hasProfile: false,
            completionPercentage: 0,
        });
    };

    return (
        <AuthContext.Provider value={{ ...state, login, logout, updateProfileState }}>
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