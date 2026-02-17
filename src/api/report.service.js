import api from './axios';

export const reportService = {
    async getSalesSummary(period) {
        const response = await api.get('/dashboard/summary', { params: { period } });
        return response.data;
    },

    async getSalesReport(from, to) {
        const response = await api.get('/reports/sales', { params: { from, to } });
        return response.data;
    },

    async getTopProducts(params) {
        const response = await api.get('/reports/top-products', { params });
        return response.data;
    },

};
