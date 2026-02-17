import api from './axios';

export const batchService = {
    async addStock(data) {
        // Backend endpoint: POST /batches
        const response = await api.post('/batches', data);
        return response.data;
    },

    async getBatchesByProduct(productId) {
        // Backend endpoint: GET /batches/product/{productId}
        const response = await api.get(`/batches/product/${productId}`);
        return response.data;
    },

    async getBatchById(batchId) {
        // Backend endpoint: GET /batches/{batchId}
        const response = await api.get(`/batches/${batchId}`);
        return response.data;
    },

    async deleteBatch(batchId) {
        // Backend endpoint: DELETE /batches/{batchId}
        const response = await api.delete(`/batches/${batchId}`);
        return response.data;
    },

    /**
     * Resolves the FIFO batchId for a product and requested quantity.
     * Logic: Find the oldest batch with qtyAvailable > 0.
     */
    async getFifoBatchIdForProduct(productId, requestedQty) {
        const batches = await this.getBatchesByProduct(productId);

        const eligibleBatches = batches
            .filter(b => b.qtyAvailable >= requestedQty)
            .sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));

        if (eligibleBatches.length === 0) {
            throw new Error(`Insufficient stock in any single batch for product #${productId}`);
        }

        return eligibleBatches[0].id;
    }
};
