import api from './axios';

export const aiService = {
    async getInsights(data) {
        const response = await api.post('/ai/insights', data);
        return response.data;
    },

    async generateEmail(data) {
        const response = await api.post('/ai/email', data);
        return response.data;
    },


    async generateSocialPost(data) {
        const response = await api.post('/ai/social-post', data);
        return response.data;
    }
};
