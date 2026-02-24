import api from './axios';

export const expenseService = {
    // GET /v1/api/expenses
    async getExpenses() {
        const response = await api.get('/expenses');
        return response.data;
    },

    // GET /v1/api/expenses/{id}
    async getExpenseById(id) {
        const response = await api.get(`/expenses/${id}`);
        return response.data;
    },

    // POST /v1/api/expenses
    async createExpense(data) {
        const response = await api.post('/expenses', data);
        return response.data;
    },

    // PUT /v1/api/expenses/{id}
    async updateExpense(id, data) {
        const response = await api.put(`/expenses/${id}`, data);
        return response.data;
    },

    // DELETE /v1/api/expenses/{id}
    async deleteExpense(id) {
        const response = await api.delete(`/expenses/${id}`);
        return response.data;
    }
};
