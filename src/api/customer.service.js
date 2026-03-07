import api from './axios';

export const customerService = {
    async getCustomers() {
        const res = (await api.get('/customer')).data;
        return (res?.success && Array.isArray(res?.data)) ? res.data : (Array.isArray(res) ? res : (res?.data || []));
    },

    async createCustomer(data) {
        const res = (await api.post('/customer', data)).data;
        return (res?.success && res?.data) ? res.data : res;
    },

    async updateCustomer(id, data) {
        const res = (await api.put(`/customer/${id}`, data)).data;
        return (res?.success && res?.data) ? res.data : res;
    },

    async deleteCustomer(id) {
        const res = (await api.delete(`/customer/${id}`)).data;
        return (res?.success && res?.data) ? res.data : res;
    }
};
