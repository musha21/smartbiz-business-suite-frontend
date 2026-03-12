import React from 'react';
import { useQuery } from '@tanstack/react-query';
import {
    Zap,
    FileText,
    Package,
    Users,
    Activity,
    RefreshCw,
    ShieldCheck,
    ArrowUpRight,
    TrendingUp,
    LayoutDashboard,
    Crown
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { subscriptionService } from '../../api';
import { useTheme } from '../../context/ThemeContext';
import UsageProgressBar from '../../components/subscription/UsageProgressBar';
import { CircularProgress } from '@mui/material';

const UsageCard = ({ icon: Icon, title, used, total, unit, color, isDarkMode, link }) => (
    <div className={`p-6 rounded-[32px] border transition-all duration-300 hover:scale-[1.02] ${isDarkMode
        ? 'bg-[#15161c] border-white/5 hover:border-indigo-500/20'
        : 'bg-white border-slate-100 shadow-sm hover:shadow-md'
        }`}>
        <div className="flex justify-between items-start mb-6">
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center bg-${color}-500/10 text-${color}-500`}>
                <Icon size={24} />
            </div>
            {link && (
                <Link to={link} className={`p-2 rounded-xl transition-colors ${isDarkMode ? 'bg-white/5 text-slate-500 hover:text-white' : 'bg-slate-50 text-slate-400 hover:text-indigo-600'
                    }`}>
                    <ArrowUpRight size={18} />
                </Link>
            )}
        </div>

        <UsageProgressBar
            label={title}
            used={used}
            total={total}
            unit={unit}
            dark={isDarkMode}
        />
    </div>
);

const UsageLimits = () => {
    const { isDarkMode } = useTheme();

    const { data: usageData, isLoading: isUsageLoading, isError: isUsageError, refetch: refetchUsage } = useQuery({
        queryKey: ['subscriptionUsage'],
        queryFn: subscriptionService.getUsageCounters,
        refetchInterval: 5000, // Refetch every 5 seconds for "real-time" feel
        refetchOnWindowFocus: true,
    });

    const { data: myPlan, isLoading: isPlanLoading, isError: isPlanError } = useQuery({
        queryKey: ['owner-my-plan'],
        queryFn: subscriptionService.fetchMyPlan,
    });

    const isLoading = isUsageLoading || isPlanLoading;
    const isError = isUsageError || isPlanError;

    const findLimit = (keys) => {
        let rawData = usageData?.data || usageData || {};

        // 1. Handle nested usage array within some property
        if (rawData && typeof rawData === 'object' && Array.isArray(rawData.usage)) {
            rawData = rawData.usage;
        }

        const keyArray = Array.isArray(keys) ? keys : [keys];

        // 2. Handle Array of Counters structure (record-based)
        if (Array.isArray(rawData)) {
            const record = rawData.find(u =>
                keyArray.some(k =>
                    u.limitKey === k || u.key === k || u.name === k ||
                    (u.limitKey && u.limitKey.toLowerCase().includes(k.toLowerCase()))
                )
            );

            if (record) {
                return {
                    used: Number(record.used ?? record.currentUsage ?? record.current ?? record.value ?? 0),
                    total: Number(record.limitValue ?? record.limit ?? record.total ?? record.max ?? -1)
                };
            }
        }

        // 3. Handle Flat Object structure (property-based)
        if (rawData && typeof rawData === 'object') {
            for (const key of keyArray) {
                // If it's a direct match to an object, use its properties
                if (typeof rawData[key] === 'object' && rawData[key] !== null) {
                    const val = rawData[key];
                    return {
                        used: Number(val.used ?? val.currentUsage ?? val.current ?? val.value ?? 0),
                        total: Number(val.limitValue ?? val.limit ?? val.total ?? val.max ?? -1)
                    };
                }

                // If it's a flat key, look for common patterns (e.g. key + "Used" / key + "Limit")
                const base = key.replace(/Limit$|Used$|Credits$|_LIMIT|_USED/i, '');

                // Try common combinations
                const used = rawData[`${base}Used`] ?? rawData[`${base}_USED`] ?? rawData[key];
                const limit = rawData[`${base}Limit`] ?? rawData[`${base}_LIMIT`] ?? rawData[`${base}Total`] ?? rawData[`${base}_TOTAL`];

                if (used !== undefined) {
                    return {
                        used: Number(used),
                        total: Number(limit ?? -1)
                    };
                }
            }
        }

        return { used: 0, total: -1 };
    };

    const aiLimits = findLimit(['ai', 'AI_CREDITS', 'aiCredits', 'aiUsed']);
    const invoiceLimits = findLimit(['invoices', 'invoice', 'INVOICES', 'invoiceLimit', 'invoicesUsed']);
    const productLimits = findLimit(['products', 'product', 'PRODUCTS', 'productsLimit', 'productsUsed']);
    const customerLimits = findLimit(['customers', 'customer', 'CUSTOMERS', 'customersLimit', 'customersUsed']);

    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
                <CircularProgress sx={{ color: '#6366f1' }} />
                <p className={`text-[10px] font-black uppercase tracking-widest animate-pulse ${isDarkMode ? 'text-slate-600' : 'text-slate-400'}`}>
                    Accessing Resource Logs...
                </p>
            </div>
        );
    }

    if (isError) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[400px] gap-6 text-center">
                <div className="w-16 h-16 bg-rose-500/10 text-rose-500 rounded-3xl flex items-center justify-center border border-rose-500/20">
                    <Activity size={32} />
                </div>
                <div className="space-y-2">
                    <h3 className={`text-xl font-black italic uppercase tracking-tighter ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                        Connection Failure
                    </h3>
                    <p className={`text-xs font-bold uppercase tracking-widest leading-relaxed max-w-xs ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`}>
                        Failed to retrieve infrastructure quotas from the central server.
                    </p>
                </div>
                <button
                    onClick={() => { refetchUsage(); }}
                    className="px-8 py-3 bg-indigo-600 text-white rounded-xl text-[10px] font-black uppercase tracking-[0.2em] shadow-lg shadow-indigo-600/20"
                >
                    Reconnect Service
                </button>
            </div>
        );
    }

    return (
        <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-20">
            {/* Header */}
            <div className={`flex flex-col md:flex-row md:items-end justify-between gap-6 pb-8 border-b ${isDarkMode ? 'border-white/5' : 'border-slate-200'}`}>
                <div className="space-y-3">
                    <div className="flex items-center gap-3">
                        <div className="w-11 h-11 bg-indigo-600 rounded-2xl flex items-center justify-center text-white shadow-[0_0_25px_rgba(99,102,241,0.35)]">
                            <Activity size={22} />
                        </div>
                        <h1 className={`text-4xl font-black tracking-tighter italic uppercase ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                            Usage & Limits
                        </h1>
                    </div>
                    <p className={`text-[10px] font-black uppercase tracking-[0.25em] ml-1 ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`}>
                        Resource Allocation · Quotas · Performance
                    </p>
                </div>

                <div className="flex items-center gap-4">
                    <button
                        onClick={() => refetchUsage()}
                        className={`w-11 h-11 rounded-xl flex items-center justify-center active:scale-95 transition-all border ${isDarkMode ? 'bg-white/5 border-white/5 text-white hover:bg-white/10' : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                            }`}
                    >
                        <RefreshCw size={18} />
                    </button>
                    <div className={`px-6 py-2.5 rounded-2xl border flex items-center gap-3 ${isDarkMode ? 'bg-indigo-500/5 border-indigo-500/20' : 'bg-indigo-50 border-indigo-200'
                        }`}>
                        <Crown size={16} className="text-indigo-500" />
                        <span className="text-[10px] font-black uppercase tracking-widest text-indigo-500">
                            {myPlan?.planName || 'Standard'} Plan
                        </span>
                    </div>
                </div>
            </div>

            {/* Quick Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <UsageCard
                    icon={Zap}
                    title="AI Intelligence"
                    used={aiLimits.used}
                    total={aiLimits.total}
                    unit="Tasks"
                    color="indigo"
                    isDarkMode={isDarkMode}
                    link="/intelligence"
                />
                <UsageCard
                    icon={FileText}
                    title="Invoice Volume"
                    used={invoiceLimits.used}
                    total={invoiceLimits.total}
                    unit="Invoices"
                    color="amber"
                    isDarkMode={isDarkMode}
                    link="/invoices"
                />
                <UsageCard
                    icon={Package}
                    title="Inventory Capacity"
                    used={productLimits.used}
                    total={productLimits.total}
                    unit="Products"
                    color="emerald"
                    isDarkMode={isDarkMode}
                    link="/products"
                />
                <UsageCard
                    icon={Users}
                    title="Customer Database"
                    used={customerLimits.used}
                    total={customerLimits.total}
                    unit="Clients"
                    color="rose"
                    isDarkMode={isDarkMode}
                    link="/customers"
                />
            </div>

            {/* Detailed Insights / Upgrade Banner */}
            <div className={`rounded-[40px] border p-10 overflow-hidden relative ${isDarkMode ? 'bg-indigo-600/5 border-indigo-500/20' : 'bg-indigo-50 border-indigo-200'
                }`}>
                <div className="absolute top-0 right-0 p-8 opacity-10">
                    <TrendingUp size={120} className="text-indigo-500" />
                </div>

                <div className="relative z-10 max-w-2xl space-y-6">
                    <div className="space-y-2">
                        <h2 className={`text-2xl font-black italic uppercase tracking-tighter ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                            Need Higher Resource Limits?
                        </h2>
                        <p className={`text-xs font-bold leading-relaxed opacity-70 ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>
                            Scale your business seamlessly by upgrading your deployment tier. Each plan offers increased AI capabilities, expanded invoice limits, and enhanced CRM capacity.
                        </p>
                    </div>

                    <div className="flex flex-wrap gap-4">
                        <Link to="/subscription" className="px-8 py-4 bg-indigo-600 hover:bg-indigo-500 text-white rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] shadow-xl shadow-indigo-600/20 transition-all active:scale-95">
                            Explore Plans
                        </Link>
                        <Link to="/dashboard" className={`px-8 py-4 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] transition-all active:scale-95 border flex items-center gap-2 ${isDarkMode ? 'bg-white/5 border-white/5 text-slate-400 hover:text-white' : 'bg-white border-slate-200 text-slate-600 hover:text-slate-900'
                            }`}>
                            <LayoutDashboard size={14} />
                            Return Dashboard
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default UsageLimits;
