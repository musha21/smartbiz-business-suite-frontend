import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { isAuthenticated as checkAuthToken, getUserRole } from '../utils/auth';
import LoadingSpinner from '../components/common/LoadingSpinner';

const ProtectedRoute = ({ allowedRole }) => {
    const { isAuthenticated, user, isLoading } = useAuth();

    // 1. Loading State
    if (isLoading) {
        return <LoadingSpinner fullPage />;
    }

    // 2. Client-side Auth Check (Context + Token)
    const tokenValid = checkAuthToken();
    if (!isAuthenticated || !tokenValid) {
        return <Navigate to="/login" replace />;
    }

    // 3. Role-based Access Control
    if (allowedRole) {
        const userRole = user?.role || getUserRole(localStorage.getItem('token'));

        if (userRole !== allowedRole) {
            // Redirect to appropriate dashboard based on actual role
            const redirectPath = userRole === 'ADMIN' ? '/admin/dashboard' : '/dashboard';
            return <Navigate to={redirectPath} replace />;
        }
    }

    return <Outlet />;
};

export default ProtectedRoute;
