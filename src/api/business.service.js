import api from './axios';

export const businessService = {
    async getBusinesses(params) {
        const response = await api.get('/admin/businesses', { params });
        return response.data;
    },

    async getBusinessById(id) {
        const response = await api.get(`/admin/businesses/${id}`);
        return response.data;
    },

    async updateBusinessStatus(id, status) {
        const response = await api.put(`/admin/businesses/${id}/status`, { status });
        return response.data;
    },

    async updateBusinessPlan(businessId, planId) {
        const response = await api.put(`/admin/businesses/${businessId}/plan`, { planId });
        return response.data;
    },

    async getPlatformOverview() {
        const response = await api.get('/admin/stats/overview');
        return response.data;
    }
};
