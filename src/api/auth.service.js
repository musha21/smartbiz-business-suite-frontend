import api from './axios';


export const authService = {
    async login(credentials) {
        const response = await api.post('/auth/login', credentials);
        return response.data;
    },

    async register(data) {
        const response = await api.post('/auth/register', data);
        return response.data;
    },

    async logout() {
        const response = await api.post('/auth/logout');
        return response.data;
    },

    async getCurrentUser() {
        const response = await api.get('/auth/me');
        return response.data;
    }
};
