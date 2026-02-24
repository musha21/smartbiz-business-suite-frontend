import api from './axios';

export const dashboardService = {
    // GET /dashboard/summary
    // Robust handler to ensure we get the data object even if wrapped in 'data' field
    async getSummary() {
        const response = await api.get('/dashboard/summary');
        const result = response.data;
        // Return result.data if it exists, otherwise return the whole result
        return (result && typeof result === 'object' && result?.success && result?.data) ? result.data : result;
    }
};
