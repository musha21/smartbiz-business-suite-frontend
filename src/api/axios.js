import axios from 'axios';

const api = axios.create({
    baseURL: "http://localhost:8080/v1/api",
    headers: { "Content-Type": "application/json" },
});

// Request Interceptor: Attach Token
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token && config.headers) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// Response Interceptor: Handle Auth Failures
api.interceptors.response.use(
    (response) => response,
    (error) => {
        const { response } = error;
        if (response && (response.status === 401 || response.status === 403)) {
            if (!window.location.pathname.includes('/login')) {
                localStorage.removeItem('token');
                window.location.href = '/login';
            }
        }
        return Promise.reject(error);
    }
);

export default api;
