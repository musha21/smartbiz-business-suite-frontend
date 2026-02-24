import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import {
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    PieChart,
    Pie,
    Cell
} from 'recharts';
import {
    TrendingUp,
    TrendingDown,
    DollarSign,
    Package,
    AlertTriangle,
    ArrowRight,
    MoreHorizontal,
    FilePlus2
} from 'lucide-react';
import { dashboardService } from '../../api';
import { useAuth } from '../../context/AuthContext';
import { CircularProgress, Alert } from '@mui/material';
import { formatLKR } from '../../utils/formatters';

const OwnerDashboard = () => {
    const navigate = useNavigate();
    const { user } = useAuth();

    // Build display name — backend stores it as 'username' or 'name'
    const displayName = user?.username || user?.name || user?.fullName || 'Owner';

    // 1. Fetch Data
    const { data, isLoading, error } = useQuery({
        queryKey: ['dashboard-summary'],
        queryFn: dashboardService.getSummary,
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

    // 2. Prepare Data
    // Ensure data properties exist or fallback to 0
    const chartData = [
        { name: 'Revenue', value: data?.monthRevenue ?? data?.monthlyRevenue ?? 0 },
        { name: 'Expenses', value: data?.monthExpenses ?? data?.monthlyExpenses ?? 0 },
        { name: 'Profit', value: data?.monthProfit ?? data?.monthlyProfit ?? 0 }
    ];

    const lowStockCount = data?.lowStockCount ?? data?.lowStock ?? 0;
    const pieData = [
        { name: 'Stock', value: Math.max(0, 100 - lowStockCount), color: '#6366f1' },
        { name: 'Low Stock', value: lowStockCount, color: '#f43f5e' }
    ];


    // Components
    const StatCard = ({ title, value, icon, bgClass, iconClass }) => (
        <div className="bg-white p-6 rounded-[32px] border border-slate-100 shadow-sm flex flex-col justify-between h-40 relative overflow-hidden group hover:shadow-md transition-all">
            <div className="flex justify-between items-start z-10">
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${bgClass}`}>
                    {icon}
                </div>
                <MoreHorizontal size={20} className="text-slate-300 cursor-pointer hover:text-slate-500" />
            </div>
            <div className="z-10 mt-4">
                <p className="text-slate-500 text-xs font-bold uppercase tracking-wider mb-1">{title}</p>
                <h3 className="text-2xl font-black text-slate-800">{value}</h3>
            </div>
            {/* Background Decor */}
            <div className={`absolute -right-6 -bottom-6 w-24 h-24 rounded-full opacity-10 ${bgClass}`} />
        </div>
    );


    return (
        <div className="space-y-8 pb-10">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-black text-slate-800 tracking-tight">Dashboard</h1>
                    <p className="text-slate-500 mt-1 font-bold">
                        Welcome back, <span className="text-indigo-600">{displayName}</span> 👋
                    </p>
                </div>
                <button
                    onClick={() => navigate('/invoices/new')}
                    className="flex items-center gap-2 bg-violet-600 hover:bg-violet-700 active:scale-95 text-white font-bold px-6 py-3 rounded-2xl shadow-lg shadow-violet-200 transition-all w-fit"
                >
                    <FilePlus2 size={20} />
                    Create Invoice
                </button>
            </div>

            {/* Top Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <StatCard
                    title="Today Revenue"
                    value={formatLKR(data?.todayRevenue ?? data?.dailyRevenue ?? 0)}
                    icon={<TrendingUp size={24} className="text-indigo-600" />}
                    bgClass="bg-indigo-50"
                />
                <StatCard
                    title="Today Expenses"
                    value={formatLKR(data?.todayExpenses ?? data?.dailyExpenses ?? 0)}
                    icon={<TrendingDown size={24} className="text-rose-600" />}
                    bgClass="bg-rose-50"
                />
                <StatCard
                    title="Today Profit"
                    value={formatLKR(data?.todayProfit ?? data?.dailyProfit ?? 0)}
                    icon={<DollarSign size={24} className="text-emerald-600" />}
                    bgClass="bg-emerald-50"
                />
            </div>

            {/* Middle Section: Banner + Chart */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Gradient Banner Card - Replicating the "Reach financial goals" card */}
                <div className="lg:col-span-1 bg-gradient-to-br from-indigo-600 to-violet-700 rounded-[32px] p-8 text-white shadow-xl shadow-indigo-200 relative overflow-hidden flex flex-col justify-between min-h-[300px]">
                    <div className="relative z-10">
                        <h2 className="text-2xl font-black mb-2 leading-tight">Monthly<br />Revenue Goal</h2>
                        <p className="text-indigo-100 font-medium text-sm mb-6 opacity-90">Keep pushing to reach your monthly targets. You are doing great!</p>

                        <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/20 mb-6">
                            <p className="text-xs font-bold text-indigo-200 uppercase mb-1">Current Month</p>
                            <p className="text-2xl font-black text-white">{formatLKR(data?.monthRevenue || 0)}</p>
                        </div>
                    </div>

                    <button className="bg-white text-indigo-600 px-6 py-3 rounded-xl font-bold text-sm hover:bg-indigo-50 transition-colors w-fit shadow-lg z-10 flex items-center gap-2">
                        View Details <ArrowRight size={16} />
                    </button>

                    {/* Decor Circles */}
                    <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2 blur-2xl" />
                    <div className="absolute bottom-0 left-0 w-48 h-48 bg-black/10 rounded-full translate-y-1/2 -translate-x-1/2 blur-2xl" />
                </div>

                {/* Monthly Chart Card - Replicating "Average Weekly Savings" style */}
                <div className="lg:col-span-2 bg-white p-8 rounded-[32px] border border-slate-100 shadow-sm flex flex-col">
                    <div className="flex items-center justify-between mb-2">
                        <div>
                            <p className="text-slate-500 font-bold uppercase tracking-wider text-xs">Analytics</p>
                            <h3 className="text-xl font-black text-slate-800">Monthly Performance</h3>
                        </div>
                        <h3 className="text-2xl font-black text-slate-800">{formatLKR(data?.monthProfit || 0)}</h3>
                    </div>

                    <div className="flex-1 w-full min-h-[250px] relative">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={chartData}>
                                <defs>
                                    <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                                        <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                <XAxis
                                    dataKey="name"
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fill: '#94a3b8', fontSize: 12, fontWeight: 'bold' }}
                                    dy={10}
                                />
                                <YAxis hide />
                                <Tooltip
                                    contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                                    cursor={{ stroke: '#6366f1', strokeWidth: 1, strokeDasharray: '4 4' }}
                                />
                                <Area
                                    type="monotone"
                                    dataKey="value"
                                    stroke="#6366f1"
                                    strokeWidth={4}
                                    fillOpacity={1}
                                    fill="url(#colorValue)"
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>

            {/* Bottom Row - Lists & Status */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Unpaid Invoices List (Mocked visually as list) */}
                <div className="bg-white p-6 rounded-[32px] border border-slate-100 shadow-sm">
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="font-black text-slate-800 text-lg">Pending Invoices</h3>
                        <span className="bg-amber-50 text-amber-600 px-3 py-1 rounded-full text-xs font-bold">{data?.unpaidInvoicesCount || 0} Open</span>
                    </div>
                    <div className="space-y-4">
                        {/* Visual Placeholder for list items */}
                        <div className="flex items-center gap-4 p-3 bg-slate-50 rounded-2xl hover:bg-slate-100 transition-colors cursor-pointer">
                            <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center text-amber-600">
                                <AlertTriangle size={18} />
                            </div>
                            <div>
                                <p className="font-bold text-slate-800 text-sm">Action Needed</p>
                                <p className="text-xs text-slate-500 font-medium">Review unpaid invoices</p>
                            </div>
                            <span className="ml-auto bg-white shadow-sm px-3 py-1 rounded-lg text-xs font-bold text-indigo-600">View</span>
                        </div>
                    </div>
                </div>

                {/* Low Stock List */}
                <div className="bg-white p-6 rounded-[32px] border border-slate-100 shadow-sm">
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="font-black text-slate-800 text-lg">Inventory Status</h3>
                        <span className="bg-rose-50 text-rose-600 px-3 py-1 rounded-full text-xs font-bold">{data?.lowStockCount || 0} Low</span>
                    </div>
                    <div className="space-y-4">
                        <div className="flex items-center gap-4 p-3 bg-slate-50 rounded-2xl hover:bg-slate-100 transition-colors cursor-pointer">
                            <div className="w-10 h-10 rounded-xl bg-rose-100 flex items-center justify-center text-rose-600">
                                <Package size={18} />
                            </div>
                            <div>
                                <p className="font-bold text-slate-800 text-sm">Restock Required</p>
                                <p className="text-xs text-slate-500 font-medium">Items running low</p>
                            </div>
                            <span className="ml-auto bg-white shadow-sm px-3 py-1 rounded-lg text-xs font-bold text-indigo-600">Stock</span>
                        </div>
                    </div>
                </div>

                {/* Dark Summary Card - Replicating "Plan for 2021" */}
                <div className="bg-slate-900 p-8 rounded-[32px] text-white relative overflow-hidden shadow-xl shadow-slate-200 flex flex-col justify-center items-center text-center">
                    <div className="relative z-10 w-full h-full flex flex-col items-center justify-center">
                        <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mb-4">Net Profit Margin</p>

                        {/* Simple Donut Chart Representation */}
                        <div className="w-32 h-32 relative mb-4">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={[{ value: (data?.monthProfit > 0 ? 75 : 0) }, { value: 25 }]}
                                        innerRadius={40}
                                        outerRadius={55}
                                        startAngle={90}
                                        endAngle={-270}
                                        dataKey="value"
                                        stroke="none"
                                        cornerRadius={10}
                                    >
                                        <Cell fill="#818cf8" />
                                        <Cell fill="#334155" />
                                    </Pie>
                                </PieChart>
                            </ResponsiveContainer>
                            <div className="absolute inset-0 flex items-center justify-center flex-col">
                                <span className="font-black text-2xl text-white">Good</span>
                            </div>
                        </div>

                        <p className="text-sm text-slate-400 font-medium">Keep up the good work!</p>
                    </div>

                    {/* Background Glows */}
                    <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500 rounded-full blur-[60px] opacity-20"></div>
                    <div className="absolute bottom-0 left-0 w-32 h-32 bg-purple-500 rounded-full blur-[60px] opacity-20"></div>
                </div>
            </div>
        </div >
    );
};

export default OwnerDashboard;
