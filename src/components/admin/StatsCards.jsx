import React from "react";
import {
    TrendingUp,
    TrendingDown,
    Business as BusinessIcon,
    Groups as UsersIcon,
    ReceiptLong as InvoiceIcon,
    BarChart as ChartIcon
} from '@mui/icons-material';

const StatCard = ({ label, value, trend, trendValue, icon: Icon, color, subValue, subLabel, miniData }) => {
    return (
        <div className="bg-[#15161c] border border-white/5 p-6 rounded-[24px] group hover:bg-[#1a1b24] transition-all duration-300 relative overflow-hidden">
            {/* Background Icon Glow */}
            <div className={`absolute -right-4 -top-4 w-24 h-24 rounded-full blur-[40px] opacity-20 group-hover:opacity-30 transition-opacity ${color.replace('text-', 'bg-')}`}></div>

            <div className="flex justify-between items-start mb-6 relative z-10">
                <div className="flex flex-col">
                    <span className="text-[11px] font-black text-slate-500 uppercase tracking-widest mb-1">{label}</span>
                </div>
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center bg-white/5 border border-white/5 group-hover:border-white/10 transition-colors ${color}`}>
                    <Icon sx={{ fontSize: 20 }} />
                </div>
            </div>

            <div className="relative z-10 flex items-end justify-between">
                <div>
                    <h3 className="text-[44px] font-black text-white leading-none mb-3 tracking-tighter">
                        {value}
                    </h3>
                    <div className="flex items-center gap-2">
                        {trend === 'up' ? (
                            <TrendingUp sx={{ fontSize: 16, color: '#10b981' }} />
                        ) : (
                            <TrendingDown sx={{ fontSize: 16, color: '#ef4444' }} />
                        )}
                        <span className={`text-[13px] font-bold ${trend === 'up' ? 'text-emerald-500' : 'text-rose-500'}`}>
                            {trendValue}
                        </span>
                        <span className="text-[11px] font-bold text-slate-600 uppercase tracking-wider">{subLabel}</span>
                    </div>
                </div>

                {/* Mini Bar Chart */}
                <div className="flex items-end gap-1 px-2 h-10">
                    {miniData.map((h, i) => (
                        <div
                            key={i}
                            style={{ height: `${h}%` }}
                            className={`w-1.5 rounded-full opacity-40 group-hover:opacity-80 transition-all duration-500 delay-${i * 100} ${color.replace('text-', 'bg-')}`}
                        />
                    ))}
                </div>
            </div>
        </div>
    );
};

const MiniStatCard = ({ label, value, subText, icon: Icon, color, isWarning }) => {
    return (
        <div className="bg-[#15161c] border border-white/5 p-5 rounded-[24px] flex items-center gap-4 group hover:bg-[#1a1b24] transition-all">
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center border border-white/5 ${isWarning ? 'bg-amber-500/10 text-amber-500' : 'bg-white/5 text-slate-400'}`}>
                <Icon sx={{ fontSize: 22 }} />
            </div>
            <div>
                <p className="text-[10px] font-black text-slate-600 uppercase tracking-widest mb-0.5">{label}</p>
                <div className="flex items-baseline gap-2">
                    <span className={`text-xl font-black ${isWarning ? 'text-rose-500' : 'text-white'}`}>{value}</span>
                    <span className="text-[10px] font-bold text-slate-600">{subText}</span>
                </div>
            </div>
        </div>
    );
};

const StatsCards = ({ stats }) => {
    if (!stats) return null;

    const mainCards = [
        {
            label: "Total Businesses",
            value: stats.totalBusinesses || 0,
            trend: 'up',
            trendValue: "+3",
            subLabel: "vs last month",
            icon: ChartIcon,
            color: "text-indigo-500",
            miniData: [30, 45, 35, 60, 75, 40, 90]
        },
        {
            label: "Active Businesses",
            value: stats.activeBusinesses || 0,
            trend: 'down',
            trendValue: "-2",
            subLabel: "need attention",
            icon: BusinessIcon,
            color: "text-emerald-500",
            miniData: [20, 30, 80, 50, 60, 40, 70]
        },
        {
            label: "Total Users",
            value: stats.totalUsers || 0,
            trend: 'up',
            trendValue: "+7",
            subLabel: "new this week",
            icon: UsersIcon,
            color: "text-purple-500",
            miniData: [40, 20, 60, 80, 30, 50, 70]
        },
        {
            label: "Invoices This Month",
            value: stats.invoicesThisMonth || 0,
            trend: 'up',
            trendValue: "+4",
            subLabel: "vs last month",
            icon: InvoiceIcon,
            color: "text-amber-500",
            miniData: [30, 40, 20, 50, 70, 40, 60]
        }
    ];

    const subCards = [
        {
            label: "Monthly Revenue",
            value: "$12,400",
            subText: "↑ 18% from last month",
            icon: ChartIcon,
            color: "text-indigo-500"
        },
        {
            label: "Inactive Businesses",
            value: "21",
            subText: "Require re-activation",
            icon: TrendingDown,
            isWarning: true
        },
        {
            label: "System Uptime",
            value: "99.8%",
            subText: "Last 30 days",
            icon: BusinessIcon,
            color: "text-emerald-500"
        }
    ];

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {mainCards.map((card, idx) => (
                    <StatCard key={idx} {...card} />
                ))}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {subCards.map((card, idx) => (
                    <MiniStatCard key={idx} {...card} />
                ))}
            </div>
        </div>
    );
};

export default StatsCards;
