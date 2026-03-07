import api from './axios';

export const profileService = {
    /**
     * Fetch the business profile
     */
    async getProfile() {
        try {
            const response = await api.get('/business/profile');
            return response.data;
        } catch (error) {
            if (error.response?.status === 404) {
                return null;
            }
            throw error;
        }
    },

    /**
     * Create a new business profile
     */
    async createProfile(data) {
        const response = await api.post('/business/profile', data);
        return response.data;
    },

    /**
     * Update an existing business profile
     */
    async updateProfile(data) {
    const response = await api.put('/business/profile', data);
    return response.data;
}
};
