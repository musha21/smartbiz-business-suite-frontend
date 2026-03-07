import React from "react";
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import {
    getAdminStats,
    getAdminLogs
} from "../../api";
import StatsCards from "../../components/admin/StatsCards";
import LatestLogsTable from "../../components/admin/LatestLogsTable";
import {
    CalendarMonth as CalendarIcon,
    Refresh as RefreshIcon,
    ArrowForward as ArrowIcon
} from '@mui/icons-material';

const LineChart = () => {
    return (
        <div className="relative h-48 w-full mt-12">
            <svg className="w-full h-full overflow-visible" viewBox="0 0 400 100" preserveAspectRatio="none">
                {/* Horizontal grid lines */}
                {[0, 25, 50, 75, 100].map(v => (
                    <line key={v} x1="0" y1={v} x2="400" y2={v} stroke="rgba(255,255,255,0.03)" strokeWidth="1" />
                ))}

                {/* Line 1 - Registrations */}
                <path
                    d="M0 80 Q 50 70, 100 85 T 200 60 T 300 75 T 400 70"
                    fill="none"
                    stroke="rgba(99, 102, 241, 0.6)"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    className="animate-[dash_3s_ease-in-out_infinite]"
                />
                <path
                    d="M0 80 Q 50 70, 100 85 T 200 60 T 300 75 T 400 70 V 100 H 0 Z"
                    fill="url(#gradient-blue)"
                    className="opacity-10"
                />

                {/* Line 2 - Activations */}
                <path
                    d="M0 90 Q 50 95, 100 80 T 200 85 T 300 90 T 400 85"
                    fill="none"
                    stroke="rgba(16, 185, 129, 0.6)"
                    strokeWidth="2"
                    strokeLinecap="round"
                />

                <defs>
                    <linearGradient id="gradient-blue" x1="0%" y1="0%" x2="0%" y2="100%">
                        <stop offset="0%" stopColor="#6366f1" />
                        <stop offset="100%" stopColor="transparent" />
                    </linearGradient>
                </defs>
            </svg>

            <div className="flex justify-between mt-4 text-[10px] font-black text-slate-700 uppercase tracking-widest px-2">
                <span>Mon</span>
                <span>Tue</span>
                <span>Wed</span>
                <span>Thu</span>
                <span>Fri</span>
                <span>Sat</span>
                <span>Sun</span>
            </div>
        </div>
    );
};

const DonutChart = () => {
    return (
        <div className="relative w-64 h-64 mx-auto mt-8">
            <svg viewBox="0 0 36 36" className="w-full h-full transform -rotate-90">
                <circle cx="18" cy="18" r="15.915" fill="none" stroke="rgba(255,255,255,0.03)" strokeWidth="4"></circle>
                {/* Enterprise */}
                <circle cx="18" cy="18" r="15.915" fill="none" stroke="#6366f1" strokeWidth="4" strokeDasharray="40 60" strokeDashoffset="0"></circle>
                {/* Professional */}
                <circle cx="18" cy="18" r="15.915" fill="none" stroke="#10b981" strokeWidth="4" strokeDasharray="32 68" strokeDashoffset="-40"></circle>
                {/* Starter */}
                <circle cx="18" cy="18" r="15.915" fill="none" stroke="#a855f7" strokeWidth="4" strokeDasharray="28 72" strokeDashoffset="-72"></circle>
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <span className="text-[44px] font-black text-white leading-none">25</span>
                <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Total</span>
            </div>
        </div>
    );
};

