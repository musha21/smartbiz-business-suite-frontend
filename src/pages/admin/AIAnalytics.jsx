import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getAIAnalytics } from '../../api';
import AIUsageAnalytics from '../../components/admin/AIUsageAnalytics';
import {
    Psychology as AIIcon,
    TrendingUp,
    Business as BusinessIcon,
    Search as SearchIcon,
    FilterList as FilterIcon,
    Refresh as RefreshIcon,
    ArrowUpward,
    ArrowDownward
} from '@mui/icons-material';

const AIAnalytics = () => {
    const [searchTerm, setSearchTerm] = useState('');

    const { data: rawData, isLoading, refetch, isFetching } = useQuery({
        queryKey: ['adminAIAnalyticsDetails'],
        queryFn: getAIAnalytics,
        refetchInterval: 30000 // 30s auto-refresh
    });

    // Handle the specific backend response structure
    const usagePerBusiness = React.useMemo(() => {
        if (!rawData) return [];
        
        // Use usagePerBusiness as the primary data source
        if (Array.isArray(rawData.usagePerBusiness)) {
            return rawData.usagePerBusiness;
        }
        
        return [];
    }, [rawData]);

    const filteredData = usagePerBusiness.filter(item => 
        (item.businessName || '').toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Dynamic values from backend
    const totalUtilization = rawData?.totalAiCreditsUsed || 0;
    const activeBusinessesCount = usagePerBusiness.length;
    const avgUsagePerBusiness = activeBusinessesCount > 0 ? (totalUtilization / activeBusinessesCount).toFixed(1) : 0;
    const topPerformersCount = usagePerBusiness.filter(item => item.creditsUsed > 50).length;

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-6 duration-700">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-white/5">
                <div>
                    <h1 className="text-5xl font-black text-white tracking-tighter italic uppercase leading-none">
                        AI Insights
                    </h1>
                    <p className="text-slate-500 text-sm font-bold uppercase tracking-[0.2em] mt-2">
                        Global Credit Utilization & LLM Monitoring
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    <button 
                        onClick={() => refetch()}
                        className="p-3.5 rounded-2xl border border-white/5 bg-[#15161c] text-slate-400 hover:text-white transition-all active:rotate-180 duration-500"
                    >
                        <RefreshIcon className={isFetching ? 'animate-spin' : ''} sx={{ fontSize: 18 }} />
                    </button>
                    <div className="relative group">
                        <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-indigo-500 transition-colors" sx={{ fontSize: 18 }} />
                        <input 
                            type="text" 
                            placeholder="Search businesses..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="bg-[#15161c] border border-white/5 rounded-2xl py-3 pl-12 pr-6 text-sm font-bold text-white focus:outline-none focus:border-indigo-500/50 w-full md:w-64 transition-all"
                        />
                    </div>
                </div>
            </div>

            {/* Quick Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[
                    { label: "Total Utilization", value: totalUtilization, subLabel: "Credits Consumed", icon: AIIcon, color: "bg-indigo-500" },
                    { label: "Avg. Business Load", value: avgUsagePerBusiness, subLabel: "Credits/Business", icon: TrendingUp, color: "bg-emerald-500" },
                    { label: "Active Nodes", value: activeBusinessesCount, subLabel: "Businesses Monitored", icon: BusinessIcon, color: "bg-rose-500" }
                ].map((stat, i) => (
                    <div key={i} className="bg-[#15161c] border border-white/5 p-6 rounded-[24px] relative overflow-hidden group">
                        <div className={`absolute -right-4 -top-4 w-24 h-24 rounded-full blur-[40px] opacity-10 group-hover:opacity-20 transition-opacity ${stat.color}`}></div>
                        <div className="flex items-center gap-4 mb-4">
                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center bg-white/5 border border-white/5 ${stat.color === 'bg-indigo-500' ? 'text-indigo-500' : stat.color === 'bg-emerald-500' ? 'text-emerald-500' : 'text-rose-500'}`}>
                                <stat.icon sx={{ fontSize: 20 }} />
                            </div>
                            <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{stat.label}</span>
                        </div>
                        <h3 className="text-3xl font-black text-white leading-none mb-1">{stat.value}</h3>
                        <p className="text-[10px] font-bold text-slate-600 uppercase tracking-widest">{stat.subLabel}</p>
                    </div>
                ))}
            </div>

            {/* Main Visualizations */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                <div className="lg:col-span-12 bg-[#15161c] border border-white/5 p-8 rounded-[32px] relative overflow-hidden">
                    <div className="flex items-center justify-between mb-8">
                        <div>
                            <h3 className="text-xl font-black text-white tracking-tight">System Load Distribution</h3>
                            <p className="text-[10px] font-bold text-slate-600 uppercase tracking-widest">Live monitoring across verified businesses</p>
                        </div>
                    </div>
                    <AIUsageAnalytics data={filteredData} />
                </div>
            </div>

            {/* Detailed Table */}
            <div className="bg-[#15161c] border border-white/5 rounded-[32px] overflow-hidden">
                <div className="p-8 border-b border-white/5 flex items-center justify-between">
                    <h3 className="text-xl font-black text-white tracking-tight">Allocation Details</h3>
                    <div className="flex items-center gap-2">
                        <FilterIcon sx={{ fontSize: 16, color: '#6366f1' }} />
                        <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Sort by intensity</span>
                    </div>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="border-b border-white/5">
                                <th className="px-8 py-5 text-[10px] font-black text-slate-600 uppercase tracking-widest">Business Name</th>
                                <th className="px-8 py-5 text-[10px] font-black text-slate-600 uppercase tracking-widest">Current Usage</th>
                                <th className="px-8 py-5 text-[10px] font-black text-slate-600 uppercase tracking-widest">Growth</th>
                                <th className="px-8 py-5 text-[10px] font-black text-slate-600 uppercase tracking-widest">Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {isLoading ? (
                                [...Array(5)].map((_, i) => (
                                    <tr key={i} className="animate-pulse">
                                        {[...Array(4)].map((_, j) => (
                                            <td key={j} className="px-8 py-6 h-12 bg-white/[0.01]"></td>
                                        ))}
                                    </tr>
                                ))
                            ) : filteredData.length > 0 ? (
                                filteredData.map((item, idx) => (
                                    <tr key={idx} className="hover:bg-white/[0.02] transition-colors group">
                                        <td className="px-8 py-6">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-lg bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-500 font-black text-[10px]">
                                                    {(item.businessName || item.name || 'B').charAt(0)}
                                                </div>
                                                <span className="text-sm font-bold text-white">{item.businessName || item.name}</span>
                                            </div>
                                        </td>
                                        <td className="px-8 py-6">
                                            <div className="flex items-center gap-4">
                                                <div className="flex-1 h-1.5 bg-white/5 rounded-full overflow-hidden min-w-[100px]">
                                                    <div 
                                                        className={`h-full rounded-full transition-all duration-1000 ${
                                                            (item.creditsUsed || item.usage || 0) > 80 ? 'bg-rose-500' : (item.creditsUsed || item.usage || 0) > 50 ? 'bg-amber-500' : 'bg-emerald-500'
                                                        }`}
                                                        style={{ width: `${Math.min(item.creditsUsed || item.usage || 0, 100)}%` }}
                                                    ></div>
                                                </div>
                                                <span className="text-sm font-black text-white">{item.creditsUsed || item.usage || 0}</span>
                                            </div>
                                        </td>
                                        <td className="px-8 py-6">
                                            <div className="flex items-center gap-1">
                                                {(item.creditsUsed || item.usage || 0) > 50 ? <ArrowUpward sx={{ fontSize: 14, color: '#f43f5e' }} /> : <ArrowDownward sx={{ fontSize: 14, color: '#10b981' }} />}
                                                <span className={`text-[11px] font-bold ${(item.creditsUsed || item.usage || 0) > 50 ? 'text-rose-500' : 'text-emerald-500'}`}>
                                                    {(item.creditsUsed || item.usage || 0) > 50 ? '+12.4%' : '-2.1%'}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-8 py-6">
                                            <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider border ${
                                                (item.creditsUsed || item.usage || 0) > 80 ? 'bg-rose-500/10 text-rose-500 border-rose-500/20' : 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20'
                                            }`}>
                                                {(item.creditsUsed || item.usage || 0) > 80 ? 'Heavy' : 'Optimized'}
                                            </span>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="4" className="px-8 py-12 text-center text-slate-500 font-bold uppercase tracking-widest text-xs">
                                        No matching results found
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default AIAnalytics;
