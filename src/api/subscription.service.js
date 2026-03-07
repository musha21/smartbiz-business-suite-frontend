import api from './axios';

export const subscriptionService = {
    // Admin Endpoints (ADMIN ONLY — blocked in axios interceptor)
    async fetchAllPlans() {
        const res = (await api.get('/admin/plans')).data;
        return (res?.success && res?.data) ? res.data : res;
    },

    async createPlan(data) {
        const res = (await api.post('/admin/plans', data)).data;
        return (res?.success && res?.data) ? res.data : res;
    },

    async updatePlan(id, data) {
        const res = (await api.put(`/admin/plans/${id}`, data)).data;
        return (res?.success && res?.data) ? res.data : res;
    },

    async updatePlanStatus(id, status) {
        const res = (await api.patch(`/admin/plans/${id}/status`, { status })).data;
        return (res?.success && res?.data) ? res.data : res;
    },

    async fetchPlanLimits(id) {
        const res = (await api.get(`/admin/plans/${id}/limits`)).data;
        return (res?.success && res?.data) ? res.data : res;
    },

    // ✅ PUT expects { key, value }
    async updatePlanLimits(id, limits) {
        const res = (await api.put(`/admin/plans/${id}/limits`, limits)).data;
        return (res?.success && res?.data) ? res.data : res;
    },

    async assignSubscription(payload) {
        const res = (await api.put('/admin/subscriptions/assign', payload)).data;
        return (res?.success && res?.data) ? res.data : res;
    },

    // Owner Endpoints
    async fetchActivePlans() {
        const res = (await api.get('/plans/active')).data;
        return (res?.success && res?.data) ? res.data : res;
    },

    async fetchMyPlan() {
        const res = (await api.get('/owner/my-plan')).data;
        return (res?.success && res?.data) ? res.data : res;
    },

    async getUsageCounters() {
        const res = (await api.get('/owner/usage')).data;
        return (res?.success && res?.data) ? res.data : res;
    }
};