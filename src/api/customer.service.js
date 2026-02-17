import api from './axios';

export const customerService = {
    async getCustomers() {
        const response = await api.get('/customer');
        return response.data;
    },

    async createCustomer(data) {
        const response = await api.post('/customer', data);
        return response.data;
    },

    async updateCustomer(id, data) {
        const response = await api.put(`/customer/${id}`, data);
        return response.data;
    },

    async deleteCustomer(id) {
        const response = await api.delete(`/customer/${id}`);
        return response.data;
    }
};
