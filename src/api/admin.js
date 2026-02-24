import api from './axios';

export const adminService = {
    async getStats() {
        const response = await api.get('/admin/stats/overview');
        const res = response.data;
        return (res?.success && res?.data) ? res.data : res;
    },
    async getLogs(limit = 20) {
        const response = await api.get(`/admin/logs?limit=${limit}`);
        const res = response.data;
        return (res?.success && res?.data) ? res.data : res;
    }
};

// Also export individual functions for backward compatibility or direct use
export const getAdminStats = adminService.getStats;
export const getAdminLogs = adminService.getLogs;