const AdminDashboard = () => {
    const navigate = useNavigate();

    const {
        data: stats,
        isLoading: statsLoading,
        refetch: refetchStats
    } = useQuery({
        queryKey: ["adminStatsOverview"],
        queryFn: getAdminStats,
    });

    const {
        data: logs,
        isLoading: logsLoading,
        refetch: refetchLogs
    } = useQuery({
        queryKey: ["adminLogs", 20],
        queryFn: () => getAdminLogs(20),
    });

    const isLoading = statsLoading || logsLoading;

    const handleRetryAll = () => {
        refetchStats();
        refetchLogs();
    };

    return (
        <div className="p-4 max-w-[1600px] mx-auto min-h-screen">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-8 pb-8 border-b border-white/5 relative">
                <div className="space-y-2">
                    <h1 className="text-6xl font-black text-white tracking-tighter leading-none italic uppercase">
                        Admin Dashboard
                    </h1>
                    <p className="text-slate-500 text-sm font-bold uppercase tracking-[0.2em]">SaaS ERP Global Overview & System Health</p>
                </div>

                <div className="flex items-center gap-4">
                    <div className="bg-[#15161c] border border-white/5 py-2.5 px-6 rounded-2xl flex items-center gap-4 group">
                        <CalendarIcon sx={{ fontSize: 18, color: '#6366f1' }} />
                        <span className="text-sm font-black text-slate-400 tracking-tight uppercase">Feb 27, 2026</span>
                    </div>

                    <button
                        onClick={handleRetryAll}
                        className="p-3.5 rounded-2xl border border-white/5 bg-[#15161c] text-slate-500 hover:text-white hover:border-indigo-500/30 transition-all active:rotate-180 duration-500"
                    >
                        <RefreshIcon className={isLoading ? 'animate-spin' : ''} sx={{ fontSize: 18 }} />
                    </button>
                </div>
            </div>

            {isLoading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {[...Array(8)].map((_, i) => (
                        <div key={i} className="h-40 bg-[#15161c] animate-pulse rounded-[24px] border border-white/5" />
                    ))}
                </div>
            ) : (
                <div className="animate-in fade-in slide-in-from-bottom-8 duration-1000">
                    {/* Main Stats */}
                    <StatsCards stats={stats} />

                    {/* Middle Charts Grid */}
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mt-12">
                        {/* Business Activity */}
                        <div className="lg:col-span-7 bg-[#15161c] border border-white/5 p-8 rounded-[32px] group relative overflow-hidden">
                            <div className="flex items-center justify-between mb-2">
                                <h3 className="text-xl font-black text-white tracking-tight flex items-center gap-2">
                                    Business Activity — Last 7 Days
                                    <span className="text-indigo-400 hover:text-indigo-300 cursor-pointer text-xs uppercase tracking-widest font-black flex items-center gap-1 ml-4 border-b border-indigo-400/20 pb-0.5">
                                        View All <ArrowIcon sx={{ fontSize: 12 }} />
                                    </span>
                                </h3>
                            </div>

                            <div className="flex gap-6 mt-6">
                                <div className="flex items-center gap-2">
                                    <div className="w-2.5 h-2.5 rounded-full bg-indigo-500"></div>
                                    <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Registrations</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <div className="w-2.5 h-2.5 rounded-full bg-emerald-500"></div>
                                    <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Activations</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <div className="w-2.5 h-2.5 rounded-full bg-rose-500"></div>
                                    <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Deactivations</span>
                                </div>
                            </div>

                            <LineChart />
                        </div>

                        {/* Plan Distribution */}
                        <div className="lg:col-span-5 bg-[#15161c] border border-white/5 p-8 rounded-[32px] relative overflow-hidden">
                            <div className="flex items-center justify-between">
                                <h3 className="text-xl font-black text-white tracking-tight">Plan Distribution</h3>
                                <button className="text-indigo-400 font-black text-[10px] uppercase tracking-widest flex items-center gap-1">Details <ArrowIcon sx={{ fontSize: 12 }} /></button>
                            </div>

                            <div className="flex flex-col md:flex-row items-center justify-between gap-8">
                                <DonutChart />

                                <div className="flex-1 space-y-4 w-full">
                                    {[
                                        { name: 'Enterprise', code: '10', pct: '40%', color: 'bg-indigo-500' },
                                        { name: 'Professional', code: '8', pct: '32%', color: 'bg-emerald-500' },
                                        { name: 'Starter', code: '7', pct: '28%', color: 'bg-purple-500' }
                                    ].map((plan, i) => (
                                        <div key={i} className="group cursor-pointer">
                                            <div className="flex justify-between items-end mb-2">
                                                <div className="flex items-center gap-3">
                                                    <div className={`w-2 h-2 rounded-full ${plan.color}`}></div>
                                                    <span className="text-sm font-bold text-slate-300 group-hover:text-white transition-colors">{plan.name}</span>
                                                </div>
                                                <div className="text-right">
                                                    <span className="text-sm font-black text-white block leading-none">{plan.code}</span>
                                                    <span className="text-[10px] font-bold text-slate-600 uppercase tracking-widest">{plan.pct}</span>
                                                </div>
                                            </div>
                                            <div className="h-1 bg-white/[0.03] rounded-full overflow-hidden">
                                                <div className={`h-full ${plan.color} opacity-30 group-hover:opacity-100 transition-all duration-500`} style={{ width: plan.pct }}></div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Logs Table */}
                    <LatestLogsTable logs={logs} />
                </div>
            )}
        </div>
    );
};

export default AdminDashboard;
