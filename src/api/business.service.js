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

    async enableBusiness(id) {
        const response = await api.patch(`/admin/businesses/${id}/enable`);
        return response.data;
    },

    async disableBusiness(id) {
        const response = await api.patch(`/admin/businesses/${id}/disable`);
        return response.data;
    },

    async getPlatformOverview() {
        const response = await api.get('/admin/stats/overview');
        return response.data;
    }
};
