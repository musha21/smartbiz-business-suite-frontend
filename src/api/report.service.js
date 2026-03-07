import api from './axios';

export const reportService = {
    // Dashboard summary (Keep existing)
    async getSalesSummary(period) {
        const response = await api.get('/dashboard/summary', { params: { period } });
        return response.data;
    },

    // 1) Monthly Revenue
    // Backend returns: { year, month, paidRevenue }
    async getMonthlyRevenue(year, month) {
        const response = await api.get('/reports/revenue/monthly', {
            params: { year, month }
        });
        return response.data; // flat object: { year, month, paidRevenue }
    },

    // 2) Top Products
    async getTopProducts(year, month, limit) {
        const response = await api.get('/reports/products/top', {
            params: { year, month, limit }
        });
        const result = response.data;
        // Handle array or wrapped response
        return Array.isArray(result) ? result : (result?.data ?? result?.products ?? result?.items ?? []);
    },

    // 3) Unpaid Invoices — pass year & month so the backend can filter by period
    // 3) Unpaid Invoices
    async getUnpaidInvoices() {
        // The user spec implies a general unpaid invoices fetch for the Email Center
        const response = await api.get('/reports/invoices/unpaid');
        const result = response.data;
        return Array.isArray(result) ? result : (result?.data ?? result?.invoices ?? result?.items ?? []);
    },

    // 4) Analytics Dashboard (New Requirement)
    async getAnalytics(from, to) {
        const response = await api.get('/reports/analytics', {
            params: { from, to }
        });
        return response.data;
    }
};
