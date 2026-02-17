import React from 'react';
import {
    TrendingUp,
    ShoppingCart,
    Inventory,
    AttachMoney
} from '@mui/icons-material';
import {
    AreaChart,
    Area,
    PieChart,
    Pie,
    Cell,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    Legend
} from 'recharts';
import { useQuery } from '@tanstack/react-query';
import { reportService } from '../../api';
import { CircularProgress, Alert } from '@mui/material';

const COLORS = ['#6366f1', '#8b5cf6', '#ec4899', '#f43f5e'];

const OwnerDashboard = () => {
    const { data: stats, isLoading, error } = useQuery({
        queryKey: ['owner-dashboard-stats'],
        queryFn: () => reportService.getSalesSummary('30days'),
    });

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <CircularProgress color="primary" />
            </div>
        );
    }

    if (error) {
        return (
            <div className="p-8">
                <Alert severity="error">Failed to load dashboard metrics. Please check your connection.</Alert>
            </div>
        );
    }

    // Default fallbacks for charts if data is empty
    const salesTrend = stats?.salesTrend || [
        { name: 'N/A', sales: 0, profit: 0 },
    ];
    const categoryStats = stats?.categoryDistribution || [
        { name: 'No Data', value: 1 },
    ];
    const topProducts = stats?.topProducts || [];

    const metrics = [
        {
            title: "Today's Sales",
            value: new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(stats?.todaySales || 0),
            change: "+12.5%",
            icon: <TrendingUp />,
            color: "bg-emerald-500"
        },
        {
            title: "Monthly Sales",
            value: new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(stats?.monthlySales || 0),
            change: "+8.2%",
            icon: <ShoppingCart />,
            color: "bg-indigo-500"
        },
        {
            title: "Estimated Profit",
            value: new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(stats?.estimatedProfit || 0),
            change: "+5.1%",
            icon: <AttachMoney />,
            color: "bg-purple-500"
        },
        {
            title: "Low Stock Items",
            value: stats?.lowStockCount || "0",
            change: "Critical",
            icon: <Inventory />,
            color: "bg-rose-500"
        },
    ];

    return (
        <div className="space-y-8 pb-10">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-slate-800 tracking-tight">Operational Overview</h1>
                    <p className="text-slate-500 mt-1">Welcome back, here's what's happening today.</p>
                </div>
                <div className="flex items-center gap-3">
                    <button className="bg-white border border-slate-200 text-slate-700 px-4 py-2.5 rounded-xl font-semibold text-sm hover:bg-slate-50 transition-colors shadow-sm">
                        Export Report
                    </button>
                </div>
            </div>

            {/* Metric Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {metrics.map((m, i) => (
                    <div key={i} className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow group">
                        <div className="flex items-center justify-between mb-4">
                            <div className={`${m.color} w-12 h-12 rounded-2xl flex items-center justify-center text-white shadow-lg`}>
                                {m.icon}
                            </div>
                            <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${m.change.startsWith('+') ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}>
                                {m.change}
                            </span>
                        </div>
                        <h3 className="text-slate-500 text-sm font-medium">{m.title}</h3>
                        <p className="text-2xl font-extrabold text-slate-800 mt-1">{m.value}</p>
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Sales Chart */}
                <div className="lg:col-span-2 bg-white p-8 rounded-3xl border border-slate-100 shadow-sm">
                    <div className="flex items-center justify-between mb-8">
                        <h3 className="text-lg font-bold text-slate-800">Sales Trend</h3>
                        <select className="bg-slate-100 border-none rounded-lg text-xs font-bold px-3 py-1.5 focus:ring-2 focus:ring-indigo-500 outline-none">
                            <option>Last 30 Days</option>
                            <option>Last 3 Months</option>
                            <option>Last Year</option>
                        </select>
                    </div>
                    <div className="h-[350px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={salesTrend}>
                                <defs>
                                    <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                                        <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12 }} dy={10} />
                                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12 }} />
                                <Tooltip
                                    contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)', padding: '12px' }}
                                />
                                <Area type="monotone" dataKey="sales" stroke="#6366f1" strokeWidth={4} fillOpacity={1} fill="url(#colorSales)" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Categories Pie */}
                <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm flex flex-col">
                    <h3 className="text-lg font-bold text-slate-800 mb-8">Sales by Category</h3>
                    <div className="flex-1 min-h-[300px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={categoryStats}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={60}
                                    outerRadius={100}
                                    paddingAngle={5}
                                    dataKey="value"
                                >
                                    {categoryStats.map((_, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip />
                                <Legend layout="horizontal" verticalAlign="bottom" align="center" iconType="circle" />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>

            {/* Top Products Table/List */}
            <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
                <div className="p-8 border-b border-slate-100 flex items-center justify-between">
                    <h3 className="text-lg font-bold text-slate-800">Top Performing Products</h3>
                    <button className="text-indigo-600 text-sm font-bold hover:underline">View All</button>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="bg-slate-50">
                                <th className="px-8 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Product</th>
                                <th className="px-8 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Revenue</th>
                                <th className="px-8 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {topProducts.map((p, i) => (
                                <tr key={i} className="hover:bg-slate-50 transition-colors">
                                    <td className="px-8 py-5">
                                        <div className="flex items-center gap-4">
                                            <div className="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center font-bold text-slate-500">
                                                {p.name?.charAt(0) || 'P'}
                                            </div>
                                            <span className="font-semibold text-slate-800">{p.name}</span>
                                        </div>
                                    </td>
                                    <td className="px-8 py-5 text-slate-600 font-medium">
                                        {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(p.revenue || 0)}
                                    </td>
                                    <td className="px-8 py-5">
                                        <span className="px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-600 text-xs font-bold">Active</span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default OwnerDashboard;
