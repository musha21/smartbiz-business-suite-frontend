import axios from 'axios';
import { toast } from 'react-toastify';

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

// Response Interceptor: Handle Auth Failures + Global Alerts
api.interceptors.response.use(
    (response) => {
        const method = response.config.method?.toUpperCase();
        if (['POST', 'PUT', 'DELETE', 'PATCH'].includes(method)) {
            const url = response.config.url || "";
            const data = response.data;

            // 1. Prioritize backend message if it's customized (not generic)
            let message = data?.message;
            const isGenericBackend = !message || message.toLowerCase().includes("success") || message.toLowerCase().includes("ok");

            // 2. Fallback to intelligent context-aware messages if backend isn't specific
            if (isGenericBackend) {
                // Detect Entity
                let entity = "Entry";
                if (url.includes("/customers")) entity = "Customer";
                else if (url.includes("/suppliers")) entity = "Supplier";
                else if (url.includes("/products")) entity = "Product";
                else if (url.includes("/categories")) entity = "Category";
                else if (url.includes("/batches")) entity = "Stock Batch";
                else if (url.includes("/expenses")) entity = "Expense";
                else if (url.includes("/invoices")) entity = "Invoice";
                else if (url.includes("/admin/plans")) entity = "Plan";
                else if (url.includes("/admin/businesses")) entity = "Business";
                else if (url.includes("/subscription")) entity = "Subscription";

                // Specialized Auth Messages
                if (url.includes("/auth/login")) {
                    message = "Welcome back! Login successful.";
                } else if (url.includes("/auth/register")) {
                    message = "Success! Your account is ready.";
                } else {
                    // Method Mapping
                    switch (method) {
                        case 'POST':
                            message = `New ${entity} has been successfully added.`;
                            break;
                        case 'PUT':
                        case 'PATCH':
                            message = `${entity} information has been updated.`;
                            break;
                        case 'DELETE':
                            message = `${entity} has been removed from your records.`;
                            break;
                        default:
                            message = "The action was completed successfully.";
                    }
                }
            }

            toast.success(message);
        }
        return response;
    },
    (error) => {
        // If we blocked it ourselves, just throw it
        if (error?.isForbidden || error?.code === "NOT_ADMIN") {
            toast.error("Oops! You don't have permission to do that.");
            return Promise.reject(error);
        }

        const { response } = error;

        // Handle specific error cases with human-friendly language
        if (response && response.status === 401) {
            if (!window.location.pathname.includes('/login')) {
                toast.error("Your session has expired. Let's get you logged back in.");
                localStorage.removeItem('token');
                window.location.href = '/login';
            }
        }
        else if (response && response.status === 403) {
            error.isForbidden = true;
            error.message = "Admin access required";
            toast.warning("Oops! You don't have permission to do that.");
        }
        else if (!response) {
            // Network/Timeout issues
            toast.error("Connection issues. Please check your internet and try again.");
        }
        else {
            // ✅ Global Human-Friendly Error Alert
            let message = response?.data?.message || "";

            // Map technical strings to human-friendly versions
            const techMap = {
                "bad credentials": "Login failed. Please check your email and password.",
                "user not found": "Account not found. Please register if you're new!",
                "access denied": "You don't have permission to perform this action.",
                "duplicate key": "This record already exists in our system.",
                "internal server error": "Something went wrong on our end. We're on it!"
            };

            const lowerMsg = message.toLowerCase();
            for (const [tech, human] of Object.entries(techMap)) {
                if (lowerMsg.includes(tech)) {
                    message = human;
                    break;
                }
            }

            if (!message || message.length < 3) {
                message = "Something went wrong on our end. Please try again in a bit.";
            }

            toast.error(message);
        }

        return Promise.reject(error);
    }
);

export default api;