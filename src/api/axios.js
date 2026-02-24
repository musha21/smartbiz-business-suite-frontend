import axios from 'axios';

const api = axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL || "http://localhost:8080/v1/api",
    headers: { "Content-Type": "application/json" },
});

// ✅ get role from JWT safely
function getRoleFromToken() {
    const token = localStorage.getItem("token");
    if (!token) return null;
    try {
        const payload = JSON.parse(atob(token.split(".")[1]));
        return payload?.role ?? null;
    } catch {
        return null;
    }
}

// ✅ Request Interceptor: Attach Token + Block /admin/** if not ADMIN
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');

        if (token && config.headers) {
            config.headers.Authorization = `Bearer ${token}`;
        }

        // ✅ HARD BLOCK admin endpoints for non-admin tokens
        const url = config.url || "";
        const isAdminEndpoint = url.startsWith("/admin") || url.includes("/admin/");

        if (isAdminEndpoint) {
            const role = getRoleFromToken();
            const normalizedRole = role?.toUpperCase();
            const isAdmin = normalizedRole === "ADMIN" || normalizedRole === "ROLE_ADMIN";

            if (!isAdmin) {
                const err = new Error("Admin access required");
                err.isForbidden = true;
                err.code = "NOT_ADMIN";
                throw err;
            }
        }

        return config;
    },
    (error) => Promise.reject(error)
);

// Response Interceptor: Handle Auth Failures
api.interceptors.response.use(
    (response) => response,
    (error) => {
        // If we blocked it ourselves, just throw it
        if (error?.isForbidden || error?.code === "NOT_ADMIN") {
            return Promise.reject(error);
        }

        const { response } = error;

        // 401: Unauthorized -> Logout
        if (response && response.status === 401) {
            if (!window.location.pathname.includes('/login')) {
                localStorage.removeItem('token');
                window.location.href = '/login';
            }
        }

        // 403: Forbidden
        if (response && response.status === 403) {
            error.isForbidden = true;
            error.message = "Admin access required";
        }

        return Promise.reject(error);
    }
);

export default api;