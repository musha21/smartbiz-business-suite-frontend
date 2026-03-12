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
    },
    async getPlanAnalytics() {
        const response = await api.get('/admin/plan-analytics');
        const res = response.data;
        return (res?.success && res?.data) ? res.data : res;
    },
    async getWeeklyActivity() {
        const response = await api.get('/admin/weekly-activity');
        const res = response.data;
        return (res?.success && res?.data) ? res.data : res;
    },
    async getAIAnalytics() {
        const response = await api.get('/admin/ai-analytics');
        const res = response.data;
        return (res?.success && res?.data) ? res.data : res;
    }
};

// Also export individual functions for backward compatibility or direct use
export const getAdminStats = adminService.getStats;
export const getAdminLogs = adminService.getLogs;
export const getPlanAnalytics = adminService.getPlanAnalytics;
export const getWeeklyActivity = adminService.getWeeklyActivity;
export const getAIAnalytics = adminService.getAIAnalytics;
