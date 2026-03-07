import api from './axios';

export const invoiceService = {
    async createInvoice(data) {
        const response = await api.post('/invoices', data);
        const result = response.data;
        return (result && typeof result === 'object' && result?.success && result?.data) ? result.data : result;
    },

    // GET /invoices/{id}
    async getInvoiceById(id) {
        const response = await api.get(`/invoices/${id}`);
        return response.data;
    },

    // GET /invoices/by-number/{invoiceNumber}
    async getInvoiceByNumber(invoiceNumber) {
        const response = await api.get(`/invoices/by-number/${invoiceNumber}`);
        return response.data;
    },

    // PUT /invoices/{id}/status
    async updateInvoiceStatus(id, status) {
        const response = await api.put(`/invoices/${id}/status`, { status });
        return response.data;
    },

    // GET /invoices?status=&from=&to=&q=
    async getInvoices(params) {
        const response = await api.get('/invoices', { params });
        return response.data;
    },

    // GET /invoices/customer/{customerId}?status=&from=&to=&q=
    async getInvoicesByCustomer(customerId, params) {
        const response = await api.get(`/invoices/customer/${customerId}`, { params });
        return response.data;
    },

    // GET /invoices/{id}/pdf
    async downloadPdf(id) {
        const response = await api.get(`/invoices/${id}/pdf`, {
            responseType: 'blob'
        });
        const blob = new Blob([response.data], { type: 'application/pdf' });
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', `invoice-${id}.pdf`);
        document.body.appendChild(link);
        link.click();
        link.remove();
        window.URL.revokeObjectURL(url);
    },

    // GET /invoices/{id}/pdf/preview
    async previewPdf(id) {
        const response = await api.get(`/invoices/${id}/pdf/preview`, {
            responseType: 'blob'
        });
        const blob = new Blob([response.data], { type: 'application/pdf' });
        const url = window.URL.createObjectURL(blob);
        window.open(url, '_blank');
        // Note: revokeObjectURL might be needed later, but common practice for preview is just open
    }
};
