import api from './axios';

export const logService = {
    async getAdminLogs() {
        const response = await api.get('/admin/logs');
        return response.data;
    },

    async getAiUsage() {
        const response = await api.get('/admin/ai-usage');
        return response.data;
    }
};
