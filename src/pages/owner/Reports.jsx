import React, { useState, useEffect } from 'react';
import { reportService } from '../../api';
import {
    Filter,
    Download,
    DollarSign,
    Package,
    AlertCircle,
    FileText,
    TrendingUp
} from 'lucide-react';
import { formatLKR } from '../../utils/formatters';
import CreatedAtText from '../../components/ui/CreatedAtText';
import { format } from 'date-fns';

const Reports = () => {
    // State for filters
    const [filters, setFilters] = useState({
        year: new Date().getFullYear(),
        month: new Date().getMonth() + 1,
        limit: 5
    });

    // State for data
    const [revenue, setRevenue] = useState({ data: null, loading: false, error: null });
    const [topProducts, setTopProducts] = useState({ data: [], loading: false, error: null });
    const [unpaidInvoices, setUnpaidInvoices] = useState({ data: [], loading: false, error: null });

    // Handlers
    const handleFilterChange = (e) => {
        const { name, value } = e.target;
        setFilters(prev => ({
            ...prev,
            [name]: parseInt(value)
        }));
    };

    // API Calls — accept explicit year/month to avoid stale closure bugs
    const fetchRevenue = async (year, month) => {
        setRevenue(prev => ({ ...prev, loading: true, error: null }));
        try {
            const data = await reportService.getMonthlyRevenue(year, month);
            setRevenue({ data, loading: false, error: null });
        } catch (err) {
            setRevenue({ data: null, loading: false, error: 'Failed to load revenue data' });
        }
    };

    const fetchTopProducts = async (year, month, limit) => {
        setTopProducts(prev => ({ ...prev, loading: true, error: null }));
        try {
            const data = await reportService.getTopProducts(year, month, limit);
            setTopProducts({ data: Array.isArray(data) ? data : [], loading: false, error: null });
        } catch (err) {
            setTopProducts({ data: [], loading: false, error: 'Failed to load top products' });
        }
    };

    const fetchUnpaid = async (year, month) => {
        setUnpaidInvoices(prev => ({ ...prev, loading: true, error: null }));
        try {
            // Pass year & month so backend filters unpaid invoices by selected period
            const data = await reportService.getUnpaidInvoices(year, month);
            setUnpaidInvoices({ data: Array.isArray(data) ? data : [], loading: false, error: null });
        } catch (err) {
            setUnpaidInvoices({ data: [], loading: false, error: 'Failed to load unpaid invoices' });
        }
    };

    // Load all reports with the current filter values
    const loadReports = (currentFilters = filters) => {
        const { year, month, limit } = currentFilters;
        fetchRevenue(year, month);
        fetchTopProducts(year, month, limit);
        fetchUnpaid(year, month);
    };

    // Initial Load on mount
    useEffect(() => {
        loadReports(filters);
    }, []); // eslint-disable-line react-hooks/exhaustive-deps


    // Backend returns { year, month, paidRevenue }
    const getRevenueAmount = (data) => {
        if (!data) return 0;
        // Primary: paidRevenue — fallback to other possible names
        return data.paidRevenue ?? data.totalRevenue ?? data.revenue ?? data.amount ?? 0;
    };

    return (
        <div className="space-y-8 pb-10">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-black text-slate-800 tracking-tight">Business Reports</h1>
                    <p className="text-slate-500 mt-1 font-bold">Comprehensive financial and operational insights</p>
                </div>
            </div>

            {/* Filters Section */}
            <div className="bg-white p-6 rounded-[24px] border border-slate-100 shadow-sm">
                <div className="flex items-center gap-2 mb-4 text-slate-800 font-bold">
                    <Filter size={20} className="text-indigo-600" />
                    <h2>Report Filters</h2>
                </div>
                <div className="flex flex-col md:flex-row gap-4 items-end">
                    <div className="w-full md:w-32">
                        <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Year</label>
                        <input
                            type="number"
                            name="year"
                            value={filters.year}
                            onChange={handleFilterChange}
                            className="w-full bg-slate-50 border-none rounded-xl px-4 py-2.5 font-bold text-slate-800 focus:ring-2 focus:ring-indigo-500 outline-none"
                        />
                    </div>
                    <div className="w-full md:w-48">
                        <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Month</label>
                        <select
                            name="month"
                            value={filters.month}
                            onChange={handleFilterChange}
                            className="w-full bg-slate-50 border-none rounded-xl px-4 py-2.5 font-bold text-slate-800 focus:ring-2 focus:ring-indigo-500 outline-none appearance-none"
                        >
                            {Array.from({ length: 12 }, (_, i) => i + 1).map(m => (
                                <option key={m} value={m}>
                                    {new Date(0, m - 1).toLocaleString('default', { month: 'long' })}
                                </option>
                            ))}
                        </select>
                    </div>
                    <div className="w-full md:w-32">
                        <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Top Limit</label>
                        <select
                            name="limit"
                            value={filters.limit}
                            onChange={handleFilterChange}
                            className="w-full bg-slate-50 border-none rounded-xl px-4 py-2.5 font-bold text-slate-800 focus:ring-2 focus:ring-indigo-500 outline-none"
                        >
                            <option value={5}>Top 5</option>
                            <option value={10}>Top 10</option>
                            <option value={20}>Top 20</option>
                        </select>
                    </div>
                    <button
                        onClick={() => loadReports(filters)}
                        className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2.5 px-6 rounded-xl shadow-lg shadow-indigo-100 transition-all active:scale-95 flex items-center gap-2"
                    >
                        <Download size={18} />
                        Load Reports
                    </button>
                </div>
            </div>

            {/* Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                {/* 1. Monthly Revenue Card */}
                <div className="lg:col-span-1 space-y-6">
                    <div className="bg-white p-6 rounded-[32px] border border-slate-100 shadow-sm relative overflow-hidden">
                        <div className="flex items-center gap-3 mb-6 relative z-10">
                            <div className="w-12 h-12 bg-emerald-50 rounded-2xl flex items-center justify-center text-emerald-600">
                                <DollarSign />
                            </div>
                            <div>
                                <p className="text-slate-500 text-xs font-bold uppercase tracking-wider">Monthly Revenue</p>
                                <p className="text-xs text-slate-400 font-medium">
                                    {new Date(0, filters.month - 1).toLocaleString('default', { month: 'long' })} {filters.year}
                                </p>
                            </div>
                        </div>

                        {revenue.loading ? (
                            <div className="animate-pulse space-y-3">
                                <div className="h-8 bg-slate-100 rounded w-3/4"></div>
                                <div className="h-4 bg-slate-50 rounded w-1/2"></div>
                            </div>
                        ) : revenue.error ? (
                            <div className="text-rose-500 text-sm font-medium bg-rose-50 p-3 rounded-xl border border-rose-100">
                                {revenue.error}
                            </div>
                        ) : (
                            <div className="relative z-10">
                                <h3 className="text-3xl font-black text-slate-800 leading-tight">
                                    {formatLKR(getRevenueAmount(revenue.data))}
                                </h3>
                                <div className="mt-3 flex items-center gap-2 text-emerald-600 text-sm font-bold bg-emerald-50 w-fit px-3 py-1.5 rounded-lg">
                                    <TrendingUp size={15} />
                                    <span>Paid Revenue</span>
                                </div>
                                {revenue.data && (
                                    <p className="mt-2 text-xs text-slate-400 font-medium">
                                        {new Date(0, (revenue.data.month ?? filters.month) - 1).toLocaleString('default', { month: 'long' })} {revenue.data.year ?? filters.year}
                                    </p>
                                )}
                            </div>
                        )}

                        {/* Decor */}
                        <div className="absolute -right-6 -bottom-6 w-32 h-32 bg-emerald-50 rounded-full opacity-50 z-0" />
                    </div>
                </div>

                {/* 2. Top Products Table */}
                <div className="lg:col-span-2 bg-white p-6 rounded-[32px] border border-slate-100 shadow-sm">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="w-10 h-10 bg-indigo-50 rounded-xl flex items-center justify-center text-indigo-600">
                            <Package size={20} />
                        </div>
                        <h2 className="text-lg font-bold text-slate-800">Top Performing Products</h2>
                    </div>

                    {topProducts.loading ? (
                        <div className="space-y-4">
                            {[1, 2, 3].map(i => <div key={i} className="h-12 bg-slate-50 rounded-xl animate-pulse" />)}
                        </div>
                    ) : topProducts.error ? (
                        <div className="p-4 bg-rose-50 text-rose-600 rounded-xl text-sm font-medium">{topProducts.error}</div>
                    ) : topProducts.data?.length === 0 ? (
                        <div className="text-center py-10 text-slate-400 font-medium">No sales data found for this period</div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="border-b border-slate-100">
                                        <th className="py-3 px-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Product Name</th>
                                        <th className="py-3 px-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-center">Qty Sold</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {topProducts.data.map((product, idx) => (
                                        <tr key={idx} className="hover:bg-slate-50/50 transition-colors border-b border-slate-50 last:border-0">
                                            <td className="py-4 px-4 font-bold text-slate-700">{product.productName}</td>
                                            <td className="py-4 px-4 text-center font-bold text-slate-600 bg-slate-50 rounded-lg">{product.totalQty}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>

                {/* 3. Unpaid Invoices Table (Full Width) */}
                <div className="lg:col-span-3 bg-white p-6 rounded-[32px] border border-slate-100 shadow-sm">
                    <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-amber-50 rounded-xl flex items-center justify-center text-amber-600">
                                <AlertCircle size={20} />
                            </div>
                            <div>
                                <h2 className="text-lg font-bold text-slate-800">Unpaid Invoices</h2>
                                <p className="text-xs text-slate-400 font-medium">
                                    {new Date(0, filters.month - 1).toLocaleString('default', { month: 'long' })} {filters.year}
                                </p>
                            </div>
                        </div>
                        <span className="bg-amber-100 text-amber-700 px-3 py-1 rounded-full text-xs font-bold">
                            {unpaidInvoices.data?.length || 0} Pending
                        </span>
                    </div>

                    {unpaidInvoices.loading ? (
                        <div className="space-y-4">
                            {[1, 2, 3].map(i => <div key={i} className="h-12 bg-slate-50 rounded-xl animate-pulse" />)}
                        </div>
                    ) : unpaidInvoices.error ? (
                        <div className="p-4 bg-rose-50 text-rose-600 rounded-xl text-sm font-medium">{unpaidInvoices.error}</div>
                    ) : unpaidInvoices.data?.length === 0 ? (
                        <div className="text-center py-10 text-slate-400 font-medium">No unpaid invoices for this period. Great job!</div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="bg-slate-50/50 rounded-lg">
                                        <th className="py-3 px-4 text-xs font-bold text-slate-500 uppercase tracking-wider rounded-l-xl">Invoice #</th>
                                        <th className="py-3 px-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Date</th>
                                        <th className="py-3 px-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Customer</th>
                                        <th className="py-3 px-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-right rounded-r-xl">Amount Due</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {unpaidInvoices.data.map((inv) => (
                                        <tr key={inv.id} className="hover:bg-slate-50 transition-colors">
                                            <td className="py-4 px-4 font-bold text-indigo-600">#{inv.invoiceNumber}</td>
                                            <td className="py-4 px-4 text-sm font-medium text-slate-500">
                                                <CreatedAtText value={inv.invoiceDate} dateOnly />
                                            </td>
                                            <td className="py-4 px-4 font-bold text-slate-700">{inv.customerName || 'Unknown Customer'}</td>
                                            <td className="py-4 px-4 text-right font-black text-slate-800">{formatLKR(inv.totalAmount)}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Reports;
