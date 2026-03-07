import api from './axios';

export const aiService = {
    async getReport(period) {
        const response = await api.get(`/ai/report?period=${period}`);
        return response.data;
    },

    async generateMarketingPost(data) {
        const response = await api.post('/ai/marketing/post', data);
        return response.data;
    },

    async generateEmail(data) {
        const response = await api.post('/ai/email/draft', data);
        return response.data;
    },

    async generateImage(data) {
        const response = await api.post('/ai/generate-image', data);
        return response.data;
    },

    async getDetailedReport(payload) {
        const response = await api.post('/ai/report', payload);
        return response.data;
    }
};
