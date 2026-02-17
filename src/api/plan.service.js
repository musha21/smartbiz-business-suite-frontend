import api from './axios';

export const planService = {
    async getPlans() {
        const response = await api.get('/admin/plans');
        return response.data;
    },

    async createPlan(data) {
        const response = await api.post('/admin/plans', data);
        return response.data;
    },

    async updatePlan(id, data) {
        const response = await api.put(`/admin/plans/${id}`, data);
        return response.data;
    },

    async deletePlan(id) {
        const response = await api.delete(`/admin/plans/${id}`);
        return response.data;
    }
};
