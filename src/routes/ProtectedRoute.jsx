import React from "react";
import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { isAuthenticated as checkAuthToken, getUserRole } from "../utils/auth";
import LoadingSpinner from "../components/common/LoadingSpinner";

const normalizeRole = (r) => (r === "USER" ? "OWNER" : r);

const ProtectedRoute = ({ allowedRoles = [] }) => {
    const { isAuthenticated, user, hasProfile, isLoading } = useAuth();

    // 1) Loading
    if (isLoading) return <LoadingSpinner fullPage />;

    // 2) Auth check (context + token)
    const tokenValid = checkAuthToken();
    if (!isAuthenticated || !tokenValid) return <Navigate to="/login" replace />;

    // 3) Resolve role safely
    const token = localStorage.getItem("token");
    const roleFromContext = user?.role;
    const roleFromToken = getUserRole(token);
    const userRole = normalizeRole(roleFromContext || roleFromToken);

    // 4) Role-based access
    if (allowedRoles.length > 0 && !allowedRoles.includes(userRole)) {
        const redirectPath = userRole === "ADMIN" ? "/admin/dashboard" : "/dashboard";
        return <Navigate to={redirectPath} replace />;
    }

    // 5) Profile completion check for Owners
    const isOwner = userRole === "OWNER" || userRole === "USER"; // "USER" is normalized to "OWNER" above
    const isAtSetupPage = window.location.pathname === "/setup-profile";

    if (isOwner && !hasProfile && !isAtSetupPage) {
        return <Navigate to="/setup-profile" replace />;
    }

    // 6) If profile exists, don't stay on setup page
    if (isOwner && hasProfile && isAtSetupPage) {
        return <Navigate to="/dashboard" replace />;
    }

    return <Outlet />;
};

export default ProtectedRoute;