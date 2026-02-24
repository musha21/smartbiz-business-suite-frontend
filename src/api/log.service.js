import api from './axios';

export const logService = {
    // Admin System Logs
    async getSystemLogs(limit = 100) {
        const response = await api.get(`/admin/logs?limit=${limit}`);
        return response.data;
    },

    // AI Usage Analytics
    async getAiUsage() {
        const response = await api.get('/admin/ai-usage');
        return response.data;
    }
};
