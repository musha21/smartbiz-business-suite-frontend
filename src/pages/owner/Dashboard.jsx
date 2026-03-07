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
    Plus,
    Activity,
    Zap,
    ChevronRight,
    Sparkles
} from 'lucide-react';
import { dashboardService } from '../../api';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { CircularProgress } from '@mui/material';
import { formatLKR } from '../../utils/formatters';

const formatGrowth = (value, suffix = 'Today') => {
    if (value == null || value === 0) return `0% ${suffix}`;
    const sign = value > 0 ? '+' : '';
    return `${sign}${Number(value).toFixed(1)}% ${suffix}`;
};

const OwnerDashboard = () => {
    const navigate = useNavigate();
    const { user, profile, completionPercentage } = useAuth();
    const { isDarkMode } = useTheme();
    const displayName = profile?.businessName || user?.username || user?.name || user?.fullName || 'Owner';

    const { data, isLoading, error } = useQuery({
        queryKey: ['dashboard-summary'],
        queryFn: dashboardService.getSummary,
    });

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-[500px]">
                <CircularProgress sx={{ color: '#6366f1' }} />
            </div>
        );
    }

    if (error) {
        return (
            <div className="p-8">
                <div className={`border rounded-[2rem] px-8 py-6 font-black uppercase tracking-widest text-xs text-center shadow-2xl ${isDarkMode ? 'bg-rose-500/10 border-rose-500/20 text-rose-400' : 'bg-rose-50 border-rose-100 text-rose-600'}`}>
                    Service Error: Failed to load dashboard metrics.
                </div>
            </div>
        );
    }

    const chartData = [
        { name: 'Revenue', value: data?.monthRevenue ?? data?.monthlyRevenue ?? 0 },
        { name: 'Expenses', value: data?.monthExpenses ?? data?.monthlyExpenses ?? 0 },
        { name: 'Profit', value: data?.monthProfit ?? data?.monthlyProfit ?? 0 }
    ];

    const StatCard = ({ title, value, icon: Icon, color, trend }) => (
        <div className={`border p-8 rounded-[32px] relative overflow-hidden ${isDarkMode ? 'bg-[#15161c] border-white/5' : 'bg-white border-slate-200 shadow-sm'}`}>
            <div className="flex justify-between items-start relative z-10">
                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${isDarkMode ? `bg-${color}-500/10 text-${color}-400` : `bg-${color}-100 text-${color}-600`}`}>
                    <Icon size={24} />
                </div>
                <div className="text-right">
                    <p className={`text-[10px] font-black uppercase tracking-widest mb-1 ${isDarkMode ? `text-${color}-500/80` : `text-${color}-600`}`}>{trend}</p>
                    <div className={`w-2 h-2 rounded-full shadow-[0_0_8px] float-right ${isDarkMode ? `bg-${color}-500 shadow-${color}-500/50` : `bg-${color}-600 shadow-${color}-600/50`}`} />
                </div>
            </div>
            <div className="relative z-10 mt-8">
                <p className={`text-[10px] font-black uppercase tracking-[0.2em] mb-2 ${isDarkMode ? 'text-slate-600' : 'text-slate-400'}`}>{title}</p>
                <h3 className={`text-3xl font-black italic uppercase tracking-tight ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>{value}</h3>
            </div>
        </div>
    );

    return (
        <div className="space-y-10 pb-20">
            {/* Header Section */}
            <div className={`flex flex-col md:flex-row md:items-end justify-between gap-6 pb-8 border-b ${isDarkMode ? 'border-white/5' : 'border-slate-200'}`}>
                <div className="space-y-2">
                    <h1 className={`text-5xl font-black tracking-tighter italic uppercase leading-none ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                        Business Overview
                    </h1>
                    <p className={`text-[10px] font-bold uppercase tracking-[0.2em] ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`}>
                        Welcome back, <span className="text-indigo-500">{displayName}</span> — {new Date().toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' })}
                    </p>
                </div>
                <button
                    onClick={() => navigate('/invoices/new')}
                    className="flex items-center gap-3 bg-indigo-600 text-white px-8 py-4 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-indigo-50 shadow-lg shadow-indigo-600/20"
                >
                    <Plus size={18} />
                    <span>Create Invoice</span>
                </button>
            </div>

            {/* Profile Completion Call to Action */}
            {completionPercentage < 100 && (
                <div className={`p-8 rounded-[40px] border relative overflow-hidden group transition-all duration-500 hover:scale-[1.01] ${isDarkMode ? 'bg-indigo-600/10 border-indigo-500/30' : 'bg-indigo-50 border-indigo-100'}`}>
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
                        <div className="flex items-center gap-5">
                            <div className="w-16 h-16 bg-indigo-600 rounded-3xl flex items-center justify-center text-white shadow-xl shadow-indigo-600/20 animate-pulse">
                                <Sparkles size={28} />
                            </div>
                            <div>
                                <h3 className={`text-xl font-black italic uppercase tracking-tight ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>Complete Your Business Profile</h3>
                                <p className={`text-xs font-bold mt-1 ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>Your profile is <span className="text-indigo-500">{completionPercentage}%</span> complete. Unlock advanced AI features by filling in all details.</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-4">
                            <div className="hidden md:block w-48 h-2 bg-black/10 rounded-full overflow-hidden">
                                <div className="h-full bg-indigo-600 rounded-full transition-all duration-1000" style={{ width: `${completionPercentage}%` }} />
                            </div>
                            <button
                                onClick={() => navigate('/profile')}
                                className="bg-white text-indigo-900 px-8 py-4 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-slate-100 transition-all shadow-lg active:scale-95"
                            >
                                Finish Setup
                            </button>
                        </div>
                    </div>
                    <div className="absolute -right-20 -bottom-20 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl" />
                </div>
            )}

            {/* Top Metrics Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <StatCard
                    title="Today's Revenue"
                    value={formatLKR(data?.todayRevenue ?? 0)}
                    icon={TrendingUp}
                    color="indigo"
                    trend={formatGrowth(data?.todayGrowthPercent)}
                />
                <StatCard
                    title="Today's Expenses"
                    value={formatLKR(data?.todayExpenses ?? 0)}
                    icon={TrendingDown}
                    color="rose"
                    trend={formatGrowth(data?.todayExpenseChangePercent)}
                />
                <StatCard
                    title="Net Profit"
                    value={formatLKR(data?.todayProfit ?? 0)}
                    icon={DollarSign}
                    color="emerald"
                    trend={data?.profitStatus || 'N/A'}
                />
            </div>

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* Analytics Chart */}
                <div className={`lg:col-span-8 border p-8 rounded-[40px] relative overflow-hidden ${isDarkMode ? 'bg-[#15161c] border-white/5' : 'bg-white border-slate-200'}`}>
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-10 relative z-10">
                        <div>
                            <p className={`text-[10px] font-bold uppercase tracking-[0.2em] mb-2 ${isDarkMode ? 'text-slate-600' : 'text-slate-400'}`}>Performance Analysis</p>
                            <h3 className={`text-2xl font-black italic uppercase tracking-tight ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>Monthly Sales</h3>
                        </div>
                        <div className="flex items-center gap-6">
                            <div className="flex items-center gap-2">
                                <span className="w-2 h-2 rounded-full bg-indigo-500" />
                                <span className={`text-[10px] font-bold uppercase tracking-widest ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`}>Total Revenue</span>
                            </div>
                            <h3 className={`text-2xl font-black ${isDarkMode ? 'text-white' : 'text-indigo-600'}`}>{formatLKR(data?.monthRevenue || 0)}</h3>
                        </div>
                    </div>

                    <div className="h-[350px] w-full relative z-10">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={chartData}>
                                <defs>
                                    <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#6366f1" stopOpacity={0.2} />
                                        <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={isDarkMode ? "rgba(255,255,255,0.03)" : "rgba(0,0,0,0.05)"} />
                                <XAxis
                                    dataKey="name"
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fill: isDarkMode ? '#475569' : '#94a3b8', fontSize: 10, fontWeight: '700' }}
                                    dy={15}
                                />
                                <YAxis hide />
                                <Tooltip
                                    contentStyle={{
                                        backgroundColor: isDarkMode ? '#1a1b24' : '#fff',
                                        borderRadius: '16px',
                                        border: isDarkMode ? '1px solid rgba(255,255,255,0.05)' : '1px solid rgba(0,0,0,0.05)',
                                    }}
                                    itemStyle={{ color: isDarkMode ? '#fff' : '#1e293b', fontSize: '12px', fontWeight: '700', textTransform: 'uppercase' }}
                                    cursor={{ stroke: '#6366f1', strokeWidth: 1 }}
                                />
                                <Area
                                    type="monotone"
                                    dataKey="value"
                                    stroke="#6366f1"
                                    strokeWidth={4}
                                    fillOpacity={1}
                                    fill="url(#colorRevenue)"
                                    animationDuration={0}
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Status Cards */}
                <div className="lg:col-span-4 space-y-8">
                    {/* Goal Card */}
                    <div className="bg-gradient-to-br from-indigo-600 to-violet-800 rounded-[40px] p-8 text-white shadow-lg shadow-indigo-600/20 relative overflow-hidden flex flex-col justify-between min-h-[300px]">
                        <div className="relative z-10">
                            <h2 className="text-3xl font-black mb-2 leading-none italic uppercase tracking-tighter">Business<br />Growth</h2>
                            <p className="text-indigo-200 font-bold text-[10px] uppercase tracking-widest mt-4 opacity-80 leading-relaxed">Inventory levels and sales performance are currently at optimal levels.</p>
                        </div>

                        <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/10 relative z-10">
                            <p className="text-[9px] font-black text-indigo-300 uppercase tracking-widest mb-1.5">Monthly Sales</p>
                            <p className="text-3xl font-black text-white">{formatLKR(data?.monthRevenue || 0)}</p>
                        </div>

                        <button
                            onClick={() => navigate('/reports')}
                            className="bg-white text-indigo-900 px-6 py-4 rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-indigo-50 w-full z-10 flex items-center justify-center gap-2"
                        >
                            View Full Report <ArrowRight size={14} />
                        </button>
                    </div>

                    {/* Stock Warning Card */}
                    <div className={`border p-8 rounded-[40px] relative overflow-hidden ${isDarkMode ? 'bg-[#15161c] border-white/5' : 'bg-white border-slate-200 shadow-sm'}`}>
                        <div className="flex items-center justify-between mb-8">
                            <div className="w-12 h-12 bg-rose-500/10 text-rose-500 rounded-2xl flex items-center justify-center">
                                <Zap size={20} />
                            </div>
                            <span className="bg-rose-500/10 text-rose-500 px-3 py-1.5 rounded-lg text-[9px] font-bold uppercase tracking-widest border border-rose-500/20">
                                {data?.lowStockCount || 0} Low Stock
                            </span>
                        </div>
                        <p className={`text-[10px] font-bold uppercase tracking-[0.2em] mb-2 ${isDarkMode ? 'text-slate-600' : 'text-slate-400'}`}>Inventory Alerts</p>
                        <h3 className={`text-xl font-black italic uppercase tracking-tight ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>Stock Warnings</h3>

                        <div className={`mt-6 p-4 border rounded-2xl flex items-center justify-between cursor-pointer ${isDarkMode ? 'bg-white/[0.02] border-white/5 hover:bg-white/[0.04]' : 'bg-slate-50 border-slate-200 hover:bg-slate-100 shadow-sm'}`} onClick={() => navigate('/products')}>
                            <div className="flex items-center gap-3">
                                <Package size={16} className="text-rose-500" />
                                <span className={`text-[11px] font-bold uppercase tracking-widest ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>View low stock items</span>
                            </div>
                            <ChevronRight size={14} className="text-slate-400" />
                        </div>
                    </div>
                </div>
            </div>

            {/* Bottom Section */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Pending Invoices */}
                <div className={`border p-8 rounded-[40px] ${isDarkMode ? 'bg-[#15161c] border-white/5' : 'bg-white border-slate-200 shadow-sm'}`}>
                    <div className="flex items-center justify-between mb-8">
                        <div>
                            <p className={`text-[10px] font-bold uppercase tracking-[0.2em] mb-1 ${isDarkMode ? 'text-slate-600' : 'text-slate-400'}`}>Financials</p>
                            <h3 className={`text-xl font-black italic uppercase tracking-tight ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>Pending Invoices</h3>
                        </div>
                        <div className="w-12 h-12 bg-amber-500/10 text-amber-500 rounded-2xl flex items-center justify-center">
                            <Activity size={20} />
                        </div>
                    </div>
                    <div className="space-y-4">
                        <div className={`flex items-center gap-4 p-5 rounded-[24px] border cursor-pointer ${isDarkMode ? 'bg-white/[0.02] border-white/5 hover:bg-white/[0.04]' : 'bg-slate-50 border-slate-200 hover:bg-slate-100 shadow-sm'}`} onClick={() => navigate('/invoices')}>
                            <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-500">
                                <AlertTriangle size={18} />
                            </div>
                            <div className="flex-1">
                                <p className={`font-black text-xs uppercase tracking-wide leading-none mb-1 ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>Payment Required</p>
                                <p className={`text-[10px] font-bold uppercase tracking-widest ${isDarkMode ? 'text-slate-600' : 'text-slate-500'}`}>{data?.unpaidInvoicesCount || 0} Unpaid Invoices</p>
                            </div>
                            <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${isDarkMode ? 'bg-white/5 text-slate-600' : 'bg-white border border-slate-200 text-slate-400'}`}>
                                <ChevronRight size={14} />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Quick Insights Card */}
                <div className={`border p-8 rounded-[40px] relative overflow-hidden ${isDarkMode ? 'bg-[#15161c] border-white/5' : 'bg-white border-slate-200 shadow-sm'}`}>
                    <div className="flex items-center justify-between mb-8 relative z-10">
                        <div>
                            <p className={`text-[10px] font-bold uppercase tracking-[0.2em] mb-1 ${isDarkMode ? 'text-slate-600' : 'text-slate-400'}`}>Overview</p>
                            <h3 className={`text-xl font-black italic uppercase tracking-tight ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>Quick Insights</h3>
                        </div>
                        <div className="w-12 h-12 bg-indigo-500/10 text-indigo-500 rounded-2xl flex items-center justify-center">
                            <Activity size={20} />
                        </div>
                    </div>
                    <div className="space-y-4 relative z-10">
                        <div className={`flex items-center justify-between p-4 border rounded-2xl ${isDarkMode ? 'bg-white/[0.02] border-white/5' : 'bg-slate-50 border-slate-200'}`}>
                            <div className="flex items-center gap-3">
                                <Package size={16} className="text-rose-500" />
                                <span className={`text-[10px] font-black uppercase tracking-widest ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>Low Stock Items</span>
                            </div>
                            <span className={`text-lg font-black italic ${isDarkMode ? 'text-rose-400' : 'text-rose-600'}`}>{data?.lowStockCount ?? 0}</span>
                        </div>
                        <div className={`flex items-center justify-between p-4 border rounded-2xl ${isDarkMode ? 'bg-white/[0.02] border-white/5' : 'bg-slate-50 border-slate-200'}`}>
                            <div className="flex items-center gap-3">
                                <AlertTriangle size={16} className="text-amber-500" />
                                <span className={`text-[10px] font-black uppercase tracking-widest ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>Unpaid Invoices</span>
                            </div>
                            <span className={`text-lg font-black italic ${isDarkMode ? 'text-amber-400' : 'text-amber-600'}`}>{data?.unpaidInvoicesCount ?? 0}</span>
                        </div>
                        <div className={`flex items-center justify-between p-4 border rounded-2xl ${isDarkMode ? 'bg-white/[0.02] border-white/5' : 'bg-slate-50 border-slate-200'}`}>
                            <div className="flex items-center gap-3">
                                <DollarSign size={16} className="text-emerald-500" />
                                <span className={`text-[10px] font-black uppercase tracking-widest ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>Monthly Revenue</span>
                            </div>
                            <span className={`text-lg font-black italic ${isDarkMode ? 'text-emerald-400' : 'text-emerald-600'}`}>{formatLKR(data?.monthRevenue ?? 0)}</span>
                        </div>
                    </div>
                </div>

                {/* Efficiency / Pie Section */}
                <div className={`border p-8 rounded-[40px] flex flex-col items-center text-center ${isDarkMode ? 'bg-[#15161c] border-white/5' : 'bg-white border-slate-200 shadow-sm'}`}>
                    <p className={`text-[10px] font-bold uppercase tracking-[0.2em] mb-1 ${isDarkMode ? 'text-slate-600' : 'text-slate-400'}`}>Financial Health</p>
                    <h3 className={`text-xl font-black italic uppercase tracking-tight mb-8 ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>Profit Margin</h3>

                    <div className="w-40 h-40 relative">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={[{ value: Math.max(0, data?.profitMarginPercent ?? 0) }, { value: Math.max(0, 100 - (data?.profitMarginPercent ?? 0)) }]}
                                    innerRadius={50}
                                    outerRadius={70}
                                    startAngle={90}
                                    endAngle={-270}
                                    dataKey="value"
                                    stroke="none"
                                    cornerRadius={12}
                                    paddingAngle={5}
                                >
                                    <Cell fill="#6366f1" />
                                    <Cell fill={isDarkMode ? "rgba(255,255,255,0.03)" : "rgba(0,0,0,0.05)"} />
                                </Pie>
                            </PieChart>
                        </ResponsiveContainer>
                        <div className="absolute inset-0 flex items-center justify-center flex-col">
                            <span className={`font-black text-2xl italic ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>{Math.round(data?.profitMarginPercent ?? 0)}%</span>
                            <span className={`text-[9px] font-black uppercase tracking-widest mt-1 ${isDarkMode ? 'text-slate-700' : 'text-slate-400'}`}>{data?.profitStatus || 'N/A'}</span>
                        </div>
                    </div>

                    <p className={`text-[10px] font-bold uppercase tracking-widest mt-6 ${isDarkMode ? 'text-slate-600' : 'text-slate-500'}`}>
                        {(data?.profitMarginPercent ?? 0) >= 20 ? 'Your business is performing well' : (data?.profitMarginPercent ?? 0) >= 10 ? 'Business needs attention' : 'Critical: Review your margins'}
                    </p>
                </div>
            </div>
        </div>
    );
};

export default OwnerDashboard;
