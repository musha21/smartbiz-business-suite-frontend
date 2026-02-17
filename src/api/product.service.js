import api from './axios';

export const productService = {
    // GET /v1/api/products = returns only ACTIVE products.
    async getProducts() {
        const response = await api.get('/products');
        return response.data;
    },

    // GET /v1/api/products/archived = returns only ARCHIVED products.
    async getArchivedProducts() {
        const response = await api.get('/products/archived');
        return response.data;
    },

    async createProduct(data) {
        const response = await api.post('/products', data);
        return response.data;
    },

    async updateProduct(id, data) {
        const response = await api.put(`/products/${id}`, data);
        return response.data;
    },

    // DELETE /v1/api/products/{id} = SOFT DELETE (archives product).
    async deleteProduct(id) {
        const response = await api.delete(`/products/${id}`);
        return response.data;
    },

    // PATCH /v1/api/products/{id}/restore = restores archived product.
    async restoreProduct(id) {
        const response = await api.patch(`/products/${id}/restore`);
        return response.data;
    }
};
