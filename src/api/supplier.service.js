import api from './axios';

export const supplierService = {
    async getSuppliers(params) {
        const response = await api.get('/supplier', { params });
        return response.data;
    },

    async getSupplierById(id) {
        const response = await api.get(`/supplier/${id}`);
        return response.data;
    },

    async createSupplier(data) {
        const response = await api.post('/supplier', data);
        return response.data;
    },

    async updateSupplier(id, data) {
        const response = await api.put(`/supplier/${id}`, data);
        return response.data;
    },

    async deleteSupplier(id) {
        const response = await api.delete(`/supplier/${id}`);
        return response.data;
    }
};
